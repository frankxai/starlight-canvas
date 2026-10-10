export type HouseId = "starlight" | "arcanea" | "gencreator";

export type NodeKind =
  | "brief"
  | "memory"
  | "agent"
  | "lens"
  | "skill"
  | "scene"
  | "distribute";

export type Voice =
  | "brief"
  | "bible"
  | "working"
  | "audience"
  | "iri"
  | "sable"
  | "noor"
  | "kepler"
  | "tone"
  | "contract"
  | "scene"
  | "spec"
  | "jun"
  | "mercer"
  | "harbor";

export type NodeStatus = "idle" | "live" | "done" | "held";

export interface GraphNode {
  id: string;
  kind: NodeKind;
  house: HouseId;
  voice: Voice;
  title: string;
  role: string;
  body: string;
  x: number;
  y: number;
  status: NodeStatus;
  output: string;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
}

export interface Beat {
  nodeId: string;
  title: string;
  role: string;
  text: string;
}

export interface Episode {
  id: string;
  house: HouseId;
  title: string;
  at: number;
  source: "runtime" | "grok";
  beats: Beat[];
}

export interface HouseMeta {
  id: HouseId;
  name: string;
  line: string;
  promise: string;
}
