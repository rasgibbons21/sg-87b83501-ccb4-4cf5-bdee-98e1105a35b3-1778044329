import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  display_name: string;
  location: string;
  situation: string;
  quote: string;
  started_with: string;
  result: string;
  avatar_emoji: string;
  image_url?: string;
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching testimonials:", error);
      return;
    }

    // Map testimonials to their AI-generated images
    const testimonialsWithImages = data?.map((t) => {
      let imageUrl = "";
      if (t.display_name === "Sarah M.") imageUrl = "/generated/testimonial-sarah.png";
      else if (t.display_name === "Priya K.") imageUrl = "/generated/testimonial-priya.png";
      else if (t.display_name === "Maria C.") imageUrl = "/generated/testimonial-maria.png";
      
      return { ...t, image_url: imageUrl };
    }) || [];

    setTestimonials(testimonialsWithImages);
  };

  return (
    <section className="py-24 bg-ivory">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta-100 rounded-full mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-terracotta-500"></div>
            <span className="text-sm font-medium text-terracotta-600 uppercase tracking-wide">
              Real Results
            </span>
          </div>
          <h2 className="font-serif text-5xl text-sage-800 mb-4">
            Women investing with Bloom
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-8 shadow-sm border-l-4 border-sage-400 hover:shadow-md transition-shadow"
            >
              <div className="text-6xl font-serif text-sage-200 leading-none mb-4">"</div>
              
              <p className="text-slate-700 italic leading-relaxed mb-6">
                {testimonial.quote}
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-sage-100">
                {testimonial.image_url ? (
                  <img 
                    src={testimonial.image_url} 
                    alt={testimonial.display_name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-sage-200"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sage-300 to-champagne-300 flex items-center justify-center text-2xl">
                    {testimonial.avatar_emoji}
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="font-semibold text-sage-900">{testimonial.display_name}</div>
                  <div className="text-sm text-slate-500">{testimonial.location}</div>
                  <div className="text-xs text-slate-400 mt-1">{testimonial.situation}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-600">Started with {testimonial.started_with}</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-mono font-semibold text-xs">
                  {testimonial.result}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}