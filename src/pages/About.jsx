import { useState } from 'react'
import { Link } from 'react-router-dom'
import heroAboutImg from '../assets/images/hero-about.jpg'
import aboutStoryImg from '../assets/images/about-story.jpg'
import lanternImg from '../assets/images/lantern-story.jpg'
import ctaCelebrationsImg from '../assets/images/cta-celebrations.png'
import PageHero from '../components/PageHero.jsx'
import { categories } from '../data/products.js'
import {
  AwardIcon,
  BoxIcon,
  CheckCircleIcon,
  HeartIcon,
  PhoneIcon,
  ShieldIcon,
  SparklesIcon,
  StarIcon,
  TruckIcon,
  UsersIcon,
  WhatsAppIcon,
} from '../components/icons.jsx'

const stats = [
  { value: '75+', label: 'Products' },
  { value: '24', label: 'Categories' },
  { value: '1000s', label: 'Happy Customers' },
  { value: '100%', label: 'Quality Checked' },
]

const values = [
  { Icon: AwardIcon, title: 'Quality Products', desc: 'Every item is checked for performance and finish before it reaches you.' },
  { Icon: ShieldIcon, title: 'Safety First', desc: 'Clear usage guidance and safe, reliable products for the whole family.' },
  { Icon: HeartIcon, title: 'Customer First', desc: 'Friendly help on WhatsApp and phone, before and after your enquiry.' },
  { Icon: SparklesIcon, title: 'Celebration Together', desc: 'From kids\u2019 sparklers to grand aerial shows, we help you light up the moment.' },
]

const promises = [
  'Fair, transparent prices with honest advice',
  'Products picked straight from trusted Sivakasi makers',
  'Friendly guidance on choosing the right mix for your budget',
  'Careful packing so everything reaches you in perfect shape',
]

const journey = [
  { tag: 'The Idea', title: 'A simple vision', desc: 'Karpaga Crackers began with one goal: make every festival brighter with crackers families can trust.' },
  { tag: 'Sourcing', title: 'Straight from Sivakasi', desc: 'We work with reliable manufacturers so quality and freshness are never a question.' },
  { tag: 'Growing', title: 'A range for everyone', desc: 'From gentle sparklers to grand aerial shows, we grew a catalogue with something for every age and budget.' },
  { tag: 'Today', title: 'Easy online enquiry', desc: 'Browse, add to cart and send your enquiry \u2014 we confirm prices and availability personally on WhatsApp.' },
]

const steps = [
  { n: '1', title: 'Browse & Add', desc: 'Pick your favourite crackers and add them to your cart.' },
  { n: '2', title: 'Place Enquiry', desc: 'Share your details and send the enquiry on WhatsApp.' },
  { n: '3', title: 'We Confirm', desc: 'Our team calls back with confirmed prices and availability.' },
  { n: '4', title: 'Celebrate', desc: 'Get ready to light up your festival with family and friends.' },
]

const reviews = [
  { name: 'Ramesh K.', place: 'Chennai', text: 'Wide variety and very fair prices. The team helped us pick the right combo for the whole family.' },
  { name: 'Priya S.', place: 'Madurai', text: 'Kids loved the sparklers and fountains. Everything arrived well packed and worked perfectly.' },
  { name: 'Arun M.', place: 'Coimbatore', text: 'Quick replies on WhatsApp and honest advice on what to buy for our function. Highly recommended!' },
]

const safetyTips = [
  { q: 'Light crackers outdoors only', a: 'Always use an open area away from buildings, dry grass and vehicles.' },
  { q: 'Keep a bucket of water nearby', a: 'Have water or sand ready, and drop used crackers into water after the show.' },
  { q: 'Adult supervision for children', a: 'Kids should only handle sparklers and ground items, always with an adult beside them.' },
  { q: 'Light one at a time, and step back', a: 'Use a long incense stick, light the fuse at arm\u2019s length and move away quickly.' },
]

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-10 text-center">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cracker-orange">{eyebrow}</p>
      <h2 className="font-display text-2xl font-bold text-cracker-navy sm:text-3xl">{title}</h2>
      <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-gradient-to-r from-cracker-orange to-cracker-gold" />
      {subtitle && <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-500">{subtitle}</p>}
    </div>
  )
}

