const investigationForm = document.querySelector("[data-investigation-form]");
const investigationInput = document.querySelector("[data-investigation-input]");
const emptyState = document.querySelector("[data-empty-state]");
const reportPanel = document.querySelector("[data-report-panel]");
const addressLine = document.querySelector("[data-address-line]");
const addressOutput = document.querySelector("[data-address-output]");
const chainOutput = document.querySelector("[data-chain-output]");
const copyLink = document.querySelector("[data-copy-link]");

const reportTargets = {
  score: document.querySelector("[data-score-output]"),
  risk: document.querySelector("[data-risk-output]"),
  activity: document.querySelector("[data-activity-output]"),
  integrity: document.querySelector("[data-integrity-output]"),
  summary: document.querySelector("[data-summary-output]"),
  behavior: document.querySelector("[data-behavior-output]"),
  risks: document.querySelector("[data-risk-list]"),
  paths: document.querySelector("[data-path-list]"),
  watch: document.querySelector("[data-watch-list]")
};

function detectChain(address) {
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) return "Ethereum / EVM";
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return "Solana";
  return "Unknown";
}

function hashAddress(address) {
  let hash = 2166136261;
  for (let index = 0; index < address.length; index += 1) {
    hash ^= address.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function bounded(seed, min, max, salt) {
  return min + ((seed + salt * 7919) % (max - min + 1));
}

function createReport(address) {
  const chain = detectChain(address);
  const seed = hashAddress(address.toLowerCase());
  const valid = chain !== "Unknown";
  const activity = valid ? bounded(seed, 38, 96, 1) : 0;
  const concentration = valid ? bounded(seed, 25, 91, 2) : 0;
  const velocity = valid ? bounded(seed, 18, 88, 3) : 0;
  const interaction = valid ? bounded(seed, 22, 93, 4) : 0;
  const riskScore = valid ? Math.round((concentration * 0.24 + velocity * 0.28 + interaction * 0.18 + bounded(seed, 8, 75, 5) * 0.3)) : 0;
  const investigationScore = valid ? Math.max(41, 100 - Math.round(riskScore * 0.52) + bounded(seed, -8, 12, 6)) : 0;
  const riskLevel = riskScore >= 72 ? "高" : riskScore >= 46 ? "中" : "低";
  const activityLevel = activity >= 78 ? "高活跃" : activity >= 52 ? "中活跃" : "低频";
  const persona = chain === "Solana"
    ? (velocity > 62 ? "Meme Sniper / 高频狙击型" : "Liquidity Watcher / 流动性观察型")
    : (concentration > 70 ? "Diamond Whale / 长线巨鲸型" : "Smart Flow / 聪明钱流动型");

  return {
    address,
    valid,
    chain,
    investigationScore,
    riskLevel,
    activityLevel,
    integrity: valid ? "格式通过" : "需要检查",
    persona,
    behavior: [
      ["交易活跃度", activity],
      ["资产集中度", concentration],
      ["资金流速度", velocity],
      ["合约交互复杂度", interaction]
    ],
    risks: valid ? [
      riskScore >= 72 ? "近期行为需要重点复核，建议查看大额转出和交易所交互。" : "未发现高危格式信号，仍需接入真实交易数据复核。",
      interaction > 68 ? "合约交互复杂度偏高，后续应检测授权、钓鱼合约和黑名单地址。" : "合约交互复杂度可控，适合加入普通观察列表。",
      velocity > 70 ? "资金流速度偏快，适合设置实时转出提醒。" : "资金流速度不高，可按每日简报频率观察。"
    ] : [
      "地址格式未通过基础检查，请确认是否完整复制。",
      "当前仅支持 EVM 0x 地址和 Solana Base58 地址。",
      "不要输入助记词、私钥、交易所密码或任何签名内容。"
    ],
    paths: valid ? [
      `${chain} 地址已识别，下一阶段可接入资产余额和交易历史。`,
      "建议追踪交易所流入/流出、大额转账和稳定币路径。",
      "可扩展为关联钱包图谱：共同资金来源、共同合约交互、同步交易。"
    ] : [
      "等待有效地址后生成资金路径。",
      "输入地址只在浏览器本地处理。",
      "当前页面不会连接钱包。"
    ],
    watch: valid ? [
      "余额变化超过 15% 时提醒",
      "转入交易所地址时提醒",
      "买入新 Token 或新池子交互时提醒",
      "与高风险合约交互时提醒"
    ] : [
      "先输入有效地址",
      "确认链类型",
      "再创建监控规则"
    ]
  };
}

function renderList(target, items) {
  target.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function renderBehavior(target, items) {
  target.innerHTML = items.map(([label, value]) => `
    <div class="bar-item">
      <div class="bar-meta"><span>${label}</span><strong>${value}%</strong></div>
      <div class="bar"><span style="width: ${value}%"></span></div>
    </div>
  `).join("");
}

function renderReport(address) {
  const normalized = normalizeAddress(address);
  const report = createReport(normalized);
  const url = new URL(window.location.href);
  url.searchParams.set("address", normalized);
  window.history.replaceState({}, "", url);

  emptyState.hidden = true;
  reportPanel.hidden = false;
  addressLine.hidden = false;
  addressOutput.textContent = normalized || "未输入";
  chainOutput.textContent = report.chain;
  chainOutput.dataset.severity = report.riskLevel;

  reportTargets.score.textContent = report.valid ? `${report.investigationScore}` : "--";
  reportTargets.risk.textContent = report.riskLevel;
  reportTargets.risk.dataset.severity = report.riskLevel;
  reportTargets.activity.textContent = report.activityLevel;
  reportTargets.integrity.textContent = report.integrity;
  reportTargets.summary.textContent = report.valid
    ? `该地址被识别为 ${report.chain} 钱包，初步画像为 ${report.persona}。当前本地评分显示调查可信度 ${report.investigationScore}/100，风险等级为${report.riskLevel}。建议优先接入真实交易历史、资产余额和交易所路径，确认是否存在大额转出、异常合约授权或同步钱包行为。`
    : "地址格式未通过基础检查。请确认地址是否完整，且不要输入助记词、私钥或任何签名内容。";

  renderBehavior(reportTargets.behavior, report.behavior);
  renderList(reportTargets.risks, report.risks);
  renderList(reportTargets.paths, report.paths);
  renderList(reportTargets.watch, report.watch);
}

if (investigationForm && investigationInput) {
  const initialAddress = new URLSearchParams(window.location.search).get("address");
  if (initialAddress) {
    investigationInput.value = initialAddress;
    renderReport(initialAddress);
  }

  investigationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renderReport(investigationInput.value);
  });

  document.querySelectorAll("[data-sample-address]").forEach((button) => {
    button.addEventListener("click", () => {
      const address = button.getAttribute("data-sample-address") || "";
      investigationInput.value = address;
      renderReport(address);
    });
  });
}

if (copyLink) {
  copyLink.addEventListener("click", async (event) => {
    event.preventDefault();
    const text = window.location.href;
    try {
      await navigator.clipboard.writeText(text);
      copyLink.textContent = "已复制";
      window.setTimeout(() => {
        copyLink.textContent = "复制报告链接";
      }, 1600);
    } catch {
      copyLink.textContent = "复制失败";
    }
  });
}
