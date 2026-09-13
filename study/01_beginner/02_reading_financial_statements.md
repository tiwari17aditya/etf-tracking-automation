# Module 1.2: Reading Financial Statements (P&L, Balance Sheet, Cash Flow)

Financial statements are the objective scorecards of a business. Every public company reports three core interconnected statements quarterly and annually.

---

## 1. The Income Statement (Profit & Loss / P&L)
The P&L measures economic activity over a specific period (Quarter or Year).

```
Revenue (Top Line: Gross Sales)
  (-) Cost of Goods Sold (COGS: raw materials, direct labor)
=======================================================
= Gross Profit (Indicator of pricing power)
  (-) Operating Expenses (SG&A, R&D, employee expenses)
  (-) Depreciation & Amortization (non-cash physical asset wear)
=======================================================
= Operating Profit (EBIT: Earnings Before Interest & Taxes)
  (-) Interest Expenses (cost of debt)
  (+) Non-Operating / Other Income
=======================================================
= Profit Before Tax (PBT)
  (-) Taxes
=======================================================
= Net Profit (Bottom Line / PAT: Profit After Tax)
```

### Key Metrics:
- **Operating Margin (%)**: $\frac{\text{EBIT}}{\text{Revenue}} \times 100$. Look for stable or expanding margins over 5 years.
- **Diluted EPS (Earnings Per Share)**: $\frac{\text{Net Income}}{\text{Weighted Average Diluted Shares}}$.

---

## 2. The Balance Sheet
The Balance Sheet is a **snapshot in time** of what a company owns and what it owes.

$$\text{Assets} = \text{Liabilities} + \text{Shareholders' Equity}$$

### Assets (What Company Owns)
1. **Current Assets** (Convertible to cash < 1 year): Cash & Cash Equivalents, Accounts Receivable, Inventory.
2. **Non-Current Assets** (Long-term productive tools): Property, Plant & Equipment (PP&E), Intangible Assets (Patents, Software), Long-term Investments.

### Liabilities (What Company Owes)
1. **Current Liabilities** (Due < 1 year): Accounts Payable, Short-Term Borrowings, Accrued Expenses.
2. **Non-Current Liabilities** (Long-term obligations): Long-Term Debt, Deferred Tax Liabilities.

### Shareholders' Equity (Book Value)
- Share Capital + Retained Earnings (cumulative profits reinvested into business minus dividends paid).

---

## 3. The Cash Flow Statement (The Truth Teller)
Accounting profit (Net Income) is based on accruals and can be manipulated via revenue recognition policies. Cash Flow measures **actual physical money flowing in and out of company bank accounts**.

Divided into 3 segments:
1. **Cash Flow from Operating Activities (CFO)**: Real cash generated from core business operations.
   - *Rule of Thumb*: Healthy companies have $\text{CFO} \ge \text{Net Profit}$. If Net Profit is positive but CFO is consistently negative, suspect aggressive revenue booking or uncollected receivables.
2. **Cash Flow from Investing Activities (CFI)**: Cash spent on or received from investments.
   - **Capital Expenditure (CapEx)**: Buying machinery, building factories, buying tech infrastructure.
3. **Cash Flow from Financing Activities (CFF)**: Cash from equity issuance, debt borrowing, dividend distributions, or share buybacks.

---

## 4. Free Cash Flow (FCF) — The Most Important Quant Metric
Free cash flow is the cash left over after maintaining and expanding the asset base. This is the cash available to distribute to shareholders or retire debt.

$$\text{Free Cash Flow (FCF)} = \text{Cash from Operations (CFO)} - \text{Capital Expenditures (CapEx)}$$

- **FCF Yield**: $\frac{\text{Free Cash Flow}}{\text{Market Capitalization}}$. If a company generates a 6% FCF yield while growing revenue at 12%, it offers strong fundamental downside protection.

---

## 🔍 Interactive Antigravity Practice
Ask Antigravity:
> *"Use the MCP tool `get_financial_statements` for symbol 'TCS.NS' and compare the Operating Revenue vs Net Income across the last 3 fiscal periods."*
