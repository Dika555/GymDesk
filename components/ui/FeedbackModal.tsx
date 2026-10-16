"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

type FeedbackType = "success" | "error" | "warning" | "info";

type Props = {
  open: boolean;
  title: string;
  message: string;
  type?: FeedbackType;
  onClose: () => void;
};

const appearance = {
  success: {
    icon: CheckCircle2,
    iconClass: "bg-green-100 text-green-600",
    buttonClass: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
  },
  error: {
    icon: XCircle,
    iconClass: "bg-red-100 text-red-600",
    buttonClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "bg-amber-100 text-amber-600",
    buttonClass: "bg-orange-500 hover:bg-orange-600 focus:ring-orange-500",
  },
  info: {
    icon: Info,
    iconClass: "bg-blue-100 text-blue-600",
    buttonClass: "bg-orange-500 hover:bg-orange-600 focus:ring-orange-500",
  },
};

export default function FeedbackModal({
  open,
  title,
  message,
  type = "info",
  onClose,
}: Props) {
  if (!open) return null;

  const style = appearance[type];
  const Icon = style.icon;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
        aria-describedby="feedback-modal-message"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${style.iconClass}`}
          >
            <Icon size={26} />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pesan"
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X size={20} />
          </button>
        </div>

        <h2
          id="feedback-modal-title"
          className="mt-4 text-lg font-bold text-zinc-900"
        >
          {title}
        </h2>

        <p
          id="feedback-modal-message"
          className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600"
        >
          {message}
        </p>

        <button
          type="button"
          autoFocus
          onClick={onClose}
          className={`mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${style.buttonClass}`}
        >
          Mengerti
        </button>
      </section>
    </div>
  );
}