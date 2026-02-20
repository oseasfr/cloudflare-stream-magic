import { useState, useRef, useCallback } from "react";
import { Upload, Film, CheckCircle2, AlertCircle, X, Loader2, Copy, ExternalLink, Info } from "lucide-react";
import NavBar from "@/components/NavBar";

const ACCEPTED_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/avi"];
const MAX_SIZE_MB = 500;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

type UploadState = "idle" | "validating" | "uploading" | "success" | "error";

interface VideoFile {
  file: File;
  preview: string;
  size: string;
  duration?: string;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const WORKER_CODE = `// Cloudflare Worker — upload.opendata.center/api/upload
export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
    
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== \`Bearer \${env.UPLOAD_SECRET}\`) {
      return new Response("Unauthorized", { status: 401 });
    }
    
    const formData = await request.formData();
    const file = formData.get("file");
    
    if (!file || !(file instanceof File)) {
      return new Response("No file provided", { status: 400 });
    }
    
    const allowedTypes = ["video/mp4","video/webm","video/quicktime"];
    if (!allowedTypes.includes(file.type)) {
      return new Response("Invalid file type", { status: 415 });
    }
    
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return new Response("File too large", { status: 413 });
    }
    
    const key = \`private/uploads-temp/\${crypto.randomUUID()}-\${file.name}\`;
    await env.R2_BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
    });
    
    return Response.json({ 
      success: true, 
      key,
      url: \`https://upload.opendata.center/\${key}\`
    });
  }
};`;

const UploadPage = () => {
  const [dragOver, setDragOver] = useState(false);
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [showWorker, setShowWorker] = useState(false);
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
    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      setState("error");
      return;
    }
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
    
