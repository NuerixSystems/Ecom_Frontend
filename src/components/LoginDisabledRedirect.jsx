import { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext.jsx'

// Shown instead of the login-only pages (/login, /account, /orders) while
// LOGIN_ENABLED is false (see src/config/features.js). Nobody needs to log in:
// cart, wishlist and enquiries work directly. An old bookmark or typed URL just
// gets a short note and is sent to the home page.
export default function LoginDisabledRedirect() {
  const toast = useToast()
  const shown = useRef(false)

  useEffect(() => {
    if (shown.current) return
    shown.current = true
    toast.info({
      title: 'No login needed',
      message: 'You can add items to your cart and place your enquiry directly.',
    })
  }, [toast])

  return <Navigate to="/" replace />
}
