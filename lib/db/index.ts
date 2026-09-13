import fs from 'fs';
import path from 'path';
import { Signal, CronRunLog, PortfolioSetting, SignalStatus, AppLog, ChatSessionLog } from './types';

interface StoreData {
  signals: Signal[];
  cronLogs: CronRunLog[];
  settings: PortfolioSetting;
  appLogs: AppLog[];
  chatLogs: ChatSessionLog[];
}

function getStoragePath(): { dir: string; file: string } {
  // Check if running on Vercel / serverless (read-only root)
  const localDataDir = path.join(process.cwd(), 'data');
  const tmpDataDir = path.join('/tmp', 'smart_dip_data');

  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return { dir: tmpDataDir, file: path.join(tmpDataDir, 'store.json') };
  }

  return { dir: localDataDir, file: path.join(localDataDir, 'store.json') };
}

let memoryStore: StoreData | null = null;

const DEFAULT_SETTINGS: PortfolioSetting = {
  id: 'default',
  sweepInAccountName: 'HDFC Sweep-in Account',
  sweepInBalance: 85000,
  defaultDipAmount: 7400,
  rsiBuyThreshold: 35.0,
  hitlModeEnabled: true,
  autoExecuteBelowRsi: 25.0,
  emailNotifications: true,
  recipientEmail: process.env.ALERT_RECIPIENT_EMAIL || 'investor@example.com',
  updatedAt: new Date().toISOString(),
};

const SEED_SIGNALS: Signal[] = [
  {
    id: 'sig-gold-001',
    symbol: 'GOLDBEES.NS',
    price: 74.20,
    rsi: 31.8,
    ema50: 76.50,
    dipDetected: true,
    conditionTriggered: 'RSI < 35 (31.8) & Below 50-EMA (76.50)',
    recommendedAmount: 7400,
    status: 'PENDING_APPROVAL',
    alertSent: true,
    alertSentAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    approvedAt: null,
    approvedBy: null,
    executedAt: null,
    notes: 'Dip detected during market correction. 14-day RSI in oversold territory.',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'sig-silver-002',
    symbol: 'SILVERBEES.NS',
    price: 89.40,
    rsi: 33.2,
    ema50: 92.10,
    dipDetected: true,
    conditionTriggered: 'RSI < 35 (33.2) & Near Support Band',
    recommendedAmount: 7400,
    status: 'APPROVED',
    alertSent: true,
    alertSentAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    approvedBy: 'UI_DASHBOARD',
    executedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    notes: 'Approved via HITL Action Center by Investor. Deployed from HDFC Sweep-in.',
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
  },
  {
    id: 'sig-gold-003',
    symbol: 'GOLDBEES.NS',
    price: 72.85,
    rsi: 28.4,
    ema50: 75.80,
    dipDetected: true,
    conditionTriggered: 'Extreme Dip: RSI < 30 (28.4)',
    recommendedAmount: 14800,
    status: 'EXECUTED',
    alertSent: true,
    alertSentAt: new Date(Date.now() - 86400 * 1000 * 3).toISOString(),
    approvedAt: new Date(Date.now() - 86400 * 1000 * 3 + 60000).toISOString(),
    approvedBy: 'EMAIL_ACTION',
    executedAt: new Date(Date.now() - 86400 * 1000 * 3 + 120000).toISOString(),
    notes: 'Double tranche accumulated on geopolitical dip.',
    createdAt: new Date(Date.now() - 86400 * 1000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400 * 1000 * 3).toISOString(),
  },
  {
    id: 'sig-silver-004',
    symbol: 'SILVERBEES.NS',
    price: 94.60,
    rsi: 34.9,
    ema50: 95.00,
    dipDetected: true,
    conditionTriggered: 'RSI < 35 (34.9) Threshold Breach',
    recommendedAmount: 7400,
    status: 'REJECTED',
    alertSent: true,
    alertSentAt: new Date(Date.now() - 86400 * 1000 * 7).toISOString(),
    approvedAt: null,
    approvedBy: 'UI_DASHBOARD',
    executedAt: null,
    notes: 'Skipped by user due to impending US Fed FOMC meeting.',
    createdAt: new Date(Date.now() - 86400 * 1000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400 * 1000 * 7).toISOString(),
  },
];

