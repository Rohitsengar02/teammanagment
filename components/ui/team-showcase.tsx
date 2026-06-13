'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaLinkedinIn, FaTwitter, FaBehance, FaInstagram } from 'react-icons/fa'
import { cn } from '@/lib/utils'

export interface TeamMember {
  id: string
  name: string
  role: string
  image: string
  social?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    behance?: string;
  }
}

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Chadrack',
    role: 'director of photography',
    image: 'https://media.licdn.com/dms/image/v2/D4D03AQFnmLdpZW78yA/profile-displayphoto-scale_200_200/B4DZvM8NB2JMAY-/0/1768669895649?e=2147483647&v=beta&t=5VGAB-2gYupLNaHvJHECollR25THd-3oR5wngGlQiY4',
    social: { twitter: '#', linkedin: '#', behance: '#' },
  },
  {
    id: '2',
    name: 'Mak VieSAinte',
    role: 'FOUNDER',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2vnSxNNVGZV2MXRjlGELl-NgLl5kXdpDR6A&s',
    social: { twitter: '#', linkedin: '#' },
  },
  {
    id: '3',
    name: 'Osiris Balonga',
    role: 'LEAD FRONT-END',
    image: 'https://media.licdn.com/dms/image/v2/D4D03AQGVqrPPAGHtoQ/profile-displayphoto-scale_200_200/B4DZwhAkjaHwAY-/0/1770080338529?e=2147483647&v=beta&t=q-_6p1VCJ8NN8eHj9zUFwJZds_XpKez9Hy14SAIDp4M',
    social: { twitter: '#', linkedin: '#' },
  },
  {
    id: '4',
    name: 'Jacques',
    role: 'PRODUCT OWNER',
    image: 'https://media.licdn.com/dms/image/v2/D4D03AQE-Z7-S1LSYNQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1724143166545?e=2147483647&v=beta&t=6IPCwgOzblGt4p2fEdnY74gMbLyRHii5Ite3A39qQsY',
    social: { linkedin: '#' },
  },
  {
    id: '5',
    name: 'Riche Makso',
    role: 'CTO - PRODUCT DESIGNER',
    image: 'https://media.licdn.com/dms/image/v2/D4D03AQEkTAbZLlSrLg/profile-displayphoto-scale_200_200/B4DZoHdu8BGgAY-/0/1761061833315?e=2147483647&v=beta&t=Rg1dBTvq9X2heyhuhBwG2DsEkG65v0vQ35hF2FSeYns',
    social: { twitter: '#', linkedin: '#' },
  },
  {
    id: '6',
    name: 'Jemima',
    role: 'MAKE-UP ARTISTE',
    image: 'https://i.pravatar.cc/400?img=16',
    social: { instagram: '#' } as TeamMember['social'],
  },
]

interface TeamShowcaseProps {
  members?: TeamMember[]
}

