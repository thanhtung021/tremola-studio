import { getRouteApi } from "@tanstack/react-router";
import { founding as fallback } from "@/config/founding";
import type { Founding } from "@/lib/founding.functions";

const root = getRouteApi("__root__");

/** Founding counter loaded once by the root route (server-rendered, so it is in the initial HTML). */
export function useFounding(): Founding {
  const data = root.useLoaderData() as { founding?: Founding } | undefined;
  return data?.founding ?? fallback;
}
