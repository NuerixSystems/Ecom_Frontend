import { useState } from 'react'
import heroContactImg from '../assets/images/hero-contact.jpg'
import PageHero from '../components/PageHero.jsx'
import { InstagramIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from '../components/icons.jsx'
import { sendContactMessage } from '../api/contact.js'
import { ApiError } from '../api/client.js'
import EnquiryPanel from '../components/EnquiryPanel.jsx'
import { useToast } from '../context/ToastContext.jsx'

const contactRows = [
  { Icon: PhoneIcon, label: 'Phone', value: '95852 26667', href: 'tel:9585226667' },
  { Icon: WhatsAppIcon, label: 'WhatsApp', value: '95852 26667', href: 'https://wa.me/919585226667' },
  { Icon: MailIcon, label: 'Email', value: 'hello@karpagacrackers.com', href: 'mailto:hello@karpagacrackers.com' },
  { Icon: PinIcon, label: 'Address', value: '125, Festival Street, Chennai - 600001' },
]

const socials = [
  { Icon: InstagramIcon, label: 'Instagram', href: 'https://www.instagram.com/karpaga_crackers/' },
]

export default function Contact() {
  const toast = useToast()
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return // prevent duplicate submissions

    const form = e.target
    const name = form.name.value.trim()
    const email = form.email.value.trim()
    const message = form.message.value.trim()

    setError('')
    setSubmitting(true)
    try {
      await sendContactMessage({ name, email, message })
      setSent(true)
      toast.success({ title: 'Message sent', message: 'Thanks! Your message has been noted.' })
      form.reset()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.'
      setError(message)
      toast.error({ title: 'Could not send message', message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHero title="Get in Touch" subtitle="We're here to help you" image={heroContactImg} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-14">
        <EnquiryPanel />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-14 pt-4 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h2 className="font-display text-xl font-bold text-cracker-navy">Contact Information</h2>
          <ul className="space-y-4">
            {contactRows.map(({ Icon, label, value, href }) => (
              <li key={label} className="flex items-start gap-3 text-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-cracker-orange"><Icon className="h-[18px] w-[18px]" /></span>
                <span><span className="block font-medium text-gray-800">{label}</span>{href ? (
                  <a href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="break-words text-gray-500 hover:text-cracker-orange">{value}</a>
                ) : (
                  <span className="text-gray-500">{value}</span>
                )}</span>
              </li>
            ))}
          </ul>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-800">Follow Us</p>
            <div className="flex gap-3">
              {socials.map(({ Icon, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 text-cracker-navy transition-colors hover:border-cracker-orange hover:text-cracker-orange">
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4 text-sm">
          <h2 className="font-semibold text-gray-800 mb-1">Send a Message</h2>
          <label className="block"><span className="mb-1 block text-xs font-medium text-gray-600">Name <span className="text-cracker-red">*</span></span>
            <input required name="name" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-cracker-orange focus:outline-none" placeholder="Enter your name" /></label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-gray-600">Email <span className="text-cracker-red">*</span></span>
            <input required type="email" name="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-cracker-orange focus:outline-none" placeholder="Enter your email" /></label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-gray-600">Message <span className="text-cracker-red">*</span></span>
            <textarea required name="message" rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-cracker-orange focus:outline-none" placeholder="Type your message" /></label>
          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? 'Sending…' : 'Send Message'}
          </button>
          {sent && <p className="text-green-600 text-xs">Thanks! Your message has been noted.</p>}
          {error && <p className="text-cracker-red text-xs">{error}</p>}
        </form>
      </div>
    </div>
  )
}
