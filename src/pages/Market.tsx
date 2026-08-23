import { useMemo } from 'react'
import LivePriceCard from '../components/LivePriceCard'
import TrendChart from '../components/TrendChart'
import NewsPanel from '../components/NewsPanel'
import QuickTradeBar from '../components/QuickTradeBar'
import { useLivePrice } from '../hooks/useLivePrice'
import { initialProducts } from '../lib/mockData'

type MarketStatus = {
  isOpen: boolean
  nextOpenLabel: string | null
  nextCloseLabel: string | null
  dayLabel: string
}

/**
 * 判断当前是否为夏令时（美国夏令时：3月第二个周日至11月第一个周日）
 * 夏令时期间国际黄金交易时间比冬令时早1小时
 */
function isSummerTime(): boolean {
  const now = new Date()
  const month = now.getMonth() // 0=Jan
  const day = now.getDay() // 0=Sun
  const date = now.getDate()

  // 粗略判断：4月-10月为夏令时，11月-3月为冬令时
  // 精确判断需考虑3月第二个周日和11月第一个周日
  if (month >= 3 && month <= 9) return true // 4月-10月
  if (month === 2) {
    // 3月：第二个周日之后为夏令时
    const firstSunday = date <= 7 ? 7 - ((day + 7 - date) % 7) : null
    const secondSunday = firstSunday ? firstSunday + 7 : 14 - ((day + 14 - date) % 7)
    return date >= (secondSunday ?? 14)
  }
  if (month === 10) {
    // 11月：第一个周日之前为夏令时
    const firstSunday = date <= 7 ? 7 - ((day + 7 - date) % 7) : 7
    return date < (firstSunday || 7)
  }
  return false
}

/**
 * 国际传统黄金/白银交易时间
 * - 夏令时：周一06:00开盘 → 周六05:00收盘，每日05:00-06:00结算休市
 * - 冬令时：周一07:00开盘 → 周六06:00收盘，每日06:00-07:00结算休市
 * - 周末休市（周六收盘后至周一开盘）
 */
function getTraditionalStatus(): MarketStatus {
  const now = new Date()
  const day = now.getDay() // 0=周日, 1=周一, ..., 6=周六
  const minutes = now.getHours() * 60 + now.getMinutes()
  const summer = isSummerTime()

  const dailyOpen = summer ? 6 * 60 : 7 * 60 // 夏令时06:00, 冬令时07:00
  const dailyClose = summer ? 5 * 60 : 6 * 60 // 夏令时05:00, 冬令时06:00（次日）
  const settlementStart = dailyClose // 结算休市开始 = 每日收盘时间
  const settlementEnd = dailyOpen // 结算休市结束 = 每日开盘时间

  const dayLabel = summer ? '夏令时' : '冬令时'

  // --- 判断是否在交易时段 ---
  // 周一开盘时间至周六收盘时间为交易周
  // 每日 dailyOpen 至次日 dailyClose 为交易时间，dailyClose 至 dailyOpen 为结算休市

  // 周六：05:00/06:00 之前仍在交易（延续周五夜盘）
  if (day === 6) {
    if (minutes < dailyClose) {
      return {
        isOpen: true,
        nextOpenLabel: null,
        nextCloseLabel: `今日 ${summer ? '05:00' : '06:00'} 收盘`,
        dayLabel: `国际黄金（${dayLabel}）`,
      }
    }
    // 周六收盘后 → 周一开盘
    return {
      isOpen: false,
      nextOpenLabel: `周一 ${summer ? '06:00' : '07:00'} 开盘`,
      nextCloseLabel: null,
      dayLabel: `国际黄金（${dayLabel}）`,
    }
  }

  // 周日：全天休市
  if (day === 0) {
    return {
      isOpen: false,
      nextOpenLabel: `明日 ${summer ? '06:00' : '07:00'} 开盘`,
      nextCloseLabel: null,
      dayLabel: `国际黄金（${dayLabel}）`,
    }
  }

  // 周一至周五
  // 交易时段：dailyOpen 至次日 dailyClose（跨天）
  // 结算休市：dailyClose 至 dailyOpen（1小时）

  if (minutes >= dailyOpen) {
    // 当日开盘后 → 交易中（直到次日收盘）
    return {
      isOpen: true,
      nextOpenLabel: null,
      nextCloseLabel: `明日 ${summer ? '05:00' : '06:00'} 收盘`,
      dayLabel: `国际黄金（${dayLabel}）`,
    }
  }

  if (minutes >= settlementStart && minutes < settlementEnd) {
    // 结算休市时段（dailyClose 至 dailyOpen）
    return {
      isOpen: false,
      nextOpenLabel: `今日 ${summer ? '06:00' : '07:00'} 开盘`,
      nextCloseLabel: null,
      dayLabel: `结算休市（${dayLabel}）`,
    }
  }

  // 凌晨 dailyClose 之前 → 前一交易日的夜盘延续
  if (minutes < dailyClose) {
    // 周一凌晨：周日休市，不算延续
    if (day === 1) {
      return {
        isOpen: false,
        nextOpenLabel: `今日 ${summer ? '06:00' : '07:00'} 开盘`,
        nextCloseLabel: null,
        dayLabel: `国际黄金（${dayLabel}）`,
      }
    }
    // 周二至周五凌晨：前一交易日夜盘延续
    return {
      isOpen: true,
      nextOpenLabel: null,
      nextCloseLabel: `今日 ${summer ? '05:00' : '06:00'} 收盘`,
      dayLabel: `国际黄金（${dayLabel}）`,
    }
  }

  // 兜底
  return {
    isOpen: false,
    nextOpenLabel: `下个交易日 ${summer ? '06:00' : '07:00'} 开盘`,
    nextCloseLabel: null,
    dayLabel: `国际黄金（${dayLabel}）`,
  }
}

