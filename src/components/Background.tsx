import { useEffect, useRef, useState } from "preact/hooks";

import { BACKGROUND_VIDEO_STORAGE_KEY, BACKGROUND_VIDEOS } from "../lib/videos";
import { FluentImage24Regular } from "./icons/FluentImage24Regular";

const CACHE_NAME = "bg-videos-v1";
const STORAGE_KEY = BACKGROUND_VIDEO_STORAGE_KEY;

function getInitialSelected(): string {
  if (typeof localStorage === "undefined") return BACKGROUND_VIDEOS[0].id;
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved && BACKGROUND_VIDEOS.some((v) => v.id === saved) ? saved : BACKGROUND_VIDEOS[0].id;
}

async function resolveVideoSrc(src: string): Promise<string> {
  if (typeof caches === "undefined") return src;

  try {
    const cache = await caches.open(CACHE_NAME);
    let res = await cache.match(src);
    if (!res) {
      res = await fetch(src);
      if (!res.ok) return src;
      await cache.put(src, res.clone());
    }
    return URL.createObjectURL(await res.blob());
  } catch {
    return src;
  }
}

export default function Background() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(getInitialSelected);
  const hasVideo = (BACKGROUND_VIDEOS.find((v) => v.id === selected) ?? BACKGROUND_VIDEOS[0]).src !== null;

  useEffect(() => {
    navigator.storage?.persist?.();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selected);
    const video = BACKGROUND_VIDEOS.find((v) => v.id === selected) ?? BACKGROUND_VIDEOS[0];

    if (video.src === null) {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
      const el = videoRef.current;
      if (el) {
        el.removeAttribute("src");
        el.load();
      }
      return;
    }

    let cancelled = false;
    resolveVideoSrc(video.src).then((url) => {
      const isBlob = url.startsWith("blob:");
      if (cancelled) {
        if (isBlob) URL.revokeObjectURL(url);
        return;
      }
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = isBlob ? url : null;

      const el = videoRef.current;
      if (el) {
        el.src = url;
        el.load();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selected]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  return (
    <>
      <video
        ref={videoRef}
        autoplay
        loop
        muted
        playsinline
        class="fixed top-0 left-0 w-full h-screen object-cover -z-10"
      />
      <div
        id="bg-tint"
        class={`fixed top-0 left-0 w-full h-screen -z-10 ${hasVideo ? "bg-black/60" : "bg-transparent"}`}
      ></div>

      <div class="fixed bottom-12 left-12 z-10">
        {open && (
          <div class="frosted-glass absolute bottom-full left-0 mb-2 flex min-w-40 flex-col gap-1 rounded-xl p-2">
            {BACKGROUND_VIDEOS.map((v) => (
              <button
                key={v.id}
                type="button"
                class={`rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/10 ${v.id === selected ? "bg-white/15" : ""}`}
                onClick={() => {
                  setSelected(v.id);
                  setOpen(false);
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          class="frosted-glass rounded-full p-3 hover:cursor-pointer"
          aria-label="Change background"
          onClick={() => setOpen((o) => !o)}
        >
          <FluentImage24Regular />
        </button>
      </div>
    </>
  );
}
