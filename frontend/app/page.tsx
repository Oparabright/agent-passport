"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  useAgentPassport,
  useTransaction,
  useDispute,
} from "@/lib/hooks/useAgentPassport";

const AGENTS = {
  researchbot: {
    label: "ResearchBot",
    role: "Research Agent",
    address: "0x6909892961bF4A4E3f69E750b9a18196DaAe489d",
  },
  verifierbot: {
    label: "VerifierBot",
    role: "Verification Agent",
    address: "0x1f400f22878fBBcc8090BB60d906b9Df779edB84",
  },
  scambot: {
    label: "ScamBot",
    role: "Flagged Agent",
    address: "0x437e1D8dB8E448BbF00cbBE0795d13F70DF73Ac8",
  },
};

type AgentKey = keyof typeof AGENTS;

function shortenAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function getTrustStatus(reputation: number) {
  if (reputation >= 70) {
    return {
      label: "Highly Trusted",
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      dot: "bg-emerald-400",
      bar: "bg-emerald-400",
    };
  }

  if (reputation >= 50) {
    return {
      label: "Trusted",
      text: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      dot: "bg-green-400",
      bar: "bg-green-400",
    };
  }

  if (reputation >= 40) {
    return {
      label: "Caution",
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      dot: "bg-amber-400",
      bar: "bg-amber-400",
    };
  }

  return {
    label: "High Risk",
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    dot: "bg-red-400",
    bar: "bg-red-400",
  };
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-white/20 hover:bg-white/[0.055]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/45">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

function TransactionCard({
  id,
  result,
  description,
}: {
  id: number;
  result: "SUCCESS" | "FAILED";
  description: string;
}) {
  const success = result === "SUCCESS";

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              success ? "bg-emerald-400" : "bg-red-400"
            }`}
          />

          <div>
            <p className="font-medium">Transaction #{id}</p>
            <p className="text-xs text-white/40">On-chain activity</p>
          </div>
        </div>

        <span
          className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
            success
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/20 bg-red-500/10 text-red-400"
          }`}
        >
          {result}
        </span>
      </div>

      <p className="mt-4 break-words text-sm leading-6 text-white/55">
        {description || "Loading transaction from GenLayer..."}
      </p>
    </div>
  );
}

