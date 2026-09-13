"""
Stock Market & Quant Research MCP Server for Antigravity.
Provides real-time quotes, multi-timeframe OHLCV series, Wilder's RSI, EMAs, Bollinger Bands,
financial statements, and a local DuckDB analytical SQL engine.
Zero API keys required. 100% free and open-source.
"""

from typing import Any, Dict, List, Optional
import json
import duckdb
import numpy as np
import pandas as pd
import yfinance as yf
from mcp.server.mcpserver import MCPServer

# Initialize MCP Server
app = MCPServer("stock-research-mcp")

# In-memory DuckDB connection for analytical queries
db_conn = duckdb.connect(database=":memory:")


def _normalize_symbol(symbol: str) -> str:
    sym = symbol.strip().upper()
    # Common Indian ETFs / Stocks shortcuts if missing exchange suffix
    if "." not in sym and "^" not in sym:
        indian_common = {
            "GOLDBEES", "SILVERBEES", "NIFTYBEES", "JUNIORBEES", "BANKBEES", "NETFPHARMA", "FMCGIETF",
            "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK", "AXISBANK",
            "TATAMOTORS", "ITC", "LT", "BHARTIARTL", "HINDUNILVR", "NESTLEIND", "TITAN", "BAJFINANCE",
            "SUNPHARMA", "CIPLA", "DRREDDY", "DIVISLAB", "APOLLOHOSP", "LUPIN", "AUROPHARMA",
            "POWERGRID", "NTPC", "ONGC", "COALINDIA", "TATASTEEL", "JSWSTEEL", "MARUTI", "M&M"
        }
        if sym in indian_common or len(sym) >= 7:
            return f"{sym}.NS"
    return sym


def _calculate_wilder_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    
    avg_gain = gain.ewm(alpha=1.0 / period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1.0 / period, min_periods=period, adjust=False).mean()
    
    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    return rsi.fillna(50)


@app.tool()
def get_stock_quote(symbol: str) -> Dict[str, Any]:
    """
    Fetch the latest market price, day range, 52-week range, volume, P/E, and fundamental overview.
    Supports global and Indian symbols (e.g. 'GOLDBEES.NS', 'AAPL', 'RELIANCE.NS', 'SPY').
    """
    try:
        if not symbol or not isinstance(symbol, str):
            return {"error": "Invalid symbol provided.", "symbol": str(symbol), "current_price": None}

        normalized = _normalize_symbol(symbol)
        ticker = yf.Ticker(normalized)
        
        fast_info = getattr(ticker, "fast_info", None)
        info = ticker.info if hasattr(ticker, "info") else {}
        
        # Try fast_info first for real-time accuracy, fallback to info
        last_price = None
        if fast_info:
            last_price = getattr(fast_info, "last_price", None) or getattr(fast_info, "previous_close", None)
            
        if last_price is None and "currentPrice" in info:
            last_price = info.get("currentPrice")
        elif last_price is None and "regularMarketPrice" in info:
            last_price = info.get("regularMarketPrice")
            
        # If still none, fetch 5-day history
        if last_price is None:
            hist = ticker.history(period="5d")
            if not hist.empty:
                last_price = float(hist["Close"].iloc[-1])

        return {
            "symbol": normalized,
            "company_name": info.get("shortName") or info.get("longName") or normalized,
            "currency": getattr(fast_info, "currency", None) or info.get("currency", "INR"),
            "current_price": round(float(last_price), 4) if last_price else None,
            "previous_close": round(float(getattr(fast_info, "previous_close", 0) or info.get("previousClose", 0) or 0), 4),
            "day_high": round(float(getattr(fast_info, "day_high", 0) or info.get("dayHigh", 0) or 0), 4),
            "day_low": round(float(getattr(fast_info, "day_low", 0) or info.get("dayLow", 0) or 0), 4),
            "fifty_two_week_high": round(float(getattr(fast_info, "year_high", 0) or info.get("fiftyTwoWeekHigh", 0) or 0), 4),
            "fifty_two_week_low": round(float(getattr(fast_info, "year_low", 0) or info.get("fiftyTwoWeekLow", 0) or 0), 4),
            "market_cap": getattr(fast_info, "market_cap", None) or info.get("marketCap"),
            "trailing_pe": info.get("trailingPE"),
            "forward_pe": info.get("forwardPE"),
            "price_to_book": info.get("priceToBook"),
            "dividend_yield_pct": round(info.get("dividendYield", 0) * 100, 2) if info.get("dividendYield") else 0.0,
            "fifty_day_average": info.get("fiftyDayAverage"),
            "two_hundred_day_average": info.get("twoHundredDayAverage"),
        }
    except Exception as e:
        return {
            "symbol": symbol,
            "error": f"Failed to fetch quote: {str(e)}",
            "current_price": None,
            "company_name": symbol,
            "currency": "INR"
        }


