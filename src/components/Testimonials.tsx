import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "./MotionWrappers";

const testimonials = [
  {
    name: "Jean-Pierre M.",
    role: "Year 3, Computer Science",
    university: "University of Rwanda",
    rating: 5,
    text: "MR.ASSIGNMENT saved my semester! I submitted a complex physics project and got it back in 24 hours, better than I could have done myself.",
    initials: "JP",
  },
  {
    name: "Aimée U.",
    role: "Year 2, Business Admin",
    university: "AUCA",
    rating: 5,
    text: "The escrow system gave me confidence to try it. Paid only after seeing the quality. My agent was professional and on-time.",
    initials: "AU",
  },
  {
    name: "Claude N.",
    role: "Year 4, Engineering",
    university: "KIST",
    rating: 4,
    text: "I've been an agent for 6 months. The platform is straightforward, payments are fast, and the admin review keeps quality high.",
    initials: "CN",
  },
  {
    name: "Grace I.",
    role: "Year 1, Medicine",
    university: "University of Rwanda",
    rating: 5,
    text: "As a first-year student with a heavy workload, this platform has been a lifesaver. The chat feature made clarifications so easy.",
    initials: "GI",
  },
];

const Testimonials = () => (
  <section className="py-20">
    <div className="container mx-auto px-4 max-w-5xl">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3">
          Loved by Students Across Rwanda
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Real feedback from students and agents using MR.ASSIGNMENT.
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {testimonials.map((t, i) => (
          <motion.div key={i} variants={fadeUp}>
            <Card className="border-border card-hover h-full" style={{ boxShadow: "var(--card-shadow)" }}>
              <CardContent className="p-5">
                <Quote className="h-5 w-5 text-primary/30 mb-3" />
                <p className="text-sm leading-relaxed text-foreground mb-4">"{t.text}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {t.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-medium">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.role} · {t.university}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3 w-3 ${s <= t.rating ? "text-[hsl(var(--warn))] fill-[hsl(var(--warn))]" : "text-muted-foreground/20"}`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default Testimonials;
