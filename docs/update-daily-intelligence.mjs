import { writeFile } from "node:fs/promises";

const outputUrl = new URL("../assets/daily-intelligence.json", import.meta.url);
const timezone = "Asia/Shanghai";

function compactUsd(value) {
  if (!Number.isFinite(value)) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2
  }).format(value);
}

function percent(value) {
  if (!Number.isFinite(value)) return "--";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function shanghaiParts(date) {
  return Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date).map((part) => [part.type, part.value]));
}

function shanghaiDateKey(date) {
  const parts = shanghaiParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function shanghaiDisplayTime(date) {
  const parts = shanghaiParts(date);
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} BJT`;
}

async function fetchJson(url, source) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18000);
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`${source} returned ${response.status}`);
    return { ok: true, source, data: await response.json() };
  } catch (error) {
    return { ok: false, source, error: error.message };
  } finally {
    clearTimeout(timeout);
  }
}

function successful(result) {
  return result && result.ok ? result.data : null;
}

function buildDailyItems(data) {
  const market = data.market || {};
  const sentiment = data.sentiment && Array.isArray(data.sentiment.data) ? data.sentiment.data[0] : null;
  const binance = Array.isArray(data.binance) ? data.binance : [];
  const protocols = Array.isArray(data.protocols) ? data.protocols : [];
  const stableAssets = Array.isArray(data.stablecoins?.peggedAssets) ? data.stablecoins.peggedAssets : [];
  const chains = Array.isArray(data.chains) ? data.chains : [];
  const hacks = Array.isArray(data.hacks) ? data.hacks : [];
  const boosts = Array.isArray(data.dexBoosts) ? data.dexBoosts : [];

  const coins = [
    ["bitcoin", "BTC"],
    ["ethereum", "ETH"],
    ["solana", "SOL"],
    ["binancecoin", "BNB"]
  ].map(([id, symbol]) => ({
    id,
    symbol,
    price: Number(market[id]?.usd),
    change: Number(market[id]?.usd_24h_change)
  })).filter((coin) => Number.isFinite(coin.change));

  const topMover = coins.slice().sort((a, b) => Math.abs(b.change) - Math.abs(a.change))[0];
  const liquidityLeader = binance
    .filter((item) => item && Number(item.quoteVolume) > 0)
    .sort((a, b) => Number(b.quoteVolume) - Number(a.quoteVolume))[0];
  const topStable = stableAssets
    .map((asset) => ({
      name: asset.name || "Stablecoin",
      symbol: asset.symbol || "USD",
      supply: Number(asset.circulating?.peggedUSD),
      price: Number(asset.price)
    }))
    .filter((asset) => Number.isFinite(asset.supply) && asset.supply > 0)
    .sort((a, b) => b.supply - a.supply)[0];
  const topProtocol = protocols
    .filter((protocol) => Number(protocol.tvl) > 0 && protocol.category !== "CEX")
    .sort((a, b) => Number(b.tvl) - Number(a.tvl))[0];
  const topChain = chains
    .filter((chain) => Number(chain.tvl) > 0)
    .sort((a, b) => Number(b.tvl) - Number(a.tvl))[0];
  const latestHack = hacks
    .filter((event) => Number(event.amount) > 0)
    .sort((a, b) => Number(b.date) - Number(a.date))[0];
  const dexBoost = boosts.find((item) => item && item.tokenAddress);

  const sentimentValue = Number(sentiment?.value);
  const sentimentTitle = sentiment
    ? `市场情绪：${sentiment.value_classification} ${Number.isFinite(sentimentValue) ? `${sentimentValue}/100` : ""}`.trim()
    : "市场情绪：等待下一次公开数据更新";
  const sentimentBody = sentiment
    ? `Fear & Greed 当前为 ${sentiment.value_classification}。它不是交易指令，但能帮助解释今天的风险偏好：极端恐惧看流动性压力，极端贪婪提高追高风险权重。`
    : "情绪数据暂时不可用，今日简报会继续保留市场背景观察入口。";

  return [
    {
      id: "sentiment",
      icon: "🧭",
      category: "市场情绪",
      title: sentimentTitle,
      body: sentimentBody,
      href: "alpha/alerts.html",
      metrics: [
        sentiment ? `F&G ${sentiment.value}/100` : "F&G --",
        topMover ? `${topMover.symbol} ${percent(topMover.change)}` : "主流资产待观察"
      ]
    },
    {
      id: "liquidity",
      icon: "💧",
      category: "流动性",
      title: liquidityLeader ? `${liquidityLeader.symbol} 成交额领先` : "成交量数据等待更新",
      body: liquidityLeader
        ? `Binance 24 小时成交额约 ${compactUsd(Number(liquidityLeader.quoteVolume))}，成交笔数 ${Number(liquidityLeader.count || 0).toLocaleString("en-US")}。高流动性资产适合作为今天市场方向和风险偏好的锚点。`
        : "交易深度数据暂时不可用，生产版会通过后端缓存降低公开 API 限流影响。",
      href: "signals/?type=flow",
      metrics: [
        liquidityLeader ? compactUsd(Number(liquidityLeader.quoteVolume)) : "Volume --",
        liquidityLeader ? `${Number(liquidityLeader.count || 0).toLocaleString("en-US")} trades` : "Trades --"
      ]
    },
    {
      id: "stablecoins",
      icon: "🪙",
      category: "稳定币",
      title: topStable ? `${topStable.symbol} 稳定币供给位于前列` : "稳定币流动性等待更新",
      body: topStable
        ? `${topStable.name} 流通供给约 ${compactUsd(topStable.supply)}，当前价格约 $${Number.isFinite(topStable.price) ? topStable.price.toFixed(4) : "--"}。稳定币供给和脱锚风险会影响 DeFi 收益、链上流动性和整体风险偏好。`
        : "稳定币供给数据暂时不可用，今日保留 DeFi 流动性观察入口。",
      href: "sources/#live-data",
      metrics: [
        topStable ? compactUsd(topStable.supply) : "Supply --",
        topStable && Number.isFinite(topStable.price) ? `$${topStable.price.toFixed(4)}` : "Peg --"
      ]
    },
    {
      id: "defi",
      icon: "📈",
      category: "DeFi 与链上资金",
      title: topProtocol ? `${topProtocol.name} 保持 TVL 前列` : "DeFi TVL 等待更新",
      body: topProtocol
        ? `${topProtocol.name} 当前 TVL 约 ${compactUsd(Number(topProtocol.tvl))}。链级资金方面，${topChain?.name || "头部公链"} 仍是重点观察生态。TVL 不能直接代表代币价值，但能决定哪些项目值得进入 Alpha 评分。`
        : "DeFi TVL 暂时不可用，今日会把链上资金沉淀作为待复核线索。",
      href: "alpha/report.html?project=defi-revenue",
      metrics: [
        topProtocol ? compactUsd(Number(topProtocol.tvl)) : "TVL --",
        topChain ? `${topChain.name} ${compactUsd(Number(topChain.tvl))}` : "Chain --"
      ]
    },
    {
      id: "risk",
      icon: "⚠️",
      category: "风险与热点",
      title: latestHack ? `${latestHack.name} 安全事件进入风险样本` : "DEX 热点进入风险观察",
      body: latestHack
        ? `公开安全事件库记录 ${latestHack.name} 损失约 ${compactUsd(Number(latestHack.amount))}，类型为 ${latestHack.classification || "Unknown"}。同时 DEX 热点 ${dexBoost?.chainId || "on-chain"} 新币仍应默认进入风险观察池。`
        : `DEX Boost 热点 ${dexBoost?.chainId || "on-chain"} 新币需要等待合约、流动性和持仓证据，不能只凭热度判断质量。`,
      href: "alpha/watchlist.html?status=risk",
      metrics: [
        latestHack ? compactUsd(Number(latestHack.amount)) : "Risk watch",
        dexBoost ? `${dexBoost.chainId || "DEX"} boost` : "DEX --"
      ]
    }
  ];
}

async function main() {
  const now = new Date();
  const symbols = encodeURIComponent(JSON.stringify(["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"]));
  const requests = await Promise.all([
    fetchJson("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true", "CoinGecko"),
    fetchJson(`https://data-api.binance.vision/api/v3/ticker/24hr?symbols=${symbols}`, "Binance"),
    fetchJson("https://api.llama.fi/protocols", "DeFiLlama Protocols"),
    fetchJson("https://stablecoins.llama.fi/stablecoins?includePrices=true", "DeFiLlama Stablecoins"),
    fetchJson("https://api.llama.fi/v2/chains", "DeFiLlama Chains"),
    fetchJson("https://api.llama.fi/hacks", "DeFiLlama Security"),
    fetchJson("https://api.dexscreener.com/token-boosts/latest/v1", "DEX Screener"),
    fetchJson("https://api.alternative.me/fng/?limit=1", "Alternative.me")
  ]);

  const bySource = Object.fromEntries(requests.map((result) => [result.source, result]));
  const data = {
    market: successful(bySource["CoinGecko"]),
    binance: successful(bySource.Binance),
    protocols: successful(bySource["DeFiLlama Protocols"]),
    stablecoins: successful(bySource["DeFiLlama Stablecoins"]),
    chains: successful(bySource["DeFiLlama Chains"]),
    hacks: successful(bySource["DeFiLlama Security"]),
    dexBoosts: successful(bySource["DEX Screener"]),
    sentiment: successful(bySource["Alternative.me"])
  };

  const items = buildDailyItems(data);
  const okSources = requests.filter((result) => result.ok).map((result) => result.source);
  const failedSources = requests.filter((result) => !result.ok).map((result) => ({
    source: result.source,
    error: result.error
  }));

  const payload = {
    version: 1,
    date: shanghaiDateKey(now),
    generatedAt: now.toISOString(),
    generatedAtDisplay: shanghaiDisplayTime(now),
    timezone,
    schedule: {
      cronUtc: "30 0 * * *",
      display: "每天北京时间 08:30 自动更新"
    },
    summary: `今日简报已从 ${okSources.length} 个公开数据源生成，保留 5 条最值得跟踪的市场情报。`,
    sourceStatus: {
      ok: okSources,
      failed: failedSources
    },
    items
  };

  const serialized = `${JSON.stringify(payload, null, 2)}\n`;
  if (process.argv.includes("--stdout")) {
    process.stdout.write(serialized);
    return;
  }

  await writeFile(outputUrl, serialized, "utf8");
  console.log(`Updated ${outputUrl.pathname} with ${items.length} items.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