const SEED_LOGS: CronRunLog[] = [
  {
    id: 'cron-log-01',
    status: 'SUCCESS',
    symbolsChecked: 'GOLDBEES.NS,SILVERBEES.NS',
    signalsFound: 1,
    executionTimeMs: 412,
    layer1Status: 'HEALTHY',
    layer2Status: 'HEALTHY',
    layer3Status: 'HEALTHY',
    errorMessage: null,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'cron-log-02',
    status: 'SUCCESS',
    symbolsChecked: 'GOLDBEES.NS,SILVERBEES.NS',
    signalsFound: 0,
    executionTimeMs: 388,
    layer1Status: 'HEALTHY',
    layer2Status: 'HEALTHY',
    layer3Status: 'HEALTHY',
    errorMessage: null,
    createdAt: new Date(Date.now() - 105 * 60 * 1000).toISOString(),
  },
  {
    id: 'cron-log-03',
    status: 'SUCCESS',
    symbolsChecked: 'GOLDBEES.NS,SILVERBEES.NS',
    signalsFound: 1,
    executionTimeMs: 429,
    layer1Status: 'HEALTHY',
    layer2Status: 'HEALTHY',
    layer3Status: 'HEALTHY',
    errorMessage: null,
    createdAt: new Date(Date.now() - 165 * 60 * 1000).toISOString(),
  },
];

const SEED_APP_LOGS: AppLog[] = [
  {
    id: 'app-log-01',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    level: 'SUCCESS',
    category: 'QUANT',
    message: 'Quantitative indicators calculated for GOLDBEES & SILVERBEES',
    details: 'Wilder RSI: 31.8, 50-EMA: ₹76.50. Math precision >99.2%.',
    latencyMs: 412,
  },
  {
    id: 'app-log-02',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    level: 'INFO',
    category: 'CRON',
    message: 'Scheduled Vercel Cron triggered: 0 4-10 * * 1-5',
    details: 'Security gate verified. Bearer token matched CRON_SECRET.',
    latencyMs: 388,
  },
  {
    id: 'app-log-03',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    level: 'WARN',
    category: 'HITL',
    message: 'Dip signal pending human authorization: GOLDBEES.NS',
    details: 'Tranche recommendation: ₹7,400 from HDFC Sweep-in.',
    latencyMs: null,
  },
  {
    id: 'app-log-04',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    level: 'SUCCESS',
    category: 'HITL',
    message: 'Order approved by investor via UI Dashboard',
    details: 'Allocated ₹7,400. Deducted from available sweep-in balance.',
    latencyMs: 145,
  },
];

const SEED_CHAT_LOGS: ChatSessionLog[] = [
  {
    id: 'chat-log-01',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    userMessage: 'What is the current status of GoldBEES?',
    assistantReply: 'GoldBEES is at ₹125.12. 14-period RSI is 47.93. 50-Day EMA is ₹124.56. Normal accumulation range.',
    inputTokens: 18,
    outputTokens: 42,
    totalTokens: 60,
    latencyMs: 340,
    model: 'Gemini-1.5-Flash / Quant-Tool-RAG',
  },
  {
    id: 'chat-log-02',
    timestamp: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
    userMessage: 'Show pending approvals in HITL queue',
    assistantReply: 'Pending Human-In-The-Loop Approvals: 1 order. GoldBEES @ ₹74.20 (RSI: 31.8). Allocation: ₹7,400.',
    inputTokens: 14,
    outputTokens: 38,
    totalTokens: 52,
    latencyMs: 290,
    model: 'Gemini-1.5-Flash / Quant-Tool-RAG',
  },
];

