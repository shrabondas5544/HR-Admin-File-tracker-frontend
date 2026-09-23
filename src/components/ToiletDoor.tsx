"use client";

import React from "react";

export const ToiletDoor: React.FC = () => {
  return (
    <div
      className="flex-shrink-0 flex flex-col items-center select-none group"
      title="Restroom / Toilet Door (Static - Does not open)"
    >
      {/* Outer Door Frame / Casing */}
      <div className="relative w-44 sm:w-52 md:w-56 h-[590px] bg-stone-200 border-4 border-stone-300 rounded-t-md shadow-lg flex flex-col justify-between overflow-hidden">
        {/* Top Door Frame Trim / Header Reveal */}
        <div className="w-full h-3 bg-stone-300/80 border-b border-stone-400/40 shadow-inner flex items-center justify-center">
          <div className="w-8 h-1 bg-stone-400/40 rounded-full" />
        </div>

        {/* Door Leaf Body */}
        <div className="relative flex-1 w-full bg-[#d6c7b2] flex flex-col justify-between p-3.5 border-x border-stone-400/30 shadow-inner overflow-hidden"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.06) 0%, rgba(255,255,255,0.15) 30%, rgba(0,0,0,0.04) 70%, rgba(0,0,0,0.12) 100%), repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.015) 3px, rgba(0,0,0,0.015) 6px)",
          }}
        >
          {/* Top Panel Molding / Inset Accent */}
          <div className="w-full h-36 rounded border border-stone-400/40 bg-white/10 shadow-inner flex flex-col items-center justify-center">
            {/* Restroom Plaque Sign */}
            <div className="px-3 py-1 rounded bg-stone-800 text-stone-100 shadow-md border border-stone-700 flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono tracking-widest font-bold text-amber-400 uppercase">
                TOILET
              </span>
              <span className="text-[8px] font-mono text-stone-400 tracking-wider">
                RESTROOM
              </span>
            </div>
          </div>

          {/* Right-Handed Modern Office Lever Handle */}
          <div className="absolute right-2.5 top-[52%] -translate-y-1/2 flex items-center z-10">
            {/* Backplate / Escutcheon */}
            <div className="relative w-3.5 h-16 rounded bg-gradient-to-r from-stone-300 via-stone-100 to-stone-400 border border-stone-400/80 shadow-md flex flex-col items-center justify-between py-1.5">
              {/* Top mounting screw dot */}
              <div className="w-1 h-1 rounded-full bg-stone-500/70" />

              {/* Lever Stem & Handle Projection */}
              <div className="relative flex items-center">
                {/* Horizontal Lever Handle pointing left into door */}
                <div
                  className="absolute right-2.5 w-10 h-2.5 rounded-l-sm shadow-md border border-stone-500/60"
                  style={{
                    background: "linear-gradient(to bottom, #f5f5f5 0%, #d4d4d4 50%, #a3a3a3 100%)",
                  }}
                />
                {/* Cylinder Rosette */}
                <div className="w-2.5 h-2.5 rounded-full bg-stone-500 shadow-inner" />
              </div>

              {/* Privacy Lock / Keyhole dot */}
              <div className="w-1 h-2 rounded-xs bg-stone-700/80 shadow-inner" />

              {/* Bottom mounting screw dot */}
              <div className="w-1 h-1 rounded-full bg-stone-500/70" />
            </div>
          </div>

          {/* Bottom Panel Molding / Inset Accent */}
          <div className="w-full h-44 rounded border border-stone-400/40 bg-white/10 shadow-inner flex items-end justify-center pb-2">
            <span className="text-[9px] font-mono text-stone-500/80 tracking-widest uppercase">
              W2 • PRIVATE
            </span>
          </div>

          {/* Bottom Metal Kick Plate */}
          <div className="w-full h-6 rounded-b bg-gradient-to-r from-stone-400 via-stone-300 to-stone-400 border-t border-stone-400/60 shadow-inner flex items-center justify-around px-2 opacity-80">
            <div className="w-1 h-1 rounded-full bg-stone-500/50" />
            <div className="w-1 h-1 rounded-full bg-stone-500/50" />
            <div className="w-1 h-1 rounded-full bg-stone-500/50" />
          </div>
        </div>

        {/* Door Bottom Floor Threshold Strip */}
        <div className="w-full h-2.5 bg-gradient-to-r from-stone-400 via-stone-300 to-stone-400 border-t border-stone-500/50 shadow-inner" />
      </div>

      {/* Floor Baseboard & Ground Shadow */}
      <div className="w-full max-w-[240px] h-3 bg-gradient-to-b from-[#b09a76] to-[#9a8566] border-t border-[#b09a76]/50 shadow-xs" />
    </div>
  );
};
