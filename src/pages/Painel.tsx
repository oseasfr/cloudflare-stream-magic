import { useState } from "react";
import { LayoutDashboard, Globe, Trash2, Play, Film, Clock, HardDrive, Search, CheckCircle2, AlertCircle, Eye, Filter } from "lucide-react";
import NavBar from "@/components/NavBar";

type VideoStatus = "temp" | "published" | "removing";

interface VideoItem {
  id: string;
  name: string;
  filename: string;
  size: string;
  duration: string;
  uploadedAt: string;
  status: VideoStatus;
  path: string;
  resolution: string;
}

const MOCK_VIDEOS: VideoItem[] = [
  { id: "1", name: "produto-demo-v2", filename: "produto-demo-v2.mp4", size: "142 MB", duration: "3:24", uploadedAt: "2025-01-15 14:32", status: "published", path: "public/produto-demo-v2.mp4", resolution: "1920×1080" },
  { id: "2", name: "apresentacao-q1", filename: "apresentacao-q1.mp4", size: "89 MB", duration: "8:15", uploadedAt: "2025-01-15 11:08", status: "temp", path: "private/uploads-temp/apresentacao-q1.mp4", resolution: "1280×720" },
  { id: "3", name: "tour-escritorio", filename: "tour-escritorio.webm", size: "210 MB", duration: "5:47", uploadedAt: "2025-01-14 18:20", status: "published", path: "public/tour-escritorio.webm", resolution: "1920×1080" },
  { id: "4", name: "evento-launch-2025", filename: "evento-launch-2025.mp4", size: "387 MB", duration: "12:03", uploadedAt: "2025-01-14 09:55", status: "temp", path: "private/uploads-temp/evento-launch-2025.mp4", resolution: "3840×2160" },
  { id: "5", name: "highlights-jan", filename: "highlights-jan.mp4", size: "55 MB", duration: "1:52", uploadedAt: "2025-01-13 16:44", status: "published", path: "public/highlights-jan.mp4", resolution: "1920×1080" },
];

type FilterType = "all" | "temp" | "published";

const PainelPage = () => {
  const [videos, setVideos] = useState<VideoItem[]>(MOCK_VIDEOS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [notification, setNotification] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showNotif = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const publish = (id: string) => {
    setVideos(v => v.map(x => x.id === id
      ? { ...x, status: "published", path: `public/${x.filename}` }
      : x
    ));
    showNotif("Vídeo publicado em /public/ com sucesso.");
  };

  const remove = (id: string) => {
    const video = videos.find(v => v.id === id);
    setVideos(v => v.filter(x => x.id !== id));
    showNotif(`"${video?.name}" removido do R2.`);
  };

  const filtered = videos.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.filename.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || v.status === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: videos.length,
    published: videos.filter(v => v.status === "published").length,
    temp: videos.filter(v => v.status === "temp").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="pt-14 min-h-screen">
        {/* Header */}
        <div className="border-b border-border bg-surface-1">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded bg-cyan/10 flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-cyan" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">painel.opendata.center</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Painel de Gestão</h1>
            <p className="text-sm text-muted-foreground">Gerencie vídeos no Cloudflare R2 · Publique ou remova</p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
          {/* Notification */}
          {notification && (
            <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 animate-slide-up ${
              notification.type === "success"
                ? "border-success/30 bg-success/10"
                : "border-destructive/30 bg-destructive/10"
            }`}>
              {notification.type === "success"
                ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                : <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              }
              <p className={`text-sm ${notification.type === "success" ? "text-success" : "text-destructive"}`}>
                {notification.msg}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total de vídeos", value: stats.total, icon: Film, color: "text-cyan" },
              { label: "Publicados", value: stats.published, icon: Globe, color: "text-success" },
              { label: "Em rascunho", value: stats.temp, icon: Clock, color: "text-warning" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-xl border border-border bg-surface-1 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Filters + Search */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar vídeos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-1 border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/30 transition-colors"
              />
            </div>
            <div className="flex items-center gap-1 bg-surface-1 border border-border rounded-lg p-1">
              {(["all", "published", "temp"] as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    filter === f
                      ? "bg-cyan text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "all" ? "Todos" : f === "published" ? "Publicados" : "Rascunho"}
                </button>
              ))}
            </div>
          </div>

          {/* Video List */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Film className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum vídeo encontrado</p>
              </div>
            ) : (
              filtered.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center gap-4 rounded-xl border border-border bg-surface-1 p-4 hover:border-border/80 hover:bg-surface-2 transition-all group"
                >
                  {/* Thumbnail placeholder */}
                  <div className="w-16 h-10 rounded-lg bg-surface-3 flex items-center justify-center shrink-0">
                    <Play className="w-4 h-4 text-muted-foreground" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-foreground truncate">{video.name}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium font-mono shrink-0 ${
                        video.status === "published"
                          ? "bg-success/15 text-success"
                          : "bg-warning/15 text-warning"
                      }`}>
                        {video.status === "published" ? "● PUBLIC" : "◌ TEMP"}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground truncate">{video.path}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <HardDrive className="w-3 h-3" />{video.size}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />{video.duration}
                      </span>
                      <span className="text-xs text-muted-foreground">{video.resolution}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {video.status === "published" && (
                      <a
                        href={`/tv/${video.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver
                      </a>
                    )}

                    {video.status === "temp" && (
                      <button
                        onClick={() => publish(video.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan/10 border border-cyan/30 text-xs font-medium text-cyan hover:bg-cyan/20 hover:shadow-glow-cyan-sm transition-all"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Publicar
                      </button>
                    )}

                    <button
                      onClick={() => remove(video.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remover
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Storage path reference */}
          <div className="rounded-lg border border-border bg-surface-1 p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-cyan" />
              Estrutura de pastas — opendata-videos (R2)
            </p>
            <div className="font-mono text-xs space-y-1 text-foreground/70">
              <p><span className="text-cyan">opendata-videos/</span></p>
              <p className="pl-4"><span className="text-warning">├── private/uploads-temp/</span> <span className="text-muted-foreground">← rascunhos</span></p>
              <p className="pl-4"><span className="text-success">└── public/</span> <span className="text-muted-foreground">← vídeos publicados (tv.opendata.center)</span></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PainelPage;
