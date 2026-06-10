"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState("");
  const missingInfo = [
    "Unit Number",
    "Stairs",
    "Elevator",
    "Long Walk",
    "Lead Source",
    "Exact Pickup Address",
    "Exact Drop-off Address",
  ];
  const [callType, setCallType] = useState("New Lead");
  const [outcome, setOutcome] = useState("Left Voicemail");
  const [customerName, setCustomerName] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [callHistory, setCallHistory] = useState<
    {
      customer: string;
      notes: string;
      date: string;
      type: string;
      outcome: string;
    }[]
  >(() => {
    if (typeof window === "undefined") return [];

    const savedCalls = localStorage.getItem("asap-call-history");

    if (!savedCalls) return [];

    return JSON.parse(savedCalls);
  });

  const saveCall = () => {
    setCallHistory((prev) => [
      {
        customer: customerName || "Unknown Customer",
        notes: callNotes,
        date: new Date().toLocaleTimeString(),
        type: callType,
        outcome,
      },
      ...prev,
    ]);
  };

  useEffect(() => {
    localStorage.setItem("asap-call-history", JSON.stringify(callHistory));
  }, [callHistory]);

  function generateNotes() {
    if (callType === "New Lead") {
setNotes(`
CALL TYPE: NEW LEAD

CALL OUTCOME:
${outcome}

CUSTOMER:
${customerName || "Not provided"}

PHONE:

EMAIL:

MOVE TYPE:

PICKUP ADDRESS:

DROPOFF ADDRESS:

ITEMS TO MOVE:

NOTES:
${callNotes || "No notes entered."}
`);
    }

    if (callType === "Complaint") {
      setNotes(`
CALL TYPE: COMPLAINT

CALL OUTCOME:
${outcome}

CUSTOMER:

ISSUE:

RESOLUTION REQUESTED:

FOLLOW UP REQUIRED:
`);
    }

    if (callType === "Status Check") {
      setNotes(`
CALL TYPE: STATUS CHECK

CALL OUTCOME:
${outcome}

CUSTOMER:

JOB DATE:

CURRENT STATUS:

ACTION NEEDED:
`);
    }

    if (callType === "Reschedule") {
      setNotes(`
CALL TYPE: RESCHEDULE

CALL OUTCOME:
${outcome}

CUSTOMER:

ORIGINAL DATE:

NEW REQUESTED DATE:

FOLLOW UP:
`);
    }
  }
    function copyNotes() {
      navigator.clipboard.writeText(notes);
    }

    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold">ASAP Call Assistant</h1>

          <p className="mt-2 text-slate-400">
            Paste a transcript and generate Supermove helper notes.
          </p>

          <div className="mb-4">
            <label className="mb-2 block text-sm text-slate-400">
              Customer Name
            </label>

            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm text-slate-400">
              Call Notes
            </label>

            <textarea
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              placeholder="Enter notes from the call..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"
              rows={4}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            <div className="bg-slate-900 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Transcript</h2>

              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setCallType("New Lead")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    callType === "New Lead" ? "bg-blue-600" : "bg-slate-700"
                  }`}
                >
                  New Lead
                </button>

                <button
                  onClick={() => setCallType("Complaint")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    callType === "Complaint" ? "bg-blue-600" : "bg-slate-700"
                  }`}
                >
                  Complaint
                </button>

                <button
                  onClick={() => setCallType("Status Check")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    callType === "Status Check" ? "bg-blue-600" : "bg-slate-700"
                  }`}
                >
                  Status Check
                </button>

                <button
                  onClick={() => setCallType("Reschedule")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    callType === "Reschedule" ? "bg-blue-600" : "bg-slate-700"
                  }`}
                >
                  Reschedule
                </button>
              </div>

              <p className="mb-4 text-sm text-slate-400">
                Current Mode: {callType}
              </p>
              <div className="mb-4">
                <label className="mb-2 block text-sm text-slate-400">
                  Call Outcome
                </label>

                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2"
                >
                  <option>Left Voicemail</option>
                  <option>No Answer</option>
                  <option>Still Considering</option>
                  <option>Move Completed</option>
                  <option>Hired Competitor</option>
                  <option>Awaiting Walkthrough</option>
                  <option>Call Back Later</option>
                  <option>Scheduled</option>
                </select>
              </div>

              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste transcript here..."
                className="w-full h-[500px] bg-slate-950 border border-slate-700 rounded-lg p-4"
              />

              <button
                onClick={generateNotes}
                className="mt-4 bg-blue-600 px-4 py-3 rounded-lg font-semibold"
              >
                Generate Notes
              </button>
              <button
                onClick={saveCall}
                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-500"
              >
                Save Call
              </button>
            </div>

            <div className="bg-slate-900 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Supermove Helper</h2>

              <button
                onClick={copyNotes}
                disabled={!notes}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                Copy Notes
              </button>

              <pre className="whitespace-pre-wrap h-[500px] overflow-auto bg-slate-950 border border-slate-700 rounded-lg p-4">
                {notes ||
                  "Paste a customer conversation and click Generate Notes."}
              </pre>
              <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                <h3 className="font-semibold text-yellow-300">
                  ⚠ Missing Information
                </h3>

                <div className="mt-3 grid gap-2 text-sm text-slate-200">
                  {missingInfo.map((item) => (
                    <label key={item} className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4" />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">📋 Today&apos;s Calls</h2>

            <button
              onClick={() => setCallHistory([])}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500"
            >
              Clear History
            </button>
          </div>

          {callHistory.length === 0 ? (
            <p className="text-slate-400">No calls tracked yet...</p>
          ) : (
            <div className="space-y-3">
              {callHistory.map((call, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-slate-700 bg-slate-950 p-3"
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{call.customer}</div>

                      <div className="text-sm text-slate-400">{call.type}</div>
                    </div>
                    <span className="text-slate-400">{call.date}</span>
                  </div>

                  <div className="mt-1 text-sm text-slate-300">
                    Outcome: {call.outcome}
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    {call.notes}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

