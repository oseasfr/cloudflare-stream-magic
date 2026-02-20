import { useState, useRef, useCallback } from "react";
import { Upload, Film, CheckCircle2, AlertCircle, X, Loader2, Copy, Tv } from "lucide-react";
import { Link } from "react-router-dom";
import NavBar from "@/components/NavBar";

const ACCEPTED_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/avi"];
const MAX_SIZE_MB = 500;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// Fixed public stream URL
const STREAM_URL = "https://tv.opendata.center/stream";

type UploadState = "idle" | "validating" | "uploading" | "success" | "error";

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const UploadPage = () => {
  const [dragOver, setDragOver] = useState(false);
  const [videoFile, setVideoFile] = useState<{ file: File; preview: string; size: string; duration?: string } | null>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) return "Tipo inválido. Use MP4, WebM, MOV ou AVI.";
    if (file.size > MAX_SIZE_BYTES) return `Arquivo muito grande. Máximo: ${MAX_SIZE_MB}MB.`;
    return null;
  };

  const handleFile = useCallback((file: File) => {
    setError("");
    setState("validating");
    const err = validate(file);
    if (err) { setError(err); setState("error"); return; }
    const preview = URL.createObjectURL(file);
    setVideoFile({ file, preview, size: formatBytes(file.size) });
    setState("idle");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const simulateUpload = async () => {
    if (!videoFile) return;
    setState("uploading");
    setProgress(0);
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(r => setTimeout(r, 55));
      setProgress(i);
    }
    setState("success");
  };

  const reset = () => {
    setVideoFile(null);
    setState("idle");
    setProgress(0);
    setError("");
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(STREAM_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="pt-14 min-h-screen">
        {/* Header */}
        <div className="border-b border-border bg-surface-1">
          <div className="mx-auto max-w-3xl px-6 py-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="w-4 h-4 text-primary" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">upload.opendata.center</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Upload de Stream</h1>
            <p className="text-sm text-muted-foreground">
              O arquivo será salvo como <span className="font-mono text-primary">stream.mp4</span> no bucket R2 ·
              Disponível em <span className="font-mono text-muted-foreground">{STREAM_URL}</span>
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-6 py-8 space-y-5">

          {/* Drop Zone */}
          {!videoFile && state !== "success" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 p-14 flex flex-col items-center gap-5 ${
                dragOver
                  ? "border-primary bg-primary/5 shadow-glow-cyan"
                  : "border-surface-3 hover:border-primary/50 hover:bg-surface-1"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${dragOver ? "bg-primary/20" : "bg-surface-2"}`}>
                <Film className={`w-8 h-8 transition-colors ${dragOver ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground mb-1">
                  {dragOver ? "Solte o vídeo aqui" : "Arraste e solte o vídeo"}
                </p>
                <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
                <p className="text-xs text-muted-foreground mt-2 font-mono">
                  Será publicado como <span className="text-primary">stream.mp4</span>
                </p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {["MP4", "WebM", "MOV", "AVI"].map(t => (
                  <span key={t} className="px-2 py-0.5 rounded text-xs bg-surface-2 text-muted-foreground font-mono">{t}</span>
                ))}
                <span className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary font-mono">≤ 500MB</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
              <button onClick={() => setError("")} className="ml-auto">
                <X className="w-4 h-4 text-destructive/60 hover:text-destructive" />
              </button>
            </div>
          )}

          {/* File Preview */}
          {videoFile && state !== "success" && (
            <div className="rounded-xl border border-border bg-surface-1 overflow-hidden animate-slide-up">
              <video
                src={videoFile.preview}
                className="w-full max-h-56 object-contain bg-black"
                controls
                onLoadedMetadata={(e) => {
                  const v = e.target as HTMLVideoElement;
                  const m = Math.floor(v.duration / 60);
                  const s = Math.floor(v.duration % 60);
                  setVideoFile(prev => prev ? { ...prev, duration: `${m}:${s.toString().padStart(2, "0")}` } : prev);
                }}
              />
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Film className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {videoFile.file.name}
                      <span className="ml-2 text-xs font-mono text-primary">→ stream.mp4</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {videoFile.size}{videoFile.duration && ` · ${videoFile.duration}`}
                    </p>
                  </div>
                </div>
                {state === "idle" && (
                  <button onClick={reset} className="p-1.5 rounded hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="px-4 pb-4">
                {state === "idle" && (
                  <button
                    onClick={simulateUpload}
                    className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-all hover:brightness-110 active:scale-[0.98]"
                  >
                    Publicar como stream.mp4
                  </button>
                )}

                {state === "uploading" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                        Enviando para Cloudflare R2...
                      </span>
                      <span className="font-mono text-primary">{progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      /public/stream.mp4
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success */}
          {state === "success" && (
            <div className="rounded-xl border border-success/30 bg-success/5 p-6 space-y-4 animate-slide-up">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Publicado com sucesso!</p>
                  <p className="text-xs text-muted-foreground">
                    Disponível em <span className="font-mono text-primary">/public/stream.mp4</span>
                  </p>
                </div>
              </div>

              {/* Fixed URL */}
              <div className="rounded-lg bg-surface-2 border border-border p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">URL de exibição (TV)</p>
                  <p className="text-sm font-mono text-primary">{STREAM_URL}</p>
                </div>
                <button
                  onClick={copyUrl}
                  className="flex items-center gap-1.5 shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded hover:bg-surface-3"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={reset}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors"
                >
                  Novo Upload
                </button>
                <Link
                  to="/tv"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold text-center transition-all hover:brightness-110"
                >
                  <Tv className="w-4 h-4" />
                  Ver no Player
                </Link>
              </div>
            </div>
          )}

          {/* Info card */}
          <div className="rounded-xl border border-border bg-surface-1 p-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Worker", desc: "Autenticação + validação", color: "text-primary" },
                { label: "R2 Bucket", desc: "public/stream.mp4", color: "text-success" },
                { label: "TV Player", desc: "URL fixa · autoplay · loop", color: "text-warning" },
              ].map(({ label, desc, color }) => (
                <div key={label}>
                  <div className={`text-xs font-mono font-bold mb-0.5 ${color}`}>{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
