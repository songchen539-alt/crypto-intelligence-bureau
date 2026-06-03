# Website Architecture

产品名：加密货币情报局 / Crypto Intelligence Bureau

简称：CIB

## 1. Product Concept

加密货币情报局不是普通行情站，而是一个「链上侦查 + 巨鲸监控 + 交易员画像 + 每日情报」的加密市场情报工作台。

核心用户：

- 加密交易员：想知道聪明钱、巨鲸和热门钱包在做什么。
- 链上研究员：需要调查钱包、交易路径、相关地址和资金流。
- KOL / 内容创作者：需要快速生成每日市场情报和事件解读。
- 项目方 / 社群运营：需要监控核心钱包、竞品项目和市场热度。

核心价值：

- 把复杂链上数据翻译成可读情报。
- 把钱包行为变成画像、标签、风险和机会。
- 把每日市场噪音整理成可行动的线索。

## 2. Top-Level Navigation

主导航建议：

- Dashboard / 情报总览
- Wallet Investigation / 钱包调查
- Whale Radar / 巨鲸雷达
- Wallet Watch / 钱包监控
- Trader Investigation / 交易员调查
- Crypto MBTI / 加密人格
- Daily Intelligence / 每日情报
- Watchlist / 关注列表
- Alerts / 预警中心

辅助入口：

- Pricing / 会员
- API / 数据接口
- Docs / 使用文档
- Account / 账户设置

## 3. Page Structure

### 3.1 Dashboard / 情报总览

第一屏目标：让用户一打开网站就看到「今天最重要的链上情报」。

核心组件：

- 今日市场情报摘要
- 巨鲸异动 Top 10
- 热门钱包 / 聪明钱钱包榜
- 我的监控钱包提醒
- 今日风险事件
- 今日叙事热度，如 BTC、ETH、SOL、AI、DeFi、Meme 等

页面气质：

- 深色专业情报终端
- 数据密度高，但分区清楚
- 重点信息用风险级别、方向和置信度突出

### 3.2 Wallet Investigation / 钱包调查

目标：输入任意钱包地址，生成一份可读的「钱包调查报告」。

主要功能：

- 地址基础信息：链、余额、活跃时间、首次出现时间。
- 资产结构：Token 持仓、稳定币比例、高风险资产比例。
- 交易行为：买入、卖出、转账、桥接、DEX 活动。
- 资金路径：资金来源、资金去向、关联钱包。
- 标签系统：巨鲸、聪明钱、套利、做市、项目方、交易所、疑似机器人等。
- 风险评级：混币、黑名单交互、异常转账、钓鱼合约交互。
- AI 总结：用自然语言生成钱包画像。

关键页面：

- `/wallet`
- `/wallet/[address]`
- `/wallet/[address]/transactions`
- `/wallet/[address]/connections`
- `/wallet/[address]/report`

### 3.3 Whale Radar / 巨鲸雷达

目标：实时发现大额资金流、巨鲸建仓、抛售和跨链迁移。

主要功能：

- 大额转账实时流
- 巨鲸买入/卖出榜
- 交易所流入/流出监测
- 稳定币铸造/销毁与迁移
- 大额 NFT / Token 交易
- 巨鲸行为聚类：同一批钱包是否同步行动
- 市场影响评分：某笔交易可能造成的影响

关键页面：

- `/whales`
- `/whales/radar`
- `/whales/flows`
- `/whales/entities/[entityId]`

### 3.4 Wallet Watch / 钱包监控

目标：让用户关注钱包，并在关键行为出现时收到提醒。

主要功能：

- 添加监控钱包
- 创建钱包分组，例如聪明钱、项目方、朋友、竞品、风险钱包。
- 自定义提醒规则：
  - 余额变化超过阈值
  - 买入指定 Token
  - 卖出指定 Token
  - 转入/转出交易所
  - 与高风险合约交互
  - 与指定钱包交互
- 提醒渠道：
  - 站内通知
  - Email
  - Telegram / Discord webhook
  - API webhook

关键页面：

- `/watch`
- `/watch/groups`
- `/watch/rules`
- `/alerts`

### 3.5 Crypto MBTI / 加密人格

目标：把钱包或交易员的行为风格转化成容易理解、可传播的角色画像。

示例人格：

- Diamond Whale: 长线巨鲸型
- Degen Hunter: 高风险猎手型
- Stable Farmer: 稳定收益型
- Exit Sprinter: 快速止盈型
- Liquidity Shadow: 流动性潜伏型
- Meme Sniper: Meme 狙击型

分析维度：

- 风险偏好：低风险 / 高风险
- 持仓周期：短线 / 长线
- 交易频率：低频 / 高频
- 资产偏好：主流币 / 山寨币 / Meme / DeFi / NFT
- 盈亏节奏：稳健复利 / 爆发式收益 / 大幅回撤
- 行为模式：跟随、抢跑、套利、埋伏、追涨、做市

