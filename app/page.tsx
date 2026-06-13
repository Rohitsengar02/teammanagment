'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Users, User, ThumbsUp, Lock, MousePointer, Code2, ShoppingCart } from 'lucide-react'
import { Component as StripeGradient } from '@/components/ui/stripe-like-gradient-shader'
import TeamShowcase from '@/components/ui/team-showcase'
import { Gallery4 } from '@/components/ui/gallery4'
import { Pricing } from '@/components/ui/pricing'
import { Testimonials } from '@/components/ui/testimonials-columns-1'

interface RoleOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
  bgColor: string
  shadowColor: string
}

const roles: RoleOption[] = [
  {
    id: 'employer',
    name: 'Employer Panel',
    description: 'Manage employee directories, payroll, shifts, and assign tasks',
    icon: <Users size={20} />,
    href: '/employer/login',
    color: 'from-purple-600 to-pink-500',
    bgColor: 'bg-purple-500/10 text-pink-400 border-purple-500/20',
    shadowColor: 'shadow-purple-500/10'
  },
  {
    id: 'employee',
    name: 'Employee Panel',
    description: 'View assigned tasks, schedule shifts, and update attendance',
    icon: <User size={20} />,
    href: '/employee/login',
    color: 'from-blue-600 to-cyan-500',
    bgColor: 'bg-blue-500/10 text-cyan-400 border-blue-500/20',
    shadowColor: 'shadow-blue-500/10'
  },
]

const demoPlans = [
  {
    name: "Starter",
    price: "50",
    yearlyPrice: "40",
    period: "per month",
    features: [
      "Up to 10 active pipelines",
      "Omnichannel lead capture",
      "Automated shift planner logs",
      "Basic sales flow reports",
      "Community forum access",
    ],
    description: "Perfect for growing sales agents and startup teams.",
    buttonText: "Start Free Trial",
    href: "/employer/login",
    isPopular: false,
  },
  {
    name: "Professional",
    price: "99",
    yearlyPrice: "79",
    period: "per month",
    features: [
      "Unlimited sales pipelines",
      "Advanced AI lead categorization",
      "24-hour response support team",
      "Direct API integrations",
      "Shared workspaces for groups",
      "Custom analytics widgets",
    ],
    description: "Ideal for full-stack CRM team hubs.",
    buttonText: "Get Started Now",
    href: "/employer/login",
    isPopular: true,
  },
  {
    name: "Enterprise",
    price: "299",
    yearlyPrice: "239",
    period: "per month",
    features: [
      "Everything in Professional",
      "Custom SLA guidelines",
      "Dedicated account managers",
      "SSO/SAML security integration",
      "Advanced fraud/anomaly detection",
      "1-hour response SLA guarantee",
    ],
    description: "Tailored to larger enterprise scale CRM pipelines.",
    buttonText: "Contact Sales",
    href: "/employer/login",
    isPopular: false,
  },
]

