// Full-width banner used at the top of Shop, About and Contact.
export default function PageHero({ title, subtitle, image, position = 'center' }) {
  return (
    <section className="relative isolate flex min-h-[170px] items-center justify-center overflow-hidden bg-cracker-navy text-center text-white sm:min-h-[210px]">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        style={{ objectPosition: position }}
      />
      <div className="absolute inset-0 -z-10 bg-cracker-navy/60" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-black/30 to-transparent" />
      <div className="px-6 py-10">
        <h1 className="font-['Source_Serif_4',Georgia,serif] text-3xl font-semibold tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] sm:text-4xl">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-sm font-medium text-white/90 sm:text-base">{subtitle}</p>}
      </div>
    </section>
  )
}
