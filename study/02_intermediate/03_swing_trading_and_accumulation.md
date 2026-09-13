# Module 2.3: Swing Trading & Systematic Dip Accumulation

Profitable investing and trading is not about predicting the future with 100% certainty; it is about **position sizing, risk-to-reward asymmetry, and systematic capital deployment**.

---

## 1. Capital Preservation & Asymmetric Risk-Reward

### The 1% Risk Rule
Never risk more than 1% to 2% of total portfolio capital on a single trade idea.
$$\text{Position Size (Units)} = \frac{\text{Account Capital} \times \text{Risk \%}}{\text{Entry Price} - \text{Stop Loss Price}}$$

#### Example:
- Total Account: ₹500,000
- Risk per trade (1%): ₹5,000
- Stock Entry: ₹250
- Stop Loss: ₹240 (Risk = ₹10/share)
- **Position Size**: $\frac{₹5,000}{₹10} = 500 \text{ shares}$ (Capital deployed: ₹125,000).

### Minimum Risk-Reward Ratio (1:2 or 1:3)
If you risk ₹10/share, your target must be at least ₹20/share (1:2) or ₹30/share (1:3).
- At **1:2 Risk-Reward**, you only need a **33.4% win rate** to break even.
- At **1:3 Risk-Reward**, a **25% win rate** breaks even.

```
Win Rate vs Required Risk-Reward Matrix
+------------+-----------------------+
| Win Rate   | Min R:R to Break Even |
+------------+-----------------------+
| 30%        | 1 : 2.33              |
| 40%        | 1 : 1.50              |
| 50%        | 1 : 1.00              |
| 60%        | 1 : 0.67              |
+------------+-----------------------+
```

---

## 2. Systematic Dollar Cost Averaging (DCA) vs. Smart Dip Accumulation

### Standard DCA (Blind Accumulation)
- Invests a fixed dollar amount on a fixed calendar date (e.g., ₹10,000 on the 1st of every month) regardless of valuation or price action.
- *Downside*: Buys both at market peaks (overbought) and market troughs.

### Smart Dip Accumulation (Systematic Value Averaging)
- Retains dry powder and deploys capital opportunistically when the asset pulls back to high-probability statistical support levels.
- **Trigger Conditions for Smart Dip**:
  1. **Primary Filter**: Asset is in a macro secular uptrend (Trading above or near 200-day EMA).
  2. **Pullback Trigger**: 14-period Wilder RSI drops to $\le 35$ or touches 50-day EMA.
  3. **Volatility Compression**: Price tests lower Bollinger Band.
- Deploys capital in staged tranches (e.g., 40% on RSI < 35, 60% on confirmation of RSI hooking back above 35).

---

## 3. Position Sizing Matrix for Dip Tranches

When building long-term ETF positions (e.g., GoldBEES, NiftyBEES):
- **Tranche 1 (Mild Dip)**: Price drops 3%–5% from 52W high; RSI 40–45 $\rightarrow$ Deploy 20% tranche.
- **Tranche 2 (Standard Correction)**: Price drops 7%–10% from 52W high; RSI 30–35 $\rightarrow$ Deploy 40% tranche.
- **Tranche 3 (Capitulation Dip)**: Price drops > 15%; RSI < 30 $\rightarrow$ Deploy remaining 40% tranche.

---

## 🔍 Interactive Antigravity Practice
Ask Antigravity:
> *"Query the current price and indicators of GOLDBEES.NS. Calculate whether it currently qualifies for Tranche 1, Tranche 2, or Tranche 3 accumulation."*
