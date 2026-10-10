import { HOUSES } from "@/lib/studio/presets";
import { useStudio } from "@/lib/studio/store";
import type { HouseId } from "@/lib/studio/types";

const INDEX = ["01", "02", "03"];

export function Overture() {
  const enter = useStudio((s) => s.enter);

  return (
    <div className="h-dvh overflow-y-auto bg-ink text-bone">
      <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Mark />
            <p className="text-xs font-medium tracking-widest text-muted uppercase">Starlight Canvas</p>
          </div>
          <p className="text-xs text-muted">Arcanea Labs</p>
        </header>

        <div className="mt-14 max-w-3xl sm:mt-24">
          <p className="text-xs tracking-widest text-copper uppercase">The director’s room</p>
          <h1 className="mt-4 font-display text-4xl leading-tight font-medium sm:text-6xl">
            One memory.
            <br />
            Three houses.
            <br />
            An infinite graph.
          </h1>
          <div className="mt-6 h-px w-16 bg-copper" />
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Arcanea keeps the world. GenCreator cuts the series. Starlight is the
            contract underneath both. Open a house, wire a seat, run the room.
          </p>
        </div>

        <div className="mt-12 grid gap-3 md:grid-cols-3">
          {HOUSES.map((house, i) => (
            <button
              key={house.id}
              type="button"
              onClick={() => enter(house.id as HouseId)}
              className="group flex min-h-44 flex-col items-start rounded-xl border border-line bg-surface p-5 text-left transition-colors hover:border-copper"
            >
              <span className="flex w-full items-center justify-between text-xs tracking-widest text-muted uppercase">
                <span className="text-copper">{house.line}</span>
                <span>{INDEX[i]}</span>
              </span>
              <span className="mt-6 font-display text-3xl">{house.name}</span>
              <span className="mt-2 text-sm leading-relaxed text-muted">{house.promise}</span>
              <span className="mt-5 text-xs tracking-widest text-bone uppercase">Enter</span>
            </button>
          ))}
        </div>

        <p className="mt-auto pt-12 pb-2 text-sm leading-relaxed text-muted">
          The constellation walks the graph on this machine. Grok rewrites one node, and only
          when you ask. A lens is a shot ticket until a render is real.
        </p>
      </div>
    </div>
  );
}

function Mark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" className="shrink-0">
      <circle cx="11" cy="11" r="8.25" fill="none" stroke="var(--color-copper)" strokeWidth="1.25" />
      <path d="M11 4.2 L12.1 9.2 L17 11 L12.1 12.8 L11 17.8 L9.9 12.8 L5 11 L9.9 9.2 Z" fill="var(--color-bone)" />
    </svg>
  );
}
