"use client";

import React from "react";
import { motion } from "framer-motion";

export interface TestimonialItem {
  text: string;
  image: string;
  name: string;
  role: string;
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: TestimonialItem[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-transparent"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div className="p-8 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 max-w-xs w-full text-left" key={i}>
                  <div className="text-slate-700 text-sm leading-relaxed font-medium">{text}</div>
                  <div className="flex items-center gap-3 mt-6">
                    <img
                      width={40}
                      height={40}
                      src={image}
                      alt={name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <div className="font-extrabold text-sm text-slate-900 tracking-tight leading-none">{name}</div>
                      <div className="text-xs text-slate-400 font-semibold tracking-tight mt-1">{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};

const testimonials: TestimonialItem[] = [
  {
    text: "This CRM revolutionized our operations, streamlining client pipelines and task handoffs. The cloud platform keeps us productive, even remotely.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    name: "Briana Patton",
    role: "Operations Manager",
  },
  {
    text: "Implementing this CRM was smooth and quick. The customizable, user-friendly interface made team onboarding absolutely effortless.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    name: "Bilal Ahmed",
    role: "IT Manager",
  },
  {
    text: "The customer support team is exceptional, guiding us through pipeline setups and shift logs, ensuring our absolute satisfaction.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
    name: "Saman Malik",
    role: "Support Lead",
  },
  {
    text: "This portal's seamless dashboard integrations enhanced our client visibility and efficiency. Highly recommended CRM platform.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    name: "Omar Raza",
    role: "CEO",
  },
  {
    text: "Its robust analytics features and quick task tracking have transformed our daily workflow, making us significantly faster.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    name: "Zainab Hussain",
    role: "Project Director",
  },
  {
    text: "The smooth implementation exceeded expectations. It streamlined client assignments, improving overall business velocity.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    name: "Aliza Khan",
    role: "Business Analyst",
  },
  {
    text: "Our business functions improved with a user-friendly UI layout. Employee performance maps have also become highly trackable.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
    name: "Farhan Siddiqui",
    role: "Marketing Director",
  },
  {
    text: "They delivered a solution that exceeded expectations, understanding our customized workflow and pipeline constraints.",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=150",
    name: "Sana Sheikh",
    role: "Sales Lead",
  },
  {
    text: "Using this client roster, our team management and lead conversions significantly improved, boosting overall profit metrics.",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150",
    name: "Hassan Ali",
    role: "Manager",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export function Testimonials() {
  return (
    <section className="bg-slate-50 py-24 relative overflow-hidden w-full border-t border-slate-100">
      <div className="container z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[640px] mx-auto text-center"
        >
          <div className="flex justify-center mb-4">
            <span className="border border-slate-200 bg-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full text-slate-600 shadow-sm">
              Testimonials
            </span>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            What our users say
          </h2>
          <p className="mt-4 text-slate-600 text-lg leading-relaxed">
            See how teams around the globe streamline operations, track employee performance, and scale pipeline velocity with GlowAI.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-16 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] max-h-[600px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
}
