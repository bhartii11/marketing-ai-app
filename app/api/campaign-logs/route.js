import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "../../../lib/supabaseServer";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      campaign_name = "",
      channel = "",
      recipients = "",
      content = "",
      status = "sent",
      opens = 0,
      clicks = 0,
      sent_at = new Date().toISOString(),
    } = body || {};

    if (!campaign_name || !channel || !recipients || !content) {
      return NextResponse.json({ error: "Missing required fields for campaign log." }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("campaign_logs")
      .insert([
        {
          campaign_name,
          channel,
          recipients,
          content,
          status,
          sent_at,
          opens,
          clicks,
        },
      ])
      .select("id, campaign_name, channel, status, sent_at, opens, clicks")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, log: data });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Failed to save campaign log." }, { status: 500 });
  }
}

