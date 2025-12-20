import { create } from "zustand";
import type { Session } from "../types/session";

interface ResearchStoreState {
  sessionId: string | null;
  session: Session | null;
  setSessionId: (sessionId: string | null) => void;
  setSession: (session: Session | null) => void;
  clearSession: () => void;
}

export const useResearchStore = create<ResearchStoreState>((set) => ({
  sessionId: null,
  session: null,
  setSessionId: (sessionId) => set({ sessionId }),
  setSession: (session) => set({ session }),
  clearSession: () => set({ sessionId: null, session: null }),
}));
