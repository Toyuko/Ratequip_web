import { indeedAdapter } from "@/lib/talent/adapters/indeed";
import { linkedInAdapter } from "@/lib/talent/adapters/linkedin";
import type { BoardId, JobBoardAdapter } from "@/lib/talent/types";

const adapters: Partial<Record<BoardId, JobBoardAdapter>> = {
  indeed: indeedAdapter,
  linkedin: linkedInAdapter,
};

export function getAdapter(board: BoardId): JobBoardAdapter {
  const adapter = adapters[board];
  if (!adapter) {
    throw new Error(`No adapter registered for board ${board}`);
  }
  return adapter;
}

export function listAdapters(): JobBoardAdapter[] {
  return Object.values(adapters).filter(Boolean) as JobBoardAdapter[];
}
