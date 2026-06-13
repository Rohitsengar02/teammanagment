"use client";

import React from "react";

interface GlowingCardProps {
  value: string | number;
  label: string;
}

export const GlowingCard = ({ value, label }: GlowingCardProps) => {
  return (
    <div className="glow-card-outer">
      <div className="glow-card-dot"></div>
      <div className="glow-card-inner">
        <div className="glow-card-ray"></div>
        <div className="text-3xl font-extrabold tracking-tight text-slate-950 mb-1">
          {value}
        </div>
        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
          {label}
        </div>
        <div className="line topl"></div>
        <div className="line leftl"></div>
        <div className="line bottoml"></div>
        <div className="line rightl"></div>
      </div>
    </div>
  );
};