@app.tool()
def get_historical_candles(symbol: str, period: str = "1mo", interval: str = "1d") -> List[Dict[str, Any]]:
    """
    Fetch historical Open, High, Low, Close, Volume (OHLCV) candles.
    - symbol: e.g. 'GOLDBEES.NS', 'AAPL', 'MSFT', 'NIFTYBEES.NS'
    - period: '1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', 'max'
    - interval: '1m', '5m', '15m', '30m', '60m', '1d', '1wk', '1mo'
    """
    normalized = _normalize_symbol(symbol)
    ticker = yf.Ticker(normalized)
    hist = ticker.history(period=period, interval=interval)
    
    if hist.empty:
        return []
    
    results = []
    for dt, row in hist.iterrows():
        date_str = dt.strftime("%Y-%m-%d %H:%M:%S") if hasattr(dt, "strftime") else str(dt)
        results.append({
            "timestamp": date_str,
            "open": round(float(row["Open"]), 4),
            "high": round(float(row["High"]), 4),
            "low": round(float(row["Low"]), 4),
            "close": round(float(row["Close"]), 4),
            "volume": int(row.get("Volume", 0))
        })
    return results


@app.tool()
def calculate_indicators(symbol: str, period: str = "6mo") -> Dict[str, Any]:
    """
    Calculate quant technical indicators:
    - 14-period Wilder's RSI
    - Exponential Moving Averages (EMA 20, EMA 50, EMA 200)
    - Average True Range (ATR 14)
    - 20-period Bollinger Bands (Upper, Middle SMA, Lower, Bandwidth, %B)
    """
    try:
        if not symbol or not isinstance(symbol, str):
            return {"error": "Invalid symbol provided.", "symbol": str(symbol)}

        normalized = _normalize_symbol(symbol)
        ticker = yf.Ticker(normalized)
        df = ticker.history(period=period, interval="1d")
        
        if df.empty or len(df) < 14:
            return {"error": f"Insufficient historical price candles for '{normalized}' (got {len(df)} candles, need at least 14).", "symbol": normalized}
        
        close = df["Close"].dropna()
        high = df["High"].dropna()
        low = df["Low"].dropna()
        
        if len(close) < 14:
            return {"error": f"Insufficient non-null prices for {normalized}.", "symbol": normalized}

        # RSI (Wilder's 14)
        rsi_series = _calculate_wilder_rsi(close, period=14)
        current_rsi = float(rsi_series.iloc[-1]) if not rsi_series.empty else 50.0
        
        # EMAs
        ema20 = float(close.ewm(span=20, adjust=False).mean().iloc[-1]) if len(close) >= 20 else float(close.iloc[-1])
        ema50 = float(close.ewm(span=50, adjust=False).mean().iloc[-1]) if len(close) >= 50 else None
        ema200 = float(close.ewm(span=200, adjust=False).mean().iloc[-1]) if len(close) >= 200 else None
        
        # ATR 14
        prev_close = close.shift(1)
        tr1 = high - low
        tr2 = (high - prev_close).abs()
        tr3 = (low - prev_close).abs()
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        atr14 = float(tr.rolling(window=14).mean().iloc[-1]) if len(tr) >= 14 else 0.0
        
        # Bollinger Bands (20-day, 2 std)
        win = min(len(close), 20)
        sma20 = float(close.rolling(window=win).mean().iloc[-1])
        std20 = float(close.rolling(window=win).std().iloc[-1]) if win > 1 else 0.0
        bb_upper = sma20 + (2 * std20)
        bb_lower = sma20 - (2 * std20)
        bb_bandwidth = ((bb_upper - bb_lower) / sma20) * 100 if sma20 > 0 else 0
        
        last_close = float(close.iloc[-1])
        bb_pct_b = ((last_close - bb_lower) / (bb_upper - bb_lower)) if (bb_upper != bb_lower) else 0.5
        
        # Status synthesis
        dip_status = "OVERSOLD (RSI <= 35)" if current_rsi <= 35 else ("OVERBOUGHT (RSI >= 70)" if current_rsi >= 70 else "NEUTRAL")
        ema50_status = "ABOVE 50 EMA" if (ema50 and last_close >= ema50) else ("BELOW 50 EMA" if ema50 else "INSUFFICIENT DATA FOR 50 EMA")
        
        return {
            "symbol": normalized,
            "current_close": round(last_close, 4),
            "rsi_14": round(current_rsi, 2),
            "rsi_status": dip_status,
            "ema_20": round(ema20, 4),
            "ema_50": round(ema50, 4) if ema50 else None,
            "ema_200": round(ema200, 4) if ema200 else None,
            "ema_50_status": ema50_status,
            "atr_14": round(atr14, 4),
            "bollinger_bands": {
                "upper": round(bb_upper, 4),
                "middle_sma20": round(sma20, 4),
                "lower": round(bb_lower, 4),
                "bandwidth_pct": round(bb_bandwidth, 2),
                "pct_b": round(bb_pct_b, 4)
            }
        }
    except Exception as e:
        return {
            "symbol": symbol,
            "error": f"Failed to compute indicators: {str(e)}"
        }


