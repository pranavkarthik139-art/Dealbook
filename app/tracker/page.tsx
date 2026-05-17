"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const trackerRows = [
  { feature: "SSO via Okta / SAML", sub: "Required for IT sign-off", priority: "Critical", pClass: "bg-[#FCEBEB] text-[#A32D2D]", status: "Available", sClass: "bg-[#EAF3DE] text-[#3B6D11]" },
  { feature: "Bulk data export (CSV/JSON)", sub: "Ops team dependency", priority: "Critical", pClass: "bg-[#FCEBEB] text-[#A32D2D]", status: "Gap — Q3", sClass: "bg-[#FCEBEB] text-[#A32D2D]" },
  { feature: "Custom role permissions", sub: "Multi-tenant requirement", priority: "High", pClass: "bg-[#FAEEDA] text-[#854F0B]", status: "Partial", sClass: "bg-[#FAEEDA] text-[#854F0B]" },
];

const mapTasks = [
  { id: 1, text: "Deliver security whitepaper + compliance docs", due: "Completed", done: true },
  { id: 2, text: "Configure sandbox environment with sample data", due: "Completed", done: true },
  { id: 3, text: "Run live demo for VP of Engineering", due: "Completed", done: true },
  { id: 4, text: "Submit formal response to RFP questions", due: "Due Jun 7 · Overdue", done: false, overdue: true },
  { id: 5, text: "Prepare use case validation report", due: "Due Jun 14", done: false },
];

export default function TrackerPage() {
  const [tasks, setTasks] = useState(mapTasks);
  const [shareState, setShareState] = useState("Share");
  const [activity, setActivity] = useState([
    { event: "Security Whitepaper viewed", sub: "D. Okafor spent 8m 42s on page 4–9", time: "Today · 2:31 PM" },
    { event: "Milestone 2 reached", sub: "Environment setup marked complete by MK", time: "Today · 11:04 AM" },
    { event: "POC kickoff call", sub: "7 attendees · 54 min · recording shared", time: "May 20 · 10:00 AM" },
  ]);

  const doneCount = useMemo(() => tasks.filter((task) => task.done).length, [tasks]);

  const toggleTask = (id: number) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareState("Copied");
      setTimeout(() => setShareState("Share"), 1200);
    } catch {
      setShareState("Copy failed");
      setTimeout(() => setShareState("Share"), 1200);
    }
  };

  const handleLogUpdate = () => {
    setActivity((prev) => [
      { event: "Manual update logged", sub: "Sales engineer added a status note", time: "Just now" },
      ...prev,
    ]);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] px-9 pb-9 pt-7 text-[#1A1A18]">
      <header className="mb-7 flex items-center justify-between">
        <Link href="/" className="text-[11px] text-[#8A8A85] hover:text-[#0047FF]">
          ← All POCs
        </Link>
        <div className="text-center">
          <div className="mb-1 text-[9px] uppercase tracking-[2px] text-[#8A8A85]">Pilot Command Center</div>
          <h1 className="font-serif text-[26px] font-black tracking-[-0.8px]">Aether Logistics</h1>
          <p className="text-[11px] text-[#8A8A85]">Enterprise · 5,100 seats · Day 18 of 30 · Owner: MK</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-full bg-[#F0F3FF] px-3 py-1.5 text-[11px] font-medium text-[#0047FF]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0047FF]" />
            Live · Health 9.1
          </div>
          <button type="button" onClick={handleShare} className="rounded-full border border-black/15 px-3 py-1 text-[10px] text-[#8A8A85] hover:bg-white">
            {shareState}
          </button>
          <button type="button" onClick={handleLogUpdate} className="rounded-full bg-[#0047FF] px-3 py-1 text-[10px] text-white hover:bg-[#0039d6]">
            + Log Update
          </button>
        </div>
      </header>

      <main className="grid grid-cols-[1fr_1fr_280px] gap-5">
        <section className="animate-fade-up overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
            <h2 className="font-serif text-base font-bold">Gap Tracker</h2>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-[#A32D2D]">2 critical gaps</span>
              <span className="rounded-full bg-[#F0F3FF] px-2 py-0.5 text-[10px] text-[#0047FF]">6 features</span>
            </div>
          </div>
          <div className="px-6 py-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left text-[9px] uppercase tracking-[1.6px] text-[#8A8A85]">
                  <th className="pb-3">Requested Feature</th>
                  <th className="pb-3 text-center">Priority</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {trackerRows.map((row) => (
                  <tr key={row.feature} className="border-t border-black/5 align-middle">
                    <td className="py-3">
                      <div className="text-[13px] font-medium">{row.feature}</div>
                      <div className="text-[10px] text-[#8A8A85]">{row.sub}</div>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`rounded px-2 py-0.5 text-[9px] font-medium ${row.pClass}`}>{row.priority}</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${row.sClass}`}>
                        <span className="h-1 w-1 rounded-full bg-current" />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="animate-fade-up overflow-hidden rounded-2xl bg-white shadow-card [animation-delay:0.08s]">
          <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
            <h2 className="font-serif text-base font-bold">Mutual Action Plan</h2>
            <span className="rounded-full bg-[#F0F3FF] px-2 py-0.5 text-[10px] text-[#0047FF]">{doneCount} of {tasks.length} done</span>
          </div>
          <div className="space-y-2 px-6 py-4 text-sm text-[#3D3D3A]">
            {tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => toggleTask(task.id)}
                className="flex w-full items-start gap-2 border-b border-black/5 py-2.5 text-left last:border-b-0"
              >
                <span className={`mt-0.5 h-4 w-4 rounded ${task.done ? "bg-[#0047FF]" : "border border-black/20"}`} />
                <div>
                  <p className={`text-[12px] ${task.done ? "text-[#8A8A85] line-through" : ""}`}>{task.text}</p>
                  <p className={`text-[10px] ${task.overdue && !task.done ? "font-medium text-[#C0392B]" : "text-[#8A8A85]"}`}>{task.done ? "Completed" : task.due}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="animate-fade-up overflow-hidden rounded-2xl bg-white shadow-card [animation-delay:0.16s]">
          <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
            <h2 className="font-serif text-base font-bold">Pulse Feed</h2>
            <span className="rounded-full bg-[#F0F3FF] px-2 py-0.5 text-[9px] text-[#0047FF]">Live</span>
          </div>
          <div className="space-y-3 px-5 py-4">
            {activity.map((item, idx) => (
              <div key={`${item.event}-${idx}`} className={idx !== activity.length - 1 ? "border-b border-black/5 pb-3" : ""}>
                <p className="text-[12px] font-medium">{item.event}</p>
                <p className="mt-0.5 text-[10px] text-[#8A8A85]">{item.sub}</p>
                <p className="mt-1 text-[9px] text-[#8A8A85]">{item.time}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
