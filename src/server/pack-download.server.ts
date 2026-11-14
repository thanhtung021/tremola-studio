/**
 * GET /api/pack/download?t=<signed token>
 * Verifies the signed, time-limited token, logs the download, then streams the ZIP from the
 * private R2 bucket bound as PACKS. The bucket itself is never public.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { binding, hashKey, type R2BucketLike } from "./env.server";
import { verifyDownload } from "./download.server";
import { logSubmissionError } from "./leads.server";

const html = (status: number, title: string, body: string) =>
  new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} · Tremola Studio</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#1f1a14;color:#e6cf9a;font-family:Helvetica,Arial,sans-serif;padding:16px">
<main style="max-width:480px;text-align:center"><h1 style="font-family:Georgia,serif;font-weight:500">${title}</h1><p style="color:rgba(230,207,154,0.80)">${body}</p>
<p><a href="/free-pack" style="color:#c9a45c">tremolastudio.com/free-pack</a></p></main></body></html>`,
    {
      status,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    },
  );

export async function handlePackDownload(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const claims = await verifyDownload(url.searchParams.get("t") ?? "");
  if (!claims)
    return html(
      410,
      "This link has expired",
      "Download links are valid for 24 hours. Request the pack again and we will send a fresh one. / Link đã hết hạn, bạn vui lòng yêu cầu lại.",
    );

  const bucket = binding<R2BucketLike>("PACKS");
  const object = bucket ? await bucket.get(claims.key) : null;
  if (!object) {
    await logSubmissionError("download", "missing_object", `R2 object not found: ${claims.key}`);
    return html(
      503,
      "The pack is being prepared",
      "Please try again shortly. / Gói âm thanh đang được chuẩn bị, bạn vui lòng thử lại sau.",
    );
  }

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const { error } = await supabaseAdmin.from("pack_downloads").insert({
    signup_id: claims.sid,
    object_key: claims.key,
    ip_hash: await hashKey(ip),
    user_agent: (request.headers.get("user-agent") ?? "").slice(0, 300),
    country: request.headers.get("cf-ipcountry"),
  });
  if (error) await logSubmissionError("download", "log", error.message);

  const filename = claims.key.split("/").pop() ?? "tremola-free-pack.zip";
  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? "application/zip",
      "content-length": String(object.size),
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "private, no-store",
      etag: object.httpEtag,
    },
  });
}