@app.tool()
def get_financial_statements(symbol: str, statement_type: str = "income") -> Dict[str, Any]:
    """
    Fetch company financial statements for fundamental study & valuation.
    - statement_type: 'income' (Profit & Loss), 'balance_sheet', or 'cashflow'.
    """
    try:
        if not symbol or not isinstance(symbol, str):
            return {"error": "Invalid symbol provided.", "symbol": str(symbol), "periods": {}}

        normalized = _normalize_symbol(symbol)
        ticker = yf.Ticker(normalized)
        
        st_type = statement_type.lower().strip()
        if st_type in ("income", "pl", "profit_and_loss"):
            fin_df = getattr(ticker, "financials", None)
        elif st_type in ("balance", "balance_sheet", "bs"):
            fin_df = getattr(ticker, "balance_sheet", None)
        elif st_type in ("cash", "cashflow", "cf"):
            fin_df = getattr(ticker, "cashflow", None)
        else:
            return {"error": f"Invalid statement_type: '{statement_type}'. Choose from 'income', 'balance_sheet', or 'cashflow'.", "periods": {}}
        
        if fin_df is None or fin_df.empty:
            return {
                "symbol": normalized,
                "statement_type": st_type,
                "periods": {},
                "message": "No financial statement records available (common for ETFs, indices, or commodities)."
            }
        
        # Convert dataframe to JSON serializable dictionary with formatted dates
        formatted = {}
        for col in fin_df.columns[:4]:  # Last 4 fiscal reporting periods
            col_name = col.strftime("%Y-%m-%d") if hasattr(col, "strftime") else str(col)
            formatted[col_name] = {
                str(k): (None if pd.isna(v) else int(v) if isinstance(v, (int, np.integer)) else float(v) if isinstance(v, (float, np.floating)) else str(v))
                for k, v in fin_df[col].dropna().items()
            }
            
        return {
            "symbol": normalized,
            "statement_type": st_type,
            "periods": formatted
        }
    except Exception as e:
        return {
            "symbol": symbol,
            "statement_type": statement_type,
            "error": f"Error fetching financials: {str(e)}",
            "periods": {}
        }


@app.tool()
def query_duckdb(sql_query: str) -> List[Dict[str, Any]]:
    """
    Execute high-speed analytical SQL on the embedded DuckDB engine.
    Useful for running backtests, screening multi-asset metrics, calculating quant distributions,
    and running queries on local CSV/Parquet files.
    """
    try:
        rel = db_conn.execute(sql_query)
        columns = [desc[0] for desc in rel.description]
        rows = rel.fetchall()
        return [dict(zip(columns, row)) for row in rows]
    except Exception as e:
        return [{"error": str(e)}]


@app.tool()
def get_ticker_news(symbol: str, limit: int = 6) -> List[Dict[str, Any]]:
    """
    Fetch the latest financial and macroeconomic news articles for a ticker.
    For Gold and Silver ETFs, automatically bridges to underlying commodity drivers (Gold Futures / Silver Futures).
    """
    try:
        normalized = _normalize_symbol(symbol)
        
        # Determine ticker to query
        search_ticker = normalized
        is_gold_etf = any(k in normalized for k in ["GOLD", "GOLDBEES", "SETFGOLD"])
        is_silver_etf = any(k in normalized for k in ["SILVER", "SILVERBEES"])
        
        if is_gold_etf:
            ticker_obj = yf.Ticker("GC=F")  # Gold Futures drive Gold ETFs
        elif is_silver_etf:
            ticker_obj = yf.Ticker("SI=F")  # Silver Futures drive Silver ETFs
        else:
            ticker_obj = yf.Ticker(normalized)

        raw_news = getattr(ticker_obj, "news", []) or []
        articles = []

        for item in raw_news[:limit]:
            content = item.get("content", {}) if isinstance(item, dict) else {}
            title = content.get("title") or item.get("title")
            if not title:
                continue

            summary = content.get("summary") or content.get("snippet") or item.get("summary") or ""
            pub_date = content.get("pubDate") or item.get("providerPublishTime") or ""
            provider = content.get("provider", {}).get("displayName") or item.get("publisher") or "Market News"
            url = content.get("canonicalUrl", {}).get("url") or item.get("link") or "#"

            articles.append({
                "title": title,
                "summary": summary,
                "published_at": str(pub_date),
                "publisher": provider,
                "url": url,
                "symbol": normalized
            })

        return articles
    except Exception as e:
        return [{"error": f"Failed to fetch news: {str(e)}", "symbol": symbol}]


