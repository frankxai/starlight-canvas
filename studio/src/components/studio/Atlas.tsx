import { useState } from "react";
import { X } from "lucide-react";
import { AGENTS_MD, PHASES, SKILL_MD } from "@/lib/studio/doctrine";
import { useStudio } from "@/lib/studio/store";

const LEDGER = [
  ["Canvas seat", "A director", "This room", "Live as a studio"],
  ["House room", "Writer or showrunner", "Arcanea bible, GenCreator series", "Designed"],
  ["Lens meter", "Whoever renders", "Imagine stills, Higgsfield motion", "Ticket only"],
  ["Skill license", "A team that forked a pass", "skill.md after Mercer", "Designed"],
  ["Fleet", "A company with harnesses", "Starlight attestation", "Already a repo"],
];

export function Atlas() {
  const close = useStudio((s) => s.setOverlay);
  const [copied, setCopied] = useState<string | null>(null);
  const [doc, setDoc] = useState<"agents" | "skill">("agents");

  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
    } catch {
      setCopied("fail");
    }
  }

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-ink text-bone">
      <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8 sm:py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest text-copper uppercase">Atlas</p>
            <h2 className="mt-2 font-display text-4xl leading-tight">The room, and what it refuses to fake.</h2>
          </div>
          <button
            type="button"
            onClick={() => close(null)}
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-line text-bone"
            aria-label="Close atlas"
          >
            <X className="size-4" />
          </button>
        </div>

        <section className="mt-10">
          <h3 className="font-display text-2xl">Problem</h3>
          <p className="mt-3 text-base leading-relaxed text-muted">
            A world bible, a series cut, and an agent handoff live in three tools, and none of
            them share a memory. Node canvases look like direction and forget by morning. Agent
            frameworks remember state and give a director nowhere to stand. Generative UI streams
            cards into a void. The work is not another chat. The work is one graph with shelves.
          </p>
        </section>

        <section className="mt-8">
          <h3 className="font-display text-2xl">Solution</h3>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Starlight is the substrate: typed nodes, ports, four planes, eval before canon.
            Arcanea is the fiction house. GenCreator is the audience house. Same wires. Iri will
            not let a chapter borrow a destiny. Noor will not explain the magic. Kepler will not
            let a subagent write the world plane. Harbor will not crop a vertical into a landscape
            and call it distribution.
          </p>
        </section>

        <section className="mt-8">
          <h3 className="font-display text-2xl">What is actually running</h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
            <li>TypeScript, React 19, TanStack Start, Tailwind. The graph is Zustand, on this device.</li>
            <li>A local runtime walks nodes in order and writes a beat in that seat's voice.</li>
            <li>Grok 4.5 is one button on one node. It does not run the room for you.</li>
            <li>Jun writes a Higgsfield ticket. There is no pretend clip.</li>
            <li>The research canvas in starlight-agent-canvas stays the engineering surface. This is the director's surface.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h3 className="font-display text-2xl">Ledger</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs tracking-widest text-muted uppercase">
                <tr>
                  <th className="py-2 pr-4 font-medium">Stream</th>
                  <th className="py-2 pr-4 font-medium">Who pays</th>
                  <th className="py-2 pr-4 font-medium">For</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {LEDGER.map((row) => (
                  <tr key={row[0]} className="border-t border-line">
                    {row.map((cell) => (
                      <td key={cell} className="py-3 pr-4 align-top text-bone">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Stripe when there are accounts. A wallet when a skill can fail an eval and still be
            priced. Paperclip-style roles hire against a skill.md and a paid trial on this canvas.
            We do not invent staff.
          </p>
        </section>

        <section className="mt-10">
          <h3 className="font-display text-2xl">Doctrines, not group chats</h3>
          <ul className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
            <li>
              <span className="text-bone">First principles.</span> If a node cannot name its input,
              output, and the plane it may write, it does not ship.
            </li>
            <li>
              <span className="text-bone">Taste.</span> The audience feels the cut before they
              understand the stack. Spectacle is the cheap failure.
            </li>
            <li>
              <span className="text-bone">Constitutional eval.</span> An agent that cannot refuse a
              bad brief is not a director.
            </li>
            <li>
              <span className="text-bone">Graph over chat.</span> Conversation is a log. Deep agents
              plan, use a shelf, and hand off. They do not become the product by talking.
            </li>
            <li>
              <span className="text-bone">Distribution is a node.</span> One shape per place. Harbor
              is not a department you bolt on after the premiere.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-4">
          <h3 className="font-display text-2xl">Three passes worth running next</h3>
          {PHASES.map((phase) => (
            <article key={phase.id} className="rounded-xl border border-line bg-surface p-5">
              <h4 className="font-display text-xl">{phase.name}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted">{phase.detail}</p>
              <button
                type="button"
                onClick={() => copy(phase.id, phase.prompt)}
                className="mt-4 inline-flex h-11 items-center rounded-xl bg-copper px-4 text-sm font-medium text-copper-ink"
              >
                {copied === phase.id ? "Copied" : "Copy the prompt"}
              </button>
            </article>
          ))}
        </section>

        <section className="mt-10 pb-16">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDoc("agents")}
              className={`h-11 rounded-xl border px-4 text-sm ${doc === "agents" ? "border-copper text-bone" : "border-line text-muted"}`}
            >
              AGENTS.md
            </button>
            <button
              type="button"
              onClick={() => setDoc("skill")}
              className={`h-11 rounded-xl border px-4 text-sm ${doc === "skill" ? "border-copper text-bone" : "border-line text-muted"}`}
            >
              SKILL.md
            </button>
            <button
              type="button"
              onClick={() => copy(doc, doc === "agents" ? AGENTS_MD : SKILL_MD)}
              className="ml-auto h-11 rounded-xl border border-line px-4 text-sm text-bone"
            >
              {copied === doc ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap text-bone">
            {doc === "agents" ? AGENTS_MD : SKILL_MD}
          </pre>
        </section>
      </div>
    </div>
  );
}
