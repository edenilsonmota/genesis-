import { useState, type FormEvent } from "react";
import { getApiErrorMessage } from "../../../lib/http";
import { changePassword } from "../api/authApi";
import { useAuth } from "../context/useAuth";

const inputClass =
  "w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100";

export function ChangePasswordPage() {
  const { accessToken, user, updateUser, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !user) return;
    if (newPassword !== confirmation) {
      setError("A confirmação não corresponde à nova senha.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await changePassword(accessToken, currentPassword, newPassword);
      updateUser({ ...user, mustChangePassword: false });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <form className="w-full max-w-md space-y-5 rounded-2xl bg-white p-7 shadow-sm" onSubmit={submit}>
        <div>
          <p className="text-xs font-bold tracking-wider text-emerald-700 uppercase">Primeiro acesso</p>
          <h1 className="font-display mt-2 text-2xl font-bold">Crie sua senha</h1>
          <p className="mt-2 text-sm text-slate-500">Por segurança, substitua a senha inicial antes de continuar.</p>
        </div>
        <label className="grid gap-2 text-sm font-semibold">Senha atual<input className={inputClass} type="password" minLength={8} autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
        <label className="grid gap-2 text-sm font-semibold">Nova senha<input className={inputClass} type="password" minLength={8} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
        <label className="grid gap-2 text-sm font-semibold">Confirmar nova senha<input className={inputClass} type="password" minLength={8} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></label>
        {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
        <button className="w-full rounded-xl bg-emerald-800 px-4 py-3 font-bold text-white disabled:opacity-60" disabled={submitting}>{submitting ? "Salvando…" : "Salvar nova senha"}</button>
        <button className="w-full text-sm text-slate-500" type="button" onClick={logout}>Sair</button>
      </form>
    </main>
  );
}
