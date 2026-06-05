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

function initWatchForm() {
  const form = document.querySelector("[data-watch-form]");
  const input = document.querySelector("[data-watch-input]");
  const rule = document.querySelector("[data-watch-rule]");
  const status = document.querySelector("[data-watch-status]");
  const priority = document.querySelector("[data-watch-priority]");
  const frequency = document.querySelector("[data-watch-frequency]");
  const summary = document.querySelector("[data-watch-summary]");
  if (!form || !input || !rule || !summary) return;

  const copy = {
    exchange: ["Active", "High", "实时", "将监控该钱包是否向交易所地址转入资产。若出现大额流入交易所，通常需要优先复核是否存在短线抛压。"],
    large: ["Active", "Medium", "实时", "将监控单笔大额转账和余额变化。适合巨鲸、项目方钱包和聪明钱地址。"],
    buy: ["Active", "Medium", "15 分钟", "将监控该钱包是否买入新 Token 或进入新池子。适合发现早期建仓线索。"],
    risk: ["Active", "Critical", "实时", "将监控该钱包是否与高风险合约、异常授权或可疑地址交互。适合风险预警。"]
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const address = normalizeAddress(input.value) || "观察钱包";
    const selected = copy[rule.value] || copy.exchange;
    status.textContent = selected[0];
    priority.textContent = selected[1];
    frequency.textContent = selected[2];
    summary.textContent = `${address} 已生成监控方案：${selected[3]}`;
  });
}

function hashText(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(index);
  }
  return Math.abs(hash);
}

function renderMbti(target) {
  const name = document.querySelector("[data-mbti-name]");
  const summary = document.querySelector("[data-mbti-summary]");
  const bars = document.querySelector("[data-mbti-bars]");
  const list = document.querySelector("[data-mbti-list]");
  if (!name || !summary || !bars || !list) return;

  const profiles = [
    ["Diamond Whale", "偏长线配置、低频大额操作，适合观察其建仓节奏和资金流向。", ["风险偏好", 48], ["持仓耐心", 86], ["交易频率", 31]],
    ["Meme Sniper", "偏高频、高波动资产和新池子机会，收益弹性强，但回撤风险也更高。", ["风险偏好", 88], ["持仓耐心", 28], ["交易频率", 91]],
    ["Stable Farmer", "偏稳定收益、低波动资产和 DeFi 策略，适合长期监控收益路径。", ["风险偏好", 36], ["持仓耐心", 74], ["交易频率", 46]],
    ["Liquidity Shadow", "偏潜伏型资金流，常在流动性变化前后出现动作，适合与巨鲸雷达联动观察。", ["风险偏好", 64], ["持仓耐心", 62], ["交易频率", 58]]
  ];

  const query = normalizeAddress(target) || "Diamond Whale";
  const profile = profiles[hashText(query) % profiles.length];
  name.textContent = profile[0];
  summary.textContent = `${query} 的初步画像为 ${profile[0]}：${profile[1]}`;
  bars.innerHTML = profile.slice(2).map(([label, value]) => `
    <div class="bar-item">
      <div class="bar-meta"><span>${label}</span><strong>${value}%</strong></div>
      <div class="bar"><span style="width: ${value}%"></span></div>
    </div>
  `).join("");
  list.innerHTML = [
    "把人格画像作为观察框架，不要直接当作买卖信号。",
    "结合钱包调查、巨鲸雷达和钱包监控一起判断行为是否持续。",
    "重点关注画像是否随时间变化，例如从潜伏转为高频交易。"
  ].map((item) => `<li>${item}</li>`).join("");
}

function initMbtiForm() {
  const form = document.querySelector("[data-mbti-form]");
  const input = document.querySelector("[data-mbti-input]");
  if (!form || !input) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    renderMbti(input.value);
  });

  document.querySelectorAll("[data-mbti-sample]").forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.dataset.mbtiSample || "";
      renderMbti(input.value);
    });
  });
}