关键页面：

- `/mbti`
- `/mbti/wallet/[address]`
- `/mbti/trader/[traderId]`
- `/mbti/share/[reportId]`

### 3.6 Daily Intelligence / 每日情报

目标：把每日市场变化压缩成一份高质量情报简报。

内容结构：

- 今日一句话判断
- 市场温度
- 巨鲸动作
- 聪明钱方向
- 热门叙事
- 风险事件
- 值得跟踪的钱包
- 值得复盘的交易员
- 明日观察清单

关键页面：

- `/intelligence`
- `/intelligence/daily`
- `/intelligence/archive`
- `/intelligence/[date]`

### 3.7 Trader Investigation / 交易员调查

目标：研究某个交易员、KOL、公开钱包或链上地址组合的交易风格与可信度。

主要功能：

- 交易员资料页
- 公开钱包绑定
- 盈亏曲线
- 胜率、平均收益、最大回撤
- 常买资产与交易周期
- 跟单风险评分
- 历史喊单 / 链上行为对比
- 交易员可信度报告

关键页面：

- `/traders`
- `/traders/[traderId]`
- `/traders/[traderId]/performance`
- `/traders/[traderId]/wallets`
- `/traders/[traderId]/report`

## 4. Data Model

核心实体：

- User: 平台用户
- Wallet: 钱包地址
- Entity: 钱包背后的实体，如交易所、基金、项目方、未知巨鲸。
- EntityLabel: 实体标签、置信度、来源、更新时间和人工复核状态
- EvidenceSource: 链上交易、市场数据、治理公告、风险列表和人工复核记录
- InvestigationPlaybook: 钱包、巨鲸、交易员、风险、资产和每日简报调查流程
- Transaction: 链上交易
- Asset: Token / NFT / Stablecoin
- TokenProfile: 资产档案、板块标签、风险窗口与相关信号
- WatchRule: 监控规则
- Alert: 预警事件
- IntelligenceBrief: 每日情报
- TraderProfile: 交易员画像
- PersonalityReport: Crypto MBTI 报告
- InvestigationReport: 钱包/交易员调查报告
- IntelligenceEvent: 宏观、解锁、治理、链上风险等情报日历事件
- SignalDefinition: 交易所流入、巨鲸建仓、异常授权等情报信号解释

## 5. MVP Scope

第一阶段建议只做最强闭环：

1. 首页情报总览
2. 钱包调查
3. 钱包监控
4. 巨鲸雷达
5. 每日情报

Crypto MBTI 和交易员调查适合做第二阶段，因为它们需要更完整的行为数据和评分模型。

## 6. Suggested Routes

- `/` 情报总览
- `/wallet` 钱包调查入口
- `/wallet/[address]` 钱包报告
- `/whales` 巨鲸雷达
- `/watch` 钱包监控
- `/alerts` 预警中心
- `/reports` 调查报告库
- `/calendar` 情报日历
- `/signals` 链上信号库
- `/tokens` 资产雷达
- `/entities` 实体标签库
- `/sources` 数据源与证据中心
- `/playbooks` 调查手册
- `/intelligence/daily` 每日情报
- `/mbti` Crypto MBTI
- `/traders` 交易员调查
- `/pricing` 会员
- `/settings` 设置

## 7. Visual Direction

整体风格：

- 专业、神秘、情报机构感
- 深色背景，搭配高对比数据色
- 避免花哨金融炒币感，偏调查终端和数据工作台

关键词：

- Intelligence terminal
- On-chain investigation
- Crypto command center
- Whale activity radar
- Classified market briefing

推荐视觉元素：

- 钱包关系图
- 雷达扫描
- 资金流路径
- 风险等级条
- 情报简报卡片
- 地址标签徽章

## 8. Monetization

免费层：

- 查询少量钱包
- 查看延迟版巨鲸雷达
- 阅读公开每日情报

Pro：

- 更多钱包查询
- 实时巨鲸雷达
- 自定义监控规则
- 每日情报高级版
- Crypto MBTI 完整报告

Team / API：

- 团队协作
- Webhook
- API 数据访问
- 批量钱包调查
- 导出报告

## 9. Build Roadmap

### Phase 1: Intelligence Dashboard

- 首页
- 钱包地址搜索
- Mock 钱包报告
- Mock 巨鲸雷达
- 每日情报页面

### Phase 2: Real Wallet Investigation

- 接入链上数据
- 交易列表
- 资产列表
- 地址标签
- AI 调查摘要

### Phase 3: Monitoring

- 用户账户
- 钱包关注列表
- 规则引擎
- 站内预警

### Phase 4: Advanced Intelligence

- Trader Investigation
- Crypto MBTI
- 关系图谱
- 付费会员
- API
