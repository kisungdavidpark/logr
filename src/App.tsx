import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import Sidebar from "./components/Sidebar";
import TabBar from "./components/TabBar";
import LogViewer from "./components/LogViewer";
import Toolbar from "./components/Toolbar";
import { useBookmarkStore } from "./stores/bookmarkStore";
import { useTabStore } from "./stores/tabStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useSshStore } from "./stores/sshStore";
import UpdateBanner from "./components/UpdateBanner";
import { useUpdater } from "./hooks/useUpdater";
export default function App() {
  const { loadBookmarks } = useBookmarkStore();
  const { loadConnections } = useSshStore();
  const { addTab } = useTabStore();
  const { defaultEncoding } = useSettingsStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const { state: updateState, install: installUpdate, dismiss: dismissUpdate } = useUpdater();

  const addTabRef = useRef(addTab);
  const defaultEncodingRef = useRef(defaultEncoding);
  addTabRef.current = addTab;
  defaultEncodingRef.current = defaultEncoding;

  // LogViewer가 내보내기 핸들러를 등록; Toolbar가 호출
  const exportHandlerRef = useRef<((format: "txt" | "csv") => Promise<void>) | null>(null);
  const displayLineCountRef = useRef(0);
  const onRegisterExport = useCallback(
    (fn: (format: "txt" | "csv") => Promise<void>) => { exportHandlerRef.current = fn; },
    []
  );

  useEffect(() => {
    loadBookmarks();
    loadConnections();
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    getCurrentWebviewWindow()
      .onDragDropEvent((event) => {
        const type = event.payload.type;
        if (type === "enter") {
          setIsDragOver(true);
        } else if (type === "drop") {
          setIsDragOver(false);
          const paths = (event.payload as { type: string; paths: string[] }).paths ?? [];
          for (const filePath of paths) {
            const alias = filePath.split(/[\\/]/).pop() ?? filePath;
            addTabRef.current({ filePath, alias, encoding: defaultEncodingRef.current, isFollowing: true });
          }
        } else if (type === "leave") {
          setIsDragOver(false);
        }
      })
      .then((unlisten) => {
        cleanup = unlisten;
      });

    return () => { cleanup?.(); };
  }, []);

  return (
    <div
      className="flex flex-col"
      style={{ height: "100vh", backgroundColor: "var(--color-bg-primary)", position: "relative" }}
    >
      <TabBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <LogViewer onRegisterExport={onRegisterExport} displayLineCountRef={displayLineCountRef} />
      </div>
      <Toolbar
        onExport={(fmt) => exportHandlerRef.current?.(fmt) ?? Promise.resolve()}
        displayLineCountRef={displayLineCountRef}
        hasUpdate={updateState.phase === "available"}
      />

      <UpdateBanner state={updateState} install={installUpdate} dismiss={dismissUpdate} />

      {isDragOver && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none"
          style={{
            backgroundColor: "rgba(79, 142, 247, 0.08)",
            border: "2px dashed var(--color-accent)",
            zIndex: 50,
          }}
        >
          <div style={{ fontSize: 40, opacity: 0.7 }}>📂</div>
          <div
            className="text-sm font-medium"
            style={{ color: "var(--color-accent)" }}
          >
            파일을 놓아 열기
          </div>
        </div>
      )}
    </div>
  );
}
