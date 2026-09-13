import fs from 'fs';
import path from 'path';
import { Signal, CronRunLog, PortfolioSetting, SignalStatus } from './types';

interface StoreData {
  signals: Signal[];
  cronLogs: CronRunLog[];
  settings: PortfolioSetting;
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
      } else {
        initial = {
          signals: SEED_SIGNALS,
          cronLogs: SEED_LOGS,
          settings: DEFAULT_SETTINGS,
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
    memoryStore = {
      signals: SEED_SIGNALS,
      cronLogs: SEED_LOGS,
      settings: DEFAULT_SETTINGS,
    };
    return memoryStore;
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
};
