import { Link } from "react-router-dom";
import { Upload, LayoutDashboard, Tv, ArrowRight, Radio, Shield, Zap, HardDrive } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: Upload,
    title: "Upload Seguro",
    desc: "Upload via Cloudflare Worker com autenticação, validação de MIME e limite de 500MB.",
    href: "/upload",
    label: "upload.opendata.center",
  },
  {
    icon: LayoutDashboard,
    title: "Painel de Gestão",
    desc: "Liste, publique e remova vídeos do bucket R2. Mova de /private/ para /public/ com um clique.",
    href: "/painel",
    label: "painel.opendata.center",
  },
  {
    icon: Tv,
    title: "TV Player",
    desc: "Player fullscreen em modo TV — autoplay, loop infinito, sem controles visíveis.",
    href: "/tv/produto-demo-v2",
    label: "tv.opendata.center/{video}",
  },
];

const IndexPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-cyan" />
            <span className="font-bold text-sm">
              <span className="text-cyan">opendata</span><span className="text-foreground">.center</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/upload" className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
              Upload
            </Link>
            <Link to="/painel" className="px-3 py-1.5 rounded-lg bg-cyan text-primary-foreground text-xs font-semibold hover:brightness-110 hover:shadow-glow-cyan-sm transition-all">
              Painel
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-14 min-h-[60vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />

        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <div className="flex items-center gap-2 mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow" />
            <span className="text-xs font-mono text-muted-foreground">Cloudflare R2 · Workers · Serverless</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-foreground leading-tight mb-4 animate-slide-up">
            Portal de<br />
            <span className="gradient-cyan-text">Streaming</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Upload, gestão e reprodução de vídeos com arquitetura serverless via Cloudflare Workers e R2.
          </p>

          <div className="flex items-center gap-3 flex-wrap animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link
              to="/upload"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan text-primary-foreground font-semibold text-sm hover:shadow-glow-cyan hover:brightness-110 transition-all"
            >
              <Upload className="w-4 h-4" />
              Fazer Upload
            </Link>
            <Link
              to="/painel"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-foreground font-medium text-sm hover:border-foreground/40 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Ver Painel
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc, href, label }, i) => (
            <Link
              key={href}
              to={href}
              className="group rounded-xl border border-border bg-surface-1 p-6 hover:border-cyan/40 hover:bg-surface-2 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center mb-4 group-hover:bg-cyan/20 group-hover:shadow-glow-cyan-sm transition-all">
                <Icon className="w-5 h-5 text-cyan" />
              </div>
              <h2 className="font-bold text-foreground mb-2">{title}</h2>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">{label}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        {/* Security / arch pills */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          {[
            { icon: Shield, label: "URLs Assinadas" },
            { icon: Zap, label: "Worker Serverless" },
            { icon: HardDrive, label: "R2 · opendata-videos" },
            { icon: Tv, label: "Player fullscreen" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-surface-1 text-xs text-muted-foreground">
              <Icon className="w-3 h-3 text-cyan" />
              {label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default IndexPage;
