# Module 3.1: Derivatives & Options Mechanics (Greeks, Open Interest, Max Pain)

Options are derivative contracts granting the buyer the right—but not the obligation—to buy (Call) or sell (Put) an underlying asset at a predetermined Strike Price on or before Expiration.

---

## 1. The Core Options Greeks

Options prices are governed by mathematical pricing equations (Black-Scholes-Merton). The Greeks quantify how sensitive an option contract's premium is to market variables:

### 1. Delta ($\Delta$) — Directional Sensitivity
$$\Delta = \frac{\partial V}{\partial S}$$
- Change in option premium per ₹1 change in underlying asset price ($S$).
- Calls have positive Delta ($0.0 \text{ to } +1.0$). At-The-Money (ATM) Call $\approx +0.50$.
- Puts have negative Delta ($0.0 \text{ to } -1.0$). ATM Put $\approx -0.50$.
- Also approximates the market's implied probability of expiring In-The-Money (ITM).

### 2. Gamma ($\Gamma$) — Acceleration
$$\Gamma = \frac{\partial^2 V}{\partial S^2} = \frac{\partial \Delta}{\partial S}$$
- Rate of change of Delta per ₹1 change in underlying price.
- Highest for ATM options nearing expiration. This creates **Gamma Squeeze** risk for option sellers.

### 3. Theta ($\Theta$) — Time Decay
$$\Theta = \frac{\partial V}{\partial t}$$
- Daily erosion of option premium as expiration approaches, assuming price and volatility remain constant.
- Always negative for option buyers (decay works against you) and positive for option sellers.
- Decay accelerates non-linearly in the final 30 days before expiration.

### 4. Vega ($\nu$) — Volatility Sensitivity
$$\nu = \frac{\partial V}{\partial \sigma}$$
- Change in option premium per 1% change in Implied Volatility (IV).
- High IV expands both Call and Put premiums; IV crush after binary events (earnings, budget) causes dramatic premium collapse.

---

## 2. Open Interest (OI) & Put-Call Ratio (PCR)

- **Open Interest (OI)**: Total number of active, unsettled contracts currently open in the market.
- High OI at a specific strike indicates a major institutional battleground (support/resistance wall).

### Put-Call Ratio (PCR)
$$\text{PCR} = \frac{\text{Total Open Interest of Puts}}{\text{Total Open Interest of Calls}}$$

### Interpreting PCR as a Contrarian Indicator:
- **PCR > 1.3 - 1.5 (Extreme Bullish / Oversold)**: Heavy Put writing by institutions; market participants are excessively hedged. Frequently precedes strong short-covering rallies.
- **PCR < 0.6 - 0.7 (Extreme Bearish / Overbought)**: Excessive Call buying; market sentiment is over-complacent. Often marks market exhaustion and pullbacks.

---

## 3. Max Pain Theory

Max Pain posits that at options expiration, the underlying index/stock will gravitate toward the strike price where the greatest number of option contracts (both Calls and Puts) expire worthless.

### Mathematical Formulation:
For every strike $K_i$:
$$\text{Call Loss}(K_i) = \sum_{K \le K_i} \text{OI}_{\text{Call}}(K) \times (K_i - K)$$
$$\text{Put Loss}(K_i) = \sum_{K \ge K_i} \text{OI}_{\text{Put}}(K) \times (K - K_i)$$
$$\text{Total Pain}(K_i) = \text{Call Loss}(K_i) + \text{Put Loss}(K_i)$$

$$\text{Max Pain Strike} = \arg\min_{K_i} \left( \text{Total Pain}(K_i) \right)$$
Option sellers (large institutions with deep balance sheets) manage their delta hedges to nudge spot prices toward this point of maximum retail pain.

---

## 🔍 Interactive Antigravity Practice
Ask Antigravity:
> *"Explain how an option seller utilizes Theta decay and delta-neutral hedging to construct a short strangle strategy."*
