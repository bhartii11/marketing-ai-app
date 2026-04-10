"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleHelp } from "lucide-react";
import Image from "next/image";
import ChatBox from "../components/ChatBox";
import SuggestionsPanel from "../components/SuggestionsPanel";
import NextBestActions from "../components/NextBestActions";
import OutputCard from "../components/OutputCard";
import SendModal from "../components/SendModal";

const DEFAULT_ACTIONS = ["LinkedIn", "Email", "WhatsApp", "Instagram", "Blog", "SMS"];

const DEFAULT_MARKETING_PLAN = [
  {
    id: "step-1",
    title: "Step 1: Define Target Audience",
    description:
      "Identify ideal candidate persona, industry segments, and role seniority. Prioritize audience quality to improve conversion from impression to application.",
    channels: ["LinkedIn", "Email"],
  },
  {
    id: "step-2",
    title: "Step 2: Build Content Strategy",
    description:
      "Create channel-specific messaging pillars like salary transparency, growth path, and project exposure. Keep content concise and role-focused.",
    channels: ["LinkedIn", "Instagram", "Blog", "Email"],
  },
  {
    id: "step-3",
    title: "Step 3: Execute Outreach",
    description:
      "Run outbound and inbound outreach through targeted shortlists and warm leads. Use personalized communication and clear call-to-action.",
    channels: ["Email", "WhatsApp", "Naukri"],
  },
  {
    id: "step-4",
    title: "Step 4: Retarget and Optimize",
    description:
      "Retarget engaged users with reminder touchpoints and proof points. Iterate weekly using response trends and channel-level performance.",
    channels: ["LinkedIn", "Instagram", "SMS"],
  },
];

const getId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const deriveActionsFromPlanSteps = (steps, selectedIds) => {
  const selected = steps.filter((step) => selectedIds.includes(step.id));
  return Array.from(new Set(selected.flatMap((step) => step.channels || [])));
};

const toActionResponseMap = (raw) => {
  if (!raw || typeof raw !== "object") return {};
  const mapped = raw.outputs && typeof raw.outputs === "object" ? { ...raw.outputs } : {};
  return mapped;
};

function HelpIcon({ text }) {
  return (
    <span className="group relative ml-1 inline-flex align-middle">
      <CircleHelp size={14} className="text-slate-400" />
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-56 -translate-x-1/2 rounded-md bg-slate-900 px-2.5 py-2 text-xs font-normal text-white shadow-lg group-hover:block">
        {text}
      </span>
    </span>
  );
}

