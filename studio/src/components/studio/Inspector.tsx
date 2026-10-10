import { useState } from "react";
import { X } from "lucide-react";
import { upstreamOf } from "@/lib/studio/engine";
import { grokPass } from "@/lib/studio/grok.functions";
import { KIND_LABEL } from "@/lib/studio/presets";
import { useStudio } from "@/lib/studio/store";
import type { Episode } from "@/lib/studio/types";

export function Inspector({ onClose }: { onClose?: () => void }) {
  const node = useStudio((s) => s.nodes.find((n) => n.id === s.selectedId) ?? null);
  const edges = useStudio((s) => s.edges);
  const nodes = useStudio((s) => s.nodes);
  const updateNode = useStudio((s) => s.updateNode);
  const disconnect = useStudio((s) => s.disconnect);
  const removeNode = useStudio((s) => s.removeNode);
  const writeGrok = useStudio((s) => s.writeGrok);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!node) {
    return (
      <aside className="hidden w-80 shrink-0 flex-col border-l border-line bg-surface p-5 lg:flex">
        <p className="text-xs tracking-widest text-muted uppercase">Node</p>
        <p className="mt-3 font-display text-2xl leading-tight">Select a seat.</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Or run the house. The right-hand shelf fills with whatever the graph is willing to remember.
        </p>
        <Planes />
      </aside>
    );
  }

  const incoming = edges.filter((e) => e.to === node.id);

  async function ask() {
    if (!node) return;
    setBusy(true);
    setError(null);
    const up = upstreamOf(node.id, nodes, edges)
      .map((u) => `${u.title} (${u.role})\n${u.text}`)
      .join("\n\n");
    try {
      const res = await grokPass({
        data: {
          title: node.title,
          role: node.role,
          body: node.body,
          upstream: up,
          house: node.house,
        },
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const episode: Episode = {
        id: `gk-${Date.now()}`,
        house: node.house,
        title: `Grok \u00b7 ${node.title}`,
        at: Date.now(),
        source: "grok",
        beats: [{ nodeId: node.id, title: node.title, role: node.role, text: res.text }],
      };
      writeGrok(node.id, res.text, episode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The pass failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="flex h-full w-full flex-col bg-surface lg:w-80 lg:shrink-0 lg:border-l lg:border-line">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="text-xs tracking-widest text-copper uppercase">{KIND_LABEL[node.kind]}</p>
          <p className="text-sm text-muted">{node.role}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-xl border border-line"
            aria-label="Close node"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <label className="block text-xs tracking-widest text-muted uppercase">
          Title
          <input
            value={node.title}
            onChange={(e) => updateNode(node.id, { title: e.target.value })}
            className="mt-2 h-11 w-full rounded-xl border border-line bg-ink px-3 text-base text-bone"
          />
        </label>
        <label className="block text-xs tracking-widest text-muted uppercase">
          Instructions
          <textarea
            value={node.body}
            onChange={(e) => updateNode(node.id, { body: e.target.value })}
            rows={6}
            className="mt-2 w-full resize-none rounded-xl border border-line bg-ink p-3 text-sm leading-relaxed text-bone"
          />
        </label>
        {node.output && (
          <div>
            <p className="text-xs tracking-widest text-muted uppercase">
              {node.status === "idle" ? "Previous pass" : "Last pass"}
            </p>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-bone">{node.output}</p>
          </div>
        )}
        {incoming.length > 0 && (
          <div>
            <p className="text-xs tracking-widest text-muted uppercase">Wires in</p>
            <ul className="mt-2 space-y-2">
              {incoming.map((e) => {
                const from = nodes.find((n) => n.id === e.from);
                return (
                  <li key={e.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate text-bone">{from?.title ?? "Missing"}</span>
                    <button
                      type="button"
                      onClick={() => disconnect(e.id)}
                      className="h-10 shrink-0 rounded-lg px-2 text-muted"
                    >
                      Cut
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {error && <p className="text-sm text-copper">{error}</p>}
      </div>
      <div className="flex gap-2 border-t border-line p-3">
        <button
          type="button"
          onClick={ask}
          disabled={busy}
          className="h-11 flex-1 rounded-xl bg-copper text-sm font-medium text-copper-ink disabled:opacity-60"
        >
          {busy ? "Asking Grok…" : "Grok pass"}
        </button>
        <button
          type="button"
          onClick={() => removeNode(node.id)}
          className="h-11 rounded-xl border border-line px-3 text-sm text-muted"
        >
          Remove
        </button>
      </div>
    </aside>
  );
}

export function Planes() {
  const nodes = useStudio((s) => s.nodes);
  const log = useStudio((s) => s.log);
  const brief = nodes.find((n) => n.voice === "brief");
  const world = nodes.filter((n) => n.voice === "bible" || n.voice === "working");
  const audience = nodes.filter((n) => n.voice === "audience" || n.voice === "harbor");

  return (
    <div className="mt-6 space-y-4">
      <Plane name="Working" text={brief?.body ?? "No brief on the graph."} />
      <Plane
        name="World"
        text={world.map((n) => n.body).join(" ") || "No world shelf yet."}
      />
      <Plane
        name="Audience"
        text={audience.map((n) => n.body).join(" ") || "Harbor has not been seated."}
      />
      <Plane
        name="Episodic"
        text={
          log[0]
            ? `${log[0].title} \u00b7 ${log[0].beats.length} beats`
            : "No runs yet."
        }
      />
    </div>
  );
}

function Plane({ name, text }: { name: string; text: string }) {
  return (
    <div>
      <p className="text-xs tracking-widest text-muted uppercase">{name}</p>
      <p className="mt-1 line-clamp-4 text-sm leading-relaxed text-bone">{text}</p>
    </div>
  );
}