export default function HomePage() {
  const [selectedAgent, setSelectedAgent] =
    useState<AgentKey>("researchbot");

  const currentAgent = AGENTS[selectedAgent];

  const {
    data: agent,
    isLoading,
    error,
  } = useAgentPassport(currentAgent.address);

  const { data: tx1 } = useTransaction(
    1,
    selectedAgent === "researchbot"
  );

  const { data: tx2 } = useTransaction(
    2,
    selectedAgent === "researchbot"
  );

  const { data: tx3 } = useTransaction(
    3,
    selectedAgent === "scambot"
  );

  const { data: dispute1 } = useDispute(
    1,
    selectedAgent === "scambot"
  );

  const trust = agent
    ? getTrustStatus(agent.reputation)
    : getTrustStatus(0);

  return (
    <div className="min-h-screen bg-[#07090d] text-white">
      <Navbar />

      <main className="px-4 pb-16 pt-28 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="mb-10">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                GENLAYER INTELLIGENT CONTRACT
              </span>

              <span className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                LIVE ON-CHAIN
              </span>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                  Trust infrastructure for
                  <span className="block text-white/45">
                    autonomous agents.
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-7 text-white/50 md:text-lg">
                  Agent Passport creates verifiable reputation profiles from
                  transaction behavior and AI-adjudicated disputes on GenLayer.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-violet-400 shadow-[0_0_14px_rgba(167,139,250,0.7)]" />

                <div>
                  <p className="text-xs text-white/40">Network</p>
                  <p className="text-sm font-medium">
                    Studio Next
                    <span className="ml-2 text-white/30">61997</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.025] p-2">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {(Object.keys(AGENTS) as AgentKey[]).map((key) => {
                const item = AGENTS[key];
                const active = selectedAgent === key;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedAgent(key)}
                    className={`rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-violet-400/30 bg-violet-500/10"
                        : "border-transparent hover:border-white/10 hover:bg-white/[0.035]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p
                          className={`font-semibold ${
                            active ? "text-white" : "text-white/70"
                          }`}
                        >
                          {item.label}
                        </p>

                        <p className="mt-1 text-xs text-white/35">
                          {item.role}
                        </p>
                      </div>

                      {active && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-400 text-xs font-bold text-black">
                          ✓
                        </div>
                      )}
                    </div>

                    <p className="mt-3 font-mono text-xs text-white/30">
                      {shortenAddress(item.address)}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {isLoading && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
              <div className="mx-auto mb-4 h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-violet-400" />

              <p className="text-sm text-white/50">
                Reading Agent Passport from GenLayer...
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
              <p className="font-semibold text-red-400">
                Unable to load Agent Passport
              </p>

              <p className="mt-2 text-sm text-white/50">
                {error.message}
              </p>
            </div>
          )}

          {agent && (
            <>
              <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_0.8fr]">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
                  <div className="border-b border-white/10 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white/50">
                        AGENT PASSPORT
                      </p>

                      <span className="text-xs text-white/30">
                        Verified on GenLayer
                      </span>
                    </div>
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-blue-500/10 text-3xl font-semibold text-violet-300">
                        {agent.name
                          ? agent.name.charAt(0).toUpperCase()
                          : "A"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-3xl font-semibold tracking-tight">
                            {agent.name || currentAgent.label}
                          </h2>

                          <span
                            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${trust.bg} ${trust.border} ${trust.text}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${trust.dot}`}
                            />
                            {trust.label}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-white/40">
                          {currentAgent.role}
                        </p>

                        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                          <p className="mb-1 text-xs text-white/30">
                            AGENT ADDRESS
                          </p>

                          <p className="break-all font-mono text-sm text-white/60">
                            {agent.agentAddress}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 md:p-8">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/45">
                      Reputation Score
                    </p>

                    <span className={`text-sm font-medium ${trust.text}`}>
                      {trust.label}
                    </span>
                  </div>

                  <div className="mt-8">
                    <div className="flex items-end gap-2">
                      <span className="text-6xl font-semibold tracking-tighter">
                        {agent.reputation}
                      </span>

                      <span className="mb-2 text-xl text-white/25">
                        / 100
                      </span>
                    </div>

                    <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${trust.bar}`}
                        style={{
                          width: `${Math.min(agent.reputation, 100)}%`,
                        }}
                      />
                    </div>

                    <div className="mt-3 flex justify-between text-[11px] text-white/25">
                      <span>0</span>
                      <span>25</span>
                      <span>50</span>
                      <span>75</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                  label="Successful Transactions"
                  value={agent.successfulTransactions}
                  icon="✓"
                />

                <StatCard
                  label="Failed Transactions"
                  value={agent.failedTransactions}
                  icon="×"
                />

                <StatCard
                  label="Disputes Won"
                  value={agent.disputesWon}
                  icon="↑"
                />

                <StatCard
                  label="Disputes Lost"
                  value={agent.disputesLost}
                  icon="↓"
                />
              </section>

              {selectedAgent === "researchbot" && (
                <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_0.8fr]">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold">
                          Activity History
                        </p>

                        <p className="mt-1 text-sm text-white/40">
                          Reputation-building transactions
                        </p>
                      </div>

                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                        Positive history
                      </span>
                    </div>

                    <div className="space-y-3">
                      <TransactionCard
                        id={2}
                        result="SUCCESS"
                        description={
                          tx2 || "Loading transaction from GenLayer..."
                        }
                      />

                      <TransactionCard
                        id={1}
                        result="SUCCESS"
                        description={
                          tx1 || "Loading transaction from GenLayer..."
                        }
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-violet-500/15 bg-violet-500/[0.05] p-6">
                    <p className="text-sm font-medium text-violet-300">
                      REPUTATION SIGNAL
                    </p>

                    <h3 className="mt-4 text-2xl font-semibold">
                      Reliable behavior builds trust.
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-white/45">
                      ResearchBot&apos;s successful activity is reflected
                      directly in its on-chain reputation score.
                    </p>

                    <div className="mt-8 border-t border-white/10 pt-5">
                      <p className="text-xs text-white/30">
                        CURRENT STATUS
                      </p>

                      <p className={`mt-2 font-semibold ${trust.text}`}>
                        {trust.label}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {selectedAgent === "verifierbot" && (
                <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
                    <p className="text-sm text-white/40">
                      VERIFICATION ROLE
                    </p>

                    <h3 className="mt-3 text-2xl font-semibold">
                      Trust challenger
                    </h3>

                    <p className="mt-4 max-w-xl text-sm leading-6 text-white/50">
                      VerifierBot acts as a trusted counterparty and challenged
                      ScamBot&apos;s legitimacy claim through the Agent Passport
                      dispute system.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                        AI
                      </div>

                      <div>
                        <p className="font-semibold">
                          Intelligent Adjudication
                        </p>

                        <p className="text-xs text-white/35">
                          GenLayer consensus
                        </p>
                      </div>
                    </div>

                    <p className="mt-5 text-sm leading-6 text-white/50">
                      The dispute was evaluated through GenLayer&apos;s
                      intelligent contract adjudication process rather than
                      relying on a centralized reputation administrator.
                    </p>
                  </div>
                </section>
              )}

              {selectedAgent === "scambot" && (
                <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold">
                          Activity History
                        </p>

                        <p className="mt-1 text-sm text-white/40">
                          Recorded on-chain behavior
                        </p>
                      </div>

                      <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-400">
                        Risk detected
                      </span>
                    </div>

                    <TransactionCard
                      id={3}
                      result="FAILED"
                      description={
                        tx3 || "Loading transaction from GenLayer..."
                      }
                    />
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/[0.04]">
                    <div className="border-b border-red-500/10 p-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold text-red-400">
                            INTELLIGENT DISPUTE
                          </p>

                          <h3 className="mt-2 text-xl font-semibold">
                            Dispute #1
                          </h3>
                        </div>

                        <span className="rounded-full border border-red-500/30 bg-red-500/15 px-4 py-1.5 text-xs font-bold tracking-wide text-red-400">
                          INVALID
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="text-xs text-white/30">
                        GENLAYER ADJUDICATION RESULT
                      </p>

                      <p className="mt-3 text-lg font-medium">
                        Claim rejected by intelligent consensus.
                      </p>

                      <p className="mt-3 text-sm leading-6 text-white/45">
                        The submitted evidence contradicted the claim that the
                        seller was legitimate. The dispute outcome was recorded
                        on-chain and affected the accused agent&apos;s reputation.
                      </p>

                      <details className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                        <summary className="cursor-pointer text-sm font-medium text-white/60">
                          View on-chain dispute record
                        </summary>

                        <p className="mt-4 break-words text-xs leading-6 text-white/40">
                          {dispute1 || "Loading dispute from GenLayer..."}
                        </p>
                      </details>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}

          <section className="mt-14 border-t border-white/10 pt-10">
            <div className="mb-7">
              <p className="text-xs font-medium tracking-widest text-violet-300">
                HOW IT WORKS
              </p>

              <h2 className="mt-3 text-2xl font-semibold">
                Reputation backed by behavior.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Register",
                  text: "Agents receive an on-chain passport and initial reputation score.",
                },
                {
                  number: "02",
                  title: "Build History",
                  text: "Successful and failed interactions create verifiable reputation signals.",
                },
                {
                  number: "03",
                  title: "Resolve Disputes",
                  text: "GenLayer intelligent consensus evaluates claims and updates reputation.",
                },
              ].map((item) => (
                <div
                  key={item.number}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
                >
                  <p className="font-mono text-xs text-violet-300">
                    {item.number}
                  </p>

                  <h3 className="mt-4 text-lg font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/40">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/10 py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-center text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>Agent Passport</p>
          <p>Powered by GenLayer • Studio Next • Chain 61997</p>
        </div>
      </footer>
    </div>
  );
}