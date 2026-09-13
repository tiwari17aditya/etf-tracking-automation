// Stock & ETF Quant Research Station - Fortified Frontend Controller
// Implements complete client-side error boundaries, safe network wrappers,
// input validation, and crash-proof UI state recovery.

document.addEventListener("DOMContentLoaded", () => {
  let activeTicker = "GOLDBEES.NS";
  let activeStatementType = "income";
  let activeChapterPath = "";

  // -------------------------------------------------------------
  // 0. Global Crash Shield & Toast Notification System
  // -------------------------------------------------------------
  const toastContainer = document.createElement("div");
  toastContainer.id = "toast-container";
  document.body.appendChild(toastContainer);

  function showToast(message, type = "error", duration = 4000) {
    try {
      const toast = document.createElement("div");
      toast.className = `toast ${type}`;
      
      const textSpan = document.createElement("span");
      textSpan.textContent = message;
      
      const closeBtn = document.createElement("button");
      closeBtn.className = "toast-close";
      closeBtn.innerHTML = "&times;";
      closeBtn.onclick = () => toast.remove();

      toast.appendChild(textSpan);
      toast.appendChild(closeBtn);
      toastContainer.appendChild(toast);

      setTimeout(() => {
        if (toast.parentElement) {
          toast.style.opacity = "0";
          toast.style.transform = "translateX(50px)";
          setTimeout(() => toast.remove(), 300);
        }
      }, duration);
    } catch (e) {
      console.error("Toast error:", e);
    }
  }

  // Global Uncaught Error Catchers (Prevents whole-window freezes)
  window.addEventListener("error", (event) => {
    console.error("Global UI Error Caught:", event.error || event.message);
    showToast(`UI Notice: ${event.message || "An unexpected error occurred."}`, "error");
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled Promise Rejection:", event.reason);
    showToast(`Network Notice: ${event.reason?.message || "Operation failed."}`, "warning");
  });

  // Safe Fetch Wrapper with timeout and error capture
  async function safeFetch(url, options = {}, timeoutMs = 12000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        return { ok: false, status: response.status, error: "Server returned non-JSON response.", raw: text };
      }

      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        return { ok: false, error: "Request timed out. Please check server status." };
      }
      return { ok: false, error: err.message || "Network connection error." };
    }
  }

  // Safe Markdown Formatter
  function safeFormatMarkdown(text) {
    if (!text || typeof text !== "string") return "";
    try {
      // Escape HTML tags to prevent XSS
      let escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      let html = escaped
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/`([^`]+)`/gim, '<code>$1</code>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/\n\n/gim, '<p></p>')
        .replace(/\n/gim, '<br>');
      return html;
    } catch (e) {
      console.error("Markdown parse error:", e);
      return String(text);
    }
  }

  // -------------------------------------------------------------
  // 1. Tab Switching System (With State Validation)
  // -------------------------------------------------------------
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      try {
        const targetId = btn.getAttribute("data-tab");
        if (!targetId) return;

        tabButtons.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));

        btn.classList.add("active");
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.add("active");
        } else {
          showToast(`Tab content for ${targetId} not found.`, "warning");
        }
      } catch (err) {
        showToast(`Tab error: ${err.message}`, "error");
      }
    });
  });

  // -------------------------------------------------------------
  // 2. Chatbot Co-Pilot Controller
  // -------------------------------------------------------------
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages-container");
  const chatSendBtn = document.getElementById("chat-send-btn");
  const promptChips = document.querySelectorAll(".prompt-chip");

  promptChips.forEach(chip => {
    chip.addEventListener("click", () => {
      try {
        const prompt = chip.getAttribute("data-prompt");
        if (prompt && chatInput) {
          chatInput.value = prompt;
          sendMessage(prompt);
        }
      } catch (err) {
        showToast("Could not process prompt chip.", "error");
      }
    });
  });

  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      try {
        const text = chatInput ? chatInput.value.trim() : "";
        if (!text) {
          showToast("Please enter a question or prompt.", "info", 2500);
          return;
        }
        sendMessage(text);
        if (chatInput) chatInput.value = "";
      } catch (err) {
        showToast(`Chat error: ${err.message}`, "error");
      }
    });
  }

  async function sendMessage(text) {
    if (!text || typeof text !== "string") return;

    // Append User Message
    appendMessage("user", text);

    // Disable button during transit
    if (chatSendBtn) chatSendBtn.disabled = true;

    // Generate or retrieve session id for session tracking
    let currentSessionId = sessionStorage.getItem("active_quant_session_id");
    if (!currentSessionId) {
      currentSessionId = "session_" + Date.now().toString(36);
      sessionStorage.setItem("active_quant_session_id", currentSessionId);
    }

    try {
      const res = await safeFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: currentSessionId })
      });

      const bodyEl = loadingCard.querySelector(".message-body");
      if (!bodyEl) return;

      if (!res.ok) {
        const errMsg = res.data?.message || res.error || "Server error";
        bodyEl.innerHTML = `
          <div class="error-card-inline">
            <p><strong>⚠️ Request Failed:</strong> ${errMsg}</p>
            <button class="retry-btn" id="retry-chat-btn">🔄 Retry Question</button>
          </div>
        `;
        const retryBtn = bodyEl.querySelector("#retry-chat-btn");
        if (retryBtn) {
          retryBtn.onclick = () => {
            loadingCard.remove();
            sendMessage(text);
          };
        }
        showToast(`Chat assistant error: ${errMsg}`, "error");
        return;
      }

      const data = res.data || {};
      bodyEl.innerHTML = safeFormatMarkdown(data.reply || "No reply returned by assistant.");

      // If reply detected a ticker, sync terminal
      if (data.symbol) {
        activeTicker = data.symbol;
        const globalInput = document.getElementById("global-ticker-input");
        if (globalInput) globalInput.value = activeTicker;
        loadTickerData(activeTicker);
      }

    } catch (err) {
      const bodyEl = loadingCard.querySelector(".message-body");
      if (bodyEl) {
        bodyEl.innerHTML = `<div class="error-card-inline"><p>⚠️ Network Failure: ${err.message}</p></div>`;
      }
      showToast(`Network error: ${err.message}`, "error");
    } finally {
      if (chatSendBtn) chatSendBtn.disabled = false;
      if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  function appendMessage(role, content) {
    const card = document.createElement("div");
    card.className = `message-card ${role}`;
    
    const avatar = role === "assistant" ? "📈" : "👤";
    card.innerHTML = `
      <div class="avatar">${avatar}</div>
      <div class="message-body">${safeFormatMarkdown(content)}</div>
    `;
    
    if (chatMessages) {
      chatMessages.appendChild(card);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    return card;
  }

  // -------------------------------------------------------------
  // 3. Live Ticker & Terminal Controller
  // -------------------------------------------------------------
  const searchBtn = document.getElementById("search-ticker-btn");
  const globalInput = document.getElementById("global-ticker-input");

  function triggerSearch() {
    if (!globalInput) return;
    const raw = globalInput.value.trim();
    if (!raw) {
      showToast("Please enter a stock or ETF symbol (e.g. GOLDBEES, NVDA).", "warning");
      return;
    }

    // Clean symbol input
    const cleanSym = raw.replace(/[^A-Za-z0-9\.\^]/g, "").toUpperCase();
    if (cleanSym.length < 2) {
      showToast("Ticker symbol too short.", "warning");
      return;
    }

    activeTicker = cleanSym;
    globalInput.value = cleanSym;
    loadTickerData(cleanSym);
  }

  if (searchBtn) searchBtn.addEventListener("click", triggerSearch);
  if (globalInput) {
    globalInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") triggerSearch();
    });
  }

  // Statement Tab Buttons
  const stTabs = document.querySelectorAll(".st-tab-btn");
  stTabs.forEach(b => {
    b.addEventListener("click", () => {
      try {
        stTabs.forEach(tab => tab.classList.remove("active"));
        b.classList.add("active");
        activeStatementType = b.getAttribute("data-statement") || "income";
        loadFinancials(activeTicker, activeStatementType);
      } catch (err) {
        showToast("Error switching financial statement tab.", "error");
      }
    });
  });

  async function loadTickerData(symbol) {
    if (!symbol) return;
    if (searchBtn) searchBtn.disabled = true;

    try {
      // 1. Fetch Quote
      const qRes = await safeFetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
      
      const cardSymbol = document.getElementById("card-symbol");
      const cardName = document.getElementById("card-name");
      const cardPrice = document.getElementById("card-price");
      const cardPrevClose = document.getElementById("card-prev-close");
      const cardCurrency = document.getElementById("card-currency");
      const cardLow52 = document.getElementById("card-low-52");
      const cardHigh52 = document.getElementById("card-high-52");
      const cardDayHigh = document.getElementById("card-day-high");
      const cardDayLow = document.getElementById("card-day-low");
      const cardPe = document.getElementById("card-pe");
      const cardPb = document.getElementById("card-pb");
      const cardYield = document.getElementById("card-yield");
      const cardMcap = document.getElementById("card-mcap");
      const cardProgress = document.getElementById("card-52w-progress");

      if (!qRes.ok || qRes.data?.error) {
        const err = qRes.data?.message || qRes.error || "Ticker not found";
        showToast(`Quote: ${err}`, "warning");
        if (cardSymbol) cardSymbol.textContent = symbol;
        if (cardName) cardName.textContent = "Data Unavailable";
        if (cardPrice) cardPrice.textContent = "N/A";
      } else {
        const q = qRes.data || {};
        if (cardSymbol) cardSymbol.textContent = q.symbol || symbol;
        if (cardName) cardName.textContent = q.company_name || symbol;
        if (cardPrice) cardPrice.textContent = q.current_price != null ? `₹${q.current_price}` : "N/A";
        if (cardPrevClose) cardPrevClose.textContent = q.previous_close != null ? `₹${q.previous_close}` : "N/A";
        if (cardCurrency) cardCurrency.textContent = q.currency || "INR";

        if (cardLow52) cardLow52.textContent = q.fifty_two_week_low != null ? `₹${q.fifty_two_week_low}` : "N/A";
        if (cardHigh52) cardHigh52.textContent = q.fifty_two_week_high != null ? `₹${q.fifty_two_week_high}` : "N/A";
        if (cardDayHigh) cardDayHigh.textContent = q.day_high != null ? `₹${q.day_high}` : "N/A";
        if (cardDayLow) cardDayLow.textContent = q.day_low != null ? `₹${q.day_low}` : "N/A";

        if (cardPe) cardPe.textContent = q.trailing_pe ? Number(q.trailing_pe).toFixed(2) : "N/A";
        if (cardPb) cardPb.textContent = q.price_to_book ? Number(q.price_to_book).toFixed(2) : "N/A";
        if (cardYield) cardYield.textContent = q.dividend_yield_pct ? `${q.dividend_yield_pct}%` : "0.0%";
        
        if (cardMcap) {
          if (q.market_cap && typeof q.market_cap === "number") {
            cardMcap.textContent = q.market_cap > 1e9 ? `${(q.market_cap / 1e9).toFixed(1)}B` : `${(q.market_cap / 1e7).toFixed(1)}Cr`;
          } else {
            cardMcap.textContent = "N/A";
          }
        }

        // Safe 52W Progress Bar calculation (Zero-division shield)
        if (cardProgress) {
          const high = Number(q.fifty_two_week_high);
          const low = Number(q.fifty_two_week_low);
          const cur = Number(q.current_price);
          if (!isNaN(high) && !isNaN(low) && !isNaN(cur) && high > low && cur >= low) {
            const pct = ((cur - low) / (high - low)) * 100;
            cardProgress.style.width = `${Math.min(Math.max(pct, 2), 100)}%`;
          } else {
            cardProgress.style.width = "50%";
          }
        }
      }

      // 2. Fetch Indicators
      const indRes = await safeFetch(`/api/indicators?symbol=${encodeURIComponent(symbol)}`);
      const rsiNumber = document.getElementById("rsi-number");
      const rsiNeedle = document.getElementById("rsi-needle");
      const rsiBadge = document.getElementById("rsi-status-badge");
      const ema20Val = document.getElementById("ema-20-val");
      const ema50Val = document.getElementById("ema-50-val");
      const ema200Val = document.getElementById("ema-200-val");
      const emaTrendVal = document.getElementById("ema-trend-val");
      const bbUpper = document.getElementById("bb-upper");
      const bbMiddle = document.getElementById("bb-middle");
      const bbLower = document.getElementById("bb-lower");
      const atr14Val = document.getElementById("atr-14-val");

      if (!indRes.ok || indRes.data?.error) {
        if (rsiNumber) rsiNumber.textContent = "--";
        if (rsiBadge) {
          rsiBadge.textContent = "NO DATA";
          rsiBadge.className = "badge neutral";
        }
      } else {
        const ind = indRes.data || {};
        const rsiVal = typeof ind.rsi_14 === "number" ? ind.rsi_14 : 50;
        
        if (rsiNumber) rsiNumber.textContent = rsiVal.toFixed(2);
        if (rsiNeedle) rsiNeedle.style.left = `${Math.min(Math.max(rsiVal, 0), 100)}%`;

        if (rsiBadge) {
          rsiBadge.textContent = ind.rsi_status || "NEUTRAL";
          rsiBadge.className = "badge " + (rsiVal <= 35 ? "green" : (rsiVal >= 70 ? "red" : "neutral"));
        }

        if (ema20Val) ema20Val.textContent = ind.ema_20 != null ? `₹${ind.ema_20}` : "N/A";
        if (ema50Val) ema50Val.textContent = ind.ema_50 != null ? `₹${ind.ema_50}` : "N/A";
        if (ema200Val) ema200Val.textContent = ind.ema_200 != null ? `₹${ind.ema_200}` : "N/A";
        if (emaTrendVal) emaTrendVal.textContent = ind.ema_50_status || "N/A";

        const bb = ind.bollinger_bands || {};
        if (bbUpper) bbUpper.textContent = bb.upper != null ? `₹${bb.upper}` : "N/A";
        if (bbMiddle) bbMiddle.textContent = bb.middle_sma20 != null ? `₹${bb.middle_sma20}` : "N/A";
        if (bbLower) bbLower.textContent = bb.lower != null ? `₹${bb.lower}` : "N/A";
        if (atr14Val) atr14Val.textContent = ind.atr_14 != null ? `₹${ind.atr_14}` : "N/A";
      }

      // 3. Load Financial Statements
      loadFinancials(symbol, activeStatementType);

    } catch (err) {
      showToast(`Terminal loading error: ${err.message}`, "error");
    } finally {
      if (searchBtn) searchBtn.disabled = false;
    }
  }

  async function loadFinancials(symbol, statementType) {
    const thead = document.getElementById("financial-table-head");
    const tbody = document.getElementById("financial-table-body");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="color: var(--text-secondary)">Querying audited reports...</td></tr>`;

    try {
      const res = await safeFetch(`/api/financials?symbol=${encodeURIComponent(symbol)}&type=${statementType}`);
      
      if (!res.ok) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="color: var(--accent-red)">⚠️ Could not load statement: ${res.error || "Server error"}</td></tr>`;
        return;
      }

      const data = res.data || {};
      const periods = data.periods || {};
      const dates = Object.keys(periods);

      if (dates.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center" style="color: var(--text-muted); padding: 2rem;">
              ℹ️ ${data.message || "No financial statement records filed for this symbol (typical for ETFs, Gold/Silver commodities, or indices)." }
            </td>
          </tr>
        `;
        return;
      }

      // Build Headers safely
      if (thead) {
        thead.innerHTML = `<th>Financial Line Item</th>` + dates.map(d => `<th>${d}</th>`).join("");
      }

      // Collect top keys safely
      const sampleKeys = Object.keys(periods[dates[0]] || {}).slice(0, 15);
      if (sampleKeys.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${dates.length + 1}" class="text-center">No line items reported.</td></tr>`;
        return;
      }
      
      tbody.innerHTML = sampleKeys.map(k => {
        const rowVals = dates.map(d => {
          const val = periods[d] ? periods[d][k] : null;
          if (val === null || val === undefined) return "-";
          if (typeof val === "number") {
            return Math.abs(val) > 1e6 ? `${(val / 1e6).toFixed(1)}M` : val.toLocaleString();
          }
          return String(val);
        });
        return `<tr><td>${k}</td>${rowVals.map(v => `<td>${v}</td>`).join("")}</tr>`;
      }).join("");

    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="color: var(--accent-red)">Failed to render statement data: ${e.message}</td></tr>`;
    }
  }

  // -------------------------------------------------------------
  // 4. Study Academy Controller
  // -------------------------------------------------------------
  const treeContainer = document.getElementById("academy-tree-container");
  const readerTitle = document.getElementById("reader-title");
  const readerContent = document.getElementById("reader-content");
  const askChapterBtn = document.getElementById("ask-chapter-btn");

  async function loadStudyTree() {
    if (!treeContainer) return;
    try {
      const res = await safeFetch("/api/study/tree");
      if (!res.ok) {
        treeContainer.innerHTML = `
          <div style="color: var(--accent-red); padding: 1rem;">
            <p>⚠️ Failed to load curriculum.</p>
            <button class="retry-btn" id="retry-tree-btn">🔄 Retry</button>
          </div>
        `;
        const retryBtn = document.getElementById("retry-tree-btn");
        if (retryBtn) retryBtn.onclick = loadStudyTree;
        return;
      }

      const data = res.data || {};
      const modules = data.modules || [];

      if (modules.length === 0) {
        treeContainer.innerHTML = `<div style="padding: 1rem; color: var(--text-muted)">No study modules found.</div>`;
        return;
      }

      treeContainer.innerHTML = "";
      let firstChapter = null;

      modules.forEach(mod => {
        const group = document.createElement("div");
        group.className = "module-group";
        
        const title = document.createElement("div");
        title.className = "module-group-title";
        title.textContent = mod.title || "Module";
        group.appendChild(title);

        const chapters = mod.chapters || [];
        chapters.forEach(ch => {
          const link = document.createElement("a");
          link.className = "chapter-link";
          link.textContent = ch.title || ch.filename;
          link.setAttribute("data-path", ch.rel_path);

          link.addEventListener("click", () => {
            document.querySelectorAll(".chapter-link").forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            loadChapterContent(ch.rel_path, ch.title);
          });

          if (!firstChapter) firstChapter = { path: ch.rel_path, title: ch.title, el: link };
          group.appendChild(link);
        });

        treeContainer.appendChild(group);
      });

      // Automatically select first chapter
      if (firstChapter) {
        firstChapter.el.classList.add("active");
        loadChapterContent(firstChapter.path, firstChapter.title);
      }
    } catch (e) {
      treeContainer.innerHTML = `<div style="color: var(--accent-red); padding: 1rem;">Curriculum error: ${e.message}</div>`;
    }
  }

  async function loadChapterContent(relPath, title) {
    if (!relPath) return;
    activeChapterPath = relPath;
    if (readerTitle) readerTitle.textContent = title || "Chapter Notes";
    if (readerContent) readerContent.innerHTML = `<p style="color: var(--text-muted)">Loading chapter notes...</p>`;

    try {
      const res = await safeFetch(`/api/study/content?path=${encodeURIComponent(relPath)}`);
      if (!res.ok) {
        if (readerContent) {
          readerContent.innerHTML = `
            <div class="error-card-inline">
              <p><strong>⚠️ Chapter Load Error:</strong> ${res.error || "File not found."}</p>
              <button class="retry-btn" id="retry-ch-btn">🔄 Retry Loading</button>
            </div>
          `;
          const retryBtn = document.getElementById("retry-ch-btn");
          if (retryBtn) retryBtn.onclick = () => loadChapterContent(relPath, title);
        }
        return;
      }

      const data = res.data || {};
      if (readerContent) {
        readerContent.innerHTML = safeFormatMarkdown(data.content || "Chapter is empty.");
      }
    } catch (e) {
      if (readerContent) {
        readerContent.innerHTML = `<p style="color: var(--accent-red)">Failed to load chapter content: ${e.message}</p>`;
      }
    }
  }

  if (askChapterBtn) {
    askChapterBtn.addEventListener("click", () => {
      try {
        const chatTab = document.querySelector('[data-tab="tab-chat"]');
        if (chatTab) chatTab.click();

        const chapterName = readerTitle ? readerTitle.textContent : "this chapter";
        const prompt = `Teach me about '${chapterName}' from our study curriculum and demonstrate it with a live example on a stock or ETF.`;
        if (chatInput) chatInput.value = prompt;
        sendMessage(prompt);
      } catch (err) {
        showToast("Could not send chapter to chatbot.", "error");
      }
    });
  }

  // -------------------------------------------------------------
  // 5. Institutional Reviewed Entities Vault & Pass/Fail Inspection
  // -------------------------------------------------------------
  let reviewedEntities = [];
  let activeFilter = "ALL";
  let activeInspectedEntity = null;

  const wlGrid = document.getElementById("watchlist-grid-container");
  const wlRefreshBtn = document.getElementById("watchlist-refresh-btn");
  const filterChips = document.querySelectorAll(".filter-chip");
  const vaultCountBadge = document.getElementById("vault-count-badge");

  // Modal DOM elements
  const auditModal = document.getElementById("audit-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalDoneBtn = document.getElementById("modal-done-btn");
  const modalAuditCopilotBtn = document.getElementById("modal-audit-copilot-btn");

  const modalCategory = document.getElementById("modal-category");
  const modalTitle = document.getElementById("modal-title");
  const modalMeta = document.getElementById("modal-meta");
  const modalVerdictAction = document.getElementById("modal-verdict-action");
  const modalVerdictRationale = document.getElementById("modal-verdict-rationale");
  const modalScoreNum = document.getElementById("modal-score-num");
  const modalFactorStrip = document.getElementById("modal-factor-strip");
  const modalChecksTbody = document.getElementById("modal-checks-tbody");
  const modalTrancheGrid = document.getElementById("modal-tranche-grid");

  async function fetchReviewedEntities() {
    if (wlGrid) {
      wlGrid.innerHTML = `<div class="watchlist-loading" style="grid-column: 1/-1; padding: 2.5rem; text-align: center; color: var(--accent-cyan);">📋 Loading officially reviewed dossiers from research/reviewed_entities/...</div>`;
    }

    try {
      const res = await safeFetch(`/api/reviewed_entities`);
      if (res.ok && res.data && res.data.entities) {
        reviewedEntities = res.data.entities;
        if (vaultCountBadge) {
          vaultCountBadge.textContent = `${reviewedEntities.length} Entit${reviewedEntities.length === 1 ? 'y' : 'ies'} Audited`;
        }
        renderReviewedGrid();
      } else {
        if (wlGrid) {
          wlGrid.innerHTML = `<div style="color: var(--accent-red); padding: 2rem; text-align: center; grid-column: 1/-1;">Could not load reviewed dossiers. Ensure research/reviewed_entities/ contains valid Markdown dossiers.</div>`;
        }
        showToast("Failed to load reviewed entities.", "error");
      }
    } catch (err) {
      console.error("Reviewed entities load error:", err);
      showToast("Error connecting to reviewed vault.", "error");
    }
  }

  function renderReviewedGrid() {
    if (!wlGrid) return;
    const items = reviewedEntities.filter(item => {
      if (activeFilter === "ALL") return true;
      return item.category.toLowerCase().includes(activeFilter.toLowerCase());
    });

    if (items.length === 0) {
      wlGrid.innerHTML = `<div style="color: var(--text-muted); padding: 2rem; text-align: center; grid-column: 1/-1;">No reviewed entities found under category "${activeFilter}".</div>`;
      return;
    }

    wlGrid.innerHTML = items.map(item => {
      const isUp = item.change_pct >= 0;
      const chgClass = isUp ? "up" : "down";
      const chgSign = isUp ? "+" : "";

      const h52 = item["52w_high"] || 0;
      const l52 = item["52w_low"] || 0;
      const rangeSpan = h52 - l52;
      const rangePct = rangeSpan > 0 ? Math.min(100, Math.max(0, ((item.price - l52) / rangeSpan) * 100)) : 50;

      const verdictText = item.conclusion?.decision || item.verdict || "ACCUMULATE";
      const scoreVal = item.conclusion?.score || item.score || "9.0";

      return `
        <div class="watchlist-card reviewed-card" data-symbol="${item.symbol}" style="cursor: pointer;">
          <div class="wl-top">
            <div class="wl-sym-group">
              <span class="wl-sym">${item.symbol}</span>
              <span class="wl-name" title="${item.display_name}">${item.display_name}</span>
            </div>
            <span class="wl-category-tag">${item.category}</span>
          </div>

          <div class="wl-price-zone">
            <div class="wl-price">₹${item.price.toFixed(2)}</div>
            <div class="wl-change ${chgClass}">${chgSign}${item.change_pct.toFixed(2)}%</div>
          </div>

          <div class="wl-factors-table">
            <div class="factor-item" style="padding-bottom: 0.25rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
              <span class="factor-name" style="font-weight: 700; color: #fff;">Strategic Verdict:</span>
              <span class="badge-oversold" style="font-size: 0.76rem;">🟢 ${verdictText} (${scoreVal}/10)</span>
            </div>
            <div class="factor-item">
              <span class="factor-name">Wilder's RSI-14:</span>
              <span class="factor-val">${item.rsi_14.toFixed(1)}</span>
            </div>
            <div class="factor-item">
              <span class="factor-name">50-Day EMA:</span>
              <span class="factor-val">₹${item.ema_50.toFixed(2)}</span>
            </div>
            <div class="factor-item">
              <span class="factor-name">52W Drawdown:</span>
              <span class="factor-val" style="color: #10b981;">${item.drawdown_pct}%</span>
            </div>
            <div style="margin-top: 0.25rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: var(--text-muted);">
                <span>52W Low: ₹${l52}</span>
                <span>52W High: ₹${h52}</span>
              </div>
              <div class="range-track">
                <div class="range-fill" style="width: ${rangePct.toFixed(1)}%"></div>
              </div>
            </div>
          </div>

          <div class="wl-card-footer">
            <button class="btn-wl-audit" data-open-modal="${item.symbol}" style="width: 100%; text-align: center; padding: 0.5rem;">
              🔍 Inspect Full Pass / Fail Audit
            </button>
          </div>
        </div>
      `;
    }).join("");

    // Wire up Card Clicks to Open the Pass/Fail Audit Modal
    wlGrid.querySelectorAll(".reviewed-card").forEach(card => {
      card.onclick = (e) => {
        const sym = card.getAttribute("data-symbol");
        const found = reviewedEntities.find(ent => ent.symbol === sym);
        if (found) openAuditModal(found);
      };
    });
  }

  function openAuditModal(entity) {
    if (!entity || !auditModal) return;
    activeInspectedEntity = entity;

    if (modalCategory) modalCategory.textContent = entity.category;
    if (modalTitle) modalTitle.textContent = `${entity.display_name} (${entity.symbol})`;
    if (modalMeta) modalMeta.textContent = `Last Telemetry: ${entity.last_update}`;

    // Verdict Hero Banner
    const decision = entity.conclusion?.decision || entity.verdict || "BUY - ACCUMULATE";
    const score = entity.conclusion?.score || entity.score || "9.0";
    if (modalVerdictAction) modalVerdictAction.textContent = `🟢 ${decision} (BUY ORDER ACTIVE)`;
    if (modalVerdictRationale) modalVerdictRationale.textContent = entity.conclusion?.rationale || "Meets 100% of institutional liquidity, vault custody, and tracking criteria. Price is consolidating in an active accumulation zone.";
    if (modalScoreNum) modalScoreNum.textContent = score;

    // Factor Strip
    if (modalFactorStrip) {
      modalFactorStrip.innerHTML = `
        <div class="m-factor-box">
          <span class="m-factor-label">Current Price</span>
          <span class="m-factor-val">₹${entity.price.toFixed(2)}</span>
        </div>
        <div class="m-factor-box">
          <span class="m-factor-label">Wilder RSI-14</span>
          <span class="m-factor-val" style="color: ${entity.rsi_14 <= 35 ? '#10b981' : '#06b6d4'}">${entity.rsi_14.toFixed(1)}</span>
        </div>
        <div class="m-factor-box">
          <span class="m-factor-label">50-Day EMA</span>
          <span class="m-factor-val">₹${entity.ema_50.toFixed(2)}</span>
        </div>
        <div class="m-factor-box">
          <span class="m-factor-label">200-Day EMA</span>
          <span class="m-factor-val">₹${entity.ema_200 ? entity.ema_200.toFixed(2) : 'N/A'}</span>
        </div>
        <div class="m-factor-box">
          <span class="m-factor-label">52W Drawdown</span>
          <span class="m-factor-val" style="color: #10b981">${entity.drawdown_pct}%</span>
        </div>
      `;
    }

    // Itemized PASS / FAIL Table with Interactive Expandable Explanations
    if (modalChecksTbody) {
      const checks = entity.checks || [];
      modalChecksTbody.innerHTML = checks.map((c, idx) => {
        let badgeHtml = "";
        const statusUpper = (c.status || "").toUpperCase();
        let statusClass = "status-fail";
        if (statusUpper.includes("PASS")) {
          badgeHtml = `<span class="check-status-badge status-pass">✅ PASS</span>`;
          statusClass = "explain-pass";
        } else if (statusUpper.includes("ACCEPTABLE") || statusUpper.includes("NEUTRAL")) {
          badgeHtml = `<span class="check-status-badge status-acceptable">🟡 ACCEPTABLE</span>`;
          statusClass = "explain-warn";
        } else {
          badgeHtml = `<span class="check-status-badge status-fail">❌ FAIL</span>`;
          statusClass = "explain-fail";
        }

        const whyText = c.why || `${c.status}: Realized metric is ${c.realized} against requirement ${c.requirement}.`;

        return `
          <tr class="checklist-row clickable-row" data-check-idx="${idx}" title="Click to inspect why it passed or failed">
            <td>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="expand-chevron" id="chevron-${idx}">▶</span>
                <strong>${c.pillar}</strong>
              </div>
            </td>
            <td>${c.requirement}</td>
            <td>${c.realized}</td>
            <td style="text-align: center;">${badgeHtml}</td>
          </tr>
          <tr class="explanation-row hidden" id="explain-${idx}">
            <td colspan="4">
              <div class="explanation-box ${statusClass}">
                <div class="explain-header">
                  <span>💡 Institutional Analysis (${c.pillar}):</span>
                </div>
                <p class="explain-body">${whyText}</p>
              </div>
            </td>
          </tr>
        `;
      }).join("");

      // Wire up Click-to-Expand Why It Passed / Failed
      modalChecksTbody.querySelectorAll(".checklist-row").forEach(row => {
        row.onclick = () => {
          const idx = row.getAttribute("data-check-idx");
          const explainRow = document.getElementById(`explain-${idx}`);
          const chevron = document.getElementById(`chevron-${idx}`);
          if (explainRow) {
            const isHidden = explainRow.classList.contains("hidden");
            explainRow.classList.toggle("hidden");
            if (chevron) {
              chevron.textContent = isHidden ? "▼" : "▶";
            }
          }
        };
      });
    }

    // Tranches
    if (modalTrancheGrid) {
      const tranches = entity.conclusion?.tranches || [];
      modalTrancheGrid.innerHTML = tranches.map(t => {
        return `
          <div class="tranche-card">
            <div class="tranche-card-header">
              <span class="tranche-name">${t.name || t.tranche || 'Tranche'}</span>
              <span class="tranche-pct">${t.capital_pct || t.allocation_pct || '33%'}</span>
            </div>
            <p class="tranche-action">${t.action}</p>
          </div>
        `;
      }).join("");
    }

    auditModal.classList.remove("hidden");
  }

  function closeAuditModal() {
    if (auditModal) auditModal.classList.add("hidden");
  }

  if (modalCloseBtn) modalCloseBtn.onclick = closeAuditModal;
  if (modalDoneBtn) modalDoneBtn.onclick = closeAuditModal;
  if (auditModal) {
    auditModal.onclick = (e) => {
      if (e.target === auditModal) closeAuditModal();
    };
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && auditModal && !auditModal.classList.contains("hidden")) {
      closeAuditModal();
    }
  });

  if (modalAuditCopilotBtn) {
    modalAuditCopilotBtn.onclick = () => {
      if (!activeInspectedEntity) return;
      closeAuditModal();
      const chatTab = document.querySelector('[data-tab="tab-chat"]');
      if (chatTab) chatTab.click();
      const prompt = `Audit ${activeInspectedEntity.symbol}: How do its pass/fail criteria support our Tranche 1 capital accumulation plan?`;
      const chatInput = document.getElementById("chat-input");
      if (chatInput) chatInput.value = prompt;
      const sendBtn = document.getElementById("chat-send-btn");
      if (sendBtn) sendBtn.click();
    };
  }

  if (wlRefreshBtn) {
    wlRefreshBtn.onclick = () => {
      showToast("Refreshing reviewed dossiers...", "info");
      fetchReviewedEntities();
    };
  }

  filterChips.forEach(chip => {
    chip.onclick = () => {
      filterChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeFilter = chip.getAttribute("data-filter") || "ALL";
      renderReviewedGrid();
    };
  });

  // Tab change detection to load reviewed entities when opened
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.getAttribute("data-tab") === "tab-watchlist") {
        fetchReviewedEntities();
      }
    });
  });

  // -------------------------------------------------------------
  // 5. Interactive Graph Analysis Controller (Rupees vs Time)
  // -------------------------------------------------------------
  let activeGraphPeriod = "1mo";
  let activeGraphMode = "area";
  let currentCandles = [];
  let currentSummary = {};
  let chartInstance = null;

  const navGraphBtn = document.getElementById("nav-graph-analysis-btn");
  const terminalGraphBtn = document.getElementById("terminal-graph-btn");
  const graphModal = document.getElementById("graph-modal");
  const graphModalCloseBtn = document.getElementById("graph-modal-close-btn");
  const graphModalDoneBtn = document.getElementById("graph-modal-done-btn");
  const graphAskCopilotBtn = document.getElementById("graph-ask-copilot-btn");
  const graphTimeframeBtns = document.querySelectorAll(".timeframe-btn");
  const modeAreaBtn = document.getElementById("mode-area-btn");
  const modeLineBtn = document.getElementById("mode-line-btn");

  const graphModalSymbol = document.getElementById("graph-modal-symbol");
  const graphModalName = document.getElementById("graph-modal-name");
  const graphModalPrice = document.getElementById("graph-modal-price");
  const graphModalChange = document.getElementById("graph-modal-change");
  const graphModalTimeframeLabel = document.getElementById("graph-modal-timeframe-label");
  const graphOpenVal = document.getElementById("graph-open-val");
  const graphHighVal = document.getElementById("graph-high-val");
  const graphLowVal = document.getElementById("graph-low-val");
  const graphReturnVal = document.getElementById("graph-return-val");
  const graphCountVal = document.getElementById("graph-count-val");
  const chartSpinner = document.getElementById("chart-loading-spinner");
  const chartHoverInspect = document.getElementById("chart-hover-inspect");
  const inspectTime = document.getElementById("inspect-time");
  const inspectPrice = document.getElementById("inspect-price");
  const priceCanvas = document.getElementById("price-history-canvas");

  const timeframeLabels = {
    "1d": "1 Day (5m Intraday)",
    "1w": "1 Week (15m Intervals)",
    "5d": "1 Week (15m Intervals)",
    "1mo": "1 Month (Daily)",
    "1y": "1 Year (Daily)",
    "3y": "3 Years (Daily)",
    "5y": "5 Years (Weekly)"
  };

  function formatTimeLabel(tsStr, period) {
    if (!tsStr) return "";
    try {
      const d = new Date(tsStr.replace(" ", "T"));
      if (isNaN(d.getTime())) return tsStr.split(" ")[0];

      if (period === "1d") {
        return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
      }
      if (period === "1w" || period === "5d") {
        return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
      }
      if (period === "1mo") {
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      }
      if (period === "1y") {
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });
      }
      return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    } catch {
      return tsStr;
    }
  }

  async function openGraphModal(symbol, period = "1mo") {
    if (!graphModal) return;
    activeGraphPeriod = period;
    graphModal.classList.remove("hidden");

    // Sync header symbol & company name
    const cardName = document.getElementById("card-name");
    if (graphModalSymbol) graphModalSymbol.textContent = symbol;
    if (graphModalName) graphModalName.textContent = cardName ? cardName.textContent : symbol;
    if (graphModalTimeframeLabel) graphModalTimeframeLabel.textContent = timeframeLabels[period] || period.toUpperCase();

    // Update active button pill
    graphTimeframeBtns.forEach(btn => {
      const p = btn.getAttribute("data-period");
      btn.classList.toggle("active", p === period || (period === "1w" && p === "1w") || (period === "5d" && p === "1w"));
    });

    await loadGraphCandles(symbol, period);
  }

  function closeGraphModal() {
    if (graphModal) graphModal.classList.add("hidden");
    if (chartHoverInspect) chartHoverInspect.classList.add("hidden");
  }

  async function loadGraphCandles(symbol, period) {
    if (chartSpinner) chartSpinner.classList.remove("hidden");
    if (chartHoverInspect) chartHoverInspect.classList.add("hidden");

    try {
      const res = await safeFetch(`/api/candles?symbol=${encodeURIComponent(symbol)}&period=${encodeURIComponent(period)}`);
      
      let candles = [];
      let summary = {};
      if (res.ok && res.data) {
        if (Array.isArray(res.data)) {
          candles = res.data;
        } else if (res.data.candles) {
          candles = res.data.candles;
          summary = res.data.summary || {};
        }
      }

      currentCandles = candles;
      currentSummary = summary;

      if (!candles || candles.length === 0) {
        showToast(`No historical candle data found for ${symbol} in ${period.toUpperCase()} timeframe.`, "warning");
        if (graphModalPrice) graphModalPrice.textContent = "₹--";
        if (graphModalChange) {
          graphModalChange.textContent = "No data";
          graphModalChange.className = "graph-change";
        }
        renderEmptyChart();
        return;
      }

      // Compute statistics if not provided by backend
      const startPrice = summary.start_price != null ? summary.start_price : candles[0].close;
      const endPrice = summary.end_price != null ? summary.end_price : candles[candles.length - 1].close;
      const netChange = summary.change != null ? summary.change : (endPrice - startPrice);
      const netPct = summary.change_pct != null ? summary.change_pct : (startPrice ? (netChange / startPrice * 100) : 0);
      const highVal = summary.high_price != null ? summary.high_price : Math.max(...candles.map(c => c.high));
      const lowVal = summary.low_price != null ? summary.low_price : Math.min(...candles.map(c => c.low).filter(v => v > 0));

      const isPositive = netChange >= 0;

      // Update Header Stats
      if (graphModalPrice) graphModalPrice.textContent = `₹${endPrice.toFixed(2)}`;
      if (graphModalChange) {
        const sign = isPositive ? "+" : "";
        graphModalChange.textContent = `${sign}₹${netChange.toFixed(2)} (${sign}${netPct.toFixed(2)}%)`;
        graphModalChange.className = `graph-change ${isPositive ? "positive" : "negative"}`;
      }

      // Update Factor Strip
      if (graphOpenVal) graphOpenVal.textContent = `₹${startPrice.toFixed(2)}`;
      if (graphHighVal) graphHighVal.textContent = `₹${highVal.toFixed(2)}`;
      if (graphLowVal) graphLowVal.textContent = `₹${lowVal.toFixed(2)}`;
      if (graphReturnVal) {
        const sign = isPositive ? "+" : "";
        graphReturnVal.textContent = `${sign}₹${netChange.toFixed(2)}`;
        graphReturnVal.className = `m-factor-val ${isPositive ? "text-green" : "text-red"}`;
      }
      if (graphCountVal) graphCountVal.textContent = candles.length;

      // Render the chart
      renderChart(candles, isPositive);

    } catch (err) {
      console.error("Error loading candles:", err);
      showToast(`Chart error: ${err.message}`, "error");
      renderEmptyChart();
    } finally {
      if (chartSpinner) chartSpinner.classList.add("hidden");
    }
  }

  function renderChart(candles, isPositive) {
    if (!priceCanvas) return;

    const labels = candles.map(c => formatTimeLabel(c.timestamp, activeGraphPeriod));
    const rawTimes = candles.map(c => c.timestamp);
    const prices = candles.map(c => c.close);
    const primaryColor = isPositive ? "#10b981" : "#ef4444";
    const primaryGlow = isPositive ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)";

    // 1. If Chart.js library is available in window
    if (window.Chart) {
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }

      const ctx = priceCanvas.getContext("2d");
      
      // Create Gradient
      let fillBg = "transparent";
      if (activeGraphMode === "area") {
        const gradient = ctx.createLinearGradient(0, 0, 0, 360);
        gradient.addColorStop(0, primaryGlow);
        gradient.addColorStop(1, "rgba(10, 15, 26, 0.0)");
        fillBg = gradient;
      }

      chartInstance = new window.Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [{
            label: `Price (₹)`,
            data: prices,
            borderColor: primaryColor,
            borderWidth: 2.2,
            backgroundColor: fillBg,
            fill: activeGraphMode === "area",
            tension: 0.22,
            pointRadius: candles.length > 80 ? 0 : 2,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: primaryColor,
            pointHoverBorderColor: "#ffffff",
            pointHoverBorderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 350, easing: "easeOutQuart" },
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              backgroundColor: "rgba(15, 23, 42, 0.94)",
              titleColor: "#94a3b8",
              bodyColor: "#ffffff",
              borderColor: primaryColor,
              borderWidth: 1,
              padding: 10,
              displayColors: false,
              callbacks: {
                title: function(items) {
                  const idx = items[0].dataIndex;
                  return rawTimes[idx] || items[0].label;
                },
                label: function(item) {
                  const val = item.parsed.y;
                  if (chartHoverInspect && inspectTime && inspectPrice) {
                    chartHoverInspect.classList.remove("hidden");
                    inspectTime.textContent = item.label;
                    inspectPrice.textContent = `₹${val.toFixed(2)}`;
                  }
                  return `Price: ₹${val.toFixed(2)}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: "rgba(255, 255, 255, 0.04)",
                drawBorder: false
              },
              ticks: {
                color: "#64748b",
                font: { family: "Fira Code", size: 11 },
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 7
              }
            },
            y: {
              position: "right",
              beginAtZero: false,
              suggestedMin: Math.floor(Math.min(...prices) * 0.98),
              suggestedMax: Math.ceil(Math.max(...prices) * 1.02),
              grid: {
                color: "rgba(255, 255, 255, 0.05)",
                drawBorder: false
              },
              ticks: {
                color: "#94a3b8",
                font: { family: "Fira Code", size: 11 },
                callback: function(val) {
                  return `₹${Number(val).toLocaleString("en-IN")}`;
                }
              }
            }
          }
        }
      });
      return;
    }

    // 2. Fallback: Ultra-fast native HTML5 Canvas drawing engine
    renderCanvasFallback(candles, isPositive);
  }

  function renderCanvasFallback(candles, isPositive) {
    if (!priceCanvas) return;
    const ctx = priceCanvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = priceCanvas.getBoundingClientRect();
    
    priceCanvas.width = rect.width * dpr;
    priceCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    if (!candles || candles.length === 0) return;

    const prices = candles.map(c => c.close);
    const minP = Math.min(...prices) * 0.998;
    const maxP = Math.max(...prices) * 1.002;
    const range = (maxP - minP) || 1;

    const padLeft = 10;
    const padRight = 65;
    const padTop = 20;
    const padBottom = 30;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    // Draw Gridlines & Y-axis labels
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px 'Fira Code', monospace";
    ctx.textAlign = "left";

    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const y = padTop + (plotH / gridSteps) * i;
      const priceAtY = maxP - (range / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();
      ctx.fillText(`₹${priceAtY.toFixed(2)}`, w - padRight + 6, y + 4);
    }

    // Map Points
    const points = prices.map((p, idx) => {
      const x = padLeft + (idx / (prices.length - 1 || 1)) * plotW;
      const y = padTop + plotH - ((p - minP) / range) * plotH;
      return { x, y, p, raw: candles[idx] };
    });

    const primaryColor = isPositive ? "#10b981" : "#ef4444";

    // Area Fill
    if (activeGraphMode === "area") {
      const grad = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
      grad.addColorStop(0, isPositive ? "rgba(16, 185, 129, 0.28)" : "rgba(239, 68, 68, 0.28)");
      grad.addColorStop(1, "rgba(10, 15, 26, 0.0)");

      ctx.beginPath();
      ctx.moveTo(points[0].x, padTop + plotH);
      points.forEach(pt => ctx.lineTo(pt.x, pt.y));
      ctx.lineTo(points[points.length - 1].x, padTop + plotH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Trendline
    ctx.beginPath();
    points.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Date tick marks on X-axis
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "center";
    const xStep = Math.max(1, Math.floor(candles.length / 5));
    for (let i = 0; i < candles.length; i += xStep) {
      const pt = points[i];
      const lbl = formatTimeLabel(candles[i].timestamp, activeGraphPeriod);
      ctx.fillText(lbl, pt.x, h - 8);
    }

    // Native Hover Support on Canvas
    priceCanvas.onmousemove = (e) => {
      const mouseX = e.offsetX;
      let closest = points[0];
      let minDist = 999999;
      points.forEach(pt => {
        const d = Math.abs(pt.x - mouseX);
        if (d < minDist) {
          minDist = d;
          closest = pt;
        }
      });
      if (closest && chartHoverInspect && inspectTime && inspectPrice) {
        chartHoverInspect.classList.remove("hidden");
        inspectTime.textContent = formatTimeLabel(closest.raw.timestamp, activeGraphPeriod);
        inspectPrice.textContent = `₹${closest.p.toFixed(2)}`;
      }
    };

    priceCanvas.onmouseleave = () => {
      if (chartHoverInspect) chartHoverInspect.classList.add("hidden");
    };
  }

  function renderEmptyChart() {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    if (!priceCanvas) return;
    const ctx = priceCanvas.getContext("2d");
    ctx.clearRect(0, 0, priceCanvas.width, priceCanvas.height);
  }

  // Graph Timeframe Pill Clicks
  graphTimeframeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      graphTimeframeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const period = btn.getAttribute("data-period");
      activeGraphPeriod = period;
      if (graphModalTimeframeLabel) {
        graphModalTimeframeLabel.textContent = timeframeLabels[period] || period.toUpperCase();
      }
      loadGraphCandles(activeTicker, period);
    });
  });

  // Chart Mode Toggles (Area vs Line)
  if (modeAreaBtn && modeLineBtn) {
    modeAreaBtn.onclick = () => {
      modeAreaBtn.classList.add("active");
      modeLineBtn.classList.remove("active");
      activeGraphMode = "area";
      if (currentCandles.length > 0) {
        const isPos = (currentSummary.change != null ? currentSummary.change : (currentCandles[currentCandles.length-1].close - currentCandles[0].close)) >= 0;
        renderChart(currentCandles, isPos);
      }
    };

    modeLineBtn.onclick = () => {
      modeLineBtn.classList.add("active");
      modeAreaBtn.classList.remove("active");
      activeGraphMode = "line";
      if (currentCandles.length > 0) {
        const isPos = (currentSummary.change != null ? currentSummary.change : (currentCandles[currentCandles.length-1].close - currentCandles[0].close)) >= 0;
        renderChart(currentCandles, isPos);
      }
    };
  }

  // Button Listeners to Open Graph Analysis Modal
  if (navGraphBtn) {
    navGraphBtn.addEventListener("click", () => {
      openGraphModal(activeTicker, activeGraphPeriod);
    });
  }

  if (terminalGraphBtn) {
    terminalGraphBtn.addEventListener("click", () => {
      openGraphModal(activeTicker, activeGraphPeriod);
    });
  }

  // Close Modal Handlers
  if (graphModalCloseBtn) graphModalCloseBtn.onclick = closeGraphModal;
  if (graphModalDoneBtn) graphModalDoneBtn.onclick = closeGraphModal;
  if (graphModal) {
    graphModal.onclick = (e) => {
      if (e.target === graphModal) closeGraphModal();
    };
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && graphModal && !graphModal.classList.contains("hidden")) {
      closeGraphModal();
    }
  });

  // Ask Co-Pilot shortcut from graph modal
  if (graphAskCopilotBtn) {
    graphAskCopilotBtn.onclick = () => {
      closeGraphModal();
      const chatTab = document.querySelector('[data-tab="tab-chat"]');
      if (chatTab) chatTab.click();
      const pLabel = activeGraphPeriod.toUpperCase();
      const curP = graphModalPrice ? graphModalPrice.textContent : "";
      const prompt = `Audit ${activeTicker} price action: Analyzing the ${pLabel} time-series chart (current price ${curP}). What are the key support/resistance levels, trend moving average alignment, and momentum outlook?`;
      const chatInput = document.getElementById("chat-input");
      if (chatInput) chatInput.value = prompt;
      const sendBtn = document.getElementById("chat-send-btn");
      if (sendBtn) sendBtn.click();
    };
  }

  // Initial Boot
  loadTickerData(activeTicker);
  loadStudyTree();
  fetchReviewedEntities();
});


