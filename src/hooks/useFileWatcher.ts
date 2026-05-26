import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { LogLine } from "../types";

const POLL_INTERVAL = 300; // ms

export function useFileWatcher(
  filePath: string | null,
  isFollowing: boolean,
  encoding: string,
  onNewLines: (lines: LogLine[]) => void,
  filePosRef: React.MutableRefObject<number>
) {
  const onNewLinesRef = useRef(onNewLines);
  onNewLinesRef.current = onNewLines;

  useEffect(() => {
    if (!filePath || !isFollowing) return;

    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      try {
        const size = await invoke<number>("get_file_size", { path: filePath });
        if (size > filePosRef.current) {
          const result = await invoke<{ lines: LogLine[]; new_pos: number }>(
            "read_lines_from_pos",
            { path: filePath, fromPos: filePosRef.current, encoding }
          );
          if (!cancelled && result.lines.length > 0) {
            filePosRef.current = result.new_pos;
            onNewLinesRef.current(result.lines);
          }
        }
      } catch {
        // 파일 읽기 실패 시 조용히 무시 (파일 삭제/이동 등)
      }
    };

    const intervalId = setInterval(poll, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [filePath, isFollowing, encoding]);
}
