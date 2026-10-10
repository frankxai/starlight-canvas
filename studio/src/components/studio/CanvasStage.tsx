import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Scan } from "lucide-react";
import { useStudio } from "@/lib/studio/store";
import { KIND_LABEL } from "@/lib/studio/presets";
import type { GraphNode } from "@/lib/studio/types";

const NODE_W = 240;

interface Cam {
  x: number;
  y: number;
  z: number;
}

export function CanvasStage({ houseKey }: { houseKey: string }) {
  const nodes = useStudio((s) => s.nodes);
  const edges = useStudio((s) => s.edges);
  const selectedId = useStudio((s) => s.selectedId);
  const log = useStudio((s) => s.log);
  const select = useStudio((s) => s.select);
  const moveNode = useStudio((s) => s.moveNode);
  const connect = useStudio((s) => s.connect);

  const vp = useRef<HTMLDivElement>(null);
  const camRef = useRef<Cam>({ x: 24, y: 24, z: 0.9 });
  const [cam, setCam] = useState<Cam>(camRef.current);
  const dragRef = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const panRef = useRef<{ px: number; py: number; cx: number; cy: number } | null>(null);
  const linkRef = useRef<string | null>(null);
  const [link, setLink] = useState<{ fromId: string; x: number; y: number } | null>(null);

  useEffect(() => {
    camRef.current = cam;
  }, [cam]);

  function toWorld(clientX: number, clientY: number) {
    const rect = vp.current?.getBoundingClientRect();
    const c = camRef.current;
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - c.x) / c.z,
      y: (clientY - rect.top - c.y) / c.z,
    };
  }

  function fit() {
    const el = vp.current;
    const current = useStudio.getState().nodes;
    if (!el || current.length === 0) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 40 || rect.height < 40) return;
    const minX = Math.min(...current.map((n) => n.x));
    const minY = Math.min(...current.map((n) => n.y));
    const maxX = Math.max(...current.map((n) => n.x)) + NODE_W;
    const maxY = Math.max(...current.map((n) => n.y)) + 210;
    const w = Math.max(1, maxX - minX);
    const h = Math.max(1, maxY - minY);
    const reserve = 92;
    const z = Math.min(
      1,
      Math.max(0.42, Math.min((rect.width - 72) / w, (rect.height - reserve - 28) / h)),
    );
    const spare = rect.height - reserve - h * z;
    setCam({
      z,
      x: (rect.width - w * z) / 2 - minX * z,
      y: Math.max(16, spare * 0.35) - minY * z,
    });
  }

  useEffect(() => {
    const el = vp.current;
    if (!el) return;
    let cancel = false;
    let fitted = false;
    const attempt = () => {
      if (cancel || fitted) return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 40 || rect.height < 40) return;
      fitted = true;
      fit();
    };
    const observer = new ResizeObserver(attempt);
    observer.observe(el);
    const timer = window.setTimeout(attempt, 40);
    return () => {
      cancel = true;
      observer.disconnect();
      window.clearTimeout(timer);
    };
    // Fit once per house, after the canvas actually has a size.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [houseKey]);

  useEffect(() => {
    const el = vp.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest("[data-ui]")) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      setCam((c) => {
        const next = clamp(c.z * (e.deltaY < 0 ? 1.08 : 0.92), 0.4, 1.45);
        const wx = (e.clientX - rect.left - c.x) / c.z;
        const wy = (e.clientY - rect.top - c.y) / c.z;
        return {
          z: next,
          x: e.clientX - rect.left - wx * next,
          y: e.clientY - rect.top - wy * next,
        };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("[data-ui]")) return;
    vp.current?.setPointerCapture(e.pointerId);
    const port = (e.target as HTMLElement).closest("[data-port]");
    if (port?.getAttribute("data-port") === "out") {
      const id = port.getAttribute("data-node-id");
      if (!id) return;
      const w = toWorld(e.clientX, e.clientY);
      linkRef.current = id;
      setLink({ fromId: id, x: w.x, y: w.y });
      return;
    }
    const card = (e.target as HTMLElement).closest("[data-node]");
    if (card) {
      const id = card.getAttribute("data-node-id");
      const node = useStudio.getState().nodes.find((n) => n.id === id);
      if (!id || !node) return;
      select(id);
      const w = toWorld(e.clientX, e.clientY);
      dragRef.current = { id, ox: w.x - node.x, oy: w.y - node.y };
      return;
    }
    select(null);
    const c = camRef.current;
    panRef.current = { px: e.clientX, py: e.clientY, cx: c.x, cy: c.y };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (dragRef.current) {
      const w = toWorld(e.clientX, e.clientY);
      moveNode(dragRef.current.id, w.x - dragRef.current.ox, w.y - dragRef.current.oy);
      return;
    }
    if (panRef.current) {
      setCam((c) => ({
        ...c,
        x: panRef.current!.cx + (e.clientX - panRef.current!.px),
        y: panRef.current!.cy + (e.clientY - panRef.current!.py),
      }));
      return;
    }
    if (linkRef.current) {
      const w = toWorld(e.clientX, e.clientY);
      setLink({ fromId: linkRef.current, x: w.x, y: w.y });
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    if (linkRef.current) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const port = el?.closest("[data-port='in']");
      const to = port?.getAttribute("data-node-id");
      if (to) connect(linkRef.current, to);
      linkRef.current = null;
      setLink(null);
    }
    dragRef.current = null;
    panRef.current = null;
  }

  function zoomBy(factor: number) {
    const el = vp.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCam((c) => {
      const next = clamp(c.z * factor, 0.4, 1.45);
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const wx = (cx - c.x) / c.z;
      const wy = (cy - c.y) / c.z;
      return { z: next, x: cx - wx * next, y: cy - wy * next };
    });
  }

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const latest = log[0];

  return (
    <div
      ref={vp}
      className="relative min-h-0 flex-1 touch-none overflow-hidden bg-ink"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.z})` }}
      >
        <div
          className="pointer-events-none absolute"
          style={{
            left: -800,
            top: -600,
            width: 3600,
            height: 2200,
            backgroundImage: "radial-gradient(circle, var(--color-line) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <svg className="pointer-events-none absolute overflow-visible" width="2400" height="1400">
          {edges.map((e) => {
            const a = byId.get(e.from);
            const b = byId.get(e.to);
            if (!a || !b) return null;
            const hot = a.status === "live" || b.status === "live" || a.status === "done";
            return (
              <path
                key={e.id}
                d={wire(a, b)}
                fill="none"
                stroke={hot ? "var(--color-copper)" : "var(--color-muted)"}
                strokeWidth={hot ? 1.75 : 1}
                strokeOpacity={hot ? 0.9 : 0.45}
              />
            );
          })}
          {link && byId.get(link.fromId) && (
            <path
              d={wireTo(byId.get(link.fromId)!, link.x, link.y)}
              fill="none"
              stroke="var(--color-copper)"
              strokeWidth={1.5}
              strokeDasharray="5 5"
            />
          )}
        </svg>
        {nodes.map((node) => (
          <NodeCard key={node.id} node={node} selected={node.id === selectedId} />
        ))}
      </div>

      <div data-ui className="absolute bottom-20 left-3 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => zoomBy(1.12)}
          className="grid size-11 place-items-center rounded-xl border border-line bg-surface text-bone"
          aria-label="Zoom in"
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => zoomBy(0.88)}
          className="grid size-11 place-items-center rounded-xl border border-line bg-surface text-bone"
          aria-label="Zoom out"
        >
          <Minus className="size-4" />
        </button>
        <button
          type="button"
          onClick={fit}
          className="grid size-11 place-items-center rounded-xl border border-line bg-surface text-bone"
          aria-label="Fit the graph"
        >
          <Scan className="size-4" />
        </button>
      </div>

      <p className="pointer-events-none absolute top-3 left-3 hidden max-w-xs text-xs leading-relaxed text-muted sm:block">
        Drag the field. Scroll to zoom. Pull a wire from the right port to another node’s left port.
      </p>

      {latest && latest.beats.length > 0 && (
        <div
          data-ui
          className="absolute inset-x-0 bottom-0 flex gap-2 overflow-x-auto border-t border-line bg-surface px-3 py-2"
        >
          <span className="flex h-11 shrink-0 items-center text-xs tracking-widest text-muted uppercase">
            {latest.source === "grok" ? "Grok" : "Pass"}
          </span>
          {latest.beats.map((beat) => (
            <button
              key={beat.nodeId}
              type="button"
              onClick={() => select(beat.nodeId)}
              className="h-11 shrink-0 rounded-xl border border-line px-3 text-sm text-bone"
            >
              {beat.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NodeCard({ node, selected }: { node: GraphNode; selected: boolean }) {
  const live = node.status === "live";
  return (
    <article
      data-node
      data-node-id={node.id}
      className={`absolute rounded-xl border bg-surface px-3.5 py-3 ${
        selected || live ? "border-copper bg-raised" : "border-line"
      }`}
      style={{ left: node.x, top: node.y, width: NODE_W }}
    >
      <button
        type="button"
        data-port="in"
        data-node-id={node.id}
        aria-label={`Wire into ${node.title}`}
        className="absolute top-3 -left-5 grid size-11 place-items-center"
      >
        <span className="size-2.5 rounded-full border border-bone bg-ink" />
      </button>
      <button
        type="button"
        data-port="out"
        data-node-id={node.id}
        aria-label={`Wire out of ${node.title}`}
        className="absolute top-3 -right-5 grid size-11 place-items-center"
      >
        <span className="size-2.5 rounded-full bg-copper" />
      </button>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs tracking-widest text-muted uppercase">{KIND_LABEL[node.kind]}</p>
        <p className={`text-xs tracking-widest uppercase ${live ? "text-copper" : "text-muted"}`}>
          {node.status === "done" ? "Passed" : node.status === "live" ? "Live" : node.status === "held" ? "Held" : "Idle"}
        </p>
      </div>
      <h3 className="mt-1 font-display text-lg leading-tight">{node.title}</h3>
      <p className="text-xs text-copper">{node.role}</p>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{node.body}</p>
      {node.output && (
        <p className="mt-2 line-clamp-2 border-t border-line pt-2 text-xs leading-relaxed text-bone">
          {node.output}
        </p>
      )}
    </article>
  );
}

function wire(a: GraphNode, b: GraphNode): string {
  return wireTo(a, b.x, b.y + 34);
}

function wireTo(a: GraphNode, x2: number, y2: number): string {
  const x1 = a.x + NODE_W;
  const y1 = a.y + 34;
  const c = Math.max(48, Math.abs(x2 - x1) * 0.45);
  return `M ${x1} ${y1} C ${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
