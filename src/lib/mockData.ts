export type Trend = 'up' | 'down' | 'flat'

export interface Product {
  id: string
  name: string
  code: string
  unit: string
  price: number
  prevPrice: number
  openPrice: number
  change: number
  changePercent: number
  high: number
  low: number
}

export interface SignalPoint {
  time: string
  price: number
  reason: string
  side: 'buy' | 'sell'
}

export interface NewsItem {
  id: string
  scope: 'international' | 'domestic'
  title: string
  summary: string
  signal: 'bull' | 'bear' | 'neutral'
  time: string
}

export interface TradeOrder {
  id: string
  side: 'buy' | 'sell'
  product: string
  qty: number
  price: number
  time: string
  status: 'filled' | 'pending' | 'cancelled'
}

export const initialProducts: Product[] = [
  // --- 国际行情（元/克）初始值为真实行情近似值，API 连接后自动更新 ---
  {
    id: 'xaucny',
    name: '国际黄金',
    code: 'XAU',
    unit: '元/克',
    price: 995.0,
    prevPrice: 995.0,
    openPrice: 990.0,
    change: 5.0,
    changePercent: 0.51,
    high: 998.0,
    low: 988.0,
  },
  {
    id: 'xagcny',
    name: '国际白银',
    code: 'XAG',
    unit: '元/克',
    price: 14.85,
    prevPrice: 14.85,
    openPrice: 14.70,
    change: 0.15,
    changePercent: 1.02,
    high: 15.0,
    low: 14.6,
  },
  {
    id: 'paxgcny',
    name: '国际暗金',
    code: 'PAXG',
    unit: '元/克',
    price: 992.0,
    prevPrice: 992.0,
    openPrice: 988.0,
    change: 4.0,
    changePercent: 0.40,
    high: 995.0,
    low: 986.0,
  },
  // --- 国际行情（美元/盎司）---
  {
    id: 'xauusd',
    name: '现货黄金',
    code: 'XAU/USD',
    unit: 'USD/oz',
    price: 4603.0,
    prevPrice: 4603.0,
    openPrice: 4580.0,
    change: 23.0,
    changePercent: 0.50,
    high: 4610.0,
    low: 4575.0,
  },
  {
    id: 'xagusd',
    name: '现货白银',
    code: 'XAG/USD',
    unit: 'USD/oz',
    price: 68.7,
    prevPrice: 68.7,
    openPrice: 68.2,
    change: 0.5,
    changePercent: 0.73,
    high: 69.5,
    low: 67.8,
  },
  {
    id: 'paxgusd',
    name: '暗金(PAXG)',
    code: 'PAXG/USD',
    unit: 'USD/oz',
    price: 4589.0,
    prevPrice: 4589.0,
    openPrice: 4570.0,
    change: 19.0,
    changePercent: 0.42,
    high: 4595.0,
    low: 4565.0,
  },
  // --- 国内品种（保留，国内行情页使用）---
  {
    id: 'autd',
    name: '上海黄金',
    code: 'AU(T+D)',
    unit: 'CNY/g',
    price: 562.35,
    prevPrice: 562.35,
    openPrice: 561.23,
    change: 1.12,
    changePercent: 0.2,
    high: 563.5,
    low: 560.9,
  },
  {
    id: 'agtd',
    name: '上海白银',
    code: 'AG(T+D)',
    unit: 'CNY/kg',
    price: 7245,
    prevPrice: 7245,
    openPrice: 7287,
    change: -42,
    changePercent: -0.58,
    high: 7290,
    low: 7238,
  },
  {
    id: 'auretail',
    name: '品牌金零售',
    code: 'AU 零售',
    unit: 'CNY/g',
    price: 992.0,
    prevPrice: 992.0,
    openPrice: 988.0,
    change: 4.0,
    changePercent: 0.4,
    high: 993.0,
    low: 988.0,
  },
  {
    id: 'agretail',
    name: '品牌银零售',
    code: 'AG 零售',
    unit: 'CNY/g',
    price: 9.28,
    prevPrice: 9.28,
    openPrice: 9.35,
    change: -0.07,
    changePercent: -0.75,
    high: 9.36,
    low: 9.25,
  },
]

export const intradayTimes = [
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
]

export const intradayPrices = [
  4575.2, 4582.5, 4590.8, 4586.3, 4595.1, 4602.7, 4608.4, 4598.6, 4605.3, 4612.8, 4609.2, 4602.99,
]

