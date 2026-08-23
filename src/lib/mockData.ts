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
  {
    id: 'xauusd',
    name: '现货黄金',
    code: 'XAU/USD',
    unit: 'USD/oz',
    price: 2412.85,
    prevPrice: 2412.85,
    openPrice: 2400.45,
    change: 12.4,
    changePercent: 0.52,
    high: 2418.6,
    low: 2396.2,
  },
  {
    id: 'xagusd',
    name: '现货白银',
    code: 'XAG/USD',
    unit: 'USD/oz',
    price: 27.93,
    prevPrice: 27.93,
    openPrice: 28.11,
    change: -0.18,
    changePercent: -0.64,
    high: 28.24,
    low: 27.81,
  },
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
  2406.2, 2403.5, 2398.2, 2401.8, 2408.5, 2410.2, 2412.0, 2405.6, 2409.3, 2414.1, 2413.5, 2412.85,
]

// Daily K-line for XAU/USD (last 30 sessions)
export const dailyKline = [
  { t: '07-12', o: 2392, c: 2401, h: 2406, l: 2388 },
  { t: '07-15', o: 2401, c: 2410, h: 2415, l: 2398 },
  { t: '07-16', o: 2410, c: 2405, h: 2418, l: 2402 },
  { t: '07-17', o: 2405, c: 2398, h: 2408, l: 2392 },
  { t: '07-18', o: 2398, c: 2403, h: 2407, l: 2395 },
  { t: '07-19', o: 2403, c: 2412, h: 2416, l: 2401 },
  { t: '07-22', o: 2412, c: 2420, h: 2424, l: 2409 },
  { t: '07-23', o: 2420, c: 2416, h: 2426, l: 2412 },
  { t: '07-24', o: 2416, c: 2408, h: 2420, l: 2404 },
  { t: '07-25', o: 2408, c: 2399, h: 2412, l: 2394 },
  { t: '07-26', o: 2399, c: 2406, h: 2410, l: 2396 },
  { t: '07-29', o: 2406, c: 2414, h: 2418, l: 2402 },
  { t: '07-30', o: 2414, c: 2422, h: 2426, l: 2410 },
  { t: '07-31', o: 2422, c: 2418, h: 2428, l: 2414 },
  { t: '08-01', o: 2418, c: 2425, h: 2430, l: 2416 },
  { t: '08-02', o: 2425, c: 2430, h: 2434, l: 2422 },
  { t: '08-05', o: 2430, c: 2422, h: 2432, l: 2418 },
  { t: '08-06', o: 2422, c: 2415, h: 2426, l: 2410 },
  { t: '08-07', o: 2415, c: 2408, h: 2420, l: 2404 },
  { t: '08-08', o: 2408, c: 2402, h: 2412, l: 2398 },
  { t: '08-09', o: 2402, c: 2410, h: 2414, l: 2400 },
  { t: '08-12', o: 2410, c: 2418, h: 2422, l: 2408 },
  { t: '08-13', o: 2418, c: 2412, h: 2424, l: 2410 },
  { t: '08-14', o: 2412, c: 2405, h: 2416, l: 2402 },
  { t: '08-15', o: 2405, c: 2398, h: 2408, l: 2394 },
  { t: '08-16', o: 2398, c: 2406, h: 2410, l: 2396 },
  { t: '08-19', o: 2406, c: 2414, h: 2418, l: 2404 },
  { t: '08-20', o: 2414, c: 2420, h: 2424, l: 2412 },
  { t: '08-21', o: 2420, c: 2412, h: 2424, l: 2408 },
  { t: '08-22', o: 2412, c: 2412.85, h: 2418.6, l: 2396.2 },
]

export const buySignals: SignalPoint[] = [
  { time: '10:30', price: 2398.2, reason: '回踩 20 日均线，建议买入', side: 'buy' },
  { time: '14:00', price: 2405.6, reason: '美元急跌触发支撑，建议买入', side: 'buy' },
]

export const sellSignals: SignalPoint[] = [
  { time: '11:30', price: 2408.5, reason: '触及前高阻力，建议卖出', side: 'sell' },
  { time: '15:00', price: 2414.1, reason: 'RSI 超买回落，建议卖出', side: 'sell' },
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
    price: 990.0,
    prevPrice: 990.0,
    openPrice: 988.0,
    change: 2.0,
    changePercent: 0.2,
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
    price: 13.08,
    prevPrice: 13.08,
    openPrice: 13.25,
    change: -0.17,
    changePercent: -1.28,
    high: 13.3,
    low: 13.0,
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
