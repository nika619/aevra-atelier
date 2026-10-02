import React from 'react';
import { cn } from '../../lib/utils';

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center pointer-events-none">
      <div className="flex items-center space-x-12 pointer-events-auto">
        <div className="flex flex-col">
          <h1 className="text-xl tracking-[0.25em] font-serif uppercase text-white font-semibold leading-none">
            AÉVRA
          </h1>
          <span className="text-[8px] tracking-[0.28em] text-[#d4af37]/80 uppercase font-sans mt-1">
            HOROLOGICAL CONSERVATION ATELIER
          </span>
        </div>
        <div className="hidden md:flex space-x-8 text-xs font-sans text-white/60 uppercase tracking-widest">
          <button onClick={() => {
            if ((window as any).__lenis) (window as any).__lenis.scrollTo((document.documentElement.scrollHeight - window.innerHeight) * 0.15, { duration: 1.5 });
          }} className="hover:text-white transition-colors cursor-pointer">Services</button>
          <button onClick={() => {
            if ((window as any).__lenis) (window as any).__lenis.scrollTo((document.documentElement.scrollHeight - window.innerHeight) * 0.25, { duration: 1.5 });
          }} className="hover:text-white transition-colors cursor-pointer">Process</button>
          <button onClick={() => {
            const target = document.getElementById('final-scroll-target');
            if (target && (window as any).__lenis) (window as any).__lenis.scrollTo(target, { duration: 1.5 });
          }} className="hover:text-white transition-colors cursor-pointer">Our Work</button>
          <button onClick={() => {
            if ((window as any).__lenis) (window as any).__lenis.scrollTo((document.documentElement.scrollHeight - window.innerHeight) * 0.70, { duration: 1.5 });
          }} className="hover:text-white transition-colors cursor-pointer">About</button>
        </div>
      </div>
      
      <div className="flex items-center space-x-6 pointer-events-auto">
        <button onClick={() => {
          const target = document.getElementById('intake-scroll-target');
          if (target && (window as any).__lenis) (window as any).__lenis.scrollTo(target, { duration: 1.5 });
        }} className="hidden md:block text-xs font-sans text-white/60 uppercase tracking-widest hover:text-white transition-colors cursor-pointer">
          Concierge
        </button>
        <button 
          id="book-service-btn"
          onClick={() => {
            const target = document.getElementById('intake-scroll-target');
            if (target && (window as any).__lenis) (window as any).__lenis.scrollTo(target, { duration: 1.5 });
          }}
          className="px-6 py-3 border border-[#d4af37]/30 rounded-full text-xs font-sans uppercase tracking-widest text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors backdrop-blur-md cursor-pointer"
        >
          Book a Service
        </button>
      </div>
    </nav>
  );
}
