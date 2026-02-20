import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Volume2, VolumeX, AlertTriangle, ArrowLeft, Tv } from "lucide-react";

// Simulated public video catalog (would come from R2 public/ bucket)
const PUBLIC_VIDEOS: Record<string, { name: string; url: string }> = {
  "produto-demo-v2": {
    name: "Produto Demo v2",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  "tour-escritorio": {
    name: "Tour Escritório",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
  "highlights-jan": {
    name: "Highlights Janeiro",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
};

const TVPlayer = () => {
  const { video } = useParams<{ video: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState(false);
  const [showUI, setShowUI] = useState(true);
  let uiTimeout = useRef<ReturnType<typeof setTimeout>>();

  const videoData = video ? PUBLIC_VIDEOS[video] : null;

  useEffect(() => {
    if (!videoRef.current || !videoData) return;
    const el = videoRef.current;
    el.src = videoData.url;
    el.muted = true;
    el.play()
      .then(() => setStarted(true))
      .catch(() => setError(true));
  }, [videoData]);

  // Hide UI after 3s of inactivity
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

  // No video found
  if (!videoData) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-surface-1 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-warning" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground mb-2">Vídeo não encontrado</h1>
          <p className="text-sm text-muted-foreground mb-1">
            <span className="font-mono text-cyan">/{video}</span> não está publicado.
          </p>
          <p className="text-xs text-muted-foreground">Publique o vídeo no painel para disponibilizá-lo aqui.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/painel"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Ir ao Painel
          </Link>
        </div>

        {/* Hint: available videos */}
        <div className="mt-4 rounded-xl border border-border bg-surface-1 p-4 text-left max-w-sm w-full">
          <p className="text-xs font-semibold text-muted-foreground mb-3">Vídeos públicos disponíveis:</p>
          <div className="space-y-1.5">
            {Object.entries(PUBLIC_VIDEOS).map(([slug, data]) => (
              <Link
                key={slug}
                to={`/tv/${slug}`}
                className="flex items-center gap-2 text-xs font-mono text-cyan hover:text-cyan-glow transition-colors"
              >
                <Play className="w-3 h-3" />
                tv.opendata.center/{slug}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-black overflow-hidden cursor-none animate-tv-flicker"
      onMouseMove={resetUITimer}
      onClick={resetUITimer}
      style={{ cursor: showUI ? "default" : "none" }}
    >
      {/* Video */}
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

      {/* Subtle scan line overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-5"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
        }}
      />

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/80">
          <AlertTriangle className="w-12 h-12 text-warning" />
          <p className="text-foreground font-semibold">Erro ao carregar o vídeo</p>
          <p className="text-sm text-muted-foreground">Verifique se o arquivo está publicado no R2</p>
        </div>
      )}

      {/* Loading overlay */}
      {!started && !error && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-cyan/30" />
              <div className="absolute inset-0 rounded-full border-2 border-t-cyan animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground font-mono">Carregando stream...</p>
          </div>
        </div>
      )}

      {/* UI Overlay (fades out) */}
      <div
        className={`absolute inset-0 z-20 transition-opacity duration-700 pointer-events-none ${showUI ? "opacity-100" : "opacity-0"}`}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <Link to="/painel" className="flex items-center gap-2 text-xs text-foreground/70 hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Painel
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-cyan animate-pulse-glow" />
            <span className="text-xs font-mono text-foreground/70">tv.opendata.center/{video}</span>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-between pointer-events-auto">
          <div>
            <p className="text-xs font-mono text-foreground/50 mb-1">REPRODUZINDO</p>
            <h2 className="text-lg font-bold text-foreground">{videoData.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow" />
              <span className="text-xs text-foreground/50 font-mono">LOOP · AUTOPLAY</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4 text-foreground" /> : <Volume2 className="w-4 h-4 text-foreground" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVPlayer;
