import type { GraphEdge, GraphNode, HouseId, HouseMeta, NodeKind, Voice } from "./types";

export const HOUSES: HouseMeta[] = [
  {
    id: "starlight",
    name: "Starlight",
    line: "Agent OS",
    promise: "The contract every other house runs on. Memory, eval, handoff.",
  },
  {
    id: "arcanea",
    name: "Arcanea",
    line: "Worlds",
    promise: "Books, mythology, and a creative director who keeps the bible honest.",
  },
  {
    id: "gencreator",
    name: "GenCreator",
    line: "Series",
    promise: "Showrunning for modern socials. One rule, one cut, one place it ships.",
  },
];

export const KIND_LABEL: Record<NodeKind, string> = {
  brief: "Brief",
  memory: "Memory",
  agent: "Agent",
  lens: "Lens",
  skill: "Skill",
  scene: "Scene",
  distribute: "Send",
};

const idle = { status: "idle" as const, output: "" };

function node(
  partial: Omit<GraphNode, "status" | "output" | "house"> & { house: HouseId },
): GraphNode {
  return { ...idle, ...partial };
}

export function constellation(house: HouseId): { nodes: GraphNode[]; edges: GraphEdge[] } {
  if (house === "arcanea") return arcanea();
  if (house === "gencreator") return gencreator();
  return starlight();
}

export function blankNode(
  house: HouseId,
  kind: NodeKind,
  x: number,
  y: number,
): GraphNode {
  const voice = defaultVoice(house, kind);
  const role = defaultRole(kind, voice);
  return node({
    id: `n-${crypto.randomUUID().slice(0, 8)}`,
    kind,
    house,
    voice,
    title: KIND_LABEL[kind],
    role,
    body: defaultBody(kind),
    x,
    y,
  });
}

function defaultVoice(house: HouseId, kind: NodeKind): Voice {
  if (kind === "brief") return "brief";
  if (kind === "memory") return house === "gencreator" ? "audience" : house === "starlight" ? "working" : "bible";
  if (kind === "agent") return house === "arcanea" ? "iri" : house === "gencreator" ? "noor" : "kepler";
  if (kind === "lens") return "jun";
  if (kind === "skill") return house === "starlight" ? "contract" : "tone";
  if (kind === "scene") return house === "starlight" ? "spec" : "scene";
  return "harbor";
}

function defaultRole(kind: NodeKind, voice: Voice): string {
  if (voice === "iri") return "Creative director";
  if (voice === "noor") return "Showrunner";
  if (voice === "kepler") return "Orchestrator";
  if (voice === "sable") return "Memory keeper";
  if (voice === "jun") return "Higgsfield lens";
  if (voice === "mercer") return "Eval";
  if (voice === "harbor") return "Distribution";
  if (kind === "memory") return "Memory plane";
  if (kind === "skill") return "Skill contract";
  if (kind === "scene") return "Beat";
  return "Intent";
}

function defaultBody(kind: NodeKind): string {
  if (kind === "brief") return "What are we making, and what must it cost the person who makes it?";
  if (kind === "memory") return "Write only what this plane is allowed to remember. Name the refusal.";
  if (kind === "agent") return "Keep it specific. If a line could belong to any model, cut it.";
  if (kind === "lens") return "Lens, light, duration, and the one frame that must hold. No clip is rendered until a lens job is real.";
  if (kind === "skill") return "Trigger, input, output, refusal, and the memory plane this skill may write.";
  if (kind === "scene") return "The beat the audience actually receives. Carry the upstream. Do not summarize it.";
  return "Where this ships, in what shape, and what we will not crosspost.";
}

