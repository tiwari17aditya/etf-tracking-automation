import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  return handlePurge(request);
}

export async function POST(request: NextRequest) {
  return handlePurge(request);
}

async function handlePurge(request: NextRequest) {
  const startTime = Date.now();
  const configuredSecret = process.env.CRON_SECRET || 'smart_dip_cron_secure_secret_2026';

  // Security Gate
  const authHeader = request.headers.get('authorization');
  const querySecret = request.nextUrl.searchParams.get('secret');

  const isAuthorized =
    authHeader === `Bearer ${configuredSecret}` ||
    querySecret === configuredSecret;

  if (!isAuthorized) {
    return NextResponse.json(
      {
        error: 'Unauthorized. Valid CRON_SECRET authorization required.',
        endpoint: '/api/purge',
      },
      { status: 401 }
    );
  }

  const daysParam = request.nextUrl.searchParams.get('days');
  const retentionDays = daysParam ? Math.max(1, parseInt(daysParam, 10)) : 14;

  try {
    const purgeStats = db.purgeOldRecords(retentionDays);
    const latencyMs = Date.now() - startTime;

    // Log the purge event
    db.createAppLog({
      level: 'INFO',
      category: 'SYSTEM',
      message: `Vercel Scheduled Purge: Removed ${purgeStats.purgedAppLogs} app logs, ${purgeStats.purgedCronLogs} cron runs, ${purgeStats.purgedChatLogs} chat sessions`,
      details: `Retention policy: ${retentionDays} days. Expired signals: ${purgeStats.expiredSignals}.`,
      latencyMs,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      retentionDays,
      latencyMs,
      stats: purgeStats,
      message: `Log purge completed successfully on Vercel Serverless.`,
    });
  } catch (error: any) {
    console.error('Purge error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to complete log purge',
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
