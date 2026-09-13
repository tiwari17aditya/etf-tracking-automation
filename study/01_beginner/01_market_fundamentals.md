# Module 1.1: Stock Market Fundamentals & Mechanics

## 1. What is a Stock?
A stock (equity or share) represents fractional ownership in a corporation. When you buy 1 share of a company, you own a proportional claim on its assets and future earnings.

### Primary vs. Secondary Market
- **Primary Market (IPO)**: Companies issue new shares directly to institutional and retail investors to raise capital.
- **Secondary Market (Exchanges)**: Investors trade existing shares with one another (e.g., National Stock Exchange of India - NSE, Bombay Stock Exchange - BSE, New York Stock Exchange - NYSE). The company itself receives no capital when shares change hands on secondary markets.

---

## 2. Market Participants
1. **Retail Investors**: Individual traders and long-term investors investing personal capital.
2. **DIIs (Domestic Institutional Investors)**: Mutual funds, insurance companies (e.g., LIC), pension funds.
3. **FIIs / FPIs (Foreign Institutional Investors)**: Global hedge funds, sovereign wealth funds investing across international borders.
4. **Market Makers / Liquidity Providers**: High-frequency algorithms and financial institutions quoting simultaneous bids and asks to maintain liquidity.

---

## 3. Order Types & Execution

### Order Types
- **Market Order**: Executes immediately at the best available prevailing market price. High certainty of execution, but subject to *slippage* during fast-moving markets.
- **Limit Order**: Executes only at a specified price or better. Guarantees price, but no guarantee of execution if market doesn't touch the limit price.
- **Stop-Loss (SL) Order**: An order that becomes active only when a specified trigger price is breached.
  - **SL-Limit**: Once trigger is hit, places a limit order.
  - **SL-Market (SL-M)**: Once trigger is hit, executes immediately at market.
- **Good-Til-Triggered (GTT)**: Long-standing order that stays dormant for up to 1 year until your price target or stop loss triggers.

---

## 4. The Order Book & Bid-Ask Spread

The order book is a real-time ledger of pending buy (Bid) and sell (Ask) limit orders at varying price levels.

```
+-----------------------------------------------+
|               ORDER BOOK DEPTH                |
+-----------------------+-----------------------+
| BUY ORDERS (BIDS)     | SELL ORDERS (ASKS)    |
| Qty      Price (₹)    | Price (₹)    Qty      |
+-----------------------+-----------------------+
| 1,500    124.95       | 125.00       2,200    |  <-- Best Bid vs Best Ask
| 3,200    124.90       | 125.05       1,800    |
| 5,000    124.85       | 125.10       4,500    |
+-----------------------+-----------------------+
```

### The Bid-Ask Spread
The difference between the highest price a buyer will pay (Best Bid) and the lowest price a seller will accept (Best Ask):
$$\text{Spread} = \text{Best Ask} - \text{Best Bid}$$

- Highly liquid large caps (e.g., Nifty 50) have spreads of a few paise (0.01% - 0.05%).
- Illiquid small caps have wide spreads (1% - 3%), which act as a hidden transaction tax.

---

## 5. Settlement Cycles (T+1)
Modern exchanges operate on a **T+1 (Trade Date + 1 Business Day)** settlement cycle:
- If you buy shares on Monday, the shares are delivered to your Demat account on Tuesday.
- Corporate actions (dividends, bonuses, stock splits) determine eligible shareholders on the **Record Date**. To receive the corporate action, you must buy prior to the **Ex-Date**.

---

## 🔍 Interactive Antigravity Practice
Ask Antigravity:
> *"Fetch the live quote and 52-week range for GOLDBEES.NS using the MCP server, and explain the current trading volume."*