// Daily K-line for XAU/USD (last 30 sessions)
export const dailyKline = [
  { t: '07-12', o: 4380, c: 4395, h: 4402, l: 4375 },
  { t: '07-15', o: 4395, c: 4410, h: 4418, l: 4390 },
  { t: '07-16', o: 4410, c: 4402, h: 4420, l: 4398 },
  { t: '07-17', o: 4402, c: 4390, h: 4408, l: 4385 },
  { t: '07-18', o: 4390, c: 4400, h: 4406, l: 4388 },
  { t: '07-19', o: 4400, c: 4415, h: 4420, l: 4398 },
  { t: '07-22', o: 4415, c: 4430, h: 4435, l: 4412 },
  { t: '07-23', o: 4430, c: 4424, h: 4438, l: 4420 },
  { t: '07-24', o: 4424, c: 4412, h: 4428, l: 4408 },
  { t: '07-25', o: 4412, c: 4398, h: 4416, l: 4392 },
  { t: '07-26', o: 4398, c: 4410, h: 4415, l: 4395 },
  { t: '07-29', o: 4410, c: 4425, h: 4430, l: 4408 },
  { t: '07-30', o: 4425, c: 4440, h: 4445, l: 4422 },
  { t: '07-31', o: 4440, c: 4435, h: 4448, l: 4428 },
  { t: '08-01', o: 4435, c: 4450, h: 4455, l: 4432 },
  { t: '08-02', o: 4450, c: 4462, h: 4468, l: 4448 },
  { t: '08-05', o: 4462, c: 4448, h: 4466, l: 4442 },
  { t: '08-06', o: 4448, c: 4435, h: 4452, l: 4428 },
  { t: '08-07', o: 4435, c: 4420, h: 4440, l: 4415 },
  { t: '08-08', o: 4420, c: 4410, h: 4425, l: 4405 },
  { t: '08-09', o: 4410, c: 4428, h: 4432, l: 4408 },
  { t: '08-12', o: 4428, c: 4445, h: 4450, l: 4425 },
  { t: '08-13', o: 4445, c: 4438, h: 4452, l: 4435 },
  { t: '08-14', o: 4438, c: 4422, h: 4442, l: 4418 },
  { t: '08-15', o: 4422, c: 4410, h: 4428, l: 4405 },
  { t: '08-16', o: 4410, c: 4428, h: 4432, l: 4408 },
  { t: '08-19', o: 4428, c: 4450, h: 4455, l: 4425 },
  { t: '08-20', o: 4450, c: 4519, h: 4525, l: 4448 },
  { t: '08-21', o: 4519, c: 4605, h: 4632, l: 4509 },
  { t: '08-22', o: 4605, c: 4602.99, h: 4632.1, l: 4508.75 },
]

export const buySignals: SignalPoint[] = [
  { time: '10:30', price: 4590.8, reason: '回踩 20 日均线，建议买入', side: 'buy' },
  { time: '14:00', price: 4598.6, reason: '美元急跌触发支撑，建议买入', side: 'buy' },
]

export const sellSignals: SignalPoint[] = [
  { time: '11:30', price: 4595.1, reason: '触及前高阻力，建议卖出', side: 'sell' },
  { time: '15:00', price: 4612.8, reason: 'RSI 超买回落，建议卖出', side: 'sell' },
]

export const newsItems: NewsItem[] = [
  {
    id: 'n1',
    scope: 'international',
    title: '美联储会议纪要暗示 9 月可能启动降息',
    summary: '降息预期削弱美元，黄金吸引力上升',
    signal: 'bull',
    time: '10:25',
  },
  {
    id: 'n2',
    scope: 'international',
    title: '美元指数反弹至 103.5，非美货币承压',
    summary: '美元走强对金价形成短期压制',
    signal: 'bear',
    time: '11:40',
  },
  {
    id: 'n3',
    scope: 'international',
    title: '中东地缘冲突反复，避险买盘间歇性流入',
    summary: '风险情绪反复，尚未形成单边驱动',
    signal: 'neutral',
    time: '13:10',
  },
  {
    id: 'n4',
    scope: 'domestic',
    title: '央行连续 16 个月增持黄金储备',
    summary: '官方购金提供长期底部支撑',
    signal: 'bull',
    time: '09:50',
  },
  {
    id: 'n5',
    scope: 'domestic',
    title: '人民币汇率企稳，进口黄金成本波动收窄',
    summary: '汇率对冲效应有限',
    signal: 'neutral',
    time: '12:15',
  },
  {
    id: 'n6',
    scope: 'domestic',
    title: '国内金饰消费需求季节性回落',
    summary: '实物需求短期边际减弱',
    signal: 'bear',
    time: '14:30',
  },
]

export const prediction = {
  text: '综合 6 条消息信号：降息预期与央行购金形成利多，但美元反弹与实物需求回落构成压制。预计金价维持震荡偏强，短线支撑 2,395，阻力 2,420。',
  support: 2395,
  resistance: 2420,
  counts: { bull: 2, bear: 2, neutral: 2 },
}

// ==================== 国内零售行情 ====================
export interface DomesticMetal {
  id: string
  name: string
  symbol: string // 元素符号 Au / Pt / Pd / Ag
  price: number // 当前价
  prevPrice: number
  openPrice: number
  change: number
  changePercent: number
  high: number
  low: number
  unit: string
  color: string // brand color tint
}

