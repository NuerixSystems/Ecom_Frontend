import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import ToastViewport from '../components/ToastViewport.jsx'

const ToastContext = createContext(null)

const MAX_VISIBLE = 3
const DEFAULT_DURATION = 4500

// Reusable popup/toast system. Anything in the app can do:
//
//   const toast = useToast()
//   toast.success({ title: 'Saved', message: 'Your changes are live.' })
//   toast.error('Something went wrong')                       // string shorthand = message
//   toast.success({
//     title: 'Added to cart successfully', message: '...',
//     actions: [{ label: 'Place Enquiry', to: '/contact', primary: true },
//               { label: 'Continue Shopping', to: '/shop' }],   // or { label, onClick }
//     duration: 7000,                                           // 0 = stay until dismissed
//   })
//
// The provider sits above <App/> (see main.jsx), so a toast raised right before
// a route change (e.g. add-to-cart -> /cart) survives the navigation.
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const show = useCallback((type, input) => {
    const opts = typeof input === 'string' ? { message: input } : input || {}
    idRef.current += 1
    const toast = {
      id: idRef.current,
      type,
      title: opts.title || '',
      message: opts.message || '',
      actions: opts.actions || [],
      duration: opts.duration ?? DEFAULT_DURATION,
    }
    setToasts((list) => [...list, toast].slice(-MAX_VISIBLE))
    return toast.id
  }, [])

  const api = useMemo(
    () => ({
      show,
      success: (input) => show('success', input),
      error: (input) => show('error', input),
      info: (input) => show('info', input),
      dismiss,
    }),
    [show, dismiss],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