function arcanea(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const house: HouseId = "arcanea";
  const nodes: GraphNode[] = [
    node({
      id: "a-brief",
      kind: "brief",
      house,
      voice: "brief",
      title: "Steal a storm",
      role: "Working intent",
      x: 48,
      y: 200,
      body: "Chapter one. A cartographer enters the Glass Archive to take a storm filed under the wrong century. She can carry one drawer. If she speaks the weather's name, the archive files her instead.",
    }),
    node({
      id: "a-bible",
      kind: "memory",
      house,
      voice: "bible",
      title: "Archive law",
      role: "World memory",
      x: 360,
      y: 28,
      body: "Storms are glass drawers. A drawer opens only for someone who has already been rained on by that storm. Nothing here is metaphor. Misfiling is the only crime, and the sentence is forgetting.",
    }),
    node({
      id: "a-iri",
      kind: "agent",
      house,
      voice: "iri",
      title: "Iri",
      role: "Creative director",
      x: 360,
      y: 460,
      body: "Keep the theft small. No chosen one. She is paid by a harbor that wants tomorrow's rain early. End on the sound of an empty drawer, not on an explanation.",
    }),
    node({
      id: "a-sable",
      kind: "agent",
      house,
      voice: "sable",
      title: "Sable",
      role: "Memory keeper",
      x: 680,
      y: 28,
      body: "Persist: drawer law, the debt to the harbor, the rule about names. Forget: any floor plan of the archive. The building does not allow its own map to leave.",
    }),
    node({
      id: "a-tone",
      kind: "skill",
      house,
      voice: "tone",
      title: "Tone contract",
      role: "Skill",
      x: 680,
      y: 460,
      body: "Third person, close. Sentences short enough to hear. Magic is a filing system. If a line could appear in any fantasy novel, cut it. No prophecy.",
    }),
    node({
      id: "a-scene",
      kind: "scene",
      house,
      voice: "scene",
      title: "Chapter opening",
      role: "Page one",
      x: 1000,
      y: 180,
      body: "The reader must know what she is stealing and what it costs before they know the city's name.",
    }),
    node({
      id: "a-jun",
      kind: "lens",
      house,
      voice: "jun",
      title: "Jun",
      role: "Higgsfield lens",
      x: 1320,
      y: 28,
      body: "35mm. Overcast practicals. One lamp inside the drawer. Six seconds. She opens it. The rain is in there and does not fall. Hold on the wet cuff. No hero close-up.",
    }),
    node({
      id: "a-harbor",
      kind: "distribute",
      house,
      voice: "harbor",
      title: "Harbor",
      role: "Distribution",
      x: 1320,
      y: 460,
      body: "Sunday serialization to Arcanea readers. Jun's six seconds is the only social. The caption is the sound of the empty drawer, not a plot summary.",
    }),
  ];
  const edges: GraphEdge[] = [
    edge("a1", "a-brief", "a-bible"),
    edge("a2", "a-brief", "a-iri"),
    edge("a3", "a-bible", "a-sable"),
    edge("a4", "a-bible", "a-iri"),
    edge("a5", "a-iri", "a-tone"),
    edge("a6", "a-iri", "a-scene"),
    edge("a7", "a-sable", "a-scene"),
    edge("a8", "a-tone", "a-scene"),
    edge("a9", "a-scene", "a-jun"),
    edge("a10", "a-scene", "a-harbor"),
    edge("a11", "a-jun", "a-harbor"),
  ];
  return { nodes, edges };
}

function gencreator(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const house: HouseId = "gencreator";
  const nodes: GraphNode[] = [
    node({
      id: "g-brief",
      kind: "brief",
      house,
      voice: "brief",
      title: "Between stops",
      role: "Working intent",
      x: 48,
      y: 200,
      body: "Six parts. A night market that exists only between two subway stops, and only if you miss your train on purpose. Part one is a single dish and a single rule.",
    }),
    node({
      id: "g-aud",
      kind: "memory",
      house,
      voice: "audience",
      title: "Who stays",
      role: "Audience memory",
      x: 360,
      y: 28,
      body: "People who save train videos and never cook. They stay if the first three seconds are a hand, steam, and a rule. They leave if we explain the magic.",
    }),
    node({
      id: "g-bible",
      kind: "memory",
      house,
      voice: "bible",
      title: "Market law",
      role: "Series bible",
      x: 360,
      y: 460,
      body: "You cannot buy with money earned in daylight. Vendors remember your stop, not your name. The market ends when the next train's doors open, whether you have paid or not.",
    }),
    node({
      id: "g-noor",
      kind: "agent",
      house,
      voice: "noor",
      title: "Noor",
      role: "Showrunner",
      x: 680,
      y: 180,
      body: "Part one: a bowl of broth that fogs the platform glass. Do not introduce a host. The rule is spoken by the vendor, once, while the hand is still in frame.",
    }),
    node({
      id: "g-tone",
      kind: "skill",
      house,
      voice: "tone",
      title: "Cut contract",
      role: "Skill",
      x: 1000,
      y: 28,
      body: "Nine by sixteen. No logos. No landscape crop of a vertical. Steam is the transition. If a line needs a caption to make sense, the picture failed.",
    }),
    node({
      id: "g-scene",
      kind: "scene",
      house,
      voice: "scene",
      title: "Part one",
      role: "The cut",
      x: 1000,
      y: 460,
      body: "Forty seconds. Doors. Missed train. Bowl. Rule. The doors of the next train close on the last spoonful.",
    }),
    node({
      id: "g-jun",
      kind: "lens",
      house,
      voice: "jun",
      title: "Jun",
      role: "Higgsfield lens",
      x: 1320,
      y: 28,
      body: "Handheld. Sodium practicals. 9:16. Six seconds for the social, then the forty-second cut. Focus lives on the broth, not the face. Train doors are the only hard cut.",
    }),
    node({
      id: "g-harbor",
      kind: "distribute",
      house,
      voice: "harbor",
      title: "Harbor",
      role: "Distribution",
      x: 1320,
      y: 460,
      body: "Native vertical on the series account, Sunday night. One still held back for the recipe book. Do not crosspost the vertical into a widescreen graveyard.",
    }),
  ];
  const edges: GraphEdge[] = [
    edge("g1", "g-brief", "g-aud"),
    edge("g2", "g-brief", "g-bible"),
    edge("g3", "g-aud", "g-noor"),
    edge("g4", "g-bible", "g-noor"),
    edge("g5", "g-noor", "g-tone"),
    edge("g6", "g-noor", "g-scene"),
    edge("g7", "g-tone", "g-jun"),
    edge("g8", "g-scene", "g-jun"),
    edge("g9", "g-scene", "g-harbor"),
    edge("g10", "g-jun", "g-harbor"),
  ];
  return { nodes, edges };
}

