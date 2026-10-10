import type { Beat, Episode, GraphEdge, GraphNode, Voice } from "./types";

export interface Upstream {
  title: string;
  role: string;
  text: string;
}

export function orderIds(nodes: GraphNode[], edges: GraphEdge[]): { order: string[]; held: string[] } {
  const ids = nodes.map((n) => n.id);
  const indeg = new Map<string, number>(ids.map((id) => [id, 0]));
  const next = new Map<string, string[]>(ids.map((id) => [id, []]));
  for (const e of edges) {
    if (!indeg.has(e.from) || !indeg.has(e.to) || e.from === e.to) continue;
    indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1);
    next.get(e.from)?.push(e.to);
  }
  const queue = ids.filter((id) => (indeg.get(id) ?? 0) === 0);
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    for (const to of next.get(id) ?? []) {
      const left = (indeg.get(to) ?? 1) - 1;
      indeg.set(to, left);
      if (left === 0) queue.push(to);
    }
  }
  const held = ids.filter((id) => !order.includes(id));
  return { order, held };
}

export function upstreamOf(nodeId: string, nodes: GraphNode[], edges: GraphEdge[]): Upstream[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return edges
    .filter((e) => e.to === nodeId)
    .map((e) => byId.get(e.from))
    .filter((n): n is GraphNode => Boolean(n))
    .map((n) => ({
      title: n.title,
      role: n.role,
      text: (n.output || n.body).trim(),
    }));
}

export function execute(nodes: GraphNode[], edges: GraphEdge[]): { nodes: GraphNode[]; episode: Episode } {
  const { order, held } = orderIds(nodes, edges);
  const draft: GraphNode[] = nodes.map((n) => ({ ...n, output: "", status: "idle" }));
  const byId = new Map(draft.map((n) => [n.id, n]));
  const beats: Beat[] = [];

  for (const id of order) {
    const node = byId.get(id);
    if (!node) continue;
    const up = upstreamOf(id, [...byId.values()], edges);
    node.output = speak(node.voice, node.body, up);
    node.status = "done";
    beats.push({ nodeId: node.id, title: node.title, role: node.role, text: node.output });
  }
  for (const id of held) {
    const node = byId.get(id);
    if (!node) continue;
    node.status = "held";
    node.output = "Held. This loop has no first beat. Break an edge and run again.";
  }

  const brief = draft.find((n) => n.voice === "brief");
  const episode: Episode = {
    id: `ep-${Date.now()}`,
    house: draft[0]?.house ?? "starlight",
    title: brief?.title || "Untitled pass",
    at: Date.now(),
    source: "runtime",
    beats,
  };
  return { nodes: draft, episode };
}

function speak(voice: Voice, body: string, up: Upstream[]): string {
  const intent = clip(body, 320);
  const carried = up.length
    ? up.map((u) => `${u.title} (${u.role}): ${clip(u.text, 180)}`).join("\n")
    : "Nothing upstream. This node speaks first.";

  switch (voice) {
    case "brief":
      return `Working plane, not canon.\n\n${intent}\n\nThis dies with the task unless a memory keeper promotes it.`;
    case "bible":
      return `World plane. Canon only.\n\n${intent}\n\nRefusal: audience tactics, casting wishes, and anything the brief invented that this law does not allow.`;
    case "working":
      return `Working plane. Scratch only.\n\n${intent}\n\nDo not cite this tomorrow. Promote through eval or lose it.`;
    case "audience":
      return `Audience plane. Who it is for, not what is true.\n\n${intent}\n\nThis plane never writes the world bible.`;
    case "iri":
      return `Iri, creative director.\n\nKeeping: ${intent}\n\nCarried in:\n${carried}\n\nThe pass opens on the smallest object that proves the rule. If the brief and the bible disagree, the bible wins and the brief is rewritten. No prophecy. No chosen blood. End on a sound, not a theme.`;
    case "sable":
      return `Sable, memory keeper.\n\nOrders: ${intent}\n\nFrom upstream:\n${carried}\n\nPromote only the laws. Leave maps, moods, and marketing on the working plane. A fact with no owner does not get a shelf.`;
    case "noor":
      return `Noor, showrunner.\n\nEpisode law: ${intent}\n\nCarried in:\n${carried}\n\nOne dish, one rule, one exit. If the audience plane and the bible disagree, the bible decides what happens and the audience plane decides the first three seconds. Do not explain the magic.`;
    case "kepler":
      return `Kepler, orchestrator.\n\nContract under draft: ${intent}\n\nCarried in:\n${carried}\n\nPlan, then planes, then subagents, then eval, then handoff. A subagent may propose. Only an eval-closed node may write the world plane. Chat is the log of this graph, not a second source of truth.`;
    case "tone":
      return `Tone skill.\n\n${intent}\n\nApplied to:\n${carried}\n\nCut any line that could live in another story without being noticed.`;
    case "contract":
      return `Skill shape.\n\n${intent}\n\nChecked against:\n${carried}\n\nTrigger. Input. Output. Refusal. One plane. Missing any of the five, the skill does not ship.`;
    case "scene":
      return page(intent, carried);
    case "spec":
      return spec(intent, carried);
    case "jun":
      return `Jun, lens. Job ticket, not a rendered clip.\n\n${intent}\n\nMotivated by:\n${carried}\n\nHiggsfield takes this ticket when the lens phase is live. Until then the frame is language: lens, light, duration, the hold. No fake still.`;
    case "mercer":
      return `Mercer, eval.\n\nTests: ${intent}\n\nEvidence:\n${carried}\n\nPass only if canon was not invented, the audience plane stayed out of the world bible, and the voice is specific to this house. Otherwise hold the handoff.`;
    case "harbor":
      return `Harbor, distribution.\n\nShip as: ${intent}\n\nWhat actually exists upstream:\n${carried}\n\nOne shape per place. A vertical stays vertical. A chapter stays a chapter. The canvas remains the source.`;
    default:
      return intent;
  }
}

function page(intent: string, carried: string): string {
  return `Page one.\n\nObligation: ${intent}\n\nWhat the room already decided:\n${carried}\n\nShe does not get a destiny. She gets a drawer, a debt, and a rule she is about to break quietly. The city's name can wait. The cost cannot.`;
}

function spec(intent: string, carried: string): string {
  return `One-pager.\n\nAsked for: ${intent}\n\nGround:\n${carried}\n\n1. Plan on the working plane.\n2. Name the plane a write will touch.\n3. Subagents propose. They do not canonize.\n4. Mercer closes eval.\n5. Harbor hands the graph to the fleet. Not a chat paste.\n\nIf a sentence needs a vendor's name to be true, it is not part of the contract.`;
}

export function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}