export default function TeamShowcase({ members = DEFAULT_MEMBERS }: TeamShowcaseProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [hoveredMember, setHoveredMember] = useState<TeamMember | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX + 25, y: e.clientY + 25 })
  }

  const col1 = members.filter((_, i) => i % 3 === 0)
  const col2 = members.filter((_, i) => i % 3 === 1)
  const col3 = members.filter((_, i) => i % 3 === 2)

  // Motion Container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-20 select-none w-full max-w-none px-6 md:px-12 lg:px-16 py-8 font-sans relative"
    >
      {/* ── Left: wide photo grid ── */}
      <div className="flex gap-3 md:gap-4 flex-shrink-0 overflow-visible py-4">
        {/* Column 1 */}
        <div className="flex flex-col gap-3 md:gap-4">
          {col1.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="w-[125px] h-[135px] sm:w-[150px] sm:h-[160px] md:w-[180px] md:h-[195px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-3 md:gap-4 mt-[48px] sm:mt-[60px] md:mt-[76px]">
          {col2.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="w-[135px] h-[145px] sm:w-[165px] sm:h-[175px] md:w-[195px] md:h-[210px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-3 md:gap-4 mt-[24px] sm:mt-[30px] md:mt-[38px]">
          {col3.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="w-[130px] h-[140px] sm:w-[155px] sm:h-[165px] md:w-[185px] md:h-[200px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>
      </div>

      {/* ── Right: member name list ── */}
      <div className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-col gap-4 md:gap-6 pt-2 lg:pt-4 flex-1 w-full text-slate-900">
        {members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            onHoverMember={setHoveredMember}
            onMouseMove={handleMouseMove}
          />
        ))}
      </div>

      {/* Floating Follower Preview Image */}
      <AnimatePresence>
        {hoveredMember && (
          <motion.div
            style={{
              position: 'fixed',
              left: mousePos.x,
              top: mousePos.y,
              pointerEvents: 'none',
              zIndex: 9999,
            }}
            initial={{ scale: 0.6, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.6, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="w-36 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-white flex-shrink-0 pointer-events-none"
          >
            <img
              src={hoveredMember.image}
              alt={hoveredMember.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   Photo card 
───────────────────────────────────────── */

function PhotoCard({
  member,
  className,
  hoveredId,
  onHover,
}: {
  member: TeamMember
  className: string
  hoveredId: string | null
  onHover: (id: string | null) => void
}) {
  const isActive = hoveredId === member.id
  const isDimmed = hoveredId !== null && !isActive

  const childVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 80 } },
  }

  return (
    <motion.div
      variants={childVariants}
      whileHover={{ scale: 1.05, y: -6, rotate: 1.5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'overflow-hidden rounded-2xl cursor-pointer flex-shrink-0 transition-opacity duration-300 shadow-md hover:shadow-xl border border-slate-100',
        className,
        isDimmed ? 'opacity-50' : 'opacity-100',
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <img
        src={member.image}
        alt={member.name}
        className="w-full h-full object-cover transition-[filter] duration-300"
        style={{
          filter: isActive ? 'grayscale(0) brightness(1.05)' : 'grayscale(1) brightness(0.85)',
        }}
      />
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   Member name section
───────────────────────────────────────── */

function MemberRow({
  member,
  hoveredId,
  onHover,
  onHoverMember,
  onMouseMove,
}: {
  member: TeamMember
  hoveredId: string | null
  onHover: (id: string | null) => void
  onHoverMember: (member: TeamMember | null) => void
  onMouseMove: (e: React.MouseEvent) => void
}) {
  const isActive = hoveredId === member.id
  const isDimmed = hoveredId !== null && !isActive
  const hasSocial = member.social?.twitter ?? member.social?.linkedin ?? member.social?.instagram ?? member.social?.behance

  return (
    <motion.div
      whileHover={{ x: 8 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className={cn(
        'cursor-pointer transition-all duration-300 pb-3 px-4 py-3 rounded-xl border-b',
        isActive 
          ? 'bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent border-transparent shadow-sm' 
          : 'border-slate-100 hover:border-slate-200',
        isDimmed ? 'opacity-40' : 'opacity-100',
      )}
      onMouseEnter={() => {
        onHover(member.id)
        onHoverMember(member)
      }}
      onMouseLeave={() => {
        onHover(null)
        onHoverMember(null)
      }}
      onMouseMove={onMouseMove}
    >
      {/* Name + social*/}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'h-2 rounded-full flex-shrink-0 transition-all duration-300',
              isActive ? 'bg-purple-600 w-5' : 'bg-slate-200 w-2',
            )}
          />
          <span
            className={cn(
              'text-lg md:text-xl font-bold leading-none tracking-tight transition-colors duration-200',
              isActive ? 'text-purple-600' : 'text-slate-800',
            )}
          >
            {member.name}
          </span>
        </div>

        {/* Social icons */}
        {hasSocial && (
          <div
            className={cn(
              'flex items-center gap-1.5 transition-all duration-200',
              isActive
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-3 pointer-events-none',
            )}
          >
            {member.social?.twitter && (
              <a
                href={member.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-150 hover:scale-110"
                title="X / Twitter"
              >
                <FaTwitter size={14} />
              </a>
            )}
            {member.social?.linkedin && (
              <a
                href={member.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-150 hover:scale-110"
                title="LinkedIn"
              >
                <FaLinkedinIn size={14} />
              </a>
            )}
            {member.social?.instagram && (
              <a
                href={member.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-150 hover:scale-110"
                title="Instagram"
              >
                <FaInstagram size={14} />
              </a>
            )}
            {member.social?.behance && (
              <a
                href={member.social.behance}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-150 hover:scale-110"
                title="Behance"
              >
                <FaBehance size={14} />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Role */}
      <p className="mt-1.5 pl-[32px] text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {member.role}
      </p>
    </motion.div>
  )
}
