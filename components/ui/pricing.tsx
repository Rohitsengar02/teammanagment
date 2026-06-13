"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

export interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

export interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = `Choose the plan that works for you
All plans include access to our platform, lead generation tools, and dedicated support.`,
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          "hsl(var(--primary))",
          "hsl(var(--accent))",
          "hsl(var(--secondary))",
          "hsl(var(--muted))",
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div className="container py-20 mx-auto px-4">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-slate-900">
          {title}
        </h2>
        <p className="text-slate-600 text-lg whitespace-pre-line max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex justify-center items-center mb-10 gap-3">
        <span className="text-sm font-semibold text-slate-600">Monthly Billing</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <Label className="sr-only">Toggle Annual Billing</Label>
          <Switch
            ref={switchRef as any}
            checked={!isMonthly}
            onCheckedChange={handleToggle}
            className="relative"
          />
        </label>
        <span className="text-sm font-semibold text-slate-900">
          Annual billing <span className="text-purple-600 font-bold">(Save 20%)</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 1 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -10 : 0,
                    opacity: 1,
                    x: index === 2 ? -10 : index === 0 ? 10 : 0,
                    scale: index === 0 || index === 2 ? 0.96 : 1.0,
                  }
                : {}
            }
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: 0.2,
              opacity: { duration: 0.4 },
            }}
            className={cn(
              `rounded-2xl border-[1px] p-6 bg-white text-center flex flex-col justify-between relative shadow-sm hover:shadow-md transition-shadow duration-300`,
              plan.isPopular ? "border-purple-600 border-2 shadow-lg" : "border-slate-100",
              index === 0 || index === 2
                ? "z-0"
                : "z-10"
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-purple-600 text-white py-1 px-3 rounded-bl-xl rounded-tr-xl flex items-center gap-1">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Popular
                </span>
              </div>
            )}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-widest text-slate-500">
                  {plan.name}
                </p>
                <div className="mt-6 flex items-center justify-center gap-x-2">
                  <span className="text-5xl font-extrabold tracking-tight text-slate-950">
                    <NumberFlow
                      value={
                        isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)
                      }
                      format={{
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }}
                      transformTiming={{
                        duration: 500,
                        easing: "ease-out",
                      }}
                      willChange
                      className="font-variant-numeric: tabular-nums"
                    />
                  </span>
                  {plan.period !== "Next 3 months" && (
                    <span className="text-sm font-semibold leading-6 tracking-wide text-slate-500">
                      / {plan.period}
                    </span>
                  )}
                </div>

                <p className="text-xs leading-5 text-slate-400 mt-1">
                  {isMonthly ? "billed monthly" : "billed annually"}
                </p>

                <p className="mt-4 text-sm text-slate-600 font-medium leading-relaxed">
                  {plan.description}
                </p>

                <hr className="w-full my-6 border-slate-100" />

                <ul className="gap-3 flex flex-col text-slate-700 text-sm font-medium">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="h-4.5 w-4.5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="text-left leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href={plan.href}
                  className={cn(
                    buttonVariants({
                      variant: plan.isPopular ? "default" : "outline",
                    }),
                    "group relative w-full gap-2 overflow-hidden text-base font-bold py-6 rounded-xl transition-all duration-300",
                    plan.isPopular
                      ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-900"
                  )}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