function initAlertFilters() {
  const buttons = document.querySelectorAll("[data-alert-filter]");
  const items = document.querySelectorAll("[data-alert-type]");
  if (!buttons.length || !items.length) return;

  const getFilterFromLocation = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("filter") || (window.location.hash || "#all").slice(1) || "all";
  };

  const applyFilter = (filter) => {
    const allowed = Array.from(buttons).some((button) => button.dataset.alertFilter === filter);
    const activeFilter = allowed ? filter : "all";

    buttons.forEach((button) => {
      const active = button.dataset.alertFilter === activeFilter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });

    items.forEach((item) => {
      const types = item.dataset.alertType || "";
      const hidden = activeFilter !== "all" && !types.includes(activeFilter);
      item.dataset.hidden = String(hidden);
      item.setAttribute("aria-hidden", String(hidden));
    });
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-alert-filter]");
    if (!button) return;

    event.preventDefault();
    const filter = button.dataset.alertFilter || "all";
    const url = new URL(window.location.href);
    url.hash = filter === "all" ? "" : filter;
    if (filter === "all") {
      url.searchParams.delete("filter");
    } else {
      url.searchParams.set("filter", filter);
    }
    window.history.replaceState({}, "", url);
    applyFilter(filter);
  });

  window.addEventListener("hashchange", () => applyFilter(getFilterFromLocation()));
  applyFilter(getFilterFromLocation());
}

function initReportFilters() {
  const buttons = document.querySelectorAll("[data-report-filter]");
  const items = document.querySelectorAll("[data-report-type]");
  if (!buttons.length || !items.length) return;

  const getFilterFromLocation = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("type") || (window.location.hash || "#all").slice(1) || "all";
  };

  const applyFilter = (filter) => {
    const allowed = Array.from(buttons).some((button) => button.dataset.reportFilter === filter);
    const activeFilter = allowed ? filter : "all";

    buttons.forEach((button) => {
      const active = button.dataset.reportFilter === activeFilter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });

    items.forEach((item) => {
      const types = item.dataset.reportType || "";
      const hidden = activeFilter !== "all" && !types.includes(activeFilter);
      item.dataset.hidden = String(hidden);
      item.setAttribute("aria-hidden", String(hidden));
    });
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-report-filter]");
    if (!button) return;

    event.preventDefault();
    const filter = button.dataset.reportFilter || "all";
    const url = new URL(window.location.href);
    url.hash = filter === "all" ? "" : filter;
    if (filter === "all") {
      url.searchParams.delete("type");
    } else {
      url.searchParams.set("type", filter);
    }
    window.history.replaceState({}, "", url);
    applyFilter(filter);
  });

  window.addEventListener("hashchange", () => applyFilter(getFilterFromLocation()));
  applyFilter(getFilterFromLocation());
}

function initCalendarFilters() {
  const buttons = document.querySelectorAll("[data-calendar-filter]");
  const items = document.querySelectorAll("[data-calendar-type]");
  if (!buttons.length || !items.length) return;

  const getFilterFromLocation = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("type") || (window.location.hash || "#all").slice(1) || "all";
  };

  const applyFilter = (filter) => {
    const allowed = Array.from(buttons).some((button) => button.dataset.calendarFilter === filter);
    const activeFilter = allowed ? filter : "all";

    buttons.forEach((button) => {
      const active = button.dataset.calendarFilter === activeFilter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });

    items.forEach((item) => {
      const types = item.dataset.calendarType || "";
      const hidden = activeFilter !== "all" && !types.includes(activeFilter);
      item.dataset.hidden = String(hidden);
      item.setAttribute("aria-hidden", String(hidden));
    });
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-calendar-filter]");
    if (!button) return;

    event.preventDefault();
    const filter = button.dataset.calendarFilter || "all";
    const url = new URL(window.location.href);
    url.hash = filter === "all" ? "" : filter;
    if (filter === "all") {
      url.searchParams.delete("type");
    } else {
      url.searchParams.set("type", filter);
    }
    window.history.replaceState({}, "", url);
    applyFilter(filter);
  });

  window.addEventListener("hashchange", () => applyFilter(getFilterFromLocation()));
  applyFilter(getFilterFromLocation());
}

