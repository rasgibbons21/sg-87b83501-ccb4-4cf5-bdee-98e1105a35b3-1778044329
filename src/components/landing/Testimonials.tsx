export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah M.",
      location: "Atlanta, GA",
      situation: "Single mom",
      quote: "I started with $75/month in VTI and SCHD. Four months later my account shows $387.",
      result: "+18.4% in 4 months",
      emoji: "👩‍💼"
    },
    {
      name: "Priya K.",
      location: "Austin, TX",
      situation: "Stay-at-home mom",
      quote: "Bloom explained everything without making me feel dumb. Now I manage my own $200/month portfolio.",
      result: "Portfolio up $1,840",
      emoji: "👩‍🏫"
    },
    {
      name: "Maria C.",
      location: "Miami, FL",
      situation: "Nurse",
      quote: "I thought I needed thousands. $50/month in QQQ and VTI was enough.",
      result: "$412 after 6 months",
      emoji: "👩‍⚕️"
    }
  ];

  return (
    <section id="stories" className="py-20 bg-[#FAF7F2]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#C4714A]" />
            <span className="text-[#C4714A] text-sm font-medium uppercase tracking-wider">
              Real Stories
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-[#2D4A3E] mb-4">
            Women building wealth, $50 at a time
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 relative overflow-hidden group hover:shadow-lg transition-shadow"
            >
              {/* Left border gradient */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2D4A3E] via-[#5E9478] to-[#D4AF6A]" />
              
              <div className="pl-4">
                {/* Opening quote mark */}
                <div className="text-6xl font-serif text-[#A8C9B5] leading-none mb-3">
                  "
                </div>

                {/* Quote text */}
                <p className="text-slate-700 italic text-base leading-relaxed mb-6">
                  {testimonial.quote}
                </p>

                {/* Member info */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{testimonial.emoji}</div>
                    <div>
                      <div className="font-semibold text-[#2D4A3E]">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {testimonial.location}
                      </div>
                      <div className="inline-block mt-1 px-2 py-0.5 bg-[#E8F2ED] text-[#2D4A3E] text-xs rounded-full">
                        {testimonial.situation}
                      </div>
                    </div>
                  </div>

                  {/* Result badge */}
                  <div className="shrink-0 px-3 py-1.5 bg-[#E8F5EE] border border-[#2D7A4A]/20 rounded-lg">
                    <div className="text-xs text-slate-600 mb-0.5">Result</div>
                    <div className="text-sm font-semibold text-[#2D7A4A]">
                      {testimonial.result}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}