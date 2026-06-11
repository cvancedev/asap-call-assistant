"use client";

import { useEffect, useState } from "react";

type CallHistoryItem = {
  customer: string;
  notes: string;
  date: string;
  type: string;
  outcome: string;
};

type IntakeDetails = {
  customerName: string;
  phone: string;
  email: string;
  moveDate: string;
  moveType: string;
  fromCity: string;
  toCity: string;
  pickupAddress: string;
  dropoffAddress: string;
  homeSize: string;
  pickupProperty: string;
  dropoffProperty: string;
  stairs: string;
  items: string;
  leadSource: string;
  missing: string[];
};

function cleanTranscript(text: string) {
  return text.replace(/\(\d+:\d+\)/g, "").replace(/\s+/g, " ").trim();
}

function extractSplitPhone(text: string) {
  const cleaned = cleanTranscript(text);
  const phoneArea = cleaned.match(/phone number.+?(\d{3}).+?(\d{3}).+?(\d{4})/i);

  if (phoneArea) {
    return `${phoneArea[1]}-${phoneArea[2]}-${phoneArea[3]}`;
  }

  return cleaned.match(/(\d{3})[-.\s]?(\d{3})[-.\s]?(\d{4})/)?.[0] || "";
}

function analyzeTranscript(text: string): IntakeDetails {
  const cleaned = cleanTranscript(text);
  const lower = cleaned.toLowerCase();

  const phone = extractSplitPhone(cleaned);

  const email =
    cleaned.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";

  const moveDate =
    cleaned.match(/(?:this weekend,\s*)?(saturday|sunday|monday|tuesday|wednesday|thursday|friday)/i)?.[0] ||
    cleaned.match(/\b\d{1,2}\/\d{1,2}\/?\d{0,4}\b/)?.[0] ||
    "";

  const cityMatch = cleaned.match(/(?:move from|moving from|from)\s+([A-Za-z\s]+?)\s+to\s+([A-Za-z\s]+?)(?:\s+and|\s+which|\.|,)/i);

  const fromCity = cityMatch?.[1]?.trim() || "";
  const toCity = cityMatch?.[2]?.trim() || "";

  const pickupAddress =
    cleaned.match(/pickup address.*?(\d{2,6}.+?(?:court|ct|street|st|road|rd|drive|dr|avenue|ave|lane|ln).+?(?:\d{5})?)/i)?.[1]?.trim() ||
    "";

  const dropoffAddress =
    cleaned.match(/drop off location address.*?(\d{2,6}.+?(?:run|court|ct|street|st|road|rd|drive|dr|avenue|ave|lane|ln))/i)?.[1]?.trim() ||
    "";

  const homeSize =
    cleaned.match(/(?:three-bedroom|3-bedroom|two-bedroom|2-bedroom|one-bedroom|1-bedroom|four-bedroom|4-bedroom)/i)?.[0] ||
    "";

  const pickupProperty = lower.includes("townhome")
    ? "Townhome"
    : lower.includes("apartment")
    ? "Apartment"
    : lower.includes("house")
    ? "House"
    : "";

  const dropoffProperty = lower.includes("also a townhome")
    ? "Townhome"
    : lower.includes("apartment")
    ? "Apartment"
    : pickupProperty;

  const stairs = lower.includes("one set of stairs")
    ? "Pickup: one set of stairs"
    : lower.includes("two floors")
    ? "Pickup: two floors"
    : lower.includes("three floors")
    ? "Dropoff: three floors"
    : lower.includes("stairs")
    ? "Stairs mentioned, review transcript"
    : "";

  const foundItems: string[] = [];

  if (lower.includes("bed")) foundItems.push("Beds");
  if (lower.includes("couch")) foundItems.push("Couch");
  if (lower.includes("dining table")) foundItems.push("Dining table and chairs");
  if (lower.includes("fridge") || lower.includes("refrigerator")) foundItems.push("Fridge");
  if (lower.includes("tv")) foundItems.push("TV");
  if (lower.includes("furniture")) foundItems.push("Furniture");

  const leadSource = lower.includes("chat gvd") || lower.includes("chatgpt") || lower.includes("chat gpt")
    ? "ChatGPT recommendation"
    : "";

  const moveType = fromCity && toCity ? "Local Move" : "";

  const missing: string[] = [];

  if (!phone) missing.push("Phone number");
  if (!email) missing.push("Verified email");
  if (!pickupAddress) missing.push("Exact pickup address");
  if (!dropoffAddress) missing.push("Exact dropoff address");
  if (!leadSource) missing.push("Lead source");
  if (!homeSize) missing.push("Bedroom count / home size");

  return {
    customerName: "",
    phone,
    email,
    moveDate,
    moveType,
    fromCity,
    toCity,
    pickupAddress,
    dropoffAddress,
    homeSize,
    pickupProperty,
    dropoffProperty,
    stairs,
    items: foundItems.join(", "),
    leadSource,
    missing,
  };
}