export default function HomePage() {
  // SVG Motion Path for flowing cursor/arrow
  const pathD = "M 150 160 C 150 40, 650 40, 650 160 C 650 280, 150 280, 150 160 Z"
  const innerPathD = "M 200 160 C 200 80, 600 80, 600 160 C 600 240, 200 240, 200 160 Z"

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900 flex flex-col relative overflow-x-hidden selection:bg-purple-500/30 font-sans">

      {/* Stripe-like Gradient Shader Background */}
      <div className="absolute inset-0 z-0 opacity-70 pointer-events-none mix-blend-screen">
        <StripeGradient />
      </div>

      {/* Clean White-to-Transparent Gradient overlay to match top white bar */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/50 to-transparent h-[500px] z-0 pointer-events-none" />

      {/* Floating Header Navbar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-slate-950 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-sm">G</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              GlowAI
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
            <Link href="#features" className="hover:text-slate-900 transition-colors">Features</Link>
            <div className="relative group cursor-pointer flex items-center gap-1 hover:text-slate-900 transition-colors">
              <span>Use cases</span>
              <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-950 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-6">
          <Link href="/employer/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            Sign In
          </Link>
          <Link
            href="/employer/login"
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-semibold rounded-full text-sm shadow-md transition-all hover:scale-[1.02]"
          >
            Book a demo
          </Link>
        </div>
      </header>

      {/* Hero Content Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-16 pb-12 flex-1 flex flex-col items-center text-center">

        {/* Title / Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-[1.1] mb-8"
        >
          Team collaboration for <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
            new startups that scale
          </span>
        </motion.h1>

        {/* Centered Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-16"
        >
          <Link
            href="#panels"
            className="px-8 py-4 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-full text-base shadow-xl transition-all hover:scale-[1.03] inline-block"
          >
            Get Started
          </Link>
        </motion.div>

        {/* Workflow Diagram & Linear Wavy Process Area */}
        <div className="relative w-full max-w-[800px] h-[340px] flex items-center justify-center mb-16 mt-8">

          {/* Linear Wavy Process SVG Path Layout */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 320" fill="none">
            {/* The main wavy process path */}
            <path
              id="wavyProcessPath"
              d="M 50 80 C 122.5 80, 122.5 240, 195 240 C 267.5 240, 267.5 80, 340 80 C 412.5 80, 412.5 240, 485 240 C 557.5 240, 557.5 80, 630 80 C 702.5 80, 702.5 240, 765 240"
              stroke="url(#wavyGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="opacity-25"
            />
            {/* Flowing dashes on the wavy process path */}
            <path
              d="M 50 80 C 122.5 80, 122.5 240, 195 240 C 267.5 240, 267.5 80, 340 80 C 412.5 80, 412.5 240, 485 240 C 557.5 240, 557.5 80, 630 80 C 702.5 80, 702.5 240, 765 240"
              stroke="#818cf8"
              strokeWidth="3"
              strokeDasharray="10 18"
              strokeLinecap="round"
              className="opacity-80"
              style={{
                animation: "dashFlow 16s linear infinite"
              }}
            />

            {/* Glowing Pulse Circle 1 */}
            <circle r="6" fill="#ec4899" className="shadow-lg">
              <animateMotion
                path="M 50 80 C 122.5 80, 122.5 240, 195 240 C 267.5 240, 267.5 80, 340 80 C 412.5 80, 412.5 240, 485 240 C 557.5 240, 557.5 80, 630 80 C 702.5 80, 702.5 240, 765 240"
                dur="8s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Glowing Pulse Circle 2 (Offset) */}
            <circle r="5" fill="#10b981" className="shadow-lg">
              <animateMotion
                path="M 50 80 C 122.5 80, 122.5 240, 195 240 C 267.5 240, 267.5 80, 340 80 C 412.5 80, 412.5 240, 485 240 C 557.5 240, 557.5 80, 630 80 C 702.5 80, 702.5 240, 765 240"
                dur="12s"
                begin="4s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Moving Cursor Pointer */}
            <g>
              <polygon points="0,0 -5,12 -2,8 3,12" fill="#6366f1" className="shadow-lg">
                <animateMotion
                  path="M 50 80 C 122.5 80, 122.5 240, 195 240 C 267.5 240, 267.5 80, 340 80 C 412.5 80, 412.5 240, 485 240 C 557.5 240, 557.5 80, 630 80 C 702.5 80, 702.5 240, 765 240"
                  dur="10s"
                  repeatCount="indefinite"
                  rotate="auto"
                />
              </polygon>
            </g>

            {/* Gradient definition for the wavy line */}
            <defs>
              <linearGradient id="wavyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="30%" stopColor="#3b82f6" />
                <stop offset="60%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Workflow Team Avatars arranged sequentially as a horizontal linear process */}

          {/* Step 1: Priya Singh (CEO) */}
          <div className="absolute left-[3%] top-[5%] flex flex-col items-center">
            <div className="relative group cursor-pointer">
              {/* Pulsing Glow Ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-purple-500 pointer-events-none z-10"
                style={{
                  animation: "arrivalGlowRing 8s cubic-bezier(0.16, 1, 0.3, 1) infinite",
                  animationDelay: "0s"
                }}
              />
              {/* Outer Pulse Frame */}
              <div
                className="absolute -inset-1.5 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full blur-md opacity-35 group-hover:opacity-75 transition-opacity"
                style={{
                  animation: "arrivalPulse 8s ease-in-out infinite",
                  animationDelay: "0s",
                  margin: "-4px",
                  zIndex: 0
                }}
              />
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                alt="Priya Singh"
                className="relative w-14 h-14 rounded-full object-cover border-2 border-white shadow-xl z-10"
                style={{
                  animation: "arrivalCardScale 8s ease-in-out infinite",
                  animationDelay: "0s"
                }}
              />
              <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white rounded-full p-1 border border-white z-20">
                <Users size={10} />
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-800 bg-white/80 px-2 py-0.5 rounded-full shadow-sm mt-1.5 backdrop-blur-sm">Priya (CEO)</span>
            <span className="text-[8px] font-semibold text-purple-600 uppercase tracking-wider mt-1">1. Assigns Task</span>
          </div>

          {/* Step 2: Amit Kumar (Sales) */}
          <div className="absolute left-[20%] top-[56%] flex flex-col items-center">
            <div className="relative group cursor-pointer">
              {/* Pulsing Glow Ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-cyan-400 pointer-events-none z-10"
                style={{
                  animation: "arrivalGlowRing 8s cubic-bezier(0.16, 1, 0.3, 1) infinite",
                  animationDelay: "1.6s"
                }}
              />
              {/* Outer Pulse Frame */}
              <div
                className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur-md opacity-35 group-hover:opacity-75 transition-opacity"
                style={{
                  animation: "arrivalPulse 8s ease-in-out infinite",
                  animationDelay: "1.6s",
                  margin: "-4px",
                  zIndex: 0
                }}
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                alt="Amit Kumar"
                className="relative w-14 h-14 rounded-full object-cover border-2 border-white shadow-xl z-10"
                style={{
                  animation: "arrivalCardScale 8s ease-in-out infinite",
                  animationDelay: "1.6s"
                }}
              />
              <div className="absolute -bottom-1 -right-1 bg-cyan-600 text-white rounded-full p-1 border border-white z-20">
                <User size={9} />
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-800 bg-white/80 px-2 py-0.5 rounded-full shadow-sm mt-1.5 backdrop-blur-sm">Amit (Employee)</span>
            <span className="text-[8px] font-semibold text-blue-600 uppercase tracking-wider mt-1">2. Qualifies Task</span>
          </div>

          {/* Step 3: Neha Sharma (Employee) */}
          <div className="absolute left-[38%] top-[5%] flex flex-col items-center">
            <div className="relative group cursor-pointer">
              {/* Pulsing Glow Ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-emerald-400 pointer-events-none z-10"
                style={{
                  animation: "arrivalGlowRing 8s cubic-bezier(0.16, 1, 0.3, 1) infinite",
                  animationDelay: "3.2s"
                }}
              />
              {/* Outer Pulse Frame */}
              <div
                className="absolute -inset-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full blur-md opacity-35 group-hover:opacity-75 transition-opacity"
                style={{
                  animation: "arrivalPulse 8s ease-in-out infinite",
                  animationDelay: "3.2s",
                  margin: "-4px",
                  zIndex: 0
                }}
              />
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80"
                alt="Neha Sharma"
                className="relative w-14 h-14 rounded-full object-cover border-2 border-white shadow-xl z-10"
                style={{
                  animation: "arrivalCardScale 8s ease-in-out infinite",
                  animationDelay: "3.2s"
                }}
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 border border-white z-20">
                <User size={10} />
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-800 bg-white/80 px-2 py-0.5 rounded-full shadow-sm mt-1.5 backdrop-blur-sm">Neha (Employee)</span>
            <span className="text-[8px] font-semibold text-emerald-600 uppercase tracking-wider mt-1">3. Updates Status</span>
          </div>

          {/* Step 4: Vikram Patel (Sales Manager) */}
          <div className="absolute left-[56%] top-[56%] flex flex-col items-center">
            <div className="relative group cursor-pointer">
              {/* Pulsing Glow Ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-pink-400 pointer-events-none z-10"
                style={{
                  animation: "arrivalGlowRing 8s cubic-bezier(0.16, 1, 0.3, 1) infinite",
                  animationDelay: "4.8s"
                }}
              />
              {/* Outer Pulse Frame */}
              <div
                className="absolute -inset-1.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full blur-md opacity-35 group-hover:opacity-75 transition-opacity"
                style={{
                  animation: "arrivalPulse 8s ease-in-out infinite",
                  animationDelay: "4.8s",
                  margin: "-4px",
                  zIndex: 0
                }}
              />
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
                alt="Vikram Patel"
                className="relative w-14 h-14 rounded-full object-cover border-2 border-white shadow-xl z-10"
                style={{
                  animation: "arrivalCardScale 8s ease-in-out infinite",
                  animationDelay: "4.8s"
                }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-800 bg-white/80 px-2 py-0.5 rounded-full shadow-sm mt-1.5 backdrop-blur-sm">Vikram (Mgr)</span>
            <span className="text-[8px] font-semibold text-pink-600 uppercase tracking-wider mt-1">4. Reviews Progress</span>
          </div>

          {/* Step 5: Rahul (Employee) */}
          <div className="absolute left-[74%] top-[5%] flex flex-col items-center">
            <div className="relative group cursor-pointer">
              {/* Pulsing Glow Ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-indigo-400 pointer-events-none z-10"
                style={{
                  animation: "arrivalGlowRing 8s cubic-bezier(0.16, 1, 0.3, 1) infinite",
                  animationDelay: "6.4s"
                }}
              />
              {/* Outer Pulse Frame */}
              <div
                className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-md opacity-35 group-hover:opacity-75 transition-opacity"
                style={{
                  animation: "arrivalPulse 8s ease-in-out infinite",
                  animationDelay: "6.4s",
                  margin: "-4px",
                  zIndex: 0
                }}
              />
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"
                alt="Rahul Employee"
                className="relative w-14 h-14 rounded-full object-cover border-2 border-white shadow-xl z-10"
                style={{
                  animation: "arrivalCardScale 8s ease-in-out infinite",
                  animationDelay: "6.4s"
                }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-800 bg-white/80 px-2 py-0.5 rounded-full shadow-sm mt-1.5 backdrop-blur-sm">Rahul (Employee)</span>
            <span className="text-[8px] font-semibold text-indigo-600 uppercase tracking-wider mt-1">5. Completes Tasks</span>
          </div>

          {/* Step 6: Client (Guest) */}
          <div className="absolute left-[90%] top-[56%] flex flex-col items-center">
            <div className="relative group cursor-pointer">
              {/* Pulsing Glow Ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-amber-400 pointer-events-none z-10"
                style={{
                  animation: "arrivalGlowRing 8s cubic-bezier(0.16, 1, 0.3, 1) infinite",
                  animationDelay: "0s"
                }}
              />
              {/* Outer Pulse Frame */}
              <div
                className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-md opacity-35 group-hover:opacity-75 transition-opacity"
                style={{
                  animation: "arrivalPulse 8s ease-in-out infinite",
                  animationDelay: "0s",
                  margin: "-4px",
                  zIndex: 0
                }}
              />
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80"
                alt="Guest Client"
                className="relative w-14 h-14 rounded-full object-cover border-2 border-white shadow-xl z-10"
                style={{
                  animation: "arrivalCardScale 8s ease-in-out infinite",
                  animationDelay: "0s"
                }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-800 bg-white/80 px-2 py-0.5 rounded-full shadow-sm mt-1.5 backdrop-blur-sm">Client</span>
            <span className="text-[8px] font-semibold text-amber-600 uppercase tracking-wider mt-1">6. Onboard Won</span>
          </div>

          {/* Floating Action Indicator Badges */}

          {/* Lock Action Widget Left */}
          <div className="absolute left-[-2%] top-[40%] h-10 w-10 rounded-full bg-slate-950 flex items-center justify-center text-white border border-slate-800 shadow-xl pointer-events-none">
            <Lock size={14} />
          </div>

          {/* Click Badge Right */}
          <div className="absolute right-[-1%] top-[25%] h-10 w-10 rounded-full bg-slate-950 flex items-center justify-center text-white border border-slate-800 shadow-xl pointer-events-none">
            <MousePointer size={14} className="rotate-90 text-purple-400" />
          </div>

          {/* Thumbs Up Badge Bottom */}
          <div className="absolute left-[49%] bottom-[5%] h-10 w-10 rounded-full bg-slate-950 flex items-center justify-center text-white border border-slate-800 shadow-xl pointer-events-none">
            <ThumbsUp size={14} className="text-emerald-400" />
          </div>



        </div>

      </main>

      {/* Workspace Selection Section */}
      <section id="panels" className="w-full max-w-7xl mx-auto px-6 py-20 relative z-30 text-center scroll-mt-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">
            Select Your Workspace Portal
          </h2>
          <p className="text-slate-400 text-base">
            Choose a dashboard role below to enter and manage your specific operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {roles.map((role, idx) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800 p-8 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group relative overflow-hidden text-left"
            >
              {/* Glow backdrop effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${role.color} text-white w-fit mb-6 shadow-lg`}>
                  {role.icon}
                </div>
                <h3 className="text-xl font-extrabold text-white mb-3">{role.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-8">{role.description}</p>
              </div>

              <Link
                href={role.href}
                className="w-full py-3.5 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all duration-300 text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 hover:shadow-lg flex items-center justify-center cursor-pointer"
              >
                Enter Portal &rarr;
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tilted Infinite Marquee Section - Full Width, White Background, Black Text */}
      <div className="w-full py-8 bg-white border-y border-slate-200/80 -rotate-2 scale-[1.6] overflow-hidden relative z-20 shadow-lg mt-16 -mb-4">
        {/* Blurry fade edges using white gradients */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex whitespace-nowrap gap-16 items-center w-max animate-marquee">
          {/* First set */}
          <div className="flex items-center gap-16 text-black font-extrabold text-xl uppercase tracking-[0.25em]">
            <span className="flex items-center gap-2 text-black shrink-0"><span className="text-purple-600">✦</span> Flash</span>
            <span className="text-slate-800 shrink-0">Invert</span>
            <span className="text-black shrink-0">h Hitech</span>
            <span className="text-slate-800 shrink-0">⚡︎ Proline</span>
            <span className="text-black shrink-0">DevWise</span>
            <span className="flex items-center gap-2 text-black shrink-0"><span className="text-purple-600">✦</span> Flash</span>
          </div>
          {/* Second set (duplicate for infinite scroll) */}
          <div className="flex items-center gap-16 text-black font-extrabold text-xl uppercase tracking-[0.25em]" aria-hidden="true">
            <span className="flex items-center gap-2 text-black shrink-0"><span className="text-purple-600">✦</span> Flash</span>
            <span className="text-slate-800 shrink-0">Invert</span>
            <span className="text-black shrink-0">h Hitech</span>
            <span className="text-slate-800 shrink-0">⚡︎ Proline</span>
            <span className="text-black shrink-0">DevWise</span>
            <span className="flex items-center gap-2 text-black shrink-0"><span className="text-purple-600">✦</span> Flash</span>
          </div>
        </div>
      </div>

      {/* Team Showcase Section with White Background */}
      <section className="w-full bg-white border-y border-slate-100 py-38 relative z-10">
        <div className="w-full px-0">
          <div className="text-center md:text-left mb-12 max-w-3xl px-6 md:px-12 lg:px-16">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Meet the Creative Minds
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Our multidisciplinary team of product designers, creators, and engineers working behind the scenes.
            </p>
          </div>
          <TeamShowcase />
        </div>
      </section>

      {/* Leads Management Features Carousel Section */}
      <Gallery4 />

      {/* Simple, Transparent Pricing Section */}
      <section id="pricing" className="w-full bg-white relative z-10 border-b border-slate-100 py-12">
        <Pricing plans={demoPlans} />
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Beautiful Modern Footer */}
      <footer className="bg-slate-950 text-slate-400 relative z-20 border-t border-slate-800">
        <div className="w-full max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6 mb-12">

            {/* Col 1: Logo & Mission */}
            <div className="flex flex-col gap-4 text-left">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-lg">
                  <span className="text-slate-950 font-black text-sm">G</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                  GlowAI
                </span>
              </Link>
              <p className="text-sm text-slate-400 max-w-xs mt-2 leading-relaxed">
                Empowering modern teams with unified deal flows, omnichannel pipeline routing, and automated roster scheduling.
              </p>
            </div>

            {/* Col 2: Workspaces */}
            <div className="flex flex-col gap-4 text-left">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Workspaces
              </h3>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li>
                  <Link href="/employer/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                    Employer Portal <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded-full font-bold">Secure</span>
                  </Link>
                </li>
                <li>
                  <Link href="/employee/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                    Employee Portal <span className="text-[10px] bg-blue-500/10 text-cyan-400 px-1.5 py-0.5 rounded-full font-bold">Active</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Resources */}
            <div className="flex flex-col gap-4 text-left">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Product Features
              </h3>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li>
                  <Link href="/leads" className="hover:text-white transition-colors">
                    Omnichannel Ingestion
                  </Link>
                </li>
                <li>
                  <Link href="/pipeline" className="hover:text-white transition-colors">
                    Deal Pipelines
                  </Link>
                </li>
                <li>
                  <Link href="/tasks" className="hover:text-white transition-colors">
                    Task Assignments
                  </Link>
                </li>
                <li>
                  <Link href="/analytics" className="hover:text-white transition-colors">
                    Real-Time Reporting
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Contact & Newsletter */}
            <div className="flex flex-col gap-4 text-left">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Stay Updated
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Subscribe to our product logs for updates on pipeline automation.
              </p>
              <div className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-full"
                />
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors">
                  Join
                </button>
              </div>
            </div>

          </div>

          <hr className="border-slate-800 my-8" />

          {/* Bottom Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} GlowAI CRM Systems. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
              <Link href="/support" className="hover:text-slate-400 transition-colors">Support Desk</Link>
            </div>
          </div>

        </div>
      </footer>

      {/* Global CSS Styles injected dynamically for paths */}
      <style jsx global>{`
        @keyframes dashFlow {
          from {
            stroke-dashoffset: 600;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes dashFlowReverse {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: 600;
          }
        }
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        @keyframes arrivalPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.35;
          }
          15% {
            transform: scale(1.25);
            opacity: 0.9;
          }
          30%, 95% {
            transform: scale(1);
            opacity: 0.35;
          }
        }
        @keyframes arrivalCardScale {
          0%, 100% {
            transform: scale(1);
          }
          15% {
            transform: scale(1.15);
            border-color: rgba(167, 139, 250, 0.8);
          }
          30%, 95% {
            transform: scale(1);
          }
        }
        @keyframes arrivalGlowRing {
          0% {
            transform: scale(0.95);
            opacity: 0;
          }
          4% {
            opacity: 1;
          }
          22% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(0.95);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
