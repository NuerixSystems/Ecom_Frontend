import { formatINR } from '../utils/pricing.js'
import { PRICE_MAX, PRICE_MIN, normalizeRange } from '../utils/shopFilters.js'

const STEP = 50
const values = Array.from({ length: Math.ceil(PRICE_MAX / STEP) + 1 }, (_, i) => Math.min(i * STEP, PRICE_MAX))

// Flipkart-style price filter: dual-handle slider with Min / Max boxes below.
export default function PriceRangeSlider({ min, max, onChange }) {
  const span = PRICE_MAX - PRICE_MIN
  const left = ((min - PRICE_MIN) / span) * 100
  const right = ((max - PRICE_MIN) / span) * 100

  // Slider handles stop at each other (they can't cross).
  const dragMin = (v) => onChange([Math.min(Number(v), max), max])
  const dragMax = (v) => onChange([min, Math.max(Number(v), min)])
  // Dropdowns: a Max below Min (or Min above Max) swaps the two values, so the
  // range never ends up empty.
  const pickMin = (v) => onChange(normalizeRange(v, max))
  const pickMax = (v) => onChange(normalizeRange(min, v))
  const boxCls = 'w-full rounded-sm border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-800 focus:border-cracker-orange focus:outline-none'

  return (
    <div>
      <div className="price-slider relative mx-2 mt-3 h-5">
        <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded bg-gray-300" />
        <div className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded bg-cracker-red" style={{ left: `${left}%`, width: `${right - left}%` }} />
        <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={1} value={min} onChange={(e) => dragMin(e.target.value)} aria-label="Minimum price" style={{ zIndex: min > PRICE_MAX - 100 ? 5 : 3 }} />
        <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={1} value={max} onChange={(e) => dragMax(e.target.value)} aria-label="Maximum price" style={{ zIndex: 4 }} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <select value={values.includes(min) ? min : ''} onChange={(e) => pickMin(e.target.value)} className={boxCls} aria-label="Minimum price">
          {!values.includes(min) && <option value="">{formatINR(min)}</option>}
          {values.map((v) => <option key={v} value={v}>{v === 0 ? 'Min' : formatINR(v)}</option>)}
        </select>
        <span className="text-xs text-gray-500">to</span>
        <select value={values.includes(max) ? max : ''} onChange={(e) => pickMax(e.target.value)} className={boxCls} aria-label="Maximum price">
          {!values.includes(max) && <option value="">{formatINR(max)}</option>}
          {values.map((v) => <option key={v} value={v}>{v === PRICE_MAX ? `${formatINR(v)}+` : formatINR(v)}</option>)}
        </select>
      </div>
    </div>
  )
}