function initSignalFilters() {
  const buttons = document.querySelectorAll("[data-signal-filter]");
  const items = document.querySelectorAll("[data-signal-type]");
  if (!buttons.length || !items.length) return;

  const getFilterFromLocation = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("type") || (window.location.hash || "#all").slice(1) || "all";
  };

  const applyFilter = (filter) => {
    const allowed = Array.from(buttons).some((button) => button.dataset.signalFilter === filter);
    const activeFilter = allowed ? filter : "all";

    buttons.forEach((button) => {
      const active = button.dataset.signalFilter === activeFilter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });

    items.forEach((item) => {
      const types = item.dataset.signalType || "";
      const hidden = activeFilter !== "all" && !types.includes(activeFilter);
      item.dataset.hidden = String(hidden);
      item.setAttribute("aria-hidden", String(hidden));
    });
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-signal-filter]");
    if (!button) return;

    event.preventDefault();
    const filter = button.dataset.signalFilter || "all";
    const url = new URL(window.location.href);
    url.hash = filter === "all" ? "" : filter;
    if (filter === "all") {
      url.searchParams.delete("type");
    } else {
      url.searchParams.set("type", filter);
    }
    window.history.replaceState({}, "", url);
    applyFilter(filter);
  });

  window.addEventListener("hashchange", () => applyFilter(getFilterFromLocation()));
  applyFilter(getFilterFromLocation());
}

function initTokenFilters() {
  const buttons = document.querySelectorAll("[data-token-filter]");
  const items = document.querySelectorAll("[data-token-type]");
  if (!buttons.length || !items.length) return;

  const getFilterFromLocation = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("type") || (window.location.hash || "#all").slice(1) || "all";
  };

  const applyFilter = (filter) => {
    const allowed = Array.from(buttons).some((button) => button.dataset.tokenFilter === filter);
    const activeFilter = allowed ? filter : "all";

    buttons.forEach((button) => {
      const active = button.dataset.tokenFilter === activeFilter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });

    items.forEach((item) => {
      const types = item.dataset.tokenType || "";
      const hidden = activeFilter !== "all" && !types.includes(activeFilter);
      item.dataset.hidden = String(hidden);
      item.setAttribute("aria-hidden", String(hidden));
    });
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-token-filter]");
    if (!button) return;

    event.preventDefault();
    const filter = button.dataset.tokenFilter || "all";
    const url = new URL(window.location.href);
    url.hash = filter === "all" ? "" : filter;
    if (filter === "all") {
      url.searchParams.delete("type");
    } else {
      url.searchParams.set("type", filter);
    }
    window.history.replaceState({}, "", url);
    applyFilter(filter);
  });

  window.addEventListener("hashchange", () => applyFilter(getFilterFromLocation()));
  applyFilter(getFilterFromLocation());
}

function initEntityFilters() {
  const buttons = document.querySelectorAll("[data-entity-filter]");
  const items = document.querySelectorAll("[data-entity-type]");
  if (!buttons.length || !items.length) return;

  const getFilterFromLocation = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("type") || (window.location.hash || "#all").slice(1) || "all";
  };

  const applyFilter = (filter) => {
    const allowed = Array.from(buttons).some((button) => button.dataset.entityFilter === filter);
    const activeFilter = allowed ? filter : "all";

    buttons.forEach((button) => {
      const active = button.dataset.entityFilter === activeFilter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });

    items.forEach((item) => {
      const types = item.dataset.entityType || "";
      const hidden = activeFilter !== "all" && !types.includes(activeFilter);
      item.dataset.hidden = String(hidden);
      item.setAttribute("aria-hidden", String(hidden));
    });
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-entity-filter]");
    if (!button) return;

    event.preventDefault();
    const filter = button.dataset.entityFilter || "all";
    const url = new URL(window.location.href);
    url.hash = filter === "all" ? "" : filter;
    if (filter === "all") {
      url.searchParams.delete("type");
    } else {
      url.searchParams.set("type", filter);
    }
    window.history.replaceState({}, "", url);
    applyFilter(filter);
  });

  window.addEventListener("hashchange", () => applyFilter(getFilterFromLocation()));
  applyFilter(getFilterFromLocation());
}

