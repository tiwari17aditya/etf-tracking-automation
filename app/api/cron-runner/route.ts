import { NextRequest, NextResponse } from 'next/server';
import { runQuantEngine } from '@/lib/quant/engine';
import { db } from '@/lib/db';
import { sendDipAlertEmail } from '@/lib/email/service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow sufficient serverless execution budget

export async function GET(request: NextRequest) {
  return handleCron(request);
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}

async function handleCron(request: NextRequest) {
  const startTime = Date.now();
  const configuredSecret = process.env.CRON_SECRET || 'smart_dip_cron_secure_secret_2026';

  // 1. Security Gate: Verify CRON_SECRET header or token
  const authHeader = request.headers.get('authorization');
  const querySecret = request.nextUrl.searchParams.get('secret');
  const simulateParam = request.nextUrl.searchParams.get('simulate') === 'true';

  const isAuthorized =
    authHeader === `Bearer ${configuredSecret}` ||
    querySecret === configuredSecret;

  if (!isAuthorized) {
    return NextResponse.json(
      {
        error: 'Unauthorized. Valid CRON_SECRET bearer token required.',
        mandate: 'Security Gate Enforcement',
      },
      { status: 401 }
    );
  }

  // 2. Layer 1 Ingestion & Quant Computation
  try {
    const quantResult = await runQuantEngine(simulateParam);

    if (quantResult.status === 'ERROR') {
      // Layer 1: Exits cleanly without writing false data to DB
      db.createCronLog({
        status: 'FAILED',
        symbolsChecked: 'GOLDBEES.NS,SILVERBEES.NS',
        signalsFound: 0,
        executionTimeMs: Date.now() - startTime,
        layer1Status: 'FAILED',
        layer2Status: 'HEALTHY',
        layer3Status: 'HEALTHY',
        errorMessage: quantResult.error || 'Data provider throttled or returned empty frame.',
      });

      return NextResponse.json(
        {
          status: 'NO_CONTENT',
          message: 'Upstream data unavailable. Clean exit without DB corruption.',
          latencyMs: Date.now() - startTime,
        },
        { status: 204 }
      );
    }

    const settings = db.getSettings();
    const createdSignals = [];

    // 3. Process Signals
    for (const [symbol, quote] of Object.entries(quantResult.quotes)) {
      if (quote.dipDetected) {
        const signal = db.createSignal({
          symbol: quote.symbol,
          price: quote.price,
          rsi: quote.rsi14,
          ema50: quote.ema50,
          dipDetected: true,
          conditionTriggered: quote.dipReason || `RSI: ${quote.rsi14.toFixed(1)} < ${settings.rsiBuyThreshold}`,
          recommendedAmount: settings.defaultDipAmount,
          status: 'PENDING_APPROVAL',
          alertSent: false,
          alertSentAt: null,
          approvedAt: null,
          approvedBy: null,
          executedAt: null,
          notes: `Automated detection during market scan. Human-in-the-loop approval required.`,
        });

        // 4. Send Email Alert with Promise Await (Anti-TCP Drop)
        if (settings.emailNotifications) {
          const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            request.nextUrl.origin ||
            'http://localhost:3000';

          const mailRes = await sendDipAlertEmail({
            signal,
            recipientEmail: settings.recipientEmail,
            appUrl,
          });

          if (mailRes.success) {
            signal.alertSent = true;
            signal.alertSentAt = new Date().toISOString();
          }
        }

        createdSignals.push(signal);
      }
    }

    // 5. Log Telemetry
    const log = db.createCronLog({
      status: 'SUCCESS',
      symbolsChecked: Object.keys(quantResult.quotes).join(','),
      signalsFound: createdSignals.length,
      executionTimeMs: Date.now() - startTime,
      layer1Status: quantResult.source === 'PYTHON_ENGINE' ? 'HEALTHY' : 'DEGRADED',
      layer2Status: 'HEALTHY',
      layer3Status: 'HEALTHY',
      errorMessage: null,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
      cronLogId: log.id,
      signalsGenerated: createdSignals.length,
      signals: createdSignals,
      quotes: quantResult.quotes,
      engine: quantResult.source,
    });
  } catch (err: any) {
    console.error('Unhandled Cron Pipeline Error:', err);

    db.createCronLog({
      status: 'FAILED',
      symbolsChecked: 'GOLDBEES.NS,SILVERBEES.NS',
      signalsFound: 0,
      executionTimeMs: Date.now() - startTime,
      layer1Status: 'FAILED',
      layer2Status: 'DEGRADED',
      layer3Status: 'HEALTHY',
      errorMessage: err.message || String(err),
    });

    return NextResponse.json(
      {
        error: 'Pipeline exception occurred. Layer 1 safely captured without invalid writes.',
        details: err.message,
      },
      { status: 502 }
    );
  }
}
