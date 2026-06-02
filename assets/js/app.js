const iconMenu = `
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <path d="M4 7h16"></path>
    <path d="M4 12h16"></path>
    <path d="M4 17h16"></path>
  </svg>
`;

const iconClose = `
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </svg>
`;

function normalizeAddress(value) {
  return value.trim().replace(/\s/g, "");
}

function isLikelyWalletAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(value) || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
}

function updateSearchMode(mode) {
  const input = document.querySelector("[data-global-search-input]");
  const hint = document.querySelector("[data-search-hint]");
  const tabs = document.querySelectorAll("[data-search-mode]");

  tabs.forEach((tab) => {
    const active = tab.dataset.searchMode === mode;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  if (!input || !hint) return;

  const copy = {
    wallet: {
      placeholder: "输入钱包地址，例如 0x... 或 Solana 地址",
      hint: "输入钱包地址后会进入钱包调查报告页。"
    },
    whale: {
      placeholder: "输入巨鲸地址、Token 或交易方向，例如 ETH buy",
      hint: "巨鲸搜索会定位到 Top Whale Buys / Sells。"
    },
    trader: {
      placeholder: "输入交易员名称、KOL 或公开钱包",
      hint: "交易员搜索会定位到热门交易员榜和后续调查入口。"
    }
  };

  input.dataset.mode = mode;
  input.placeholder = copy[mode].placeholder;
  hint.textContent = copy[mode].hint;
}

function formatUsd(value) {
  if (!Number.isFinite(value)) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 100 ? 0 : 2
  }).format(value);
}

function renderMarketFallback() {
  const fallback = {
    bitcoin: ["$--", "等待数据"],
    ethereum: ["$--", "等待数据"],
    solana: ["$--", "等待数据"],
    binancecoin: ["$--", "等待数据"]
  };

  Object.entries(fallback).forEach(([coin, values]) => {
    const card = document.querySelector(`[data-coin="${coin}"]`);
    if (!card) return;
    card.querySelector("[data-price]").textContent = values[0];
    card.querySelector("[data-change]").textContent = values[1];
  });
}

function initDirectoryQuery() {
  const target = document.querySelector("[data-directory-query]");
  if (!target) return;

  const query = new URLSearchParams(window.location.search).get("query");
  if (query) {
    target.textContent = `正在查看与「${query}」相关的情报。`;
  }
}

async function loadMarketOverview() {
  const marketStatus = document.querySelector("[data-market-status]");
  const cards = document.querySelectorAll("[data-coin]");
  if (!marketStatus || !cards.length) return;

  try {
    const ids = Array.from(cards).map((card) => card.dataset.coin).join(",");
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`, {
      headers: { accept: "application/json" }
    });
    if (!response.ok) throw new Error("market request failed");
    const data = await response.json();

    cards.forEach((card) => {
      const coin = card.dataset.coin;
      const item = data[coin] || {};
      const change = Number(item.usd_24h_change);
      const price = Number(item.usd);
      const changeNode = card.querySelector("[data-change]");
      card.querySelector("[data-price]").textContent = formatUsd(price);
      changeNode.textContent = Number.isFinite(change) ? `${change >= 0 ? "+" : ""}${change.toFixed(2)}%` : "--";
      changeNode.classList.toggle("positive", change >= 0);
      changeNode.classList.toggle("negative", change < 0);
    });

    marketStatus.textContent = "价格来自公开市场数据源，页面会自动降级显示。";
  } catch {
    renderMarketFallback();
    marketStatus.textContent = "市场数据暂时不可用，稍后会自动恢复。";
  }
}

function initSite() {
  document.documentElement.dataset.appReady = "true";

  const menuButton = document.querySelector("[data-menu-button]");
  const navLinks = document.querySelector("[data-nav-links]");
  const walletForm = document.querySelector("[data-wallet-form]");
  const walletInput = document.querySelector("[data-wallet-input]");
  const resultItems = document.querySelectorAll("[data-result-item]");
  const globalSearchForm = document.querySelector("[data-global-search-form]");
  const globalSearchInput = document.querySelector("[data-global-search-input]");

  if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      document.body.classList.toggle("menu-open", isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.innerHTML = isOpen ? iconClose : iconMenu;
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        document.body.classList.remove("menu-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.innerHTML = iconMenu;
      });
    });
  }

  if (walletForm && walletInput) {
    walletForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const address = normalizeAddress(walletInput.value);
      const valid = isLikelyWalletAddress(address);

      resultItems.forEach((item, index) => {
        const score = item.querySelector("[data-score]");
        if (!score) return;

        if (!address) {
          score.textContent = index === 0 ? "ready" : "idle";
          return;
        }

        if (!valid) {
          score.textContent = index === 0 ? "check" : "hold";
          return;
        }

        const scores = ["91%", "7 links", "low"];
        score.textContent = scores[index] || "ok";
      });

      walletInput.setAttribute("aria-invalid", String(Boolean(address && !valid)));

      if (valid) {
        window.location.href = `wallet/?address=${encodeURIComponent(address)}`;
      }
    });
  }

  document.querySelectorAll("[data-search-mode]").forEach((tab) => {
    tab.addEventListener("click", () => updateSearchMode(tab.dataset.searchMode));
  });

  if (globalSearchForm && globalSearchInput) {
    updateSearchMode(globalSearchInput.dataset.mode || "wallet");

    globalSearchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = normalizeAddress(globalSearchInput.value);
      const mode = globalSearchInput.dataset.mode || "wallet";
      const hint = document.querySelector("[data-search-hint]");

      if (mode === "wallet") {
        if (isLikelyWalletAddress(query)) {
          window.location.href = `wallet/?address=${encodeURIComponent(query)}`;
        } else if (hint) {
          hint.textContent = "请先输入完整的钱包地址。当前支持 EVM 0x 地址和 Solana 地址。";
        }
        return;
      }

      if (mode === "whale") {
        window.location.href = `whales/?query=${encodeURIComponent(query || "Top Whale")}`;
        return;
      }

      if (mode === "trader") {
        window.location.href = `traders/?query=${encodeURIComponent(query || "Hot Trader")}`;
      }
    });
  }

  document.querySelectorAll("[data-trader-query]").forEach((link) => {
    link.addEventListener("click", () => {
      updateSearchMode("trader");
      if (globalSearchInput) globalSearchInput.value = link.dataset.traderQuery || "";
    });
  });

  loadMarketOverview();
  initDirectoryQuery();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSite, { once: true });
} else {
  initSite();
}