/**
 * 国际暗金（PAXG/XAUt）：全年365天 7×24 小时不间断交易
 */
function getDarkGoldStatus(): MarketStatus {
  return {
    isOpen: true,
    nextOpenLabel: null,
    nextCloseLabel: null,
    dayLabel: '7×24 不间断',
  }
}

export default function MarketPage() {
  const traditionalStatus = useMemo(() => getTraditionalStatus(), [])
  const darkGoldStatus = useMemo(() => getDarkGoldStatus(), [])

  // 按产品构建独立的交易状态（元/克 + 美元/盎司 共用同一交易时段）
  const openStatusMap = useMemo<Record<string, boolean>>(
    () => ({
      xaucny: traditionalStatus.isOpen,
      xagcny: traditionalStatus.isOpen,
      paxgcny: darkGoldStatus.isOpen,
      xauusd: traditionalStatus.isOpen,
      xagusd: traditionalStatus.isOpen,
      paxgusd: darkGoldStatus.isOpen,
    }),
    [traditionalStatus, darkGoldStatus],
  )

  const { products, tickDir } = useLivePrice(initialProducts, openStatusMap)

  // 分两组：元/克 和 美元/盎司
  const cnyProducts = useMemo(
    () => products.filter((p) => p.id === 'xaucny' || p.id === 'xagcny' || p.id === 'paxgcny'),
    [products],
  )
  const usdProducts = useMemo(
    () => products.filter((p) => p.id === 'xauusd' || p.id === 'xagusd' || p.id === 'paxgusd'),
    [products],
  )
  const allVisible = useMemo(() => [...cnyProducts, ...usdProducts], [cnyProducts, usdProducts])

  // 顶部状态以传统黄金为主
  const marketStatus = traditionalStatus

  const livePriceRegion = useMemo(
    () => (
      <section className="mb-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-base font-semibold text-foreground">实时行情</h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {marketStatus.isOpen ? (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full live-dot"
                    style={{ backgroundColor: 'var(--brand-state-success)' }}
                  />
                  实时推送
                </span>
                {marketStatus.nextCloseLabel && (
                  <span className="text-warning">距收盘 {marketStatus.nextCloseLabel}</span>
                )}
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--brand-state-error)' }}
                  />
                  已收盘
                </span>
                <span>下次开盘 {marketStatus.nextOpenLabel}</span>
              </>
            )}
            {/* 暗金始终交易中 */}
            <span className="inline-flex items-center gap-1.5 text-success">
              <span
                className="h-1.5 w-1.5 rounded-full live-dot"
                style={{ backgroundColor: 'var(--brand-state-success)' }}
              />
              暗金 7×24 交易中
            </span>
          </div>
        </div>

        {/* 第一排：元/克 */}
        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground">人民币计价（元/克）</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cnyProducts.map((p) => (
              <LivePriceCard
                key={p.id}
                product={p}
                tickDir={openStatusMap[p.id] ? tickDir[p.id] : undefined}
                isOpen={openStatusMap[p.id] ?? false}
              />
            ))}
          </div>
        </div>

        {/* 第二排：美元/盎司 */}
        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground">美元计价（USD/oz）</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {usdProducts.map((p) => (
              <LivePriceCard
                key={p.id}
                product={p}
                tickDir={openStatusMap[p.id] ? tickDir[p.id] : undefined}
                isOpen={openStatusMap[p.id] ?? false}
              />
            ))}
          </div>
        </div>
      </section>
    ),
    [cnyProducts, usdProducts, tickDir, marketStatus, openStatusMap],
  )

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      {livePriceRegion}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <TrendChart />
        <NewsPanel />
      </div>

      <QuickTradeBar products={allVisible} />
    </div>
  )
}