    // Simulated progress (real: POST to upload.opendata.center/api/upload)
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(r => setTimeout(r, 60));
      setProgress(i);
    }
    
    const fakeKey = `private/uploads-temp/${crypto.randomUUID()}-${videoFile.file.name}`;
    setUploadedUrl(`https://tv.opendata.center/${videoFile.file.name.replace(/\.[^/.]+$/, "")}`);
    setState("success");
  };

  const reset = () => {
    setVideoFile(null);
    setState("idle");
    setProgress(0);
    setError("");
    setUploadedUrl("");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(WORKER_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="pt-14 min-h-screen">
        {/* Header */}
        <div className="border-b border-border bg-surface-1">
          <div className="mx-auto max-w-4xl px-6 py-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded bg-cyan/10 flex items-center justify-center">
                <Upload className="w-4 h-4 text-cyan" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">upload.opendata.center</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Upload de Vídeo</h1>
            <p className="text-sm text-muted-foreground">
              MP4, WebM, MOV, AVI · Máximo 500MB · Armazenamento via Cloudflare R2
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
          {/* Drop Zone */}
          {!videoFile && state !== "success" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 p-16 flex flex-col items-center gap-5 ${
                dragOver
                  ? "border-cyan bg-cyan/5 shadow-glow-cyan"
                  : "border-surface-3 hover:border-cyan/50 hover:bg-surface-1"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${dragOver ? "bg-cyan/20 shadow-glow-cyan" : "bg-surface-2"}`}>
                <Film className={`w-8 h-8 transition-colors ${dragOver ? "text-cyan" : "text-muted-foreground"}`} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground mb-1">
                  {dragOver ? "Solte o vídeo aqui" : "Arraste e solte o vídeo"}
                </p>
                <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {["MP4", "WebM", "MOV", "AVI"].map(t => (
                  <span key={t} className="px-2 py-0.5 rounded text-xs bg-surface-2 text-muted-foreground font-mono">{t}</span>
                ))}
                <span className="px-2 py-0.5 rounded text-xs bg-cyan/10 text-cyan font-mono">≤ 500MB</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
              <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4 text-destructive/60 hover:text-destructive" /></button>
            </div>
          )}

          {/* File Preview */}
          {videoFile && state !== "success" && (
            <div className="rounded-xl border border-border bg-surface-1 overflow-hidden animate-slide-up">
              <video
                src={videoFile.preview}
                className="w-full max-h-64 object-contain bg-black"
                controls
                onLoadedMetadata={(e) => {
                  const video = e.target as HTMLVideoElement;
                  const m = Math.floor(video.duration / 60);
                  const s = Math.floor(video.duration % 60);
                  setVideoFile(v => v ? { ...v, duration: `${m}:${s.toString().padStart(2, "0")}` } : v);
                }}
              />
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Film className="w-4 h-4 text-cyan" />
                  <div>
                    <p className="text-sm font-medium text-foreground truncate max-w-xs">{videoFile.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {videoFile.size}
                      {videoFile.duration && ` · ${videoFile.duration}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {state === "idle" && (
                    <button onClick={reset} className="p-1.5 rounded hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Upload button or progress */}
              <div className="px-4 pb-4">
                {state === "idle" && (
                  <button
                    onClick={simulateUpload}
                    className="w-full py-2.5 rounded-lg bg-cyan text-primary-foreground font-semibold text-sm transition-all hover:shadow-glow-cyan hover:brightness-110 active:scale-98"
                  >
                    Fazer Upload para R2
                  </button>
                )}

                {state === "uploading" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin text-cyan" />
                        Enviando para Cloudflare R2...
                      </span>
                      <span className="font-mono text-cyan">{progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-cyan transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      /private/uploads-temp/{videoFile.file.name}
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
                <CheckCircle2 className="w-6 h-6 text-success" />
                <div>
                  <p className="font-semibold text-foreground">Upload concluído!</p>
                  <p className="text-xs text-muted-foreground">Vídeo salvo em /private/uploads-temp/</p>
                </div>
              </div>
              <div className="rounded-lg bg-surface-2 p-3 flex items-center justify-between gap-3">
                <p className="text-xs font-mono text-cyan truncate">{uploadedUrl}</p>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => navigator.clipboard.writeText(uploadedUrl)}
                    className="p-1.5 rounded hover:bg-surface-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a href="/painel" className="p-1.5 rounded hover:bg-surface-3 text-muted-foreground hover:text-foreground transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={reset} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                  Novo Upload
                </button>
                <a href="/painel" className="flex-1 py-2 rounded-lg bg-cyan text-primary-foreground text-sm font-semibold text-center transition-all hover:shadow-glow-cyan hover:brightness-110">
                  Ir para o Painel
                </a>
              </div>
            </div>
          )}

          {/* Worker Code Reference */}
          <div className="rounded-xl border border-border bg-surface-1">
            <button
              onClick={() => setShowWorker(!showWorker)}
              className="w-full flex items-center justify-between p-4 hover:bg-surface-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan" />
                <span className="text-sm font-medium">Código do Cloudflare Worker</span>
              </div>
              <span className="text-xs text-muted-foreground">{showWorker ? "Ocultar" : "Ver código"}</span>
            </button>

            {showWorker && (
              <div className="border-t border-border">
                <div className="flex items-center justify-between px-4 py-2 bg-surface-2">
                  <span className="font-mono text-xs text-muted-foreground">worker.js</span>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? "Copiado!" : "Copiar"}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-foreground/80 overflow-x-auto leading-relaxed max-h-72 overflow-y-auto">
                  <code>{WORKER_CODE}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Architecture info */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Worker", desc: "Autenticação + validação", color: "cyan" },
              { label: "R2 Bucket", desc: "opendata-videos", color: "success" },
              { label: "Player", desc: "tv.opendata.center", color: "warning" },
            ].map(({ label, desc, color }) => (
              <div key={label} className="rounded-lg border border-border bg-surface-1 p-3">
                <div className={`text-xs font-mono font-bold mb-1 ${color === "cyan" ? "text-cyan" : color === "success" ? "text-success" : "text-warning"}`}>{label}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
