import { useEffect, useState } from "react";
import {
  Aperture,
  BookOpen,
  Layers,
  Orbit,
  PenLine,
  Radio,
  ScrollText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CanvasStage } from "@/components/studio/CanvasStage";
import { Atlas } from "@/components/studio/Atlas";
import { Inspector, Planes } from "@/components/studio/Inspector";
import { Overture } from "@/components/studio/Overture";
import { execute, orderIds } from "@/lib/studio/engine";
import { HOUSES, KIND_LABEL } from "@/lib/studio/presets";
import { useStudio } from "@/lib/studio/store";
import type { HouseId, NodeKind } from "@/lib/studio/types";
import { X } from "lucide-react";

const KINDS: { kind: NodeKind; icon: LucideIcon }[] = [
  { kind: "brief", icon: PenLine },
  { kind: "memory", icon: Layers },
  { kind: "agent", icon: Orbit },
  { kind: "skill", icon: ScrollText },
  { kind: "scene", icon: BookOpen },
  { kind: "lens", icon: Aperture },
  { kind: "distribute", icon: Radio },
];

export function Studio() {
  const overture = useStudio((s) => s.overture);
  const house = useStudio((s) => s.house);
  const overlay = useStudio((s) => s.overlay);
  const selectedId = useStudio((s) => s.selectedId);
  const nodes = useStudio((s) => s.nodes);
  const edges = useStudio((s) => s.edges);
  const running = useStudio((s) => s.running);
  const loadHouse = useStudio((s) => s.loadHouse);
  const showOverture = useStudio((s) => s.showOverture);
  const setOverlay = useStudio((s) => s.setOverlay);
  const addNode = useStudio((s) => s.addNode);
  const select = useStudio((s) => s.select);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const pending = useStudio.persist.rehydrate();
    void Promise.resolve(pending).then(() => setReady(true));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Backspace" && e.key !== "Delete") return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea")) return;
      const id = useStudio.getState().selectedId;
      if (!id) return;
      e.preventDefault();
      useStudio.getState().removeNode(id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function run() {
    const state = useStudio.getState();
    if (state.running) return;
    state.setRunning(true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const { order } = orderIds(state.nodes, state.edges);
    for (const id of order) {
      if (!useStudio.getState().running && useStudio.getState().nodes.every((n) => n.status !== "live")) break;
      useStudio.getState().setStatus(id, "live");
      if (!reduce) await wait(110);
    }
    const now = useStudio.getState();
    const result = execute(now.nodes, now.edges);
    now.commit(result.nodes, result.episode);
  }

  function add(kind: NodeKind) {
    const count = useStudio.getState().nodes.length;
    addNode(kind, 480 + (count % 4) * 24, 160 + (count % 3) * 28);
  }

  if (!ready || overture) return <Overture />;

  const meta = HOUSES.find((h) => h.id === house);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ink text-bone">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-3">
        <button type="button" onClick={showOverture} className="flex items-center gap-2 font-display text-lg">
          <span className="hidden size-2 rounded-full bg-copper sm:inline-block" />
          Starlight
        </button>
        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {HOUSES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => loadHouse(item.id as HouseId)}
              className={`h-11 border-b-2 px-3 text-sm ${
                item.id === house ? "border-copper text-bone" : "border-transparent text-muted"
              }`}
            >
              {item.name}
            </button>
          ))}
        </nav>
        <p className="hidden pr-2 text-xs tracking-widest text-muted uppercase xl:block">
          {nodes.length} nodes · {edges.length} wires
        </p>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOverlay("memory")}
            className="flex h-11 items-center gap-2 rounded-xl px-3 text-sm text-muted"
          >
            <Layers className="size-4" />
            <span className="hidden sm:inline">Memory</span>
          </button>
          <button
            type="button"
            onClick={() => setOverlay("atlas")}
            className="flex h-11 items-center rounded-xl px-3 text-sm text-muted"
          >
            Atlas
          </button>
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="hidden h-11 items-center rounded-xl bg-copper px-4 text-sm font-medium text-copper-ink disabled:opacity-60 lg:inline-flex"
          >
            {running ? "Passing…" : "Run house"}
          </button>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto border-b border-line px-3 py-2 lg:hidden">
        {KINDS.map(({ kind, icon: Icon }) => (
          <button
            key={kind}
            type="button"
            onClick={() => add(kind)}
            className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-line px-3 text-sm text-bone"
          >
            <Icon className="size-4 text-copper" />
            {KIND_LABEL[kind]}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-52 shrink-0 flex-col gap-1 border-r border-line p-3 lg:flex">
          <p className="px-2 pb-2 text-xs tracking-widest text-muted uppercase">
            {meta?.line}
          </p>
          {KINDS.map(({ kind, icon: Icon }) => (
            <button
              key={kind}
              type="button"
              onClick={() => add(kind)}
              className="flex h-11 items-center gap-2 rounded-xl px-2 text-left text-sm text-bone hover:bg-raised"
            >
              <Icon className="size-4 text-copper" />
              {KIND_LABEL[kind]}
            </button>
          ))}
        </aside>
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <CanvasStage houseKey={house} />
          {selectedId && (
            <div className="absolute inset-y-0 right-0 z-20 hidden w-80 border-l border-line lg:block">
              <Inspector onClose={() => select(null)} />
            </div>
          )}
        </div>
      </div>

      {selectedId && (
        <div className="fixed inset-x-0 bottom-14 z-20 flex h-2/3 flex-col border-t border-line lg:hidden">
          <Inspector onClose={() => select(null)} />
        </div>
      )}

      <nav className="grid h-14 shrink-0 grid-cols-4 border-t border-line lg:hidden">
        {HOUSES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => loadHouse(item.id as HouseId)}
            className={`truncate px-1 text-xs ${item.id === house ? "text-bone" : "text-muted"}`}
          >
            {item.name}
          </button>
        ))}
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="bg-copper text-sm font-medium text-copper-ink disabled:opacity-60"
        >
          {running ? "…" : "Run"}
        </button>
      </nav>

      {overlay === "atlas" && <Atlas />}
      {overlay === "memory" && <MemorySheet />}
    </div>
  );
}

function MemorySheet() {
  const close = useStudio((s) => s.setOverlay);
  const log = useStudio((s) => s.log);
  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-ink text-bone">
      <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest text-copper uppercase">Memory</p>
            <h2 className="mt-2 font-display text-4xl">Four shelves. One of them dies.</h2>
          </div>
          <button
            type="button"
            onClick={() => close(null)}
            className="grid size-11 place-items-center rounded-xl border border-line"
            aria-label="Close memory"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
          Working holds the brief and is not canon. World holds laws. Audience holds who it is
          for, and is not allowed to rewrite the world. Episodic is the run you just made.
        </p>
        <Planes />
        <div className="mt-8 space-y-3 pb-16">
          <p className="text-xs tracking-widest text-muted uppercase">Episodic log</p>
          {log.length === 0 && <p className="text-sm text-muted">Run a house. The log starts there.</p>}
          {log.map((episode) => (
            <details key={episode.id} className="rounded-xl border border-line bg-surface p-4">
              <summary className="text-sm text-bone">
                {episode.title}
                <span className="ml-2 text-muted">{episode.source === "grok" ? "Grok" : "Runtime"}</span>
              </summary>
              <div className="mt-3 space-y-3">
                {episode.beats.map((beat) => (
                  <div key={beat.nodeId}>
                    <p className="text-xs tracking-widest text-copper uppercase">{beat.title}</p>
                    <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-bone">{beat.text}</p>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
