"use client";

import { useMemo, useState } from "react";
import ChatBox from "../components/ChatBox";
import SuggestionsPanel from "../components/SuggestionsPanel";
import NextBestActions from "../components/NextBestActions";
import OutputCard from "../components/OutputCard";

const DEFAULT_SUGGESTIONS = [
  "Run Hiring Campaign",
  "Promote Job Opening",
  "Build Employer Branding",
  "Target MuleSoft Developers",
];

const DEFAULT_ACTIONS = [
  "LinkedIn Post",
  "Email Campaign",
  "WhatsApp Outreach",
  "Naukri Job Post",
  "Ad Copy",
  "SMS Campaign",
];

const getId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const toActionResponseMap = (raw) => {
  if (!raw || typeof raw !== "object") return {};
  const mapped = raw.outputs && typeof raw.outputs === "object" ? { ...raw.outputs } : {};
  if (raw.linkedin && !mapped["LinkedIn Post"]) mapped["LinkedIn Post"] = raw.linkedin;
  if (raw.email && !mapped["Email Campaign"]) mapped["Email Campaign"] = raw.email;
  if (raw.whatsapp && !mapped["WhatsApp Outreach"]) mapped["WhatsApp Outreach"] = raw.whatsapp;
  return mapped;
};

export default function Home() {
  const [company, setCompany] = useState("");
  const [campaign, setCampaign] = useState("");
  const [website, setWebsite] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [description, setDescription] = useState("");

  const [chatMessages, setChatMessages] = useState([
    {
      id: getId(),
      role: "assistant",
      content:
        "Share your campaign brief here. I will suggest strategy options and the best channels to generate content.",
    },
  ]);

  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [selectedSuggestion, setSelectedSuggestion] = useState("");
  const [recommendedActions, setRecommendedActions] = useState(DEFAULT_ACTIONS);
  const [selectedActions, setSelectedActions] = useState([]);
  const [outputs, setOutputs] = useState({});

  const [askLoading, setAskLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [regeneratingAction, setRegeneratingAction] = useState("");
  const [error, setError] = useState("");

  const latestUserMessage = useMemo(() => {
    const msg = [...chatMessages].reverse().find((item) => item.role === "user");
    return msg?.content || description;
  }, [chatMessages, description]);

  const handleAttachmentChange = (e) => {
    const file = e.target.files?.[0];
    setAttachmentName(file?.name || "");
  };

  const handleAskAi = async (text) => {
    setError("");
    const userMsg = { id: getId(), role: "user", content: text };
    setChatMessages((prev) => [...prev, userMsg]);
    setDescription(text);
    setAskLoading(true);

    const payload = {
      company,
      campaign,
      website,
      description: text,
      attachmentName,
      step: "suggestions",
      chatMessages: [...chatMessages, userMsg],
    };

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || "Suggestion generation failed.");

      const nextSuggestions =
        Array.isArray(data?.suggestions) && data.suggestions.length ? data.suggestions : DEFAULT_SUGGESTIONS;
      const nextActions =
        Array.isArray(data?.recommendedActions) && data.recommendedActions.length
          ? data.recommendedActions
          : DEFAULT_ACTIONS;

      setSuggestions(nextSuggestions);
      setRecommendedActions(nextActions);
      setSelectedActions((prev) => Array.from(new Set([...prev, ...nextActions.slice(0, 2)])));
      setChatMessages((prev) => [
        ...prev,
        {
          id: getId(),
          role: "assistant",
          content:
            data?.aiMessage ||
            "Here are tailored suggestions and next best actions. Select channels and click Generate Content.",
        },
      ]);
    } catch (err) {
      setError(err.message || "Unable to ask AI right now.");
    } finally {
      setAskLoading(false);
    }
  };

  const handleToggleAction = (action) => {
    setSelectedActions((prev) =>
      prev.includes(action) ? prev.filter((item) => item !== action) : [...prev, action]
    );
  };

  const handleGenerateContent = async (actionsToGenerate = selectedActions) => {
    if (!actionsToGenerate.length) return;
    setGenerateLoading(true);
    setError("");

    const payload = {
      company,
      campaign,
      website,
      description: latestUserMessage,
      selectedActions: actionsToGenerate,
      step: "content",
      chatMessages,
      attachmentName,
    };

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || "Content generation failed.");

      const mapped = toActionResponseMap(data);
      const finalOutputs = Object.keys(mapped).length > 0 ? mapped : {};
      setOutputs((prev) => ({ ...prev, ...finalOutputs }));
    } catch (err) {
      setError(err.message || "Unable to generate content right now.");
    } finally {
      setGenerateLoading(false);
      setRegeneratingAction("");
    }
  };

  const renderedActions = Array.from(new Set([...recommendedActions, ...DEFAULT_ACTIONS]));

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-gradient-to-br from-slate-950 to-slate-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h1 className="text-2xl font-semibold sm:text-3xl">AI Marketing Workflow Studio</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            Describe your goal in chat, review AI suggestions, choose next best actions, and generate
            channel-wise content.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="space-y-5 xl:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Campaign Inputs</h2>
              <div className="mt-4 space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  Company Name
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Cloud Certitude"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Campaign Goal
                  <input
                    value={campaign}
                    onChange={(e) => setCampaign(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Hiring MuleSoft developers"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Website / Link
                  <input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="https://yourcompany.com"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  File Upload
                  <input
                    type="file"
                    onChange={handleAttachmentChange}
                    className="mt-1.5 block w-full cursor-pointer rounded-xl border border-slate-300 px-3 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    {attachmentName ? `Attached: ${attachmentName}` : "Upload supporting brief (optional)."}
                  </p>
                </label>
              </div>
            </div>

            <ChatBox messages={chatMessages} onSend={handleAskAi} loading={askLoading} />
          </div>

          <div className="space-y-5 xl:col-span-3">
            <SuggestionsPanel
              suggestions={suggestions}
              selectedSuggestion={selectedSuggestion}
              loading={askLoading}
              onSelect={(value) => {
                setSelectedSuggestion(value);
                setCampaign(value);
              }}
            />

            <NextBestActions
              actions={renderedActions}
              selectedActions={selectedActions}
              onToggle={handleToggleAction}
              onGenerate={() => handleGenerateContent()}
              loading={generateLoading}
            />

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-900">Generated Outputs</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {selectedActions.map((action) => (
                  <OutputCard
                    key={action}
                    title={action}
                    content={outputs[action] || ""}
                    regenerating={regeneratingAction === action}
                    onRegenerate={async () => {
                      setRegeneratingAction(action);
                      await handleGenerateContent([action]);
                    }}
                  />
                ))}
              </div>

              {selectedActions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                  Select one or more actions to render output cards.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