function ensureStore(): StoreData {
  if (memoryStore) {
    return memoryStore;
  }

  const { dir, file } = getStoragePath();

  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ dir, { recursive: true });
    }
    if (!fs.existsSync(/*turbopackIgnore: true*/ file)) {
      // Check if seed file exists in project data dir
      const projectSeed = path.join(process.cwd(), 'data', 'store.json');
      let initial: StoreData;
      if (fs.existsSync(projectSeed)) {
        initial = JSON.parse(fs.readFileSync(projectSeed, 'utf-8'));
        if (!initial.appLogs) initial.appLogs = SEED_APP_LOGS;
        if (!initial.chatLogs) initial.chatLogs = SEED_CHAT_LOGS;
      } else {
        initial = {
          signals: SEED_SIGNALS,
          cronLogs: SEED_LOGS,
          settings: DEFAULT_SETTINGS,
          appLogs: SEED_APP_LOGS,
          chatLogs: SEED_CHAT_LOGS,
        };
      }
      try {
        fs.writeFileSync(/*turbopackIgnore: true*/ file, JSON.stringify(initial, null, 2), 'utf-8');
      } catch (writeErr) {
        console.warn('Could not write to disk storage, using in-memory store:', writeErr);
      }
      memoryStore = initial;
      return initial;
    }
    const raw = fs.readFileSync(/*turbopackIgnore: true*/ file, 'utf-8');
    memoryStore = JSON.parse(raw) as StoreData;
    return memoryStore;
  } catch (error) {
    console.error('Error reading data store, falling back to memory store:', error);
    const fallback: StoreData = {
      signals: SEED_SIGNALS,
      cronLogs: SEED_LOGS,
      settings: DEFAULT_SETTINGS,
      appLogs: SEED_APP_LOGS,
      chatLogs: SEED_CHAT_LOGS,
    };
    memoryStore = fallback;
    return fallback;
  }
}

function saveStore(data: StoreData): void {
  memoryStore = data;
  const { dir, file } = getStoragePath();

  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ dir, { recursive: true });
    }
    fs.writeFileSync(/*turbopackIgnore: true*/ file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.warn('Serverless storage write notice (persisting in memory):', error);
  }
}