export default function About() {
  const [openTip, setOpenTip] = useState(0)
  const showcase = categories.slice(0, 8)

  return (
    <div>
      <PageHero title="About Karpaga Crackers" subtitle="Bringing Joy to Every Celebration" image={heroAboutImg} />

      {/* Story */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cracker-orange">Our Story</p>
          <h2 className="font-display text-2xl font-bold text-cracker-navy sm:text-3xl mb-4">Lighting up celebrations, one festival at a time</h2>
          <div className="space-y-3 text-sm leading-relaxed text-gray-600">
            <p>
              Karpaga Crackers was founded with a simple vision — to bring happiness, light and togetherness
              to every celebration. We offer premium quality crackers that people trust for festivals, weddings
              and every moment worth remembering.
            </p>
            <p>
              From gentle sparklers and colourful fountains for the little ones to rockets, multi-shots and
              bombs for the big night sky, our range is built so every family finds something they love —
              at fair prices, with honest advice.
            </p>
          </div>
          <ul className="mt-5 space-y-2">
            {promises.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircleIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-cracker-orange" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/shop" className="btn-primary inline-block">Explore Products</Link>
            <Link to="/contact" className="inline-block rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:border-cracker-orange hover:text-cracker-orange">Contact Us</Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-br from-cracker-orange/20 to-cracker-gold/20" />
          <div
            className="aspect-[4/3] rounded-2xl bg-cover bg-center shadow-lg"
            style={{ backgroundImage: `url(${aboutStoryImg})`, backgroundPosition: 'center 30%' }}
            role="img"
            aria-label="Fireworks lighting up the night sky"
          />
          <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg border border-orange-100 sm:left-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-cracker-orange"><AwardIcon className="h-5 w-5" /></span>
            <div>
              <p className="font-display text-sm font-bold text-cracker-navy">Trusted Quality</p>
              <p className="text-xs text-gray-500">Every item checked</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-cracker-navy bg-firework-hero">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl font-bold text-cracker-gold sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-gray-300">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & vision */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <SectionHeading eyebrow="Our Purpose" title="What drives us" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-8 border-l-4 border-l-cracker-orange">
            <h3 className="font-display text-lg font-semibold text-cracker-navy mb-2">Our Mission</h3>
            <p className="text-sm leading-relaxed text-gray-600">
              To make festive shopping simple, safe and joyful — offering quality crackers at fair prices with
              friendly, personal service from first enquiry to final delivery.
            </p>
          </div>
          <div className="card p-8 border-l-4 border-l-cracker-gold">
            <h3 className="font-display text-lg font-semibold text-cracker-navy mb-2">Our Vision</h3>
            <p className="text-sm leading-relaxed text-gray-600">
              To be the most trusted name in festive crackers for families and event planners — known for
              honest advice, dependable quality and celebrations that everyone remembers.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-orange-50/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <SectionHeading eyebrow="What We Stand For" title="Why families choose us" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(({ Icon, title, desc }) => (
              <div key={title} className="card p-6 text-center hover:-translate-y-1 transition-transform">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 text-cracker-orange"><Icon className="h-6 w-6" /></div>
                <h3 className="font-display text-sm font-semibold text-gray-800">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <SectionHeading eyebrow="Our Journey" title="From a simple idea to your festival" />
        <ol className="relative mx-auto max-w-3xl space-y-8 border-l-2 border-orange-200 pl-8">
          {journey.map((j) => (
            <li key={j.title} className="relative">
              <span className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-cracker-orange to-cracker-red ring-4 ring-cracker-cream" />
              <p className="text-xs font-semibold uppercase tracking-wider text-cracker-orange">{j.tag}</p>
              <h3 className="font-display text-base font-semibold text-cracker-navy">{j.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{j.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div
          className="relative overflow-hidden rounded-2xl bg-cover bg-center px-8 py-14 text-center text-white"
          style={{ backgroundImage: `url(${lanternImg})` }}
        >
          <div className="absolute inset-0 bg-cracker-navy/60" />
          <div className="relative">
            <h3 className="font-display text-2xl font-bold mb-2 sm:text-3xl">More Than Just Crackers</h3>
            <p className="mx-auto max-w-xl text-sm text-gray-200">
              We bring joy, happiness and togetherness to your celebrations — because the best moments are the ones we share.
            </p>
          </div>
        </div>
      </section>

      {/* Categories showcase */}
      {showcase.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <SectionHeading eyebrow="Our Range" title="Something for every celebration" subtitle="A few of the categories our customers love most." />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {showcase.map((c) => (
              <Link key={c.id} to={`/shop?category=${c.id}`} className="group card overflow-hidden">
                <div className="aspect-square overflow-hidden bg-[#F1E9DD]">
                  <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <p className="px-3 py-3 text-center text-xs font-semibold text-gray-800 group-hover:text-cracker-orange">{c.name}</p>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/shop" className="btn-primary inline-block">View All Products</Link>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-orange-50/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <SectionHeading eyebrow="Simple & Easy" title="How ordering works" />
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s) => (
              <li key={s.n} className="card p-6">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cracker-orange to-cracker-red font-display text-sm font-bold text-white">{s.n}</span>
                <h3 className="font-display text-sm font-semibold text-gray-800">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{s.desc}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
            {[
              { Icon: BoxIcon, text: 'Wide variety for every budget' },
              { Icon: TruckIcon, text: 'Careful packing & delivery support' },
              { Icon: UsersIcon, text: 'Trusted by families and event planners' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm border border-orange-100">
                <Icon className="h-5 w-5 shrink-0 text-cracker-orange" /> <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <SectionHeading eyebrow="Happy Celebrations" title="What our customers say" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((r) => (
            <figure key={r.name} className="card p-6">
              <div className="mb-3 flex gap-0.5 text-cracker-gold">
                {[0, 1, 2, 3, 4].map((i) => <StarIcon key={i} className="h-4 w-4" />)}
              </div>
              <blockquote className="text-sm leading-relaxed text-gray-600">&ldquo;{r.text}&rdquo;</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cracker-orange to-cracker-red font-display text-sm font-bold text-white">{r.name[0]}</span>
                <span>
                  <span className="block text-sm font-semibold text-gray-800">{r.name}</span>
                  <span className="block text-xs text-gray-500">{r.place}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Safety tips */}
      <section className="bg-cracker-navy">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <div className="mb-8 text-center text-white">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cracker-gold">Celebrate Responsibly</p>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Safety tips for a happy festival</h2>
          </div>
          <div className="space-y-3">
            {safetyTips.map((t, i) => {
              const open = openTip === i
              return (
                <div key={t.q} className="rounded-xl bg-white/10 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => setOpenTip(open ? -1 : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-white"
                  >
                    <span className="flex items-center gap-3"><ShieldIcon className="h-5 w-5 shrink-0 text-cracker-gold" />{t.q}</span>
                    <span className="text-lg leading-none text-cracker-gold">{open ? '\u2212' : '+'}</span>
                  </button>
                  {open && <p className="px-5 pb-4 pl-[52px] text-sm leading-relaxed text-gray-300">{t.a}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div
          className="relative overflow-hidden rounded-2xl bg-cover bg-center px-6 py-14 text-center text-white"
          style={{ backgroundImage: `url(${ctaCelebrationsImg})` }}
        >
          <div className="absolute inset-0 bg-cracker-navy/60" />
          <div className="relative">
            <h3 className="font-display text-2xl font-bold mb-2 sm:text-3xl">Make Your Celebrations Extra Special</h3>
            <p className="mb-6 text-sm text-gray-200">Have a question or a big order in mind? Talk to us anytime.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/shop" className="btn-primary inline-block">Shop Now →</Link>
              <a
                href="https://wa.me/919585226667"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-green-700"
              >
                <WhatsAppIcon className="h-[18px] w-[18px]" /> WhatsApp Us
              </a>
              <a href="tel:9585226667" className="inline-flex items-center gap-2 rounded-lg border border-white/60 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10">
                <PhoneIcon className="h-[18px] w-[18px]" /> 95852 26667
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
