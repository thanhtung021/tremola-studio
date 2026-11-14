import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Responsive WebP variants for local JPG assets. For `foo.jpg` the build ships `foo-<width>.webp`
 * files (generated once with ffmpeg; see docs/CONTENT-GUIDE.md). Given the imported JPG URL, returns
 * a `srcSet` of the WebP variants so browsers download only the size they need.
 */
const assetUrls = import.meta.glob("/src/assets/**/*.{jpg,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const byUrl = new Map(Object.entries(assetUrls).map(([path, url]) => [url, path]));

export function responsiveImage(src: string): { srcSet?: string } {
  const path = byUrl.get(src);
  if (!path?.endsWith(".jpg")) return {};
  const stem = path.slice(0, -4);
  const variants = Object.entries(assetUrls)
    .map(([p, url]) => {
      const m = p.startsWith(`${stem}-`) ? /-(\d+)\.webp$/.exec(p) : null;
      return m ? { url, w: Number(m[1]) } : null;
    })
    .filter((v): v is { url: string; w: number } => v !== null)
    .sort((a, b) => a.w - b.w);
  return variants.length ? { srcSet: variants.map((v) => `${v.url} ${v.w}w`).join(", ") } : {};
}