function initSourceFilters() {
  const buttons = document.querySelectorAll("[data-source-filter]");
  const items = document.querySelectorAll("[data-source-type]");
  if (!buttons.length || !items.length) return;

  const getFilterFromLocation = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("type") || (window.location.hash || "#all").slice(1) || "all";
  };

  const applyFilter = (filter) => {
    const allowed = Array.from(buttons).some((button) => button.dataset.sourceFilter === filter);
    const activeFilter = allowed ? filter : "all";

    buttons.forEach((button) => {
      const active = button.dataset.sourceFilter === activeFilter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });

    items.forEach((item) => {
      const types = item.dataset.sourceType || "";
      const hidden = activeFilter !== "all" && !types.includes(activeFilter);
      item.dataset.hidden = String(hidden);
      item.setAttribute("aria-hidden", String(hidden));
    });
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-source-filter]");
    if (!button) return;

    event.preventDefault();
    const filter = button.dataset.sourceFilter || "all";
    const url = new URL(window.location.href);
    url.hash = filter === "all" ? "" : filter;
    if (filter === "all") {
      url.searchParams.delete("type");
    } else {
      url.searchParams.set("type", filter);
    }
    window.history.replaceState({}, "", url);
    applyFilter(filter);
  });

  window.addEventListener("hashchange", () => applyFilter(getFilterFromLocation()));
  applyFilter(getFilterFromLocation());
}

function initPlaybookFilters() {
  const buttons = document.querySelectorAll("[data-playbook-filter]");
  const items = document.querySelectorAll("[data-playbook-type]");
  if (!buttons.length || !items.length) return;

  const getFilterFromLocation = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("type") || (window.location.hash || "#all").slice(1) || "all";
  };

  const applyFilter = (filter) => {
    const allowed = Array.from(buttons).some((button) => button.dataset.playbookFilter === filter);
    const activeFilter = allowed ? filter : "all";

    buttons.forEach((button) => {
      const active = button.dataset.playbookFilter === activeFilter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });

    items.forEach((item) => {
      const types = item.dataset.playbookType || "";
      const hidden = activeFilter !== "all" && !types.includes(activeFilter);
      item.dataset.hidden = String(hidden);
      item.setAttribute("aria-hidden", String(hidden));
    });
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-playbook-filter]");
    if (!button) return;

    event.preventDefault();
    const filter = button.dataset.playbookFilter || "all";
    const url = new URL(window.location.href);
    url.hash = filter === "all" ? "" : filter;
    if (filter === "all") {
      url.searchParams.delete("type");
    } else {
      url.searchParams.set("type", filter);
    }
    window.history.replaceState({}, "", url);
    applyFilter(filter);
  });

  window.addEventListener("hashchange", () => applyFilter(getFilterFromLocation()));
  applyFilter(getFilterFromLocation());
}

function initCaseFilters() {
  const buttons = document.querySelectorAll("[data-case-filter]");
  const items = document.querySelectorAll("[data-case-type]");
  if (!buttons.length || !items.length) return;

  const getFilterFromLocation = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("type") || (window.location.hash || "#all").slice(1) || "all";
  };

  const applyFilter = (filter) => {
    const allowed = Array.from(buttons).some((button) => button.dataset.caseFilter === filter);
    const activeFilter = allowed ? filter : "all";

    buttons.forEach((button) => {
      const active = button.dataset.caseFilter === activeFilter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });

    items.forEach((item) => {
      const types = item.dataset.caseType || "";
      const hidden = activeFilter !== "all" && !types.includes(activeFilter);
      item.dataset.hidden = String(hidden);
      item.setAttribute("aria-hidden", String(hidden));
    });
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-case-filter]");
    if (!button) return;

    event.preventDefault();
    const filter = button.dataset.caseFilter || "all";
    const url = new URL(window.location.href);
    url.hash = filter === "all" ? "" : filter;
    if (filter === "all") {
      url.searchParams.delete("type");
    } else {
      url.searchParams.set("type", filter);
    }
    window.history.replaceState({}, "", url);
    applyFilter(filter);
  });

  window.addEventListener("hashchange", () => applyFilter(getFilterFromLocation()));
  applyFilter(getFilterFromLocation());
}