export const db = {
  getSignals(): Signal[] {
    const store = ensureStore();
    return store.signals.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getSignalById(id: string): Signal | undefined {
    const store = ensureStore();
    return store.signals.find((s) => s.id === id);
  },

  getLatestSignalForSymbol(symbol: string): Signal | undefined {
    const store = ensureStore();
    return store.signals
      .filter((s) => s.symbol.toUpperCase() === symbol.toUpperCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  },

  getPendingSignals(): Signal[] {
    const store = ensureStore();
    return store.signals
      .filter((s) => s.status === 'PENDING_APPROVAL')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createSignal(signalData: Omit<Signal, 'id' | 'createdAt' | 'updatedAt'>): Signal {
    const store = ensureStore();
    const now = new Date().toISOString();
    const newSignal: Signal = {
      ...signalData,
      id: `sig-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    store.signals.unshift(newSignal);
    saveStore(store);
    return newSignal;
  },

  updateSignalStatus(
    id: string,
    status: SignalStatus,
    approvedBy: string = 'UI_DASHBOARD',
    notes?: string
  ): Signal | null {
    const store = ensureStore();
    const index = store.signals.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const current = store.signals[index];
    const now = new Date().toISOString();

    const updated: Signal = {
      ...current,
      status,
      updatedAt: now,
      notes: notes || current.notes,
    };

    if (status === 'APPROVED' || status === 'EXECUTED') {
      updated.approvedAt = updated.approvedAt || now;
      updated.approvedBy = approvedBy;
      if (status === 'EXECUTED') {
        updated.executedAt = now;
        // Deduct sweep-in balance
        if (store.settings.sweepInBalance >= current.recommendedAmount) {
          store.settings.sweepInBalance -= current.recommendedAmount;
        }
      }
    }

    store.signals[index] = updated;
    saveStore(store);
    return updated;
  },

  updateSignalAllocation(id: string, amount: number): Signal | null {
    const store = ensureStore();
    const index = store.signals.findIndex((s) => s.id === id);
    if (index === -1) return null;

    store.signals[index].recommendedAmount = amount;
    store.signals[index].updatedAt = new Date().toISOString();
    saveStore(store);
    return store.signals[index];
  },

  getCronLogs(limit: number = 20): CronRunLog[] {
    const store = ensureStore();
    return store.cronLogs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  createCronLog(logData: Omit<CronRunLog, 'id' | 'createdAt'>): CronRunLog {
    const store = ensureStore();
    const newLog: CronRunLog = {
      ...logData,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    store.cronLogs.unshift(newLog);
    // Keep max 100 logs
    if (store.cronLogs.length > 100) {
      store.cronLogs = store.cronLogs.slice(0, 100);
    }
    saveStore(store);
    return newLog;
  },

  getSettings(): PortfolioSetting {
    const store = ensureStore();
    return store.settings;
  },

  updateSettings(partial: Partial<PortfolioSetting>): PortfolioSetting {
    const store = ensureStore();
    store.settings = {
      ...store.settings,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    saveStore(store);
    return store.settings;
  },

  createAppLog(log: Omit<AppLog, 'id' | 'timestamp'>): AppLog {
    const store = ensureStore();
    if (!store.appLogs) store.appLogs = [];
    const newLog: AppLog = {
      ...log,
      id: `applog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    store.appLogs.unshift(newLog);
    if (store.appLogs.length > 200) {
      store.appLogs = store.appLogs.slice(0, 200);
    }
    saveStore(store);
    return newLog;
  },

  getAppLogs(limit: number = 50, level?: string, category?: string): AppLog[] {
    const store = ensureStore();
    let logs = store.appLogs || [];
    if (level && level !== 'ALL') {
      logs = logs.filter((l) => l.level === level);
    }
    if (category && category !== 'ALL') {
      logs = logs.filter((l) => l.category === category);
    }
    return logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  },

  createChatSessionLog(log: Omit<ChatSessionLog, 'id' | 'timestamp'>): ChatSessionLog {
    const store = ensureStore();
    if (!store.chatLogs) store.chatLogs = [];
    const newLog: ChatSessionLog = {
      ...log,
      id: `chatlog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    store.chatLogs.unshift(newLog);
    if (store.chatLogs.length > 100) {
      store.chatLogs = store.chatLogs.slice(0, 100);
    }
    saveStore(store);
    return newLog;
  },

  getChatSessionLogs(limit: number = 50): ChatSessionLog[] {
    const store = ensureStore();
    return (store.chatLogs || [])
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  },

  purgeOldRecords(retentionDays: number = 14): {
    purgedAppLogs: number;
    purgedCronLogs: number;
    purgedChatLogs: number;
    expiredSignals: number;
    remainingAppLogs: number;
    remainingCronLogs: number;
    remainingChatLogs: number;
  } {
    const store = ensureStore();
    const cutoffMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    const signalCutoffMs = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days for stale pending signals

    // 1. Purge app logs
    const initialAppLogsCount = (store.appLogs || []).length;
    store.appLogs = (store.appLogs || []).filter(
      (log) => new Date(log.timestamp).getTime() > cutoffMs
    );
    // Keep minimum 20 most recent logs
    if (store.appLogs.length < 20 && initialAppLogsCount > 0) {
      store.appLogs = (store.appLogs || []).slice(0, 20);
    }
    const purgedAppLogs = initialAppLogsCount - store.appLogs.length;

    // 2. Purge cron logs
    const initialCronCount = (store.cronLogs || []).length;
    store.cronLogs = (store.cronLogs || []).filter(
      (log) => new Date(log.createdAt).getTime() > cutoffMs
    );
    if (store.cronLogs.length < 10 && initialCronCount > 0) {
      store.cronLogs = (store.cronLogs || []).slice(0, 10);
    }
    const purgedCronLogs = initialCronCount - store.cronLogs.length;

    // 3. Purge chat logs
    const initialChatCount = (store.chatLogs || []).length;
    store.chatLogs = (store.chatLogs || []).filter(
      (log) => new Date(log.timestamp).getTime() > cutoffMs
    );
    if (store.chatLogs.length < 10 && initialChatCount > 0) {
      store.chatLogs = (store.chatLogs || []).slice(0, 10);
    }
    const purgedChatLogs = initialChatCount - store.chatLogs.length;

    // 4. Mark stale pending signals as EXPIRED
    let expiredSignals = 0;
    store.signals = (store.signals || []).map((sig) => {
      if (
        sig.status === 'PENDING_APPROVAL' &&
        new Date(sig.createdAt).getTime() < signalCutoffMs
      ) {
        expiredSignals++;
        return {
          ...sig,
          status: 'EXPIRED',
          notes: 'Auto-expired during scheduled retention purge.',
          updatedAt: new Date().toISOString(),
        };
      }
      return sig;
    });

    saveStore(store);

    return {
      purgedAppLogs,
      purgedCronLogs,
      purgedChatLogs,
      expiredSignals,
      remainingAppLogs: store.appLogs.length,
      remainingCronLogs: store.cronLogs.length,
      remainingChatLogs: store.chatLogs.length,
    };
  },
};
