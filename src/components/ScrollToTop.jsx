import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Every page change (Home -> Shop -> Product -> Cart ...) starts at the top of the new page.
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
