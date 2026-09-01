import { useAuth } from "../context/useAuth";

export function AuthenticatedHome() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_50%_10%,#d8eadf,#f5f2e9_55%)] p-6">
      <section className="w-full max-w-[620px] rounded-3xl border border-[#d2ddd6] bg-[#fffdf8] p-[clamp(32px,7vw,64px)] shadow-[0_30px_80px_#173a3018]">
        <span
          className="font-display mb-12 grid size-[54px] place-items-center rounded-[17px] border border-[#176044] font-extrabold text-[#176044]"
          aria-hidden="true"
        >
          G+
        </span>
        <p className="mb-3.5 text-xs font-bold tracking-[.16em] text-[#69bd98] uppercase">
          Sessão autenticada
        </p>
        <h1 className="font-display mb-[18px] text-[clamp(2.4rem,7vw,4.5rem)] leading-[.95] font-extrabold tracking-[-.075em]">
          Olá, {user.name}
        </h1>
        <p className="text-[#72827b]">
          {user.isAdmin
            ? "Administrador global"
            : user.roles.join(", ") || "Usuário"}
        </p>
        <button
          className="mt-6 rounded-xl bg-[#176044] px-8 py-[15px] font-bold text-[#f7fff9] shadow-[0_12px_30px_#17604422] transition hover:-translate-y-px hover:bg-[#0f5138]"
          onClick={logout}
          type="button"
        >
          Sair
        </button>
      </section>
    </main>
  );
}
