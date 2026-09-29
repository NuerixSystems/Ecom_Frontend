import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import CategoryCard from './CategoryCard.jsx'

// Horizontally auto-scrolling, seamlessly looping row of CategoryCards.
// Data-driven: pass any `categories` array ({ id, name, image }) and it adapts.
// Native overflow scrolling is kept, so touch swipe / trackpad / drag-scroll still work.
const SPEED = 45 // px per second
const RESUME_DELAY = 1500 // ms after touch/wheel before auto-scroll resumes

export default function CategoryMarquee({ categories }) {
  const scrollerRef = useRef(null)
  const setRef = useRef(null)
  const [repeat, setRepeat] = useState(1)

  // Each "set" must be at least as wide as the viewport so the loop never shows a gap.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    const setEl = setRef.current
    if (!scroller || !setEl || categories.length === 0) return
    const measure = () => {
      const baseWidth = setEl.scrollWidth / repeat
      if (!baseWidth) return
      const needed = Math.max(1, Math.ceil(scroller.clientWidth / baseWidth))
      setRepeat((r) => (r === needed ? r : needed))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(scroller)
    return () => ro.disconnect()
  }, [categories, repeat])

  useEffect(() => {
    const el = scrollerRef.current
    const setEl = setRef.current
    if (!el || !setEl || categories.length === 0) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    let raf
    let last = performance.now()
    let pos = 0
    let hovering = false
    let holding = false // finger down / keyboard focus inside
    let resumeAt = 0

    const setWidth = () => setEl.getBoundingClientRect().width

    // Three identical sets are rendered; keep scrollLeft inside the middle one,
    // so reaching the end (or swiping past it) silently jumps to the identical spot.
    const normalise = () => {
      const w = setWidth()
      if (!w) return
      if (el.scrollLeft >= 2 * w) el.scrollLeft -= w
      else if (el.scrollLeft < w) el.scrollLeft += w
    }
    el.scrollLeft = setWidth()
    pos = el.scrollLeft

    const tick = (now) => {
      const dt = Math.min(now - last, 100)
      last = now
      if (hovering || holding || now < resumeAt) {
        // Paused / user in control: follow wherever they scrolled to.
        pos = el.scrollLeft
      } else {
        // Advance a float position. Browsers may round scrollLeft to whole pixels,
        // so never re-read it here or slow speeds would stall.
        const w = setWidth()
        pos += (SPEED * dt) / 1000
        if (w && pos >= 2 * w) pos -= w
        el.scrollLeft = pos
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // Mouse only: touch "hover" is sticky after a tap and would freeze the carousel.
    const onEnter = (e) => { if (e.pointerType === 'mouse') hovering = true }
    const onLeave = () => { hovering = false }
    const onTouchStart = () => { holding = true }
    const onTouchEnd = () => { holding = false; resumeAt = performance.now() + RESUME_DELAY }
    const onWheel = () => { resumeAt = performance.now() + RESUME_DELAY }
    const onFocusIn = () => { holding = true }
    const onFocusOut = () => { holding = false }
    const onScroll = () => normalise()

    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('touchcancel', onTouchEnd, { passive: true })
    el.addEventListener('wheel', onWheel, { passive: true })
    el.addEventListener('focusin', onFocusIn)
    el.addEventListener('focusout', onFocusOut)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('focusin', onFocusIn)
      el.removeEventListener('focusout', onFocusOut)
      el.removeEventListener('scroll', onScroll)
    }
  }, [categories, repeat])

  if (!categories.length) return null

  const renderSet = (setIndex) =>
    Array.from({ length: repeat }, (_, r) =>
      categories.map((c) => (
        <div key={`${setIndex}-${r}-${c.id}`} className="shrink-0 pr-8">
          <CategoryCard category={c} />
        </div>
      ))
    )

  return (
    <div
      ref={scrollerRef}
      className="flex overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div ref={setRef} className="flex shrink-0">{renderSet(0)}</div>
      {/* Duplicates for the seamless loop: hidden from assistive tech and the tab order */}
      <div className="flex shrink-0" aria-hidden="true" inert="">{renderSet(1)}</div>
      <div className="flex shrink-0" aria-hidden="true" inert="">{renderSet(2)}</div>
    </div>
  )
}
