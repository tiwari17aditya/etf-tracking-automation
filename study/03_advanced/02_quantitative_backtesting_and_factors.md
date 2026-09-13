# Module 3.2: Quantitative Backtesting, Factor Investing & Risk Metrics

Quantitative trading replaces emotional discretion with statistical rules, empirical hypothesis testing, and rigorous risk budgeting.

---

## 1. Key Quantitative Risk & Return Ratios

### A. Sharpe Ratio
Measures excess return earned per unit of total risk (standard deviation):
$$\text{Sharpe Ratio} = \frac{E[R_p] - R_f}{\sigma_p}$$
Where $R_f$ is the risk-free rate (e.g., 10-year sovereign bond yield) and $\sigma_p$ is annualized volatility.
- **Sharpe < 1.0**: Sub-optimal; return does not sufficiently compensate for volatility.
- **Sharpe > 1.5**: Solid institutional quantitative strategy.
- **Sharpe > 2.0**: Superior risk-adjusted returns.

### B. Sortino Ratio (Downside-Adjusted)
The Sharpe ratio penalizes upside volatility (sudden rallies) the same as downside crashes. The Sortino ratio fixes this by evaluating only *downside deviation* ($\sigma_d$):
$$\text{Sortino Ratio} = \frac{E[R_p] - R_f}{\sigma_d}$$
$$\sigma_d = \sqrt{\frac{1}{N} \sum_{t=1}^{N} \min(0, R_t - R_f)^2}$$

### C. Maximum Drawdown (MDD) & Calmar Ratio
Maximum peak-to-trough decline before a new peak is reached:
$$\text{MDD} = \frac{\text{Peak Value} - \text{Trough Value}}{\text{Peak Value}}$$

- **Calmar Ratio**: Annualized Compound Return divided by Absolute Maximum Drawdown:
  $$\text{Calmar Ratio} = \frac{\text{CAGR}}{|\text{Max Drawdown}|}$$
  A Calmar > 2.0 indicates the strategy's annual return is double its worst historical drawdown.

---

## 2. Factor Investing (Fama-French & Modern Alpha)
Stock returns can be decomposed into systematic risk premia called "factors":

| Factor | Definition / Metric | Why It Works (Economic Rationale) |
| :--- | :--- | :--- |
| **Value** | Low P/B, Low P/E, High FCF Yield | Behavioral over-reaction to distressed or boring companies. |
| **Momentum** | 12-month return minus 1-month return | Investor under-reaction to positive news; institutional herding. |
| **Quality** | High ROCE, Low Debt-to-Equity, Stable Earnings | Downside resilience during market downturns. |
| **Low Volatility** | Low Beta, Low Historical Standard Deviation | Lottery ticket effect: retail investors overpay for high-beta stocks. |

---

## 3. Backtesting Pitfalls & Validation Rules

When building backtests in DuckDB or Python:

1. **Survivorship Bias**:
   - Testing only on today's Nifty 50 or S&P 500 components creates artificial positive bias because companies that went bankrupt or were delisted over the last 15 years are excluded. Always use point-in-time constituent datasets.
2. **Look-Ahead Bias**:
   - Using data that was not yet publicly known at the moment of trade execution (e.g., using Q4 earnings before the audit release date).
3. **Overfitting (Data Snooping)**:
   - Tweaking 12 indicator parameters until the backtest curve looks like a straight line up.
   - *Fix*: **Walk-Forward Analysis (WFA)**. Train rules on 70% In-Sample (IS) data, and validate without changes on 30% Out-of-Sample (OOS) data.

---

## 🔍 Interactive Antigravity Practice
Ask Antigravity:
> *"Use DuckDB SQL tool to run a statistical query computing the mean, standard deviation, and estimated Sharpe Ratio of simulated monthly returns."*
