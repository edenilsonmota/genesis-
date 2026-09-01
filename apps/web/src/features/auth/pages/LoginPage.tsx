import { useState, type FormEvent } from "react";
import { getApiErrorMessage } from "../../../lib/http";
import { login } from "../api/authApi";
import { useAuth } from "../context/useAuth";

const inputClass =
  "w-full rounded-xl border border-[#cdd7d0] bg-[#fffdfa] px-4 py-[15px] font-normal text-[#173a30] outline-none transition placeholder:text-[#9ba7a1] focus:border-[#358c68] focus:ring-4 focus:ring-[#358c6818]";
const labelClass = "mb-[22px] grid gap-2 text-sm font-bold text-[#294b41]";

export function LoginPage() {
  const { authenticate } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await login({ email, password });
      authenticate(result.accessToken, result.user);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen md:grid-cols-[minmax(0,1.08fr)_minmax(440px,0.92fr)]">
      <section
        className="relative flex min-h-72 flex-col justify-between overflow-hidden bg-[#123d32] p-8 text-[#f8f4e9] md:min-h-screen md:p-[clamp(36px,6vw,88px)]"
        aria-labelledby="login-title"
      >
        <div className="pointer-events-none absolute -top-56 -right-64 size-[620px] rounded-full border border-[#7fd3ae55] shadow-[0_0_0_90px_#7fd3ae12,0_0_0_180px_#7fd3ae0a]" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 size-72 rounded-full bg-[#d7a95718]" />
        <span
          className="font-display relative z-10 grid size-12 place-items-center rounded-[14px] border border-[#9ce4c2] font-extrabold text-[#baf2d6] md:size-[54px]"
          aria-hidden="true"
        >
          G+
        </span>
        <div className="relative z-10">
          <p className="mb-3.5 text-xs font-bold tracking-[.16em] text-[#9ce4c2] uppercase">
            Gestão que aproxima
          </p>
          <h1
            className="font-display text-[clamp(3.5rem,18vw,6rem)] leading-[.95] font-extrabold tracking-[-.075em] md:text-[clamp(4rem,10vw,8rem)]"
            id="login-title"
          >
            Genesis<span className="text-[#80ddb2]">+</span>
          </h1>
          <p className="mt-5 max-w-xl text-[clamp(1.1rem,2vw,1.45rem)] leading-relaxed text-[#d4e7de] md:mt-7">
            Pessoas, ministérios e igrejas conectados em um só lugar.
          </p>
        </div>
        <p className="relative z-10 hidden text-sm text-[#9db9ae] md:block">
          Administração simples. Comunidade em primeiro lugar.
        </p>
      </section>
      <section
        className="grid place-items-center bg-[#f5f2e9] px-6 py-12 md:p-10"
        aria-label="Acesso ao sistema"
      >
        <form className="w-full max-w-[420px]" onSubmit={handleSubmit}>
          <header className="mb-8 md:mb-10">
            <p className="mb-3.5 text-xs font-bold tracking-[.16em] text-[#69bd98] uppercase">
              Área segura
            </p>
            <h2 className="font-display mb-2.5 text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-.045em]">
              Boas-vindas
            </h2>
            <p className="text-[#72827b]">
              Entre com sua conta para continuar.
            </p>
          </header>
          <label className={labelClass}>
            E-mail
            <input
              className={inputClass}
              autoComplete="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@igreja.com"
              required
              type="email"
              value={email}
            />
          </label>
          <label className={labelClass}>
            Senha
            <input
              className={inputClass}
              autoComplete="current-password"
              minLength={8}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
              required
              type="password"
              value={password}
            />
          </label>
          {error && (
            <p
              className="-mt-1 mb-4 rounded-[10px] border border-[#dca9a0] bg-[#fff0ed] px-3.5 py-3 text-sm text-[#8d3327]"
              role="alert"
            >
              {error}
            </p>
          )}
          <button
            className="mt-2 w-full rounded-xl bg-[#176044] px-5 py-[15px] font-bold text-[#f7fff9] shadow-[0_12px_30px_#17604422] transition hover:-translate-y-px hover:bg-[#0f5138] disabled:cursor-wait disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Entrando…" : "Entrar"}
          </button>
          <p className="mt-5 text-center text-[.82rem] leading-relaxed text-[#72827b]">
            Problemas para acessar? Procure o administrador da sua igreja.
          </p>
        </form>
      </section>
    </main>
  );
}
