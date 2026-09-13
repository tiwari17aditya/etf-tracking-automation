import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SignalStatus } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const signalId = request.nextUrl.searchParams.get('signalId');
  const action = request.nextUrl.searchParams.get('action')?.toUpperCase();

  if (!signalId || !action) {
    return NextResponse.redirect(new URL('/?error=invalid_params', request.url));
  }

  const signal = db.getSignalById(signalId);
  if (!signal) {
    return NextResponse.redirect(new URL('/?error=signal_not_found', request.url));
  }

  let newStatus: SignalStatus = 'APPROVED';
  if (action === 'REJECT') newStatus = 'REJECTED';
  if (action === 'EXECUTE') newStatus = 'EXECUTED';

  db.updateSignalStatus(signalId, newStatus, 'EMAIL_ACTION', `Action applied via one-click email link: ${action}`);

  return NextResponse.redirect(
    new URL(`/?action_success=true&signal=${signal.symbol}&status=${newStatus}`, request.url)
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signalId, action, amount, approvedBy = 'UI_DASHBOARD', notes } = body;

    if (!signalId || !action) {
      return NextResponse.json(
        { error: 'Missing signalId or action parameter' },
        { status: 400 }
      );
    }

    const signal = db.getSignalById(signalId);
    if (!signal) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 });
    }

    if (amount && typeof amount === 'number' && amount > 0) {
      db.updateSignalAllocation(signalId, amount);
    }

    let targetStatus: SignalStatus = 'APPROVED';
    if (action === 'REJECT') targetStatus = 'REJECTED';
    if (action === 'EXECUTE') targetStatus = 'EXECUTED';
    if (action === 'PENDING') targetStatus = 'PENDING_APPROVAL';

    const updated = db.updateSignalStatus(
      signalId,
      targetStatus,
      approvedBy,
      notes || `Action ${action} authorized via ${approvedBy}`
    );

    const settings = db.getSettings();

    return NextResponse.json({
      success: true,
      signal: updated,
      remainingSweepInBalance: settings.sweepInBalance,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process HITL action', details: error.message },
      { status: 500 }
    );
  }
}
