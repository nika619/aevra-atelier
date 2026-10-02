import React, { useState } from 'react';
import { useCommitmentStore, defaultGenericWatch } from '../../store/commitmentStore';
import { ShieldCheck, Clock, Wrench, ArrowRight, Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';

export function CommitmentWidget() {
  const { intakeState, parsedWatch, confirmBooking } = useCommitmentStore();
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Deterministic fallback matching inclusive brand specifications
  const watchData = parsedWatch || defaultGenericWatch;

  const handleConfirm = async () => {
    setIsConfirmed(true);
    await confirmBooking();
    console.log('[Commitment] Booking confirmed for:', watchData.brand, watchData.model);
  };

  return (
    <div className="relative w-full max-w-xl pointer-events-auto">
      {/* Step Indicators - Spatial continuity with Review */}
      <div id="commitment-step-indicator" className="flex items-center justify-between mb-8 px-4 text-xs font-mono tracking-widest uppercase">
        <div className="flex items-center space-x-2">
          <span className="text-white/40 font-semibold">01</span>
          <span className="text-white/40 font-sans tracking-[0.2em]">DESCRIBE</span>
        </div>
        <div className="h-[1px] flex-1 mx-4 bg-white/10" />
        <div className="flex items-center space-x-2">
          <span className="text-white/40 font-semibold">02</span>
          <span className="text-white/40 font-sans tracking-[0.2em]">REVIEW</span>
        </div>
        <div className="h-[1px] flex-1 mx-4 bg-white/10" />
        <div className="flex items-center space-x-2">
          <span className="text-[#c9a263] font-semibold">03</span>
          <span className="text-white font-medium font-sans tracking-[0.2em]">COMMITMENT</span>
        </div>
      </div>

      <div 
        id="commitment-card"
        className="bg-[#030305]/95 border border-[#ffffff]/10 rounded-xl p-8 shadow-[0_4px_16px_rgba(0,0,0,0.4)] relative overflow-hidden min-h-[420px] flex flex-col justify-center transition-transform duration-300 hover:-translate-y-[1px]"
      >
        {/* Subtle warm tint behind card matching Review surface */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#c9a263]/5 to-transparent pointer-events-none" />

        <div id="commitment-card-content" className="flex flex-col relative z-10">
          {/* Header */}
          <div id="commitment-header" className="mb-5 will-change-transform">
            <span id="commitment-eyebrow" className="text-[10px] uppercase tracking-[0.28em] text-[#c9a263] font-semibold block mb-1">
              YOUR RESTORATION
            </span>
            <h2 id="commitment-title" className="text-2xl font-serif text-white leading-tight">
              Authorization &amp; <span className="font-serif italic font-normal text-[#c9a263]">Secure Dispatch</span>
            </h2>
            <p id="commitment-subtitle" className="text-[#a1a1aa] font-sans font-light text-xs mt-1 leading-relaxed">
              Review your preliminary scope before initiating insured dispatch to our atelier.
            </p>
          </div>

          {/* Watch Identity - Shared-element continuity with Review */}
          <div 
            id="commitment-identity"
            className="flex items-center gap-5 mb-5 p-4 bg-black/40 rounded-2xl border border-white/10 will-change-transform"
          >
            <div className="w-14 h-14 bg-[#141416] rounded-xl flex items-center justify-center border border-white/15 shrink-0">
              <div className="w-9 h-9 rounded-full border border-[#d4af37]/40 flex items-center justify-center text-[10px] text-[#d4af37] font-serif font-semibold tracking-wider">
                {watchData.badge || 'AVR'}
              </div>
            </div>
            <div>
              <h3 id="commitment-watch-name" className="text-lg font-serif text-white leading-snug">
                {(watchData.brand === 'Timepiece Identified' || watchData.brand === 'TIMEPIECE IDENTIFIED') ? watchData.model : `${watchData.brand} ${watchData.model}`}
              </h3>
              <p id="commitment-watch-ref" className="text-[#a1a1aa] font-sans text-xs">
                {watchData.reference}
              </p>
              <div className="mt-1 inline-flex items-center gap-2 px-2 py-0.5 bg-[#d4af37]/10 rounded-full border border-[#d4af37]/25">
                <span className="text-[9px] uppercase tracking-widest text-[#d4af37]">
                  {watchData.category || 'Atelier Conservation'} · Conservation Record
                </span>
              </div>
            </div>
          </div>

          {/* Service Specifications Grid */}
          <div id="commitment-specs-grid" className="grid grid-cols-3 gap-3 mb-4 will-change-transform">
            <div id="commitment-service-card" className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-[#a1a1aa] text-[10px] uppercase tracking-widest mb-1">
                <Wrench size={11} className="text-[#c9a263]" /> Service
              </div>
              <p id="commitment-service" className="text-white font-sans text-sm font-medium">
                {watchData.service}
              </p>
              <span className="text-[8.5px] text-white/40 block mt-0.5 uppercase tracking-wider">Inspection &amp; Care</span>
            </div>

            <div id="commitment-estimate-card" className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-[#a1a1aa] text-[10px] uppercase tracking-widest mb-1">
                <ShieldCheck size={11} className="text-[#c9a263]" /> Preliminary Estimate
              </div>
              <p id="commitment-estimate" className="text-white font-sans text-sm font-medium text-[#e5c88f]">
                {watchData.estimatedCost}
              </p>
              <span className="text-[8.5px] text-[#c9a263] block mt-0.5 font-medium uppercase tracking-wider">
                Physical inspection required
              </span>
            </div>

            <div id="commitment-turnaround-card" className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-[#a1a1aa] text-[10px] uppercase tracking-widest mb-1">
                <Clock size={11} className="text-[#c9a263]" /> Estimated Turnaround
              </div>
              <p id="commitment-turnaround" className="text-white font-sans text-sm font-medium">
                {watchData.estimatedTime}
              </p>
              <span className="text-[8.5px] text-white/40 block mt-0.5 uppercase tracking-wider">Post-diagnostic window</span>
            </div>
          </div>

          {/* Security & Transport Assurances */}
          <div 
            id="commitment-security-points" 
            className="flex items-center justify-between py-2.5 px-4 mb-5 bg-white/[0.015] rounded-xl border border-white/5 text-[10.5px] text-[#a1a1aa] font-sans will-change-transform"
          >
            <div className="flex items-center gap-1.5">
              <Shield size={12} className="text-[#c9a263]" />
              <span className="font-medium text-white/80">Insured intake</span>
            </div>
            <span className="text-white/20">·</span>
            <div className="flex items-center gap-1.5">
              <Lock size={12} className="text-[#c9a263]" />
              <span className="font-medium text-white/80">Secure handling</span>
            </div>
            <span className="text-white/20">·</span>
            <div className="flex items-center gap-1.5">
              <FileText size={12} className="text-[#c9a263]" />
              <span className="font-medium text-white/80">Final quotation after inspection</span>
            </div>
          </div>

          {/* CTA Action - Restrained luxury button */}
          <div id="commitment-cta-container" className="will-change-transform">
            <button 
              id="commitment-confirm-btn"
              onClick={handleConfirm}
              className="group w-full py-3.5 bg-[#c9a263] text-black font-sans uppercase tracking-widest text-xs font-semibold rounded-lg border border-transparent hover:bg-[#ebd5ad] hover:-translate-y-[1px] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 pointer-events-auto"
            >
              {isConfirmed ? (
                <>
                  <CheckCircle2 size={14} className="text-black" />
                  <span id="commitment-cta-text">BOOKING SECURED · ATELIER NOTIFIED</span>
                </>
              ) : (
                <>
                  <span id="commitment-cta-text">CONFIRM &amp; SECURE BOOKING</span>
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-[2px]" />
                </>
              )}
            </button>
            
            <p id="commitment-disclaimer" className="mt-3 text-center text-[9.5px] text-[#a1a1aa]/60 uppercase tracking-widest leading-relaxed">
              Preliminary estimate based on description provided · Final quotation follows physical inspection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