export default function Home() {
  const [company, setCompany] = useState("Cloud Certitude");
  const [campaign, setCampaign] = useState("Hiring experienced MuleSoft developers");
  const [website, setWebsite] = useState("https://www.cloudcertitude.com");
  const [attachmentName, setAttachmentName] = useState("");
  const [description, setDescription] = useState(
    "We want to hire experienced MuleSoft developers in India within 30 days. Focus on strong reach and quality applicants."
  );

  const [chatMessages, setChatMessages] = useState([
    {
      id: getId(),
      role: "assistant",
      content:
        "Share your campaign brief here. I will build a detailed marketing plan, suggest channels, and generate content.",
    },
  ]);

  const [marketingPlan, setMarketingPlan] = useState(DEFAULT_MARKETING_PLAN);
  const [selectedStepIds, setSelectedStepIds] = useState([]);
  const [recommendedActions, setRecommendedActions] = useState([]);
  const [selectedActions, setSelectedActions] = useState([]);
  const [outputs, setOutputs] = useState({});

  const [askLoading, setAskLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [regeneratingAction, setRegeneratingAction] = useState("");
  const [error, setError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendTarget, setSendTarget] = useState({ channel: "", content: "" });
  const [trackingSummary, setTrackingSummary] = useState({
    totals: { sent: 0, opens: 0, clicks: 0, open_rate: 0, click_rate: 0 },
    byChannel: [],
  });
  const [trackingLoading, setTrackingLoading] = useState(false);

  const latestUserMessage = useMemo(() => {
    const msg = [...chatMessages].reverse().find((item) => item.role === "user");
    return msg?.content || description;
  }, [chatMessages, description]);

  const dynamicActions = useMemo(
    () => deriveActionsFromPlanSteps(marketingPlan, selectedStepIds),
    [marketingPlan, selectedStepIds]
  );

  useEffect(() => {
    setSelectedActions((prev) => prev.filter((item) => dynamicActions.includes(item)));
  }, [dynamicActions]);

  const fetchTrackingSummary = async () => {
    setTrackingLoading(true);
    try {
      const res = await fetch("/api/tracking-summary");
      const data = await res.json();
      if (res.ok && !data?.error) {
        setTrackingSummary(data);
      }
    } finally {
      setTrackingLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingSummary();
  }, []);

  const handleAttachmentChange = (e) => {
    const file = e.target.files?.[0];
    setAttachmentName(file?.name || "");
  };

  const handleAskAi = async (text) => {
    setError("");
    setSendSuccess("");
    const userMsg = { id: getId(), role: "user", content: text };
    setChatMessages((prev) => [...prev, userMsg]);
    setDescription(text);
    setAskLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          campaign,
          website,
          description: text,
          attachmentName,
          step: "suggestions",
          chatMessages: [...chatMessages, userMsg],
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || "Plan generation failed.");

      const nextPlan = Array.isArray(data?.marketingPlan) && data.marketingPlan.length
        ? data.marketingPlan
        : DEFAULT_MARKETING_PLAN;
      setMarketingPlan(nextPlan);

      const initialSteps = nextPlan.slice(0, 2).map((item) => item.id);
      setSelectedStepIds(initialSteps);

      const suggested = Array.isArray(data?.recommendedActions) ? data.recommendedActions : [];
      setRecommendedActions(suggested);

      setChatMessages((prev) => [
        ...prev,
        {
          id: getId(),
          role: "assistant",
          content:
            data?.aiMessage ||
            "Marketing Plan is ready. Select steps, pick channels in Next Best Actions, then generate content.",
        },
      ]);
    } catch (err) {
      setError(err.message || "Unable to ask AI right now.");
    } finally {
      setAskLoading(false);
    }
  };

  const handleToggleStep = (stepId) => {
    setSelectedStepIds((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    );
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
    setSendSuccess("");

    const selectedPlanSteps = marketingPlan
      .filter((step) => selectedStepIds.includes(step.id))
      .map((step) => `${step.title}: ${step.description}`);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          campaign,
          website,
          description: latestUserMessage,
          selectedPlanSteps,
          selectedActions: actionsToGenerate,
          step: "content",
          chatMessages,
          attachmentName,
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || "Content generation failed.");

      const mapped = toActionResponseMap(data);
      setOutputs((prev) => ({ ...prev, ...mapped }));
    } catch (err) {
      setError(err.message || "Unable to generate content right now.");
    } finally {
      setGenerateLoading(false);
      setRegeneratingAction("");
    }
  };

  const renderedActions = dynamicActions.length ? dynamicActions : recommendedActions.length ? recommendedActions : DEFAULT_ACTIONS;

  const handleOpenSendModal = (channel) => {
    setSendTarget({ channel, content: outputs[channel] || "" });
    setSendModalOpen(true);
    setSendSuccess("");
  };

  const handleSubmitSend = async ({ campaignName, channel, recipients, content }) => {
    setSendLoading(true);
    setError("");
    setSendSuccess("");
    try {
      const res = await fetch("/api/campaign-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_name: campaignName || campaign,
          channel,
          recipients,
          content,
          status: "sent",
          sent_at: new Date().toISOString(),
          opens: 0,
          clicks: 0,
          // tracking-ready placeholders
          tracking: { opens_enabled: false, clicks_enabled: false },
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || "Failed to save send log.");
      setSendSuccess(`Dummy send logged for ${channel}.`);
      setSendModalOpen(false);
      await fetchTrackingSummary();
    } catch (err) {
      setError(err.message || "Failed to save send log.");
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-gradient-to-br from-slate-950 to-slate-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/20 bg-white/95 p-1.5">
              <Image
                src="/ai-workflow-logo.png"
                alt="AI Marketing Workflow Studio logo"
                width={240}
                height={80}
                className="h-12 w-auto object-contain sm:h-14"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold sm:text-2xl">AI Marketing Workflow Studio</h1>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Plan · Create · Publish · Grow</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="space-y-5 xl:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Campaign Inputs</h2>
              <div className="mt-4 space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="inline-flex items-center">
                    Company Name
                    <HelpIcon text="Enter your company or brand name as it should appear in generated content." />
                  </span>
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Cloud Certitude"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  <span className="inline-flex items-center">
                    Campaign Goal
                    <HelpIcon text="Describe the outcome you want, like hiring, lead generation, or product awareness." />
                  </span>
                  <input
                    value={campaign}
                    onChange={(e) => setCampaign(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Hiring MuleSoft developers"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  <span className="inline-flex items-center">
                    Website / Link
                    <HelpIcon text="Add your website, job post, or landing page URL for better context." />
                  </span>
                  <input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="https://yourcompany.com"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  <span className="inline-flex items-center">
                    File Upload
                    <HelpIcon text="Upload an optional brief, JD, or supporting document to guide the AI output." />
                  </span>
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
              marketingPlan={marketingPlan}
              selectedStepIds={selectedStepIds}
              onToggleStep={handleToggleStep}
              loading={askLoading}
            />

            <NextBestActions
              actions={renderedActions}
              selectedActions={selectedActions}
              onToggle={handleToggleAction}
              onGenerate={() => handleGenerateContent()}
              loading={generateLoading}
            />

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            ) : null}
            {sendSuccess ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {sendSuccess}
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
                    onSend={() => handleOpenSendModal(action)}
                  />
                ))}
              </div>

              {selectedActions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                  Select one or more actions to render output cards.
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Tracking Dashboard (Dummy)</h3>
                <button
                  onClick={fetchTrackingSummary}
                  className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Refresh
                </button>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Data comes from Supabase `campaign_logs` and is ready for future open/click tracking.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Sent</p>
                  <p className="text-lg font-semibold text-slate-900">{trackingSummary.totals.sent}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Opens</p>
                  <p className="text-lg font-semibold text-slate-900">{trackingSummary.totals.opens}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Clicks</p>
                  <p className="text-lg font-semibold text-slate-900">{trackingSummary.totals.clicks}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Open Rate</p>
                  <p className="text-lg font-semibold text-slate-900">{trackingSummary.totals.open_rate}%</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Click Rate</p>
                  <p className="text-lg font-semibold text-slate-900">{trackingSummary.totals.click_rate}%</p>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="px-2 py-2 font-medium">Channel</th>
                      <th className="px-2 py-2 font-medium">Sent</th>
                      <th className="px-2 py-2 font-medium">Opens</th>
                      <th className="px-2 py-2 font-medium">Clicks</th>
                      <th className="px-2 py-2 font-medium">Open %</th>
                      <th className="px-2 py-2 font-medium">Click %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackingSummary.byChannel.map((item) => (
                      <tr key={item.channel} className="border-b border-slate-100 text-slate-700">
                        <td className="px-2 py-2">{item.channel}</td>
                        <td className="px-2 py-2">{item.sent}</td>
                        <td className="px-2 py-2">{item.opens}</td>
                        <td className="px-2 py-2">{item.clicks}</td>
                        <td className="px-2 py-2">{item.open_rate}%</td>
                        <td className="px-2 py-2">{item.click_rate}%</td>
                      </tr>
                    ))}
                    {!trackingLoading && trackingSummary.byChannel.length === 0 ? (
                      <tr>
                        <td className="px-2 py-3 text-slate-500" colSpan={6}>
                          No tracking rows yet. Click Send on any output to create one.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SendModal
        open={sendModalOpen}
        channel={sendTarget.channel}
        content={sendTarget.content}
        campaignName={campaign}
        sending={sendLoading}
        onClose={() => setSendModalOpen(false)}
        onSubmit={handleSubmitSend}
      />
    </main>
  );
}
