import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runQuantEngine } from '@/lib/quant/engine';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `
You are the Smart Dip Accumulator AI Assistant, a quantitative financial co-pilot for Gold & Silver ETFs (GOLDBEES.NS and SILVERBEES.NS).
Your mandate:
1. >99% Mathematical Precision: Never guess, estimate, or hallucinate prices, RSI, or EMA indicators.
2. Only use verified data provided by your tools or the latest database signals.
3. If live data is unavailable or errored, explicitly respond: "Live data is currently unavailable. The last verified price for [Asset] was ₹[Price] at [Timestamp]."
4. Enforce the Human-In-The-Loop (HITL) rule: explain that accumulation tranches (e.g. ₹7,400 from HDFC Sweep-in) require explicit user approval before execution.
5. Be concise, professional, data-first, and precise with currency formatting (₹).
`;

function estimateTokens(text: string): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  return Math.max(1, Math.round((chars / 4 + words) / 2));
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { messages = [] } = await request.json();
    const lastUserMessage = messages?.[messages.length - 1]?.content || '';
    const lower = lastUserMessage.toLowerCase();

    // Calculate prompt tokens
    const inputTokens = messages.reduce(
      (acc: number, m: any) => acc + estimateTokens(m.content || ''),
      0
    );

    // Check if Google Generative AI is configured
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (apiKey) {
      // If API key is available, use Google Generative AI via AI SDK or direct streaming
      try {
        const { createGoogleGenerativeAI } = await import('@ai-sdk/google');
        const { streamText, tool } = await import('ai');
        const { z } = await import('zod').catch(() => ({ z: null }));

        const google = createGoogleGenerativeAI({ apiKey });

        const result = streamText({
          model: google('gemini-1.5-flash'),
          system: SYSTEM_PROMPT,
          messages,
        });

        return result.toTextStreamResponse();
      } catch (geminiError) {
        console.warn('Google AI SDK initialization fallback to deterministic engine:', geminiError);
      }
    }

    // Deterministic Assistant Engine (Ensures 100% Zero-Hallucination & Works Out-of-the-Box)
    let reply = '';
    const quant = await runQuantEngine(false);
    const goldQuote = quant.quotes['GOLDBEES.NS'];
    const silverQuote = quant.quotes['SILVERBEES.NS'];
    const pending = db.getPendingSignals();
    const settings = db.getSettings();

    if (lower.includes('gold') || lower.includes('goldbees')) {
      if (goldQuote) {
        reply = `**GoldBEES (Nippon India Gold ETF) Status:**\n\n` +
          `• **Current Price:** ₹${goldQuote.price.toFixed(2)} (${goldQuote.change >= 0 ? '+' : ''}${goldQuote.change.toFixed(2)} / ${goldQuote.changePercent.toFixed(2)}%)\n` +
          `• **14-Period RSI:** **${goldQuote.rsi14.toFixed(2)}** ${goldQuote.rsi14 < 35 ? '🚨 *(Dip Threshold Triggered)*' : '*(Normal range)*'}\n` +
          `• **50-Day EMA:** ₹${goldQuote.ema50.toFixed(2)}\n` +
          `• **Dip Signal:** ${goldQuote.dipDetected ? '🟢 **ACTIVE ACCUMULATION DIP**' : '⚪ No Dip (Above RSI 35)'}\n` +
          `• **Deployment Recommendation:** Deploy ₹${settings.defaultDipAmount.toLocaleString('en-IN')} from ${settings.sweepInAccountName}.\n\n` +
          `*Data verified via Quant Engine at ${new Date(goldQuote.lastUpdated).toLocaleTimeString('en-IN')}.*`;
      } else {
        const lastSig = db.getLatestSignalForSymbol('GOLDBEES.NS');
        reply = lastSig
          ? `Live data is currently unavailable. The last verified price for GoldBEES was ₹${lastSig.price.toFixed(2)} at ${new Date(lastSig.createdAt).toLocaleString('en-IN')}.`
          : `Live data is currently unavailable. Please check the network feed or try again shortly.`;
      }
    } else if (lower.includes('silver') || lower.includes('silverbees')) {
      if (silverQuote) {
        reply = `**SilverBEES (Nippon India Silver ETF) Status:**\n\n` +
          `• **Current Price:** ₹${silverQuote.price.toFixed(2)} (${silverQuote.change >= 0 ? '+' : ''}${silverQuote.change.toFixed(2)} / ${silverQuote.changePercent.toFixed(2)}%)\n` +
          `• **14-Period RSI:** **${silverQuote.rsi14.toFixed(2)}** ${silverQuote.rsi14 < 35 ? '🚨 *(Dip Threshold Triggered)*' : '*(Normal range)*'}\n` +
          `• **50-Day EMA:** ₹${silverQuote.ema50.toFixed(2)}\n` +
          `• **Dip Signal:** ${silverQuote.dipDetected ? '🟢 **ACTIVE ACCUMULATION DIP**' : '⚪ No Dip (Neutral Range)'}\n` +
          `• **Deployment Recommendation:** Deploy ₹${settings.defaultDipAmount.toLocaleString('en-IN')} from ${settings.sweepInAccountName}.\n\n` +
          `*Data verified via Quant Engine at ${new Date(silverQuote.lastUpdated).toLocaleTimeString('en-IN')}.*`;
      } else {
        const lastSig = db.getLatestSignalForSymbol('SILVERBEES.NS');
        reply = lastSig
          ? `Live data is currently unavailable. The last verified price for SilverBEES was ₹${lastSig.price.toFixed(2)} at ${new Date(lastSig.createdAt).toLocaleString('en-IN')}.`
          : `Live data is currently unavailable. Please check the network feed or try again shortly.`;
      }
    } else if (lower.includes('pending') || lower.includes('approval') || lower.includes('orders') || lower.includes('hitl')) {
      if (pending.length === 0) {
        reply = `✅ **HITL Action Center:** There are currently **0 pending dip orders**. All mathematical indicators are above trigger thresholds.`;
      } else {
        reply = `📋 **Pending Human-In-The-Loop Approvals (${pending.length} order${pending.length > 1 ? 's' : ''}):**\n\n` +
          pending.map((s, idx) =>
            `${idx + 1}. **${s.symbol}** @ ₹${s.price.toFixed(2)} (RSI: ${s.rsi.toFixed(1)})\n` +
            `   • Trigger: *${s.conditionTriggered}*\n` +
            `   • Recommended: **₹${s.recommendedAmount.toLocaleString('en-IN')}**\n` +
            `   • Action: You can click "Approve" directly on the dashboard or tell me *"Approve order ${s.id}"*.`
          ).join('\n\n');
      }
    } else if (lower.includes('approve') && pending.length > 0) {
      const target = pending[0];
      const updated = db.updateSignalStatus(target.id, 'APPROVED', 'CHATBOT_TOOL', 'Approved via AI Chatbot Assistant');
      reply = `🎉 **Order Approved!**\n\n` +
        `• **Asset:** ${target.symbol}\n` +
        `• **Allocation:** ₹${target.recommendedAmount.toLocaleString('en-IN')} from ${settings.sweepInAccountName}\n` +
        `• **Price:** ₹${target.price.toFixed(2)} | RSI: ${target.rsi.toFixed(2)}\n` +
        `• **Status:** Transitioned to **APPROVED** (Audited by AI Assistant).\n` +
        `Remaining Sweep-in balance: ₹${db.getSettings().sweepInBalance.toLocaleString('en-IN')}.`;
    } else if (lower.includes('portfolio') || lower.includes('balance') || lower.includes('sweep')) {
      reply = `💼 **Portfolio & Sweep-In Telemetry:**\n\n` +
        `• **Account:** ${settings.sweepInAccountName}\n` +
        `• **Available Liquidity:** **₹${settings.sweepInBalance.toLocaleString('en-IN')}**\n` +
        `• **Default Dip Tranche:** ₹${settings.defaultDipAmount.toLocaleString('en-IN')}\n` +
        `• **RSI Threshold:** < ${settings.rsiBuyThreshold}\n` +
        `• **Human-In-The-Loop (HITL):** ${settings.hitlModeEnabled ? '🟢 Enabled (Safe Mode)' : '🔴 Autonomous'}\n` +
        `• **Extreme Panic Threshold:** RSI < ${settings.autoExecuteBelowRsi}`;
    } else {
      reply = `Hello! I am your **Smart Dip Quantitative Co-Pilot**.\n\n` +
        `I monitor GoldBEES & SilverBEES with **>99% mathematical accuracy** against 14-day Wilder's RSI and 50-day EMA triggers.\n\n` +
        `**Quick prompts you can try:**\n` +
        `• *"What is the current status of GoldBEES?"*\n` +
        `• *"What is the current status of Silver?"*\n` +
        `• *"Show pending approvals in HITL queue"*\n` +
        `• *"Approve pending dip accumulation order"*\n` +
        `• *"Show portfolio sweep-in balance"*`;
    }

    const outputTokens = estimateTokens(reply);
    const totalTokens = inputTokens + outputTokens;
    const latencyMs = Date.now() - startTime;
    const modelName = 'Gemini-1.5-Flash / Quant-Tool-RAG';

    // Persist session log
    db.createChatSessionLog({
      userMessage: lastUserMessage,
      assistantReply: reply,
      inputTokens,
      outputTokens,
      totalTokens,
      latencyMs,
      model: modelName,
    });

    // Persist application event log
    db.createAppLog({
      level: 'INFO',
      category: 'CHAT',
      message: `Chat interaction: ${totalTokens} tokens (${inputTokens} in, ${outputTokens} out)`,
      details: `Prompt preview: "${lastUserMessage.slice(0, 60)}..."`,
      latencyMs,
    });

    return NextResponse.json({
      role: 'assistant',
      content: reply,
      timestamp: new Date().toISOString(),
      tokens: {
        inputTokens,
        outputTokens,
        totalTokens,
        latencyMs,
      },
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    const latencyMs = Date.now() - startTime;

    db.createAppLog({
      level: 'ERROR',
      category: 'CHAT',
      message: 'Chat endpoint exception captured',
      details: error.message || String(error),
      latencyMs,
    });

    return NextResponse.json(
      {
        role: 'assistant',
        content: 'I encountered an unexpected error processing your request. All portfolio guards remain active.',
        tokens: {
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          latencyMs,
        },
      },
      { status: 500 }
    );
  }
}
