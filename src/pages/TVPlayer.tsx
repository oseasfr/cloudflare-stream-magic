import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Volume2, VolumeX, Tv } from "lucide-react";

// Fixed stream URL — always stream.mp4 from R2 public bucket
const STREAM_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
// In production: "https://pub-xxxx.r2.dev/public/stream.mp4"

const TVPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const uiTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.src = STREAM_URL;
    el.muted = true;
    el.play()
      .then(() => setStarted(true))
      .catch(() => setError(true));
  }, []);

  const resetUITimer = () => {
    setShowUI(true);
    clearTimeout(uiTimeout.current);
    uiTimeout.current = setTimeout(() => setShowUI(false), 3000);
  };

  useEffect(() => {
    resetUITimer();
    return () => clearTimeout(uiTimeout.current);
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-black overflow-hidden animate-tv-flicker"
      onMouseMove={resetUITimer}
      onClick={resetUITimer}
      style={{ cursor: showUI ? "default" : "none" }}
    >
      {/* Video — always stream.mp4, autoplay + loop */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted={muted}
        playsInline
        onError={() => setError(true)}
        onPlay={() => setStarted(true)}
      />

      {/* Scan line overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)",
        }}
      />

      {/* Error */}
      {error && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/90">
          <div className="w-14 h-14 rounded-2xl bg-surface-1 flex items-center justify-center mb-2">
            <Tv className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-foreground font-semibold">Stream indisponível</p>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Nenhum arquivo <span className="font-mono text-primary">stream.mp4</span> encontrado no bucket R2.
          </p>
          <Link
            to="/upload"
            className="mt-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
          >
            Fazer Upload
          </Link>
        </div>
      )}

      {/* Loading */}
      {!started && !error && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground font-mono">Carregando stream...</p>
          </div>
        </div>
      )}

      {/* UI Overlay */}
      <div
        className={`absolute inset-0 z-20 transition-opacity duration-700 pointer-events-none ${showUI ? "opacity-100" : "opacity-0"}`}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/70 to-transparent flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2">
            <img
              src="https://core.opendata.center/assets/logo-white-Dn9-pPgP.png"
              alt="OPEN"
              className="w-5 h-5 object-contain opacity-70"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <span className="text-xs font-black text-white/70 tracking-wide">OPEN</span>
            <span className="text-xs text-white/40 tracking-[0.15em] font-semibold">DATACENTER</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow" />
            <span className="text-xs font-mono text-white/60">tv.opendata.center/stream</span>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-between pointer-events-auto">
          <div>
            <p className="text-xs font-mono text-white/40 mb-1">AO VIVO · STREAM</p>
            <p className="font-mono text-sm font-bold text-white/80">stream.mp4</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow" />
              <span className="text-xs text-white/40 font-mono">LOOP · AUTOPLAY</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {muted
                ? <VolumeX className="w-4 h-4 text-white" />
                : <Volume2 className="w-4 h-4 text-white" />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVPlayer;
