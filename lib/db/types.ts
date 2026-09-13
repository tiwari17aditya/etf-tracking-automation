export type SignalStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'EXECUTED'
  | 'REJECTED'
  | 'EXPIRED';

export interface Signal {
  id: string;
  symbol: string; // 'GOLDBEES.NS' | 'SILVERBEES.NS'
  price: number;
  rsi: number;
  ema50: number;
  dipDetected: boolean;
  conditionTriggered: string;
  recommendedAmount: number; // ₹7,400 default
  status: SignalStatus;
  alertSent: boolean;
  alertSentAt: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  executedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CronRunLog {
  id: string;
  status: 'SUCCESS' | 'FAILED' | 'NO_CONTENT';
  symbolsChecked: string;
  signalsFound: number;
  executionTimeMs: number;
  layer1Status: 'HEALTHY' | 'DEGRADED' | 'FAILED';
  layer2Status: 'HEALTHY' | 'DEGRADED' | 'FAILED';
  layer3Status: 'HEALTHY' | 'DEGRADED' | 'FAILED';
  errorMessage: string | null;
  createdAt: string;
}

export interface PortfolioSetting {
  id: string;
  sweepInAccountName: string;
  sweepInBalance: number;
  defaultDipAmount: number;
  rsiBuyThreshold: number;
  hitlModeEnabled: boolean;
  autoExecuteBelowRsi: number;
  emailNotifications: boolean;
  recipientEmail: string;
  updatedAt: string;
}

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high52: number;
  low52: number;
  rsi14: number;
  ema50: number;
  volume: number;
  dipDetected: boolean;
  dipReason: string | null;
  lastUpdated: string;
  history: Array<{
    date: string;
    price: number;
    rsi: number;
  }>;
}