function initAlphaFilters() {
  const buttons = document.querySelectorAll("[data-alpha-filter]");
  const items = document.querySelectorAll("[data-alpha-type]");
  if (!buttons.length || !items.length) return;

  const getFilterFromLocation = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("type") || (window.location.hash || "#all").slice(1) || "all";
  };

  const applyFilter = (filter) => {
    const allowed = Array.from(buttons).some((button) => button.dataset.alphaFilter === filter);
    const activeFilter = allowed ? filter : "all";

    buttons.forEach((button) => {
      const active = button.dataset.alphaFilter === activeFilter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });

    items.forEach((item) => {
      const types = item.dataset.alphaType || "";
      const hidden = activeFilter !== "all" && !types.includes(activeFilter);
      item.dataset.hidden = String(hidden);
      item.setAttribute("aria-hidden", String(hidden));
    });
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-alpha-filter]");
    if (!button) return;

    event.preventDefault();
    const filter = button.dataset.alphaFilter || "all";
    const url = new URL(window.location.href);
    url.hash = filter === "all" ? "" : filter;
    if (filter === "all") {
      url.searchParams.delete("type");
    } else {
      url.searchParams.set("type", filter);
    }
    window.history.replaceState({}, "", url);
    applyFilter(filter);
  });

  window.addEventListener("hashchange", () => applyFilter(getFilterFromLocation()));
  applyFilter(getFilterFromLocation());
}

function initAlphaReportTabs() {
  const buttons = document.querySelectorAll("[data-alpha-report-filter]");
  const reports = document.querySelectorAll("[data-alpha-report-item]");
  if (!buttons.length || !reports.length) return;

  const getProjectFromLocation = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("project") || (window.location.hash || "#ai-agent-execution").slice(1) || "ai-agent-execution";
  };

  const applyProject = (project) => {
    const allowed = Array.from(buttons).some((button) => button.dataset.alphaReportFilter === project);
    const activeProject = allowed ? project : "ai-agent-execution";

    buttons.forEach((button) => {
      const active = button.dataset.alphaReportFilter === activeProject;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });

    reports.forEach((report) => {
      const hidden = report.dataset.alphaReportItem !== activeProject;
      report.dataset.hidden = String(hidden);
      report.setAttribute("aria-hidden", String(hidden));
    });
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-alpha-report-filter]");
    if (!button) return;

    event.preventDefault();
    const project = button.dataset.alphaReportFilter || "ai-agent-execution";
    const url = new URL(window.location.href);
    url.searchParams.set("project", project);
    url.hash = project;
    window.history.replaceState({}, "", url);
    applyProject(project);
  });

  window.addEventListener("hashchange", () => applyProject(getProjectFromLocation()));
  applyProject(getProjectFromLocation());
}

function initAlphaWatchFilters() {
  const buttons = document.querySelectorAll("[data-alpha-watch-filter]");
  const items = document.querySelectorAll("[data-alpha-watch-status]");
  if (!buttons.length || !items.length) return;

  const getFilterFromLocation = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("status") || (window.location.hash || "#all").slice(1) || "all";
  };

  const applyFilter = (filter) => {
    const allowed = Array.from(buttons).some((button) => button.dataset.alphaWatchFilter === filter);
    const activeFilter = allowed ? filter : "all";

    buttons.forEach((button) => {
      const active = button.dataset.alphaWatchFilter === activeFilter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });

    items.forEach((item) => {
      const statuses = item.dataset.alphaWatchStatus || "";
      const hidden = activeFilter !== "all" && !statuses.includes(activeFilter);
      item.dataset.hidden = String(hidden);
      item.setAttribute("aria-hidden", String(hidden));
    });
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-alpha-watch-filter]");
    if (!button) return;

    event.preventDefault();
    const filter = button.dataset.alphaWatchFilter || "all";
    const url = new URL(window.location.href);
    url.hash = filter === "all" ? "" : filter;
    if (filter === "all") {
      url.searchParams.delete("status");
    } else {
      url.searchParams.set("status", filter);
    }
    window.history.replaceState({}, "", url);
    applyFilter(filter);
  });

  window.addEventListener("hashchange", () => applyFilter(getFilterFromLocation()));
  applyFilter(getFilterFromLocation());
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
  initWatchForm();
  initMbtiForm();
  initAlertFilters();
  initReportFilters();
  initCalendarFilters();
  initSignalFilters();
  initTokenFilters();
  initEntityFilters();
  initSourceFilters();
  initPlaybookFilters();
  initCaseFilters();
  initAlphaFilters();
  initAlphaReportTabs();
  initAlphaWatchFilters();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSite, { once: true });
} else {
  initSite();
}
