import { useState, useRef, useEffect, useCallback } from "react";

export interface UseAudioRecorderOptions {
  maxDurationSeconds?: number;
}

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  recordingDuration: number; // in seconds
  audioBlob: Blob | null;
  audioUrl: string | null;
  audioLevels: number[]; // Array of 0-1 values for live soundwave visualization
  error: string | null;
  startRecording: () => Promise<boolean>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  resetRecording: () => void;
  setAudioBlobManually: (blob: Blob | null, url?: string | null) => void;
}

export function useAudioRecorder({
  maxDurationSeconds = 180, // 3 minutes max by default
}: UseAudioRecorderOptions = {}): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>([
    0.2, 0.4, 0.6, 0.3, 0.7, 0.5, 0.3, 0.6, 0.4, 0.2,
  ]);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // Cleanup helper for tracks and context
  const cleanupStream = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  // Update real-time audio waveform levels
  const startVisualizer = useCallback(() => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateWaveform = () => {
      analyser.getByteFrequencyData(dataArray);

      // Extract 10 frequency bars normalized between 0.15 and 1.0
      const barCount = 12;
      const step = Math.floor(bufferLength / barCount);
      const newLevels: number[] = [];

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i * step] || 0;
        const normalized = Math.max(0.15, Math.min(1.0, val / 255));
        newLevels.push(normalized);
      }

      setAudioLevels(newLevels);
      animFrameRef.current = requestAnimationFrame(updateWaveform);
    };

    updateWaveform();
  }, []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    setError(null);
    cleanupStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Votre navigateur ne supporte pas l'enregistrement audio direct.");
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio analysis for real-time wave animation
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;
        startVisualizer();
      }

      // Pick best supported mime type (prefer MP4 for universal iOS/Android/desktop support)
      const mimeTypes = [
        "audio/mp4",
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "",
      ];
      const selectedMime = mimeTypes.find(
        (type) => type === "" || MediaRecorder.isTypeSupported(type),
      );

      const options = selectedMime ? { mimeType: selectedMime } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setIsRecording(false);
        setIsPaused(false);
        cleanupStream();
      };

      mediaRecorder.start(250); // Emit chunks every 250ms
      setIsRecording(true);
      setIsPaused(false);
      setRecordingDuration(0);

      // Duration ticker with max duration protection
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev + 1 >= maxDurationSeconds) {
            stopRecording();
            return maxDurationSeconds;
          }
          return prev + 1;
        });
      }, 1000);

      return true;
    } catch (err: any) {
      console.error("useAudioRecorder error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("L'accès au microphone a été refusé. Veuillez l'autoriser dans votre navigateur.");
      } else {
        setError("Impossible d'accéder au microphone : " + (err.message || "Erreur inconnue"));
      }
      cleanupStream();
      return false;
    }
  }, [cleanupStream, maxDurationSeconds, startVisualizer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startVisualizer();
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev + 1 >= maxDurationSeconds) {
            stopRecording();
            return maxDurationSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    }
  }, [maxDurationSeconds, startVisualizer]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      (mediaRecorderRef.current.state === "recording" ||
        mediaRecorderRef.current.state === "paused")
    ) {
      mediaRecorderRef.current.stop();
    }
    cleanupStream();
  }, [cleanupStream]);

  const resetRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    cleanupStream();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setIsRecording(false);
    setIsPaused(false);
    setRecordingDuration(0);
    setError(null);
  }, [audioUrl, cleanupStream]);

  const setAudioBlobManually = useCallback(
    (blob: Blob | null, externalUrl?: string | null) => {
      if (audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioBlob(blob);
      if (externalUrl !== undefined) {
        setAudioUrl(externalUrl);
      } else if (blob) {
        setAudioUrl(URL.createObjectURL(blob));
      } else {
        setAudioUrl(null);
      }
    },
    [audioUrl],
  );

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupStream();
    };
  }, [cleanupStream]);

  return {
    isRecording,
    isPaused,
    recordingDuration,
    audioBlob,
    audioUrl,
    audioLevels,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
    setAudioBlobManually,
  };
}
