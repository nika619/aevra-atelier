import React, { useRef } from 'react';
import { useCommitmentStore } from '../../store/commitmentStore';
import { cn } from '../../lib/utils';
import { ArrowRight, ShieldCheck, Clock, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function IntakeWidget() {
  const { intakeState, userDescription, setUserDescription, simulateAnalysis, parsedWatch, setIntakeState } = useCommitmentStore();

  const handleDescribeSubmit = () => {
    if (userDescription.trim().length >= 5) {
      simulateAnalysis(userDescription);
    }
  };

  return (
    <div className="relative w-full max-w-xl">
      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-8 px-4 text-xs font-mono tracking-widest uppercase">
        <div className="flex items-center space-x-2">
          <span className={cn("transition-colors duration-300 font-semibold", intakeState === 'DESCRIBE' ? 'text-[#c9a263]' : 'text-white/40')}>01</span>
          <span className={cn("transition-colors duration-300 font-sans tracking-[0.2em]", intakeState === 'DESCRIBE' ? 'text-white font-medium' : 'text-white/40')}>DESCRIBE</span>
        </div>
        <div className="h-[1px] flex-1 mx-4 bg-white/10" />
        <div className="flex items-center space-x-2">
          <span className={cn("transition-colors duration-300 font-semibold", (intakeState === 'ANALYZING' || intakeState === 'REVIEW') ? 'text-[#c9a263]' : 'text-white/40')}>02</span>
          <span className={cn("transition-colors duration-300 font-sans tracking-[0.2em]", (intakeState === 'ANALYZING' || intakeState === 'REVIEW') ? 'text-white font-medium' : 'text-white/40')}>REVIEW</span>
        </div>
        <div className="h-[1px] flex-1 mx-4 bg-white/10" />
        <div className="flex items-center space-x-2">
          <span className={cn("transition-colors duration-300 font-semibold", intakeState === 'CONFIRM' ? 'text-[#c9a263]' : 'text-white/40')}>03</span>
          <span className={cn("transition-colors duration-300 font-sans tracking-[0.2em]", intakeState === 'CONFIRM' ? 'text-white font-medium' : 'text-white/40')}>CONFIRM</span>
        </div>
      </div>

      <div className="bg-[#030305]/95 border border-[#ffffff]/10 rounded-xl p-10 shadow-[0_4px_16px_rgba(0,0,0,0.4)] relative overflow-hidden min-h-[380px] flex flex-col justify-center transition-transform duration-300 hover:-translate-y-[1px]">
        
        {/* Subtle warm tint behind card */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#c9a263]/5 to-transparent pointer-events-none" />

        <AnimatePresence mode="wait">
          {intakeState === 'DESCRIBE' && (
            <motion.div 
              id="intake-describe-view"
              key="describe"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex flex-col"
            >
              <h2 className="text-2xl md:text-3xl font-serif text-white mb-2 leading-tight">Tell us about your timepiece.</h2>
              <p className="text-[#a1a1aa] mb-6 font-sans font-light text-sm leading-relaxed">
                A few words are enough. Tell us what you know, what has changed, and why the watch matters to you.
              </p>
              
              <div className="relative group mb-4">
                <textarea
                  id="intake-textarea"
                  value={userDescription}
                  onChange={(e) => setUserDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleDescribeSubmit();
                    }
                  }}
                  placeholder="Tell us what you know—whether an everyday watch, a treasured heirloom, or a vintage reference. e.g., My grandfather's mechanical watch stopped ticking..."
                  rows={4}
                  className="w-full bg-black/50 border border-white/15 focus:border-[#c9a263]/60 focus:bg-black/70 rounded-2xl p-5 text-white font-sans text-base focus:outline-none transition-all resize-none placeholder:text-white/30 caret-[#c9a263] pointer-events-auto leading-relaxed"
                />
                <button 
                  id="intake-submit-btn"
                  onClick={handleDescribeSubmit}
                  className="absolute bottom-4 right-4 w-11 h-11 bg-[#c9a263] rounded-full flex items-center justify-center text-black border border-transparent hover:bg-[#ebd5ad] hover:-translate-y-[1px] transition-all duration-200 disabled:opacity-25 disabled:pointer-events-none cursor-pointer pointer-events-auto group"
                  disabled={userDescription.trim().length < 5}
                  title="Submit description"
                >
                  <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-[2px]" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 text-xs font-sans text-[#a1a1aa]/80">
                {[
                  "My grandfather's mechanical watch stopped ticking.",
                  "My daily watch is losing time.",
                  "The crystal on my old watch is scratched.",
                  "My automatic watch stops after a few hours.",
                  "I found an old watch and want to know if it can be restored."
                ].map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setUserDescription(prompt)}
                    className="px-3 py-1 rounded-full border border-white/10 hover:border-[#c9a263]/50 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer text-left text-[11px]"
                  >
                    “{prompt}”
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {intakeState === 'ANALYZING' && (
            <motion.div 
              id="intake-analyzing"
              key="analyzing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
                <motion.div 
                  className="absolute inset-0 rounded-full border border-[#c9a263]/20"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                  className="absolute inset-2 rounded-full border border-[#c9a263]/40 border-t-[#c9a263]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <div className="w-1.5 h-1.5 bg-[#c9a263] rounded-full animate-pulse shadow-[0_0_8px_rgba(201,162,99,0.8)]" />
              </div>
              
              <h2 className="text-2xl font-serif text-white mb-3 tracking-tight">
                Evaluating <span className="font-serif italic text-[#c9a263]">parameters.</span>
              </h2>
              
              <div className="flex flex-col items-center w-full max-w-xs gap-3">
                <div className="flex justify-between w-full text-[9px] uppercase tracking-[0.2em] font-mono text-[#c9a263]/80">
                  <motion.span
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Diagnosing
                  </motion.span>
                  <span className="text-white/30">Matching Calibre Database</span>
                </div>
                <div className="w-full h-[1px] bg-white/10 relative overflow-hidden">
                  <motion.div 
                    className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-[#c9a263] to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "300%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {(intakeState === 'REVIEW' || intakeState === 'CONFIRM' || intakeState === 'SUCCESS') && (
            <motion.div 
              id="intake-review-placeholder"
              key="review"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-12 h-12 border border-[#c9a263]/30 bg-[#c9a263]/10 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck size={20} className="text-[#c9a263]" />
              </div>
              <h2 className="text-2xl font-serif text-white mb-2 tracking-tight">Analysis Complete</h2>
              <p className="text-xs text-white/50 tracking-widest uppercase font-mono mb-2">Proceeding to Atelier Review</p>
              <span className="font-serif italic text-[#c9a263] text-sm">scroll to continue</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
