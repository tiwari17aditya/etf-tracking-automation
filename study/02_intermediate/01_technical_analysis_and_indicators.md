# Module 2.1: Technical Analysis & Quantitative Indicators

Technical analysis studies past market data (price action and volume) to identify probabilistic edges, asymmetric risk-reward entries, and supply-demand imbalances.

---

## 1. Moving Averages (Trend Filters)

### Simple Moving Average (SMA) vs. Exponential Moving Average (EMA)
- **SMA**: Simple arithmetic mean over $N$ periods:
  $$\text{SMA}_t = \frac{1}{N} \sum_{i=0}^{N-1} P_{t-i}$$
- **EMA**: Applies an exponential multiplier weighting recent price action more heavily:
  $$\alpha = \frac{2}{N + 1}$$
  $$\text{EMA}_t = (P_t \times \alpha) + (\text{EMA}_{t-1} \times (1 - \alpha))$$

### Key Moving Average Levels:
- **20 EMA**: Short-term tactical trend and pullback support in strong momentum runs.
- **50 EMA**: Intermediate institutional trend support. Pullbacks to the 50 EMA in secular bull markets represent premier accumulation zones.
- **200 EMA**: Major structural bull/bear boundary. If price is above 200 EMA, institutional bias is bullish.
- **Golden Cross**: 50 EMA crosses above 200 EMA (Macro Bullish).
- **Death Cross**: 50 EMA crosses below 200 EMA (Macro Bearish).

---

## 2. Wilder's Relative Strength Index (RSI-14)

Developed by J. Welles Wilder Jr., RSI measures the speed and change of price movements on a scale from 0 to 100.

### The Exact Wilder Smoothing Formula:
1. Calculate price change: $\Delta = P_t - P_{t-1}$.
2. Separate positive gains ($U$) and negative losses ($D$):
   $$U = \max(\Delta, 0), \quad D = \max(-\Delta, 0)$$
3. Compute smoothed averages using exponential smoothing with factor $\frac{1}{14}$:
   $$\text{AvgGain}_t = \frac{(\text{AvgGain}_{t-1} \times 13) + U_t}{14}$$
   $$\text{AvgLoss}_t = \frac{(\text{AvgLoss}_{t-1} \times 13) + D_t}{14}$$
4. Calculate Relative Strength ($RS$):
   $$RS = \frac{\text{AvgGain}_t}{\text{AvgLoss}_t}$$
5. Normalize to 0–100:
   $$\text{RSI} = 100 - \left(\frac{100}{1 + RS}\right)$$

### Tactical Interpretations:
- **Oversold ($RSI \le 35$)**: Sellers are exhausted. In quality assets (ETFs, blue-chips), this marks high-probability accumulation zones.
- **Overbought ($RSI \ge 70$)**: Buying momentum is overextended. Caution on initiating fresh long positions.
- **Bullish Divergence**: Price makes a lower low while RSI makes a higher low. Indicates selling momentum is decaying before price reverses upward.
- **Bearish Divergence**: Price makes a higher high while RSI prints a lower high. Indicates buying momentum is fading.

---

## 3. Average True Range (ATR-14) — The Volatility Yardstick
ATR measures market volatility in absolute currency units, not direction.

### True Range ($TR$) is the greatest of:
1. Current High minus Current Low: $H_t - L_t$
2. Absolute value of Current High minus Previous Close: $|H_t - C_{t-1}|$
3. Absolute value of Current Low minus Previous Close: $|L_t - C_{t-1}|$

### Using ATR for Risk Management:
- **Dynamic Stop-Loss**: Place stops at $1.5 \times \text{ATR}$ or $2.0 \times \text{ATR}$ below entry or support level. This prevents getting shaken out by normal market noise.
- **Volatility-Based Position Sizing**: When ATR expands (high volatility), reduce position size. When ATR contracts, size can increase.

---

## 4. Bollinger Bands (Mean Reversion & Volatility Squeeze)
Constructed around a 20-period SMA:
- **Middle Band**: $\text{SMA}_{20}$
- **Upper Band**: $\text{SMA}_{20} + (2 \times \sigma)$
- **Lower Band**: $\text{SMA}_{20} - (2 \times \sigma)$
where $\sigma$ is the 20-day standard deviation of closing prices.

- **Bollinger Squeeze**: When Upper and Lower bands contract tightly (low bandwidth), it indicates volatility compression, which is consistently followed by an explosive directional breakout.
- **%B Indicator**: Quantifies price relative to the bands:
  $$\%B = \frac{\text{Close} - \text{Lower Band}}{\text{Upper Band} - \text{Lower Band}}$$

---

## 🔍 Interactive Antigravity Practice
Ask Antigravity:
> *"Run `calculate_indicators` on 'GOLDBEES.NS' and tell me the RSI-14, 50-day EMA status, and Bollinger %B value."*
