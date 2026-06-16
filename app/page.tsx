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
  return text
    .replace(/\(\d+:\d+\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSplitPhone(text: string) {
  const cleaned = cleanTranscript(text);
  const phoneArea = cleaned.match(
    /phone number.+?(\d{3}).+?(\d{3}).+?(\d{4})/i,
  );

  if (phoneArea) {
    return `${phoneArea[1]}-${phoneArea[2]}-${phoneArea[3]}`;
  }

  return cleaned.match(/(\d{3})[-.\s]?(\d{3})[-.\s]?(\d{4})/)?.[0] || "";
}

function analyzeTranscript(text: string): IntakeDetails {
  const cleaned = cleanTranscript(text);
  const lower = cleaned.toLowerCase();
  const customerName =
    cleaned.match(
      /(?:my name is|this is|name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    )?.[1] || "";
  const phone = extractSplitPhone(cleaned);

  const email =
    cleaned.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";

 const moveDate =
  cleaned.match(
    /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?\b/i,
  )?.[0] ||
  cleaned.match(
    /(?:this weekend,\s*)?(saturday|sunday|monday|tuesday|wednesday|thursday|friday)/i,
  )?.[0] ||
  cleaned.match(/\b\d{1,2}\/\d{1,2}\/?\d{0,4}\b/)?.[0] ||
  "";

  const cityMatch = cleaned.match(
    /(?:move from|moving from|from)\s+([A-Za-z\s]+?)\s+to\s+([A-Za-z\s]+?)(?:\s+and|\s+which|\.|,)/i,
  );

  const fromCity = cityMatch?.[1]?.trim() || "";
  const toCity = cityMatch?.[2]?.trim() || "";

  const addressPair = cleaned.match(
  /(?:moving from|move from|from)\s+(.+?)\s+to\s+(.+?)(?:\.|\n|$)/i,
);

const pickupAddress =
  addressPair?.[1]?.trim() ||
  cleaned
    .match(
      /pickup address.*?(\d{2,6}.+?(?:court|ct|street|st|road|rd|drive|dr|avenue|ave|lane|ln).+?(?:\d{5})?)/i,
    )?.[1]
    ?.trim() ||
  "";

const dropoffAddress =
  addressPair?.[2]?.trim() ||
  cleaned
    .match(
      /drop off location address.*?(\d{2,6}.+?(?:run|court|ct|street|st|road|rd|drive|dr|avenue|ave|lane|ln).+?(?:\d{5})?)/i,
    )?.[1]
    ?.trim() ||
  "";

  const homeSize =
    cleaned.match(
      /(?:three-bedroom|3-bedroom|two-bedroom|2-bedroom|one-bedroom|1-bedroom|four-bedroom|4-bedroom)/i,
    )?.[0] || "";

 const pickupProperty = lower.includes("pickup location is")
  ? cleaned.match(/pickup location is .*?(apartment|ranch-style home|ranch home|house|townhome|condo|storage|office)/i)?.[1] || ""
  : lower.includes("apartment")
    ? "Apartment"
    : lower.includes("ranch")
      ? "Ranch Home"
      : lower.includes("townhome")
        ? "Townhome"
        : lower.includes("condo")
          ? "Condo"
          : lower.includes("storage")
            ? "Storage"
            : lower.includes("office")
              ? "Office"
              : lower.includes("house")
                ? "House"
                : "";

let dropoffProperty =
  cleaned.match(/destination is (?:a |an )?(ranch-style home|ranch home|apartment|house|townhome|condo|storage|office)/i)?.[1] ||
  cleaned.match(/dropoff.*?(ranch-style home|ranch home|apartment|house|townhome|condo|storage|office)/i)?.[1] ||
  "";

if (!dropoffProperty && lower.includes("ranch home")) {
  dropoffProperty = "Ranch Home";
}

 const accessDetails: string[] = [];

if (lower.includes("no stairs")) accessDetails.push("No stairs reported");
if (lower.includes("second-floor") || lower.includes("second floor")) {
  accessDetails.push("Second-floor access");
}
if (lower.includes("third-floor") || lower.includes("third floor")) {
  accessDetails.push("Third-floor access");
}
if (lower.includes("one flight")) accessDetails.push("One flight of stairs");
if (lower.includes("two flights")) accessDetails.push("Two flights of stairs");
if (lower.includes("no elevator")) {
  accessDetails.push("No elevator");
} else if (lower.includes("elevator")) {
  accessDetails.push("Elevator available");
}
if (lower.includes("long walk")) accessDetails.push("Long walk noted");

const stairs = accessDetails.join(". ");

  const itemKeywords = [
    "bed",
    "mattress",
    "dresser",
    "nightstand",
    "couch",
    "sofa",
    "sectional",
    "recliner",
    "dining table",
    "chairs",
    "desk",
    "tv",
    "tv stand",
    "deep freezer",
    "freezer",
    "refrigerator",
    "fridge",
    "washer",
    "dryer",
    "safe",
    "piano",
    "fish tank",
    "exercise equipment",
    "treadmill",
    "grill",
    "smoker",
    "tool chest",
    "boxes",
  ];

  const foundItems = itemKeywords.filter((item) => lower.includes(item));

 const leadSource =
  lower.includes("google reviews")
    ? "Google Reviews"
    : lower.includes("google")
      ? "Google"
      : lower.includes("truck")
        ? "Company Truck"
        : lower.includes("chatgpt") || lower.includes("chat gpt")
          ? "ChatGPT"
          : "";

  const moveType = fromCity && toCity ? "Local Move" : "";

  const missing: string[] = [];

  if (!phone) missing.push("Phone number");
  if (!email) missing.push("Verified email");
  if (!pickupAddress) missing.push("Exact pickup address");
  if (!dropoffAddress) missing.push("Exact dropoff address");
  if (!leadSource) missing.push("Lead source");
  if (!homeSize) missing.push("Bedroom count / home size");
  if (!stairs) missing.push("Stairs / elevator / access details");
if (!pickupProperty) missing.push("Pickup property type");
if (!dropoffProperty) missing.push("Dropoff property type");


  return {
    customerName,
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
  const detectedDetails = analyzeTranscript(transcript);

const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);



useEffect(() => {
  localStorage.setItem(
    "asap-call-history",
    JSON.stringify(callHistory)
  );
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

PICKUP PROPERTY:
${details.pickupProperty || "Not provided"}

DROPOFF PROPERTY:
${details.dropoffProperty || "Not provided"}

STAIRS / ACCESS:
${details.stairs || "Not provided"}

LEAD SOURCE:
${details.leadSource || "Not provided"}

MISSING INFORMATION:
${details.missing.length > 0 ? details.missing.join(", ") : "No major missing information detected"}

ITEMS TO MOVE:
${details.items || "Not provided"}

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
                ),
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
  <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
              <h3 className="font-semibold text-blue-300">🔎 Detected Information</h3>

              <div className="mt-3 grid gap-2 text-sm text-slate-200">
                <p><strong>Customer:</strong> {customerName || detectedDetails.customerName || "Not detected"}</p>
                <p><strong>Phone:</strong> {detectedDetails.phone || "Not detected"}</p>
                <p><strong>Email:</strong> {detectedDetails.email || "Not detected"}</p>
                <p><strong>Move Date:</strong> {detectedDetails.moveDate || "Not detected"}</p>
                <p><strong>Move Type:</strong> {detectedDetails.moveType || "Not detected"}</p>
                <p><strong>Home Size:</strong> {detectedDetails.homeSize || "Not detected"}</p>
                <p><strong>Items:</strong> {detectedDetails.items || "Not detected"}</p>
                <p><strong>Lead Source:</strong> {detectedDetails.leadSource || "Not detected"}</p>
              </div>
              </div>
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
              {notes ||
                "Paste a customer conversation and click Generate Notes."}
            </pre>

            <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
              <h3 className="font-semibold text-yellow-300">
                ⚠ Missing Information
              </h3>

              <div className="mt-3 grid gap-2 text-sm text-slate-200">
              {detectedDetails.missing.length === 0 ? (
                <p>✅ No major missing information detected.</p>
              ) : (
                detectedDetails.missing.map((item) => (
                  <label key={item} className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4" />
                    {item}
                  </label>
                ))
              )}
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
