import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircleIcon, CheckCircleIcon, CloseIcon } from './icons.jsx'

const STYLES = {
  success: { ring: 'border-green-200', icon: 'text-green-600', Icon: CheckCircleIcon },
  error: { ring: 'border-red-200', icon: 'text-cracker-red', Icon: AlertCircleIcon },
  info: { ring: 'border-orange-200', icon: 'text-cracker-orange', Icon: AlertCircleIcon },
}

const secondaryBtn =
  'rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-center text-sm font-medium text-gray-600 hover:border-cracker-orange hover:text-cracker-orange'
const primaryBtn = 'btn-primary !px-3.5 !py-2 text-center text-sm'

function ToastItem({ toast, onDismiss }) {
  const { id, type, title, message, actions, duration } = toast
  const style = STYLES[type] || STYLES.info
  const timer = useRef(null)

  const clear = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }
  const arm = () => {
    clear()
    if (duration > 0) timer.current = setTimeout(() => onDismiss(id), duration)
  }

  // Auto-dismiss; hovering/focusing pauses it so the action buttons stay clickable.
  useEffect(() => {
    arm()
    return clear
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, duration])

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      onMouseEnter={clear}
      onMouseLeave={arm}
      onFocus={clear}
      onBlur={arm}
      className={`pointer-events-auto rounded-xl border ${style.ring} bg-white p-4 shadow-xl`}
    >
      <div className="flex items-start gap-3">
        <style.Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.icon}`} />
        <div className="min-w-0 flex-1">
          {title && <p className="font-display text-sm font-semibold text-cracker-navy">{title}</p>}
          {message && <p className={`text-sm text-gray-600 ${title ? 'mt-0.5' : ''}`}>{message}</p>}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(id)}
          className="-m-1 flex h-8 w-8 shrink-0 items-center justify-center text-gray-400 hover:text-cracker-red"
          aria-label="Dismiss notification"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      {actions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 [&>*]:flex-1">
          {actions.map((action) => {
            const className = action.primary ? primaryBtn : secondaryBtn
            const handle = () => {
              action.onClick?.()
              onDismiss(id)
            }
            return action.to ? (
              <Link key={action.label} to={action.to} onClick={handle} className={className}>
                {action.label}
              </Link>
            ) : (
              <button key={action.label} type="button" onClick={handle} className={className}>
                {action.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Fixed stack: bottom on phones (thumb reach), top-right under the sticky
// header on larger screens.
export default function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-4 z-50 flex flex-col gap-3 sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-20 sm:w-[380px]"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
