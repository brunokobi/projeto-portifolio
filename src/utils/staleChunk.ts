// Depois de um deploy, uma aba aberta com o bundle antigo pede chunks que não
// existem mais. Recarregar uma vez busca o index.html novo; a janela de tempo
// evita loop de reload se o erro continuar depois disso.
const RELOAD_KEY = "staleChunkReloadAt";
const RELOAD_WINDOW_MS = 10_000;

const STALE_CHUNK_PATTERN =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i;

export function isStaleChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return STALE_CHUNK_PATTERN.test(message);
}

interface ReloadDeps {
  storage?: Pick<Storage, "getItem" | "setItem">;
  reload?: () => void;
  now?: number;
}

export function reloadOnceForStaleChunk({
  storage = window.sessionStorage,
  reload = () => window.location.reload(),
  now = Date.now(),
}: ReloadDeps = {}): boolean {
  try {
    const last = Number(storage.getItem(RELOAD_KEY) ?? 0);
    if (now - last < RELOAD_WINDOW_MS) return false;
    storage.setItem(RELOAD_KEY, String(now));
  } catch {
    return false;
  }
  reload();
  return true;
}
