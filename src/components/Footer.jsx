import { Link } from 'react-router-dom'
import { useCategories } from '../context/CategoriesContext.jsx'
import footerImg from '../assets/images/footer-fireworks.jpg'
import { InstagramIcon, LogoMark, PhoneIcon, WhatsAppIcon } from './icons.jsx'

const socials = [
  { Icon: InstagramIcon, label: 'Instagram', href: 'https://www.instagram.com/karpaga_crackers/' },
  { Icon: WhatsAppIcon, label: 'WhatsApp', href: 'https://wa.me/919585226667' },
]

export default function Footer() {
  const { categories } = useCategories()
  return (
    <footer
      className="relative text-gray-300 mt-16 bg-cracker-navy bg-cover bg-center"
      style={{ backgroundImage: `url(${footerImg})` }}
    >
      <div className="absolute inset-0 bg-cracker-navy/85" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <LogoMark className="h-9 w-9" />
            <span className="font-display text-lg font-bold text-cracker-orange">Karpaga Crackers</span>
          </div>
          <p className="text-sm text-gray-400">Bringing joy, happiness and togetherness to your celebrations.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-cracker-orange">Home</Link></li>
            <li><Link to="/shop" className="hover:text-cracker-orange">Shop</Link></li>
            <li><Link to="/about" className="hover:text-cracker-orange">About</Link></li>
            <li><Link to="/contact" className="hover:text-cracker-orange">Contact</Link></li>
            <li><Link to="/wishlist" className="hover:text-cracker-orange">Wishlist</Link></li>
            <li><Link to="/cart" className="hover:text-cracker-orange">Enquiry List</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Shop by Category</h4>
          <ul className="space-y-2 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}><Link to={`/shop?category=${c.id}`} className="hover:text-cracker-orange">{c.name}</Link></li>
            ))}
            <li><Link to="/shop" className="font-medium text-cracker-orange hover:underline">View All Categories →</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Customer Care</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/contact" className="hover:text-cracker-orange">Help &amp; Support</Link></li>
            <li>Shipping Policy</li>
            <li>Return Policy</li>
            <li>Privacy Policy</li>
            <li>Terms &amp; Conditions</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Connect With Us</h4>
          <div className="flex gap-3 mb-4">
            {socials.map(({ Icon, label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-cracker-orange hover:text-cracker-orange">
                <Icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
          <a href="tel:9585226667" className="flex items-center gap-2 text-sm hover:text-cracker-orange">
            <PhoneIcon className="h-4 w-4" /> 95852 26667
          </a>
        </div>
      </div>
      <div className="relative text-center text-xs text-gray-400 py-4 border-t border-white/10">
        © 2026 Karpaga Crackers. All rights reserved.
      </div>
    </footer>
  )
}
