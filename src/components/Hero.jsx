export default function Hero({ title, subtitle, cta, image }) {
  return (
    <section className="relative isolate flex min-h-[440px] items-center overflow-hidden bg-cracker-navy text-white sm:min-h-[460px] lg:min-h-[500px]">
      {image && (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[65%_45%] sm:object-[center_42%]"
        />
      )}

      {/* Overlays: even tint for readability + a stronger left-side fade behind the copy */}
      <div className="absolute inset-0 -z-10 bg-cracker-navy/25" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cracker-navy/85 via-cracker-navy/55 to-cracker-navy/10 sm:from-cracker-navy/80 sm:via-cracker-navy/35 sm:to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-6 py-14 sm:px-10 sm:py-16 lg:px-16">
        <div className="max-w-2xl">
          <h1 className="font-['Source_Serif_4',Georgia,serif] text-[40px] font-semibold leading-[1.1] tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] sm:text-5xl lg:text-[68px]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-md text-[15px] font-medium leading-relaxed text-white/95 sm:mt-5 sm:max-w-none sm:text-lg lg:text-[22px]">
              {subtitle}
            </p>
          )}
          {cta && <div className="mt-7 sm:mt-8">{cta}</div>}
        </div>
      </div>
    </section>
  )
}
