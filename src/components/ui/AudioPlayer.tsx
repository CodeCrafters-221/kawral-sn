import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Trash2,
  Mic,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  onDelete?: () => void;
  className?: string;
  compact?: boolean;
}

const SPEEDS = [1, 1.25, 1.5, 2];

// Soundwave bar base heights (normalized 0-100)
const WAVE_BARS = [
  30, 50, 75, 40, 85, 60, 95, 80, 45, 100, 65, 90, 55, 75, 45, 95, 70, 40,
  85, 55, 80, 50, 35, 25,
];

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  title = "Note vocale",
  onDelete,
  className = "",
  compact = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Format mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0 || !isFinite(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Helper to extract valid duration (fixing WebM Infinity bug)
  const extractDuration = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.duration && !isNaN(audio.duration)) {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      } else if (audio.duration === Infinity) {
        // Chromium WebM recorded without duration header fix:
        const onTempSeek = () => {
          if (audio) {
            audio.removeEventListener("timeupdate", onTempSeek);
            if (isFinite(audio.duration) && audio.duration > 0) {
              setDuration(audio.duration);
            }
            audio.currentTime = 0;
          }
        };
        audio.addEventListener("timeupdate", onTempSeek, { once: true });
        audio.currentTime = 1e101;
      }
    }
  }, []);

  // Listeners & Lifecycle management
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    setIsPlaying(false);
    setIsLoading(false);
    setHasError(false);
    setErrorMessage("");
    setCurrentTime(0);
    setDuration(0);

    const onPlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    const onWaiting = () => {
      setIsLoading(true);
    };

    const onPlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    const onCanPlay = () => {
      setIsLoading(false);
      extractDuration();
    };

    const onLoadedMetadata = () => {
      extractDuration();
    };

    const onDurationChange = () => {
      extractDuration();
    };

    const onTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
      }
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      } else {
        // At minimum duration tracks elapsed time
        setDuration((prev) => Math.max(prev, audio.currentTime));
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (audio) {
        audio.currentTime = 0;
      }
    };

    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setHasError(true);
      const code = audio.error?.code;
      if (code === 4) {
        setErrorMessage("Format audio non supporté par ce navigateur.");
      } else if (code === 2) {
        setErrorMessage("Erreur de connexion réseau lors du chargement.");
      } else {
        setErrorMessage("Impossible de charger la note vocale.");
      }
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    // Initial load
    try {
      audio.load();
    } catch {
      // safe fallback
    }

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [audioUrl, extractDuration, isDragging]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      setHasError(false);
      setIsLoading(true);
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err: any) {
        console.warn("Audio play prevented or failed:", err);
        setIsPlaying(false);
        setIsLoading(false);
        setHasError(true);
        if (err?.name === "NotSupportedError") {
          setErrorMessage("Format non supporté par cet appareil.");
        } else {
          setErrorMessage("Impossible de démarrer la lecture.");
        }
      }
    }
  };

  const cycleSpeed = () => {
    const nextIdx = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(nextIdx);
    if (audioRef.current) {
      audioRef.current.playbackRate = SPEEDS[nextIdx];
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const effectiveDuration =
      duration > 0
        ? duration
        : audio.duration && isFinite(audio.duration)
          ? audio.duration
          : 0;
    const newTime = Math.max(
      0,
      Math.min(effectiveDuration || Infinity, audio.currentTime + seconds),
    );
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Seek Calculation (Click & Touch Drag)
  const getPercentageFromClientX = (clientX: number) => {
    const bar = progressBarRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const clickX = clientX - rect.left;
    return Math.max(0, Math.min(1, clickX / rect.width));
  };

  const seekTo = (percentage: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const effectiveDuration =
      duration > 0
        ? duration
        : audio.duration && isFinite(audio.duration)
          ? audio.duration
          : 0;
    if (effectiveDuration > 0) {
      const targetTime = percentage * effectiveDuration;
      audio.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handlePointerDown = (clientX: number) => {
    setIsDragging(true);
    const p = getPercentageFromClientX(clientX);
    seekTo(p);
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDragging) return;
    const p = getPercentageFromClientX(clientX);
    const effectiveDuration = duration > 0 ? duration : 0;
    if (effectiveDuration > 0) {
      setCurrentTime(p * effectiveDuration);
    }
  };

  const handlePointerUp = (clientX?: number) => {
    if (isDragging && clientX !== undefined) {
      const p = getPercentageFromClientX(clientX);
      seekTo(p);
    }
    setIsDragging(false);
  };

  const effectiveDuration =
    duration > 0
      ? duration
      : audioRef.current?.duration && isFinite(audioRef.current.duration)
        ? audioRef.current.duration
        : 0;

  const progressPercent =
    effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <div
      className={`w-full rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/70 via-white to-amber-50/40 p-3 sm:p-4 shadow-xs transition-all ${className}`}
    >
      {/* Native HTML5 Audio Tag */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        playsInline
      />

      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-kawral-green text-white shadow-xs shrink-0">
            <Mic className="w-3.5 h-3.5 text-kawral-orange" />
          </span>
          <span className="text-xs font-extrabold text-kawral-dark truncate">
            {title}
          </span>
        </div>

        {/* Top Control Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Speed Toggle */}
          <button
            type="button"
            onClick={cycleSpeed}
            className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-white border border-slate-200 hover:border-kawral-green text-slate-700 hover:text-kawral-green transition-colors cursor-pointer active:scale-95 shadow-2xs"
            title="Vitesse de lecture"
            aria-label="Changer la vitesse de lecture"
          >
            {SPEEDS[speedIdx]}x
          </button>

          {/* Mute Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 rounded-lg text-slate-500 hover:text-kawral-dark hover:bg-white active:scale-95 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            title={isMuted ? "Activer le son" : "Couper le son"}
            aria-label={isMuted ? "Activer le son" : "Couper le son"}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Optional Delete Button */}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-colors cursor-pointer"
              title="Supprimer la note vocale"
              aria-label="Supprimer la note vocale"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Playback Controls & Waveform Track */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Play / Pause / Loading Button */}
        <button
          type="button"
          onClick={togglePlay}
          disabled={isLoading && !isPlaying}
          className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-kawral-green text-white shadow-md hover:bg-emerald-800 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-70"
          aria-label={isPlaying ? "Mettre en pause" : "Écouter l'enregistrement"}
        >
          {isLoading && !isPlaying ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5 fill-current text-white" />
          ) : (
            <Play className="w-5 h-5 fill-current text-white translate-x-0.5" />
          )}
        </button>

        {/* Quick Restart / -5s Rewind */}
        <button
          type="button"
          onClick={() => skipTime(-5)}
          className="flex items-center justify-center w-8 h-8 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:text-kawral-green hover:border-kawral-green active:scale-95 transition-all cursor-pointer shrink-0 shadow-2xs"
          title="Reculer de 5 secondes"
          aria-label="Reculer de 5 secondes"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Scrubber & Waveform Area */}
        <div className="flex-1 min-w-0">
          {/* Interactive touch/mouse track */}
          <div
            ref={progressBarRef}
            onClick={(e) => handlePointerDown(e.clientX)}
            onMouseDown={(e) => handlePointerDown(e.clientX)}
            onMouseMove={(e) => handlePointerMove(e.clientX)}
            onMouseUp={(e) => handlePointerUp(e.clientX)}
            onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
            onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
            onTouchEnd={() => handlePointerUp()}
            className="h-10 sm:h-11 flex items-center justify-between gap-1 sm:gap-1.5 cursor-pointer py-1 px-1 rounded-xl hover:bg-emerald-50/50 transition-colors group select-none touch-none"
            title="Glisser ou toucher pour naviguer dans l'audio"
          >
            {WAVE_BARS.map((h, i) => {
              const barPercent = (i / WAVE_BARS.length) * 100;
              const isPast = progressPercent >= barPercent;

              // Gentle dynamic animation when playing
              const dynamicHeight = isPlaying
                ? Math.min(100, Math.max(20, h + ((i % 3) - 1) * 18))
                : h;

              return (
                <div
                  key={i}
                  className="flex-1 flex items-center justify-center h-full min-w-0"
                >
                  <span
                    style={{
                      height: `${dynamicHeight}%`,
                      animationDelay: isPlaying ? `${(i * 0.08) % 1}s` : "0s",
                    }}
                    className={`w-full max-w-[4px] sm:max-w-[5px] rounded-full transition-all duration-150 ${
                      isPast
                        ? "bg-kawral-green shadow-xs"
                        : "bg-slate-300 group-hover:bg-slate-400"
                    } ${isPlaying && isPast ? "animate-pulse" : ""}`}
                  />
                </div>
              );
            })}
          </div>

          {/* Time & Duration Info */}
          <div className="flex items-center justify-between text-[11px] font-bold text-kawral-muted px-1 mt-0.5">
            <span className="text-kawral-green font-mono">
              {formatTime(currentTime)}
            </span>
            <span className="font-mono text-slate-500">
              {effectiveDuration > 0
                ? formatTime(effectiveDuration)
                : formatTime(currentTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Error Banner with Retry */}
      {hasError && (
        <div className="mt-2.5 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="truncate">{errorMessage || "Erreur de lecture"}</span>
          </div>
          <button
            type="button"
            onClick={togglePlay}
            className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-extrabold text-[11px] transition-colors shrink-0 cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
};
