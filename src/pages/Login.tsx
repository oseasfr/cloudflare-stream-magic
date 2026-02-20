import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";

// MS365 email domain validation
const isMS365Email = (email: string) => {
  // Accepts any email — real MS365 OAuth requires backend
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isMS365Email(email)) {
      setError("Insira um e-mail Microsoft 365 válido.");
      return;
    }
    if (!password) {
      setError("Insira sua senha.");
      return;
    }

    setLoading(true);

    // Simulated MS365 auth — real integration requer backend + Azure AD OAuth
    await new Promise(r => setTimeout(r, 1400));

    // Store session (real: token from Azure AD)
    sessionStorage.setItem("odc_auth", JSON.stringify({ email, at: Date.now() }));
    setLoading(false);
    navigate("/upload");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "hsl(var(--background))" }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-8 select-none">
        <div className="w-16 h-16 mb-4 flex items-center justify-center">
          <img
            src="https://core.opendata.center/assets/logo-white-Dn9-pPgP.png"
            alt="OPEN Datacenter"
            className="w-14 h-14 object-contain"
            onError={(e) => {
              // Fallback: cloud icon SVG inline
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <span className="text-2xl font-black tracking-wide text-foreground">OPEN</span>
        <span className="text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase mt-0.5">
          Datacenter
        </span>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-xl border border-border p-7 shadow-deep"
        style={{ background: "hsl(var(--card))" }}
      >
        <h1 className="text-xl font-bold text-foreground mb-1">Bem-vindo</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Faça login com sua conta Microsoft 365
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seu@empresa.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              className="w-full rounded-lg border border-border bg-input px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                className="w-full rounded-lg border border-border bg-input px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "hsl(var(--primary))" }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Autenticando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-5">
          Autenticação Microsoft 365 · SSO corporativo
        </p>
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground mt-8">
        © 2026 OPEN Datacenter. Todos os direitos reservados.
      </p>
    </div>
  );
};

export default LoginPage;
