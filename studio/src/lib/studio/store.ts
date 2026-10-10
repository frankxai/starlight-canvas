import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { blankNode, constellation } from "./presets";
import type { Episode, GraphEdge, GraphNode, HouseId, NodeKind, NodeStatus } from "./types";

type Overlay = "memory" | "atlas" | null;

interface StudioState {
  house: HouseId;
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId: string | null;
  overture: boolean;
  overlay: Overlay;
  log: Episode[];
  running: boolean;
  enter: (house: HouseId) => void;
  loadHouse: (house: HouseId) => void;
  showOverture: () => void;
  setOverlay: (overlay: Overlay) => void;
  select: (id: string | null) => void;
  moveNode: (id: string, x: number, y: number) => void;
  updateNode: (id: string, patch: Partial<Pick<GraphNode, "title" | "body" | "role">>) => void;
  setStatus: (id: string, status: NodeStatus) => void;
  addNode: (kind: NodeKind, x: number, y: number) => string;
  connect: (from: string, to: string) => void;
  disconnect: (edgeId: string) => void;
  removeNode: (id: string) => void;
  setRunning: (running: boolean) => void;
  commit: (nodes: GraphNode[], episode: Episode) => void;
  writeGrok: (id: string, text: string, episode: Episode) => void;
}

const initial = constellation("arcanea");

export const useStudio = create<StudioState>()(
  persist(
    (set, get) => ({
      house: "arcanea",
      nodes: initial.nodes,
      edges: initial.edges,
      selectedId: null,
      overture: true,
      overlay: null,
      log: [],
      running: false,
      enter: (house) => {
        const graph = constellation(house);
        set({
          house,
          nodes: graph.nodes,
          edges: graph.edges,
          selectedId: null,
          overture: false,
          overlay: null,
        });
      },
      loadHouse: (house) => {
        const graph = constellation(house);
        set({ house, nodes: graph.nodes, edges: graph.edges, selectedId: null, overlay: null });
      },
      showOverture: () => set({ overture: true, overlay: null }),
      setOverlay: (overlay) => set({ overlay }),
      select: (id) => set({ selectedId: id }),
      moveNode: (id, x, y) =>
        set({
          nodes: get().nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
        }),
      updateNode: (id, patch) =>
        set({
          nodes: get().nodes.map((n) =>
            n.id === id ? { ...n, ...patch, status: "idle" } : n,
          ),
        }),
      setStatus: (id, status) =>
        set({
          nodes: get().nodes.map((n) => (n.id === id ? { ...n, status } : n)),
        }),
      addNode: (kind, x, y) => {
        const created = blankNode(get().house, kind, x, y);
        set({ nodes: [...get().nodes, created], selectedId: created.id });
        return created.id;
      },
      connect: (from, to) => {
        if (from === to) return;
        if (get().edges.some((e) => e.from === from && e.to === to)) return;
        const id = `e-${crypto.randomUUID().slice(0, 8)}`;
        set({ edges: [...get().edges, { id, from, to }] });
      },
      disconnect: (edgeId) => set({ edges: get().edges.filter((e) => e.id !== edgeId) }),
      removeNode: (id) =>
        set({
          nodes: get().nodes.filter((n) => n.id !== id),
          edges: get().edges.filter((e) => e.from !== id && e.to !== id),
          selectedId: get().selectedId === id ? null : get().selectedId,
        }),
      setRunning: (running) => set({ running }),
      commit: (nodes, episode) =>
        set({
          nodes,
          running: false,
          log: [episode, ...get().log].slice(0, 8),
        }),
      writeGrok: (id, text, episode) =>
        set({
          nodes: get().nodes.map((n) =>
            n.id === id ? { ...n, output: text, status: "done" } : n,
          ),
          log: [episode, ...get().log].slice(0, 8),
        }),
    }),
    {
      name: "starlight-canvas-v2",
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        house: s.house,
        nodes: s.nodes,
        edges: s.edges,
        overture: s.overture,
        log: s.log,
      }),
    },
  ),
);
