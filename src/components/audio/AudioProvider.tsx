import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { track as trackEvent } from "@/lib/track";
import type { Track } from "./types";

type Ctx = {
  current: Track | null;
  playing: boolean;
  time: number;
  duration: number;
  peaks: Record<string, number[]>;
  toggle: (track: Track) => void;
  pause: () => void;
  close: () => void;
  seek: (seconds: number) => void;
  /** External players (e.g. before/after) claim the single audio slot. */
  claim: (ownerId: string, stop: () => void) => void;
};

const AudioCtx = createContext<Ctx | null>(null);
export const fmtTime = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

async function computePeaks(src: string, bars = 64): Promise<number[]> {
  const buf = await (await fetch(src)).arrayBuffer();
  const ctx = new AudioContext();
  const audio = await ctx.decodeAudioData(buf);
  void ctx.close();
  const data = audio.getChannelData(0);
  const size = Math.floor(data.length / bars);
  const out: number[] = [];
  for (let i = 0; i < bars; i++) {
    let max = 0;
    for (let j = i * size; j < (i + 1) * size; j += 16) max = Math.max(max, Math.abs(data[j] ?? 0));
    out.push(max);
  }
  const top = Math.max(...out, 0.0001);
  return out.map((v) => v / top);
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const external = useRef<{ id: string; stop: () => void } | null>(null);
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [peaks, setPeaks] = useState<Record<string, number[]>>({});

  useEffect(() => {
    const a = new Audio();
    a.preload = "none";
    audioRef.current = a;
    const onTime = () => setTime(a.currentTime);
    const onMeta = () => setDuration(a.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onPause);
    return () => {
      a.pause();
      a.src = "";
    };
  }, []);

  const stopExternal = () => {
    external.current?.stop();
    external.current = null;
  };

  const toggle = useCallback(
    (track: Track) => {
      const a = audioRef.current;
      if (!a) return;
      stopExternal();
      if (current?.id === track.id) {
        if (a.paused) void a.play();
        else a.pause();
        return;
      }
      a.pause();
      a.src = track.src;
      setCurrent(track);
      setTime(0);
      setDuration(0);
      void a.play();
      trackEvent("audio_play", { track: track.title, page: window.location.pathname });
      if (!track.peaks && !peaks[track.id]) {
        computePeaks(track.src)
          .then((p) => setPeaks((prev) => ({ ...prev, [track.id]: p })))
          .catch(() => {});
      }
    },
    [current, peaks],
  );

  const pause = useCallback(() => audioRef.current?.pause(), []);
  const close = useCallback(() => {
    audioRef.current?.pause();
    setCurrent(null);
  }, []);
  const seek = useCallback((s: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(s, a.duration || s));
    setTime(a.currentTime);
  }, []);
  const claim = useCallback((id: string, stop: () => void) => {
    if (external.current && external.current.id !== id) external.current.stop();
    external.current = { id, stop };
    audioRef.current?.pause();
  }, []);

  return (
    <AudioCtx.Provider
      value={{ current, playing, time, duration, peaks, toggle, pause, close, seek, claim }}
    >
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const c = useContext(AudioCtx);
  if (!c) throw new Error("useAudio must be used inside AudioProvider");
  return c;
}