export const domesticMetals: DomesticMetal[] = [
  {
    id: 'au',
    name: '黄金',
    symbol: 'Au',
    price: 996.0,
    prevPrice: 996.0,
    openPrice: 990.0,
    change: 6.0,
    changePercent: 0.61,
    high: 999.0,
    low: 989.0,
    unit: '元/克',
    color: '#D4A853',
  },
  {
    id: 'pt',
    name: '铂金',
    symbol: 'Pt',
    price: 373.05,
    prevPrice: 373.05,
    openPrice: 370.5,
    change: 2.55,
    changePercent: 0.69,
    high: 375.2,
    low: 369.8,
    unit: '元/克',
    color: '#E5E4E2',
  },
  {
    id: 'pd',
    name: '钯金',
    symbol: 'Pd',
    price: 241.59,
    prevPrice: 241.59,
    openPrice: 244.2,
    change: -2.61,
    changePercent: -1.07,
    high: 245.0,
    low: 241.0,
    unit: '元/克',
    color: '#CED0DD',
  },
  {
    id: 'ag',
    name: '白银',
    symbol: 'Ag',
    price: 16.9,
    prevPrice: 16.9,
    openPrice: 16.5,
    change: 0.4,
    changePercent: 2.42,
    high: 17.1,
    low: 16.4,
    unit: '元/克',
    color: '#B8C4CF',
  },
]

// ==================== 品牌行情 ====================
export interface BrandPrice {
  id: string
  brand: string
  category: string // 品类如 黄金 / 铂金
  buyPrice: number // 回收价
  sellPrice: number // 零售价
  unit: string
  change: number
  changePercent: number
  updated: string
}

export const brandPrices: BrandPrice[] = [
  // 水贝行情
  {
    id: 'shuibei-au',
    brand: '水贝',
    category: '黄金',
    buyPrice: 975.0,
    sellPrice: 995.0,
    unit: '元/克',
    change: 2.0,
    changePercent: 0.2,
    updated: '22:30',
  },
  {
    id: 'shuibei-pt',
    brand: '水贝',
    category: '铂金',
    buyPrice: 358.0,
    sellPrice: 378.0,
    unit: '元/克',
    change: 1.5,
    changePercent: 0.4,
    updated: '22:30',
  },
  {
    id: 'shuibei-ag',
    brand: '水贝',
    category: '白银',
    buyPrice: 12.2,
    sellPrice: 13.5,
    unit: '元/克',
    change: -0.1,
    changePercent: -0.8,
    updated: '22:30',
  },
  // 周大福
  {
    id: 'ctf-au',
    brand: '周大福',
    category: '黄金',
    buyPrice: 980.0,
    sellPrice: 1018.0,
    unit: '元/克',
    change: 3.0,
    changePercent: 0.3,
    updated: '22:30',
  },
  {
    id: 'ctf-pt',
    brand: '周大福',
    category: '铂金',
    buyPrice: 360.0,
    sellPrice: 395.0,
    unit: '元/克',
    change: 2.0,
    changePercent: 0.5,
    updated: '22:30',
  },
  {
    id: 'ctf-ag',
    brand: '周大福',
    category: '白银',
    buyPrice: 12.5,
    sellPrice: 14.2,
    unit: '元/克',
    change: -0.08,
    changePercent: -0.6,
    updated: '22:30',
  },
  // 金六福
  {
    id: 'jlf-au',
    brand: '金六福',
    category: '黄金',
    buyPrice: 972.0,
    sellPrice: 1005.0,
    unit: '元/克',
    change: 1.8,
    changePercent: 0.18,
    updated: '22:30',
  },
  {
    id: 'jlf-pt',
    brand: '金六福',
    category: '铂金',
    buyPrice: 355.0,
    sellPrice: 385.0,
    unit: '元/克',
    change: 1.2,
    changePercent: 0.32,
    updated: '22:30',
  },
  {
    id: 'jlf-ag',
    brand: '金六福',
    category: '白银',
    buyPrice: 12.0,
    sellPrice: 13.8,
    unit: '元/克',
    change: -0.12,
    changePercent: -0.9,
    updated: '22:30',
  },
]

// 国内黄金分时价格（参考截图走势：低开后拉升至高位，收盘回落）
export const domesticIntradayTimes = [
  '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
  '12:00', '14:00', '16:00', '18:00', '20:00', '22:30',
]
export const domesticIntradayPrices = [
  988.0, 989.5, 991.0, 992.5, 995.0, 997.8,
  999.0, 998.5, 996.0, 994.0, 992.0, 990.0,
]

export interface WatchlistItem extends Product {
  added: boolean
}

export const watchlistSeed: WatchlistItem[] = [
  ...initialProducts.map((p) => ({ ...p, added: true })),
  {
    id: 'palladium',
    name: '现货钯金',
    code: 'XPD/USD',
    unit: 'USD/oz',
    price: 928.4,
    prevPrice: 928.4,
    openPrice: 915.2,
    change: 13.2,
    changePercent: 1.44,
    high: 935.0,
    low: 914.0,
    added: false,
  },
  {
    id: 'platinum',
    name: '现货铂金',
    code: 'XPT/USD',
    unit: 'USD/oz',
    price: 962.15,
    prevPrice: 962.15,
    openPrice: 968.0,
    change: -5.85,
    changePercent: -0.6,
    high: 970.5,
    low: 960.2,
    added: false,
  },
]
