"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "skilldock:favorites:v1";
const SYNC_EVENT = "skilldock:favorites-changed";
const EMPTY_FAVORITES: string[] = [];

let cachedRaw: string | null = null;
let cachedParsed: string[] = EMPTY_FAVORITES;

function getClientSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY_FAVORITES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedParsed;
    cachedRaw = raw;
    if (!raw) {
      cachedParsed = EMPTY_FAVORITES;
      return cachedParsed;
    }
    const parsed = JSON.parse(raw);
    cachedParsed = Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : EMPTY_FAVORITES;
    return cachedParsed;
  } catch {
    return EMPTY_FAVORITES;
  }
}

function getServerSnapshot(): string[] {
  return EMPTY_FAVORITES;
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(SYNC_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(SYNC_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useFavorites() {
  const favorites = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const toggleFavorite = useCallback((slug: string) => {
    const current = getClientSnapshot();
    const next = current.includes(slug)
      ? current.filter((item) => item !== slug)
      : [...current, slug];
    const serialized = JSON.stringify(next);
    cachedRaw = serialized;
    cachedParsed = next;
    window.localStorage.setItem(STORAGE_KEY, serialized);
    window.dispatchEvent(new Event(SYNC_EVENT));
  }, []);

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
