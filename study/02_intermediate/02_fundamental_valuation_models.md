# Module 2.2: Fundamental Valuation & Capital Allocation Models

Valuation is the discipline of estimating the intrinsic worth of a business based on its expected cash generation capacity, return on capital, and risk profile.

---

## 1. Multiple-Based Valuation

### A. Price-to-Earnings (P/E Ratio)
$$\text{P/E} = \frac{\text{Current Market Price per Share}}{\text{Earnings Per Share (EPS)}}$$
- **Trailing P/E**: Based on the past 12 months (TTM) of reported net income.
- **Forward P/E**: Based on consensus analyst forward earnings projections.
- **PEG Ratio (P/E to Growth)**:
  $$\text{PEG} = \frac{\text{P/E}}{\text{Annual EPS Growth Rate (\%)}}$$
  A PEG < 1.0 implies growth at a reasonable price (GARP); PEG > 2.0 indicates market is pricing in aggressive future assumptions.

### B. Enterprise Value Multiples (EV/EBITDA)
Why EV/EBITDA is superior to P/E for capital-intensive companies:
P/E ignores debt structure. Two companies with identical operating performance can have vastly different P/E ratios simply because one is heavily leveraged with debt interest payments.

$$\text{Enterprise Value (EV)} = \text{Market Cap} + \text{Total Debt} - \text{Cash \& Equivalents}$$
$$\text{EV/EBITDA} = \frac{\text{EV}}{\text{Operating Profit before D\&A}}$$
EV neutralizes capital structure differences and tax jurisdictions.

---

## 2. Capital Efficiency: ROCE vs. ROE

### Return on Capital Employed (ROCE)
ROCE measures how effectively management generates operating profits from *all* capital invested (both equity and debt).

$$\text{ROCE} = \frac{\text{EBIT}}{\text{Total Assets} - \text{Current Liabilities}} = \frac{\text{EBIT}}{\text{Shareholders' Equity} + \text{Long-Term Debt}}$$

### Return on Equity (ROE)
$$\text{ROE} = \frac{\text{Net Income}}{\text{Shareholders' Equity}}$$

> [!WARNING]
> **The Leverage Trap**: A company can artificially inflate its ROE by taking on dangerous amounts of debt (which shrinks the equity denominator). Always cross-reference high ROE with ROCE and Debt-to-Equity. If ROE is 35% but ROCE is only 9%, the returns are being fueled by leverage, not superior operating prowess.

---

## 3. Discounted Cash Flow (DCF) Architecture

The foundational axiom of corporate finance: *An asset is worth the present value of all future cash flows it will produce, discounted back to today at an appropriate cost of capital.*

$$\text{Intrinsic Value} = \sum_{t=1}^{T} \frac{\text{FCF}_t}{(1 + \text{WACC})^t} + \frac{\text{Terminal Value}}{(1 + \text{WACC})^T}$$

### The 4 Steps to Build a DCF:
1. **Forecast Free Cash Flows (FCF)** for 5–10 years based on sustainable organic revenue growth and operating margins.
2. **Determine the Discount Rate (WACC - Weighted Average Cost of Capital)**:
   $$\text{WACC} = \left(\frac{E}{V} \times K_e\right) + \left(\frac{D}{V} \times K_d \times (1 - t)\right)$$
   Where $K_e = R_f + \beta(R_m - R_f)$ (CAPM Cost of Equity).
3. **Calculate Terminal Value (TV)** using the Gordon Growth Model:
   $$\text{Terminal Value} = \frac{\text{FCF}_T \times (1 + g)}{\text{WACC} - g}$$
   Where $g$ is the perpetual long-term GDP growth rate (typically 2%–4%).
4. **Margin of Safety**: Never purchase at exact intrinsic value. Benjamin Graham's rule: Require a 20%–30% discount to calculated fair value to protect against model forecasting errors.

---

## 🔍 Interactive Antigravity Practice
Ask Antigravity:
> *"Fetch the balance sheet and income statement for 'INFY.NS' using the MCP server, and compute its Debt-to-Equity ratio and Operating Margin."*
