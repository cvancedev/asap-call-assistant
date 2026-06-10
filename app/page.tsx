"use client";

import { useState } from "react";

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState("");

function generateNotes() {
  const lowerTranscript = transcript.toLowerCase();

  let projectType = "Local Move";

  if (lowerTranscript.includes("storage")) {
    projectType = "Storage Move";
  }

  setNotes(`
CLIENT

Name: [Extract Name]
Phone: [Extract Phone]
Email: [Extract Email]

PROJECT

Project Type: ${projectType}

JOB

Date: [Extract Date]

PICKUP

Address: [Extract Address]

DROPOFF

Address: [Extract Address]

MISSING INFORMATION

□ Unit Number
□ Stairs
□ Elevator
□ Long Walk
□ Lead Source
  `);
}

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold">
          ASAP Call Assistant
        </h1>

        <p className="mt-2 text-slate-400">
          Paste a transcript and generate Supermove helper notes.
        </p>

        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-slate-900 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">
              Transcript
            </h2>

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
          </div>

          <div className="bg-slate-900 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">
              Supermove Helper
            </h2>

            <pre className="whitespace-pre-wrap h-[500px] overflow-auto bg-slate-950 border border-slate-700 rounded-lg p-4">
              {notes || "Generated notes will appear here..."}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}