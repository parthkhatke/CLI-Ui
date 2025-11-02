"use client";

import { useState } from "react";

export type CommandItem = {
  command: string;
  description?: string;
};

type CommandCardProps = {
  osName: string;
  commands: CommandItem[];
};

export default function CommandCard({ osName, commands }: CommandCardProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  async function handleCopy(command: string, index: number) {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedIndex(index);
    } catch {}
  }

  return (
    <div className="w-full max-w-3xl space-y-4">
      {commands.length === 0 ? (
        <div className="text-center text-zinc-500">No commands for this OS.</div>
      ) : (
        commands.map((item, idx) => (
          <div
            key={`cmd-${idx}`}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            {item.description ? (
              <p className="mb-2 text-sm text-zinc-600">{idx + 1}. {item.description}</p>
            ) : null}
            <div className="flex items-start justify-between gap-3 rounded-lg bg-zinc-100 p-3">
              <pre className="flex-1 overflow-x-auto whitespace-pre text-sm text-zinc-900 font-mono">
                {item.command}
              </pre>
              <button
                onClick={() => handleCopy(item.command, idx)}
                className="h-fit whitespace-nowrap rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 active:bg-zinc-700"
              >
                {copiedIndex === idx ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
