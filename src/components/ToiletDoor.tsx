"use client";

import React from "react";

export const ToiletDoor: React.FC = () => {
  return (
    <div
      className="flex-shrink-0 flex flex-col items-center select-none"
      title="Toilet Door"
    >
      {/* Outer Door Frame / Casing */}
      <div className="relative w-44 sm:w-52 md:w-56 h-[590px] bg-[#3a1614] border-4 border-[#321210] rounded-t-md shadow-lg flex flex-col justify-between overflow-hidden">
        {/* Top Door Frame Trim / Header Reveal */}
        <div className="w-full h-3 bg-[#2d100e] border-b border-black/40 shadow-inner flex items-center justify-center">
          <div className="w-8 h-1 bg-black/30 rounded-full" />
        </div>

        {/* Door Leaf Body - Red Chocolate Color Finish */}
        <div
          className="relative flex-1 w-full bg-[#54201d] flex flex-col justify-between p-3.5 border-x border-black/30 shadow-inner overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.2) 0%, rgba(255,255,255,0.07) 30%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.25) 100%), repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.035) 3px, rgba(0,0,0,0.035) 6px)"
          }}
        >
          {/* Top Panel Molding / Inset Accent */}
          <div className="w-full h-36 rounded border border-black/25 bg-black/15 shadow-inner flex items-center justify-center">
            {/* Toilet Sign: Red Background with White Text */}
            <div className="px-4 py-1.5 rounded-sm bg-red-600 text-white shadow-md border border-red-700/80 flex items-center justify-center">
              <span className="text-xs font-mono tracking-widest font-black text-white uppercase drop-shadow-xs">
                TOILET
              </span>
            </div>
          </div>

          {/* Right-Handed Modern Office Lever Handle */}
          <div className="absolute right-2.5 top-[52%] -translate-y-1/2 flex items-center z-10">
            {/* Backplate / Escutcheon */}
            <div className="relative w-3.5 h-16 rounded bg-gradient-to-r from-stone-300 via-stone-100 to-stone-400 border border-stone-500/80 shadow-md flex flex-col items-center justify-between py-1.5">
              {/* Top mounting screw dot */}
              <div className="w-1 h-1 rounded-full bg-stone-500/70" />

              {/* Lever Stem & Handle Projection */}
              <div className="relative flex items-center">
                {/* Horizontal Lever Handle pointing left into door */}
                <div
                  className="absolute right-2.5 w-10 h-2.5 rounded-l-sm shadow-md border border-stone-500/60"
                  style={{
                    background: "linear-gradient(to bottom, #f5f5f5 0%, #d4d4d4 50%, #a3a3a3 100%)"
                  }}
                />
                {/* Cylinder Rosette */}
                <div className="w-2.5 h-2.5 rounded-full bg-stone-500 shadow-inner" />
              </div>

              {/* Privacy Lock / Turn dot */}
              <div className="w-1 h-2 rounded-xs bg-stone-700/80 shadow-inner" />

              {/* Bottom mounting screw dot */}
              <div className="w-1 h-1 rounded-full bg-stone-500/70" />
            </div>
          </div>

          {/* Bottom Panel Molding / Inset Accent */}
          <div className="w-full h-44 rounded border border-black/25 bg-black/15 shadow-inner" />

          {/* Bottom Metal Kick Plate */}
          <div className="w-full h-6 rounded-b bg-gradient-to-r from-stone-400 via-stone-300 to-stone-400 border-t border-stone-500/60 shadow-inner flex items-center justify-around px-2 opacity-85">
            <div className="w-1 h-1 rounded-full bg-stone-600/50" />
            <div className="w-1 h-1 rounded-full bg-stone-600/50" />
            <div className="w-1 h-1 rounded-full bg-stone-600/50" />
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