@app.tool()
def predict_and_recommend(symbol: str, forecast_days: int = 30) -> Dict[str, Any]:
    """
    Quantitative predictive forecasting and Buy/Hold/Sell recommendation engine.
    Uses Monte Carlo Geometric Brownian Motion (500 paths) on historical volatility,
    evaluates Wilder's RSI, 50/200 EMA alignment, and Bollinger Bands to generate
    statistical price targets, stop-loss levels, and a quantified action recommendation.
    """
    try:
        normalized = _normalize_symbol(symbol)
        ticker = yf.Ticker(normalized)
        df = ticker.history(period="6mo", interval="1d")

        if df.empty or len(df) < 20:
            return {"error": f"Insufficient historical data for {normalized} to run quantitative prediction."}

        close = df["Close"].dropna()
        high = df["High"].dropna()
        low = df["Low"].dropna()
        last_price = float(close.iloc[-1])

        # Daily returns, drift, and volatility
        returns = close.pct_change().dropna()
        mu = float(returns.mean())
        sigma = float(returns.std())

        # Monte Carlo Simulation (500 paths)
        np.random.seed(42)
        days = max(5, min(forecast_days, 90))
        paths = 500
        shocks = np.random.normal(mu, sigma, (days, paths))
        price_paths = last_price * np.exp(np.cumsum(shocks, axis=0))

        final_prices = price_paths[-1]
        median_target = float(np.median(final_prices))
        bull_target = float(np.percentile(final_prices, 85))
        bear_target = float(np.percentile(final_prices, 15))

        # Technical Indicators
        rsi_series = _calculate_wilder_rsi(close, period=14)
        current_rsi = float(rsi_series.iloc[-1])
        ema50 = float(close.ewm(span=50, adjust=False).mean().iloc[-1]) if len(close) >= 50 else last_price
        ema200 = float(close.ewm(span=200, adjust=False).mean().iloc[-1]) if len(close) >= 200 else None

        # Quant Scoring System (-5 to +5)
        score = 0
        reasons = []

        # 1. RSI Factor
        if current_rsi <= 35:
            score += 2
            reasons.append(f"RSI-14 is deeply oversold ({current_rsi:.1f} <= 35) -> High accumulation probability.")
        elif current_rsi <= 45:
            score += 1
            reasons.append(f"RSI-14 is in a mild pullback zone ({current_rsi:.1f}).")
        elif current_rsi >= 70:
            score -= 2
            reasons.append(f"RSI-14 is overbought ({current_rsi:.1f} >= 70) -> Exhaustion risk.")
        else:
            reasons.append(f"RSI-14 is balanced ({current_rsi:.1f} - Neutral).")

        # 2. Trend & EMA Factor
        if last_price >= ema50:
            score += 1
            reasons.append(f"Price (INR {last_price:.2f}) is sustaining above 50-day EMA (INR {ema50:.2f}) -> Uptrend intact.")
        else:
            score -= 1
            reasons.append(f"Price is trading below 50-day EMA -> Short-term weakness.")

        if ema200 and last_price >= ema200:
            score += 1
            reasons.append("Price is holding above the structural 200-day EMA.")

        # 3. Drift & Expected Return
        expected_ret_pct = ((median_target - last_price) / last_price) * 100
        if expected_ret_pct > 2.0:
            score += 1
            reasons.append(f"Monte Carlo drift is positive (+{expected_ret_pct:.1f}% expected over {days} days).")
        elif expected_ret_pct < -2.0:
            score -= 1
            reasons.append(f"Monte Carlo drift is negative ({expected_ret_pct:.1f}% expected).")

        # Final Quant Verdict
        if score >= 2:
            verdict = "BUY / ACCUMULATE (Staged Dip)"
            confidence = min(88, 65 + (score * 5))
            suggested_action = "Initiate Tranche 1 position. Favorable risk-reward asymmetry."
        elif score <= -2:
            verdict = "SELL / REDUCE (Take Profits)"
            confidence = min(85, 60 + (abs(score) * 5))
            suggested_action = "Trim speculative exposure or wait for mean-reversion pullbacks."
        else:
            verdict = "HOLD (Consolidation Zone)"
            confidence = 70
            suggested_action = "Maintain existing positions. Wait for either a deeper dip (< 35 RSI) or a volume breakout."

        # Stop-Loss: 1.5 * ATR below current or bear target
        prev_close = close.shift(1)
        tr = pd.concat([high - low, (high - prev_close).abs(), (low - prev_close).abs()], axis=1).max(axis=1)
        atr14 = float(tr.rolling(14).mean().iloc[-1]) if len(tr) >= 14 else (last_price * 0.02)
        suggested_stop_loss = round(last_price - (1.5 * atr14), 2)

        return {
            "symbol": normalized,
            "current_price": round(last_price, 2),
            "verdict": verdict,
            "confidence_pct": confidence,
            "quant_score": f"{score}/+5",
            "forecast_horizon_days": days,
            "monte_carlo_projections": {
                "base_median_target": round(median_target, 2),
                "bull_case_85th_pct": round(bull_target, 2),
                "bear_case_15th_pct": round(bear_target, 2),
                "expected_return_pct": round(expected_ret_pct, 2)
            },
            "suggested_trade_levels": {
                "ideal_entry_range": f"{round(min(last_price, ema50), 2)} - {round(last_price, 2)}",
                "stop_loss": suggested_stop_loss,
                "profit_target_1": round(median_target, 2),
                "profit_target_2": round(bull_target, 2)
            },
            "technical_reasons": reasons
        }
    except Exception as e:
        return {"symbol": symbol, "error": f"Prediction failed: {str(e)}"}


if __name__ == "__main__":
    app.run(transport="stdio")
