import { useT } from "../../i18n";
import type { UpdaterState } from "../../hooks/useUpdater";

interface UpdateBannerProps {
  state: UpdaterState;
  install: () => Promise<void>;
  dismiss: () => void;
}

export default function UpdateBanner({ state, install, dismiss }: UpdateBannerProps) {
  const t = useT();

  if (state.phase === "idle") return null;

  const isWorking = state.phase === "downloading" || state.phase === "installing";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 200,
        backgroundColor: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        padding: "12px 16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minWidth: 280,
        maxWidth: 340,
      }}
    >
      {state.phase === "available" && (
        <>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div>
              <div className="text-xs font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {t("update.available")}
              </div>
              <div className="text-xs" style={{ color: "var(--color-text-secondary)", marginTop: 2 }}>
                v{state.update.version}
              </div>
            </div>
            <button
              onClick={dismiss}
              className="text-xs hover:opacity-70"
              style={{ color: "var(--color-text-secondary)", lineHeight: 1, flexShrink: 0 }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={install}
              className="text-xs font-medium px-3 py-1.5 rounded"
              style={{ backgroundColor: "var(--color-accent)", color: "#fff", flex: 1 }}
            >
              {t("update.install")}
            </button>
            <button
              onClick={dismiss}
              className="text-xs px-3 py-1.5 rounded"
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                color: "var(--color-text-secondary)",
                border: "1px solid var(--color-border)",
              }}
            >
              {t("update.later")}
            </button>
          </div>
        </>
      )}

      {state.phase === "downloading" && (
        <>
          <div className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>
            {t("update.downloading")} {state.progress > 0 ? `${state.progress}%` : ""}
          </div>
          <div style={{ height: 4, backgroundColor: "var(--color-bg-tertiary)", borderRadius: 2, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: state.progress > 0 ? `${state.progress}%` : "30%",
                backgroundColor: "var(--color-accent)",
                borderRadius: 2,
                transition: "width 0.2s ease",
                animation: state.progress === 0 ? "pulse 1.5s ease-in-out infinite" : undefined,
              }}
            />
          </div>
        </>
      )}

      {state.phase === "installing" && (
        <div className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>
          {t("update.installing")}
        </div>
      )}

      {state.phase === "error" && (
        <>
          <div className="text-xs font-medium" style={{ color: "var(--color-error, #f87171)" }}>
            {t("update.error")}
          </div>
          <div className="text-xs" style={{ color: "var(--color-text-secondary)", wordBreak: "break-all" }}>
            {state.message}
          </div>
          <button
            onClick={dismiss}
            className="text-xs px-3 py-1 rounded self-end"
            style={{ backgroundColor: "var(--color-bg-tertiary)", color: "var(--color-text-secondary)" }}
          >
            {t("update.later")}
          </button>
        </>
      )}

      {isWorking && (
        <div className="text-xs" style={{ color: "var(--color-text-secondary)", opacity: 0.6 }}>
          앱이 자동으로 재시작됩니다
        </div>
      )}
    </div>
  );
}
