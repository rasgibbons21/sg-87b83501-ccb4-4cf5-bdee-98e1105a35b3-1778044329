"use client";

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
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("sort_order", { ascending: true })
        .limit(3);

      if (data) setTestimonials(data);
      if (error) console.error("Error fetching testimonials:", error);
    };

    fetchTestimonials();
  }, []);

  return (
    <section id="stories" className="py-20 bg-ivory">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-sage-900 mb-4">
            Real women. Real results.
          </h2>
          <p className="text-lg text-sage-600 max-w-2xl mx-auto">
            From single moms to stay-at-home moms, these are the women who started with doubt and ended with portfolios.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl p-8 border-l-4 border-gradient-to-b from-sage-600 to-champagne-400 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-6xl text-sage-200 font-serif leading-none mb-4">"</div>
              <p className="text-sage-700 italic mb-6 leading-relaxed">
                {testimonial.quote}
              </p>
              
              <div className="flex items-start gap-4 pt-6 border-t border-sage-100">
                <div className="text-4xl">{testimonial.avatar_emoji}</div>
                <div className="flex-1">
                  <div className="font-semibold text-sage-900">{testimonial.display_name}</div>
                  <div className="text-sm text-sage-600 mb-2">{testimonial.location}</div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-sage-100 text-sage-700 rounded">
                      {testimonial.situation}
                    </span>
                    <span className="text-xs px-2 py-1 bg-champagne-100 text-champagne-700 rounded">
                      Started with {testimonial.started_with}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-signal-buy bg-signal-buy-bg px-3 py-2 rounded inline-block">
                    {testimonial.result}
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