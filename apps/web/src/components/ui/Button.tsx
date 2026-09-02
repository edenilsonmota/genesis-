import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export type ButtonVariant =
  "primary" | "secondary" | "view" | "edit" | "danger" | "ghost";
const variants: Record<ButtonVariant, string> = {
  primary: "border-emerald-800 bg-emerald-800 text-white hover:bg-emerald-900",
  secondary: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  view: "border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100",
  edit: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
  danger: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  ghost: "border-transparent bg-transparent text-slate-600 hover:bg-slate-100",
};
export function Button({
  variant = "secondary",
  className = "",
  type = "button",
  children,
  ...props
}: PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }
>) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-10 items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
