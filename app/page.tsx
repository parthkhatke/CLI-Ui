"use client";

import { useEffect, useMemo, useState } from "react";
import CommandCard, { CommandItem } from "@/components/CommandCard";
import Image from "next/image";

type SupportedOs = "Windows" | "macOS" | "Linux" | "Unknown";

function detectOs(userAgent: string): SupportedOs {
  const ua = userAgent.toLowerCase();
  if (ua.includes("windows nt") || ua.includes("win64") || ua.includes("win32")) return "Windows";
  if (ua.includes("mac os x") || ua.includes("macintosh")) return "macOS";
  if (ua.includes("linux") || ua.includes("x11")) return "Linux";
  return "Unknown";
}

export default function Home() {
  const [autoDetectedOs, setAutoDetectedOs] = useState<SupportedOs>("Unknown");
  const [selectedOs, setSelectedOs] = useState<SupportedOs | "Auto">("Auto");

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const os = detectOs(navigator.userAgent || "");
      setAutoDetectedOs(os);
    }
  }, []);

  const effectiveOs: SupportedOs = useMemo(() => {
    if (selectedOs === "Auto") return autoDetectedOs;
    return selectedOs;
  }, [selectedOs, autoDetectedOs]);

  const commandMap: Record<Exclude<SupportedOs, "Unknown">, CommandItem[]> = {
    Windows: [
      {
        description: "Check processor architecture",
        command: "wmic cpu get architecture",
      },
      {
        description: "Download CLI (replace placeholders)",
        command:
          'Start-Process "https://prime.tmdata.io/plutus/api/v1/files/download?name=dataos-ctl-windows-{{ARCH}}.tar.gz&dir=cli-apps-{{CLI_VERSION}}&apikey={{PRIME_APIKEY}}"',
      },
    ],
    Linux: [
      {
        description: "Set API key",
        command: 'export PRIME_APIKEY="{{prime_apikey}}"',
      },
      {
        description: "Check processor architecture",
        command: "uname -p",
      },
      {
        description: "Download CLI binary",
        command:
          "curl --silent --output dataos-ctl-linux-{{ARCH}}.tar.gz \\\n--location --request GET \\\n\"https://prime.tmdata.io/plutus/api/v1/files/download?name=dataos-ctl-linux-{{ARCH}}.tar.gz&dir=cli-apps-2.26&apikey=$PRIME_APIKEY\"",
      },
      {
        description: "Extract the archive",
        command: "tar -xvf dataos-ctl-linux-{{ARCH}}.tar.gz",
      },
      {
        description: "Add binary to PATH",
        command: "export PATH=$PATH:$HOME/linux-{{ARCH}}",
      },
      {
        description: "Persist PATH (Bash example)",
        command:
          "echo 'export PATH=$PATH:$HOME/.dataos/bin' >> ~/.bash_profile\nsource ~/.bash_profile",
      },
    ],
    macOS: [
      {
        description: "Set API key",
        command: 'export PRIME_APIKEY="{{prime_apikey}}"',
      },
      {
        description: "Download CLI binary",
        command:
          "curl --silent --output dataos-ctl-{{ARCH}}.tar.gz \\\n--location --request GET \\\n\"https://prime.tmdata.io/plutus/api/v1/files/download?name=dataos-ctl-{{ARCH}}.tar.gz&dir=cli-apps-2.26&apikey=$PRIME_APIKEY\"",
      },
      {
        description: "Extract the archive",
        command: "tar -xvf dataos-ctl-{{ARCH}}.tar.gz",
      },
      {
        description: "Add binary to PATH",
        command: "export PATH=$PATH:$HOME/{{dir-name}}",
      },
      {
        description: "Persist PATH (Zsh example)",
        command:
          "echo 'export PATH=$PATH:$HOME/.dataos/bin' >> ~/.zshrc\nsource ~/.zshrc",
      },
    ],
  };

  // Replace {{ARCH}} dynamically based on OS
  const commands: CommandItem[] =
    effectiveOs === "Unknown"
      ? []
      : commandMap[effectiveOs].map((cmd) => {
          let arch = "";
          if (effectiveOs === "macOS") arch = "darwin-amd64";
          else if (effectiveOs === "Windows") arch = "amd64";
          else if (effectiveOs === "Linux") arch = "amd64";

          return {
            ...cmd,
            command: cmd.command.replace(/{{ARCH}}/g, arch),
          };
        });

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-white text-zinc-900 flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <Image
              src="/modernLogo.png"
              alt="Modern Logo"
              width={200}
              height={200}
              className="invert"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold">DATA OS installation Command Helper</h1>
          <p className="mt-2 text-zinc-600 max-w-xl text-sm">
            Automatically detects your operating system and replaces architecture placeholders
            accordingly.
            <br />
            If detection fails, select your OS manually and copy the commands.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-center gap-3">
          <label className="text-sm text-zinc-700">Operating System</label>
          <select
            value={selectedOs}
            onChange={(e) => setSelectedOs(e.target.value as SupportedOs | "Auto")}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-cyan-500"
          >
            <option value="Auto">Auto ({autoDetectedOs})</option>
            <option value="Windows">🪟 Windows</option>
            <option value="macOS"> macOS</option>
            <option value="Linux">🐧 Linux</option>
          </select>
        </div>

        {effectiveOs === "Unknown" ? (
          <div className="mx-auto w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 text-center text-zinc-600 shadow-sm">
            Your OS could not be detected.
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">{effectiveOs} Commands</h2>
            <CommandCard osName={effectiveOs} commands={commands} />
            <p className="mt-6 text-center text-sm text-zinc-600">
              Press the copy button to quickly copy commands to your clipboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