function starlight(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const house: HouseId = "starlight";
  const nodes: GraphNode[] = [
    node({
      id: "s-brief",
      kind: "brief",
      house,
      voice: "brief",
      title: "Before it writes",
      role: "Working intent",
      x: 48,
      y: 200,
      body: "One page. The contract a new agent must pass before it is allowed to write memory that other agents will trust.",
    }),
    node({
      id: "s-work",
      kind: "memory",
      house,
      voice: "working",
      title: "Working plane",
      role: "Working memory",
      x: 360,
      y: 28,
      body: "Working memory dies with the task. It may hold the brief, the scratch plan, and rejected lines. It may not be cited as canon tomorrow.",
    }),
    node({
      id: "s-kepler",
      kind: "agent",
      house,
      voice: "kepler",
      title: "Kepler",
      role: "Orchestrator",
      x: 360,
      y: 460,
      body: "Four planes. A node without an input and an output is a poster. Chat is a log. The product is the graph. Subagents do not write the world plane.",
    }),
    node({
      id: "s-skill",
      kind: "skill",
      house,
      voice: "contract",
      title: "Skill shape",
      role: "Skill contract",
      x: 680,
      y: 28,
      body: "Every skill.md names trigger, input, output, refusal, and the single plane it may write. If it cannot name a refusal, it is not a skill.",
    }),
    node({
      id: "s-mercer",
      kind: "agent",
      house,
      voice: "mercer",
      title: "Mercer",
      role: "Eval",
      x: 680,
      y: 460,
      body: "Fail the node if it invents canon, writes audience tactics into the world bible, or speaks in a voice that could belong to any model.",
    }),
    node({
      id: "s-spec",
      kind: "scene",
      house,
      voice: "spec",
      title: "One-pager",
      role: "The contract",
      x: 1000,
      y: 180,
      body: "Write the page a new hire can run. Plan, memory, subagents, eval, handoff. No mythology about the stack.",
    }),
    node({
      id: "s-jun",
      kind: "lens",
      house,
      voice: "jun",
      title: "Jun",
      role: "Diagram lens",
      x: 1320,
      y: 28,
      body: "Not a film. A single diagram: four planes as shelves, one wire that eval must close before the world shelf opens. Quiet, labeled, no glow.",
    }),
    node({
      id: "s-harbor",
      kind: "distribute",
      house,
      voice: "harbor",
      title: "Handoff",
      role: "Fleet handoff",
      x: 1320,
      y: 460,
      body: "The canvas is the source Claude Code, Codex, Cursor, and Grok read. Do not paste the contract into a chat and call it shipped.",
    }),
  ];
  const edges: GraphEdge[] = [
    edge("s1", "s-brief", "s-work"),
    edge("s2", "s-brief", "s-kepler"),
    edge("s3", "s-work", "s-kepler"),
    edge("s4", "s-kepler", "s-skill"),
    edge("s5", "s-kepler", "s-mercer"),
    edge("s6", "s-skill", "s-spec"),
    edge("s7", "s-mercer", "s-spec"),
    edge("s8", "s-spec", "s-jun"),
    edge("s9", "s-spec", "s-harbor"),
    edge("s10", "s-mercer", "s-harbor"),
  ];
  return { nodes, edges };
}

function edge(id: string, from: string, to: string): GraphEdge {
  return { id, from, to };
}
