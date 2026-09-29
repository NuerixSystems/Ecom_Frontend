import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from './icons.jsx'
import { backTarget, shouldShowBack } from '../utils/backNav.js'

// Site-wide "← Back" button, shown just under the header on every page except Home.
export default function BackButton() {
  const navigate = useNavigate()
  const location = useLocation()
  if (!shouldShowBack(location.pathname)) return null

  const goBack = () => navigate(backTarget(location.key, window.history.state?.idx))

  return (
    <div className="border-b border-orange-100 bg-white/70">
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1.5 rounded-full py-1 pl-1.5 pr-3 text-sm font-medium text-gray-700 transition-colors hover:bg-cracker-orange/10 hover:text-cracker-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-cracker-orange/60"
          aria-label="Go back"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back
        </button>
      </div>
    </div>
  )
}