export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState("");
  const [callType, setCallType] = useState("New Lead");
  const [outcome, setOutcome] = useState("Left Voicemail");
  const [customerName, setCustomerName] = useState("");
  const [callNotes, setCallNotes] = useState("");

  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>(() => {
    if (typeof window === "undefined") return [];

    const savedCalls = localStorage.getItem("asap-call-history");

    if (!savedCalls) return [];

    try {
      return JSON.parse(savedCalls);
    } catch {
      return [];
    }
  });

  const missingInfo = [
    "Unit Number",
    "Stairs",
    "Elevator",
    "Long Walk",
    "Lead Source",
    "Exact Pickup Address",
    "Exact Drop-off Address",
  ];

  useEffect(() => {
    localStorage.setItem("asap-call-history", JSON.stringify(callHistory));
  }, [callHistory]);

  function generateNotes() {
    const details = analyzeTranscript(transcript);

    if (callType === "New Lead") {
      setNotes(`
CALL TYPE: NEW LEAD

CALL OUTCOME:
${outcome}

CUSTOMER:
${customerName || details.customerName || "Not provided"}

PHONE:
${details.phone || "Not provided"}

EMAIL:
${details.email || "Not provided"}

MOVE TYPE:
${details.moveType || "Not provided"}

MOVE DATE:
${details.moveDate || "Not provided"}

PICKUP ADDRESS / LOCATION:
${details.pickupAddress || "Not provided"}

DROPOFF ADDRESS / LOCATION:
${details.dropoffAddress || "Not provided"}

ITEMS TO MOVE:
Not provided

NOTES:
${callNotes || "Review transcript for extra details."}

RAW TRANSCRIPT:
${transcript || "No transcript provided."}
`);
      return;
    }

    if (callType === "Complaint") {
      setNotes(`
CALL TYPE: COMPLAINT

CALL OUTCOME:
${outcome}

CUSTOMER:
${customerName || details.customerName || "Not provided"}

PHONE:
${details.phone || "Not provided"}

ISSUE:
${callNotes || transcript || "Not provided"}

RESOLUTION REQUESTED:
Not provided

FOLLOW UP REQUIRED:
Yes
`);
      return;
    }

    if (callType === "Status Check") {
      setNotes(`
CALL TYPE: STATUS CHECK

CALL OUTCOME:
${outcome}

CUSTOMER:
${customerName || details.customerName || "Not provided"}

PHONE:
${details.phone || "Not provided"}

JOB DATE:
${details.moveDate || "Not provided"}

CURRENT STATUS:
${callNotes || transcript || "Not provided"}

ACTION NEEDED:
Not provided
`);
      return;
    }

    if (callType === "Reschedule") {
      setNotes(`
CALL TYPE: RESCHEDULE

CALL OUTCOME:
${outcome}

CUSTOMER:
${customerName || details.customerName || "Not provided"}

PHONE:
${details.phone || "Not provided"}

ORIGINAL DATE:
Not provided

NEW REQUESTED DATE:
${details.moveDate || "Not provided"}

FOLLOW UP:
Confirm new availability
`);
    }
  }

function saveCall() {
  const details = analyzeTranscript(transcript);

  setCallHistory((prev) => [
    {
      customer: customerName || details.customerName || "Unknown Customer",
      notes: notes || callNotes || transcript,
      date: new Date().toLocaleTimeString(),
      type: callType,
      outcome,
    },
    ...prev,
  ]);
}

  function copyNotes() {
    navigator.clipboard.writeText(notes);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold">ASAP Call Assistant</h1>

        <p className="mt-2 text-slate-400">
          Paste a transcript and generate Supermove helper notes.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Call Input</h2>

            <div className="mb-4">
              <label className="mb-2 block text-sm text-slate-400">
                Customer Name
              </label>

              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm text-slate-400">
                Quick Notes
              </label>

              <textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Any extra notes you want included..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
                rows={3}
              />
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {["New Lead", "Complaint", "Status Check", "Reschedule"].map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => setCallType(type)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                      callType === type ? "bg-blue-600" : "bg-slate-700"
                    }`}
                  >
                    {type}
                  </button>
                )
              )}
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm text-slate-400">
                Call Outcome
              </label>

              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
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
              className="h-[420px] w-full rounded-lg border border-slate-700 bg-slate-950 p-4"
            />

            <div className="mt-4 flex gap-3">
              <button
                onClick={generateNotes}
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
              >
                Generate Notes
              </button>

              <button
                onClick={saveCall}
                className="rounded-lg bg-green-600 px-5 py-3 font-semibold hover:bg-green-500"
              >
                Save Call
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Supermove Helper</h2>

              <button
                onClick={copyNotes}
                disabled={!notes}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                Copy Notes
              </button>
            </div>

            <pre className="h-[420px] overflow-auto whitespace-pre-wrap rounded-lg border border-slate-700 bg-slate-950 p-4">
              {notes || "Paste a customer conversation and click Generate Notes."}
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

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">📋 Today&apos;s Calls</h2>

            <button
              onClick={() => setCallHistory([])}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-500"
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

                  <div className="mt-2 whitespace-pre-wrap text-sm text-slate-300">
                    {call.notes}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}