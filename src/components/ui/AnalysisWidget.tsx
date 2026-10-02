import React from 'react';
import { useCommitmentStore, defaultGenericWatch } from '../../store/commitmentStore';
import { ShieldCheck, Clock, Wrench, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function AnalysisWidget() {
  const { intakeState, parsedWatch, setIntakeState, proceedToCommitment } = useCommitmentStore();

  // Deterministic generic fallback matching inclusive brand specifications
  const watchData = parsedWatch || defaultGenericWatch;

  return (
    <div className="relative w-full max-w-xl">
      {/* Step Indicators */}
      <div id="analysis-step-indicator" className="flex items-center justify-between mb-8 px-4 text-xs font-mono tracking-widest uppercase">
        <div className="flex items-center space-x-2">
          <span className="text-white/40 font-semibold">01</span>
          <span className="text-white/40 font-sans tracking-[0.2em]">DESCRIBE</span>
        </div>
        <div className="h-[1px] flex-1 mx-4 bg-white/10" />
        <div className="flex items-center space-x-2">
          <span className="text-[#c9a263] font-semibold">02</span>
          <span className="text-white font-medium font-sans tracking-[0.2em]">REVIEW</span>
        </div>
        <div className="h-[1px] flex-1 mx-4 bg-white/10" />
        <div className="flex items-center space-x-2">
          <span className="text-white/40 font-semibold">03</span>
          <span className="text-white/40 font-sans tracking-[0.2em]">CONFIRM</span>
        </div>
      </div>

      <div className="bg-[#030305]/95 border border-[#ffffff]/10 rounded-xl p-8 shadow-[0_4px_16px_rgba(0,0,0,0.4)] relative overflow-hidden min-h-[380px] flex flex-col justify-center transition-transform duration-300 hover:-translate-y-[1px]">
        {/* Subtle warm tint behind card */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#c9a263]/5 to-transparent pointer-events-none" />

        <div id="analysis-card-content" className="flex flex-col relative z-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-5">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9a263] font-semibold block mb-1">
                {(watchData.brand === 'Timepiece Identified' || watchData.brand === 'TIMEPIECE IDENTIFIED') ? 'TIMEPIECE IDENTIFIED' : 'PRELIMINARY ASSESSMENT'}
              </span>
              <h2 id="analysis-title" className="text-2xl font-serif text-white leading-tight">
                We've understood your <span className="font-serif italic font-normal text-[#c9a263]">request.</span>
              </h2>
              <p id="analysis-copy" className="text-[#a1a1aa] font-sans font-light text-xs mt-1 leading-relaxed">
                Here is what we identified from your description. Every watch receives the same atelier standard of review.
              </p>
            </div>
            <button 
              id="analysis-edit-btn" 
              className="text-xs text-[#a1a1aa] underline hover:text-white uppercase tracking-widest cursor-pointer ml-4 shrink-0"
              onClick={() => {
                setIntakeState('DESCRIBE');
                const intakeTarget = document.getElementById('intake-scroll-target');
                if ((window as any).__lenis && intakeTarget) {
                  (window as any).__lenis.scrollTo(intakeTarget, { duration: 1.0 });
                }
              }}
            >
              Edit
            </button>
          </div>

          {/* Watch Identity */}
          <div 
            id="analysis-identity"
            className="flex items-center gap-5 mb-5 p-4 bg-black/40 rounded-2xl border border-white/10 will-change-transform"
          >
            <div className="w-14 h-14 bg-[#141416] rounded-xl flex items-center justify-center border border-white/15 shrink-0">
              <div className="w-9 h-9 rounded-full border border-[#d4af37]/40 flex items-center justify-center text-[10px] text-[#d4af37] font-serif font-semibold tracking-wider">
                {watchData.badge || 'AVR'}
              </div>
            </div>
            <div>
              <h3 id="analysis-watch-name" className="text-lg font-serif text-white leading-snug">
                <span id="review-watch-name">
                  {(watchData.brand === 'Timepiece Identified' || watchData.brand === 'TIMEPIECE IDENTIFIED') ? watchData.model : `${watchData.brand} ${watchData.model}`}
                </span>
              </h3>
              <p id="analysis-watch-ref" className="text-[#a1a1aa] font-sans text-xs">
                <span id="review-watch-ref">{watchData.reference}</span>
              </p>
              <div className="mt-1 inline-flex items-center gap-2 px-2 py-0.5 bg-[#d4af37]/10 rounded-full border border-[#d4af37]/25">
                <span id="analysis-confidence" className="text-[9px] uppercase tracking-widest text-[#d4af37]">
                  {watchData.category || 'Atelier Identified'} · {watchData.confidence}% interpretation confidence
                </span>
              </div>
            </div>
          </div>

          {/* Service Metadata Grid */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div id="analysis-service-card" className="p-3 bg-white/[0.02] rounded-xl border border-white/5 will-change-transform">
              <div className="flex items-center gap-1.5 text-[#a1a1aa] text-[10px] uppercase tracking-widest mb-1">
                <Wrench size={11} className="text-[#c9a263]" /> Likely Service
              </div>
              <p id="analysis-service" className="text-white font-sans text-sm font-medium">
                <span id="review-service">{watchData.service}</span>
              </p>
              <span className="text-[8.5px] text-white/40 block mt-0.5 uppercase tracking-wider">Based on description</span>
            </div>

            <div id="analysis-cost-card" className="p-3 bg-white/[0.02] rounded-xl border border-white/5 will-change-transform">
              <div className="flex items-center gap-1.5 text-[#a1a1aa] text-[10px] uppercase tracking-widest mb-1">
                <ShieldCheck size={11} className="text-[#c9a263]" /> Preliminary Estimate
              </div>
              <p id="analysis-cost" className="text-white font-sans text-sm font-medium">
                <span id="review-cost">{watchData.estimatedCost}</span>
              </p>
              <span className="text-[8.5px] text-[#c9a263] block mt-0.5 font-medium uppercase tracking-wider">Physical inspection required</span>
            </div>

            <div id="analysis-timeline-card" className="p-3 bg-white/[0.02] rounded-xl border border-white/5 will-change-transform">
              <div className="flex items-center gap-1.5 text-[#a1a1aa] text-[10px] uppercase tracking-widest mb-1">
                <Clock size={11} className="text-[#c9a263]" /> Estimated Time
              </div>
              <p id="analysis-turnaround" className="text-white font-sans text-sm font-medium">
                <span id="review-turnaround">{watchData.estimatedTime}</span>
              </p>
              <span className="text-[8.5px] text-white/40 block mt-0.5 uppercase tracking-wider">Post-diagnostic window</span>
            </div>
          </div>

          {/* Disclaimer */}
          <p id="analysis-disclaimer" className="text-[10px] text-white/50 mb-4 text-center leading-relaxed">
            Preliminary estimate based on description provided. Final scope and quotation follow physical inspection.
          </p>

          {/* CTA Action */}
          <div id="analysis-cta-container" className="will-change-transform">
            <button 
              id="analysis-proceed-btn"
              onClick={proceedToCommitment}
              className="group w-full py-3.5 bg-[#c9a263] text-black font-sans uppercase tracking-widest text-xs font-semibold rounded-lg border border-transparent hover:bg-[#ebd5ad] hover:-translate-y-[1px] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <span id="intake-proceed-btn">Proceed to Atelier Review</span>
              <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-[2px]" />
            </button>
            
            <div className="mt-3 flex justify-center items-center gap-2 text-[10px] text-[#a1a1aa]/60 uppercase tracking-widest">
              <ShieldCheck size={12} /> Secure & encrypted atelier concierge
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
