export const PHASES = [
  {
    id: "lens",
    name: "Phase 2 — The lens is a job, not a caption",
    detail:
      "Jun's node currently writes a shot ticket. Next it should dispatch a real Higgsfield still or six-second clip, and a Grok Imagine still beside it, then pin the asset to the node. No stock. No fake thumbnail.",
    prompt: `Phase 2 of Starlight Canvas. Keep the infinite graph, the three houses (Starlight, Arcanea, GenCreator), and the four memory planes.

Make Lens nodes real jobs:
- A "Render still" action on a Jun node calls Grok Imagine server-side (grok-imagine-image), user-initiated, one image, cached on the node.
- A "Render motion" action describes a Higgsfield job ticket with lens, duration, and aspect, and if the Higgsfield connector can submit a generation, submit one clip and store the url. If it cannot, show the exact ticket and a honest blocked state. Never fake a thumbnail.
- Stream the beat back onto the node as a generative card (prompt, asset, refusal), not a replaced paragraph.
- Cap spend: one still and one clip per click, no loops, no autorun.
- Mobile and desktop must both hold. Do not restyle the ink / bone / copper system.`,
  },
  {
    id: "memory",
    name: "Phase 3 — Memory that outlives the browser",
    detail:
      "The run log is local on purpose. The next room is accounts, because canon shared between a writer and a showrunner is per-person data. Working memory still dies. World memory is a row with an author.",
    prompt: `Phase 3 of Starlight Canvas. Add real accounts and a database, following the app's auth rules: authMiddleware on every server function, queries scoped by the verified user id, no client-sent user ids.

Persist three planes only:
- Episodic: the run log, owned by the director.
- World: canon rows promoted by Sable's node after Mercer's eval passes. Include the source node id and the refusal that was checked.
- Audience: distribution constraints, never readable as world canon.

Working memory stays in the session and is wiped on a new brief.

Build a second chair: invite is a link, the guest can run the graph but cannot promote canon. Arcanea rooms and GenCreator rooms are the same schema with a house column.

Do not add wallets yet. Do not bulk-delete. Keep the canvas interaction intact.`,
  },
  {
    id: "exchange",
    name: "Phase 4 — The exchange, the fleet, the payroll",
    detail:
      "Seats, metered lens, and a skill that can be licensed only after eval. Paperclip-style roles hire against a skill.md and a paid trial on this canvas. Stripe for seats. Settlement for the marketplace comes after the skill can fail.",
    prompt: `Phase 4 of Starlight Canvas. Turn the studio into a small economy without pretending it is a global bank.

Ship:
- Stripe seats for a director (canvas) and a house room (Arcanea world bible or GenCreator series). Use the existing auth from phase 3.
- A skill exchange: a skill node can be published only if Mercer eval passed on its last run. Show price, plane it may write, and the refusal. Buyers fork the skill onto their graph.
- Metered lens: each Imagine or Higgsfield job writes a ledger line (kind, house, cost class, node id). No crypto wallet in this phase. Show the ledger.
- A hiring rail inspired by Paperclip: a role card (title, skill.md, trial task on the canvas, paid trial). Do not invent employees or scrape real people's likenesses. The bench that ships with the product stays fictional and labeled.
- Handoff export: the one-pager and the graph as the artifact Claude Code, Codex, Cursor, and Grok are meant to read. Markdown download is enough.

Leave distribution honest: one shape per place, no auto-crosspost.`,
  },
] as const;

export const AGENTS_MD = `# Starlight Canvas

The director's room on top of the Starlight substrate.
Arcanea and GenCreator are houses. They are not separate brains.

## Planes

- Working — dies with the task. Briefs and scratch live here.
- Episodic — the run log. What the graph did, in order.
- World — canon. Books, market law, agent contracts. Eval before write.
- Audience — who it is for. Never promoted into world.

## Bench

These are seats we would hire. They are not real people and not endorsements.

- Iri — Arcanea creative director. Taste, refusal, the small theft.
- Sable — memory keeper. What is allowed to persist.
- Noor — GenCreator showrunner. One rule, one cut.
- Jun — lens. Higgsfield and Imagine tickets. Does not fake a clip.
- Kepler — orchestrator. Graph over chat. Subagents propose.
- Mercer — eval. Invented canon fails. Vague voice fails.
- Harbor — distribution. One shape per place.

## Law

A node names its input, its output, and the plane it may write.
If it cannot name a refusal, it is a poster.
The canvas is the source. A chat paste is not a handoff.
`;

export const SKILL_MD = `# Skill: Constellation pass

Trigger: a director runs a house, or asks one node for a Grok pass.

Input: the node body, upstream beats, the house, the plane.

Output: one beat. Specific to this house. Short enough to put back on the node.

## Refusal

- Do not write audience tactics into the world plane.
- Do not invent canon the bible did not allow.
- Do not claim a living person shipped, funded, or joined.
- Do not call a model on load, on a timer, or for every node.
- Do not render a fake still and call it Higgsfield.

## Planes

Working dies. Episodic records the run. World requires Mercer.
Audience is required before Harbor, and stays on its own shelf.

## Tools

- Local runtime walks the graph in order. Instant. No quota.
- Grok 4.5 rewrites a single node when the director presses the button.
- Lens nodes emit a job ticket until a render phase is actually wired.
`;
