import { create } from 'zustand';

export type IntakeState = 'IDLE' | 'DESCRIBE' | 'ANALYZING' | 'REVIEW' | 'CONFIRM' | 'SUCCESS';

export interface ParsedWatch {
  badge: string;
  brand: string;
  model: string;
  reference: string;
  issue: string;
  service: string;
  estimatedCost: string;
  estimatedTime: string;
  confidence: number;
  category: string;
  preliminaryNote?: string;
}

export const defaultGenericWatch: ParsedWatch = {
  badge: 'AVR',
  brand: 'TIMEPIECE IDENTIFIED',
  model: 'Mechanical wristwatch',
  reference: 'Three-hand mechanical · Individual caliber assessment',
  issue: 'Movement inspection & rate regulation',
  service: 'Movement inspection + regulation',
  estimatedCost: 'Based on description',
  estimatedTime: '2–3 weeks',
  confidence: 92,
  category: 'Mechanical Timepiece',
  preliminaryNote: 'Based on the description provided. Final scope and quotation follow physical inspection.'
};

export function parseHorologicalDescription(desc: string): ParsedWatch {
  const d = desc.toLowerCase().trim();

  // Scenario C / High-Horology (Rolex / Daytona / Cosmograph)
  if (d.includes('daytona') || d.includes('rolex') || d.includes('cosmograph')) {
    return {
      badge: 'RLX',
      brand: 'Rolex',
      model: 'Daytona Cosmograph',
      reference: 'Ref. 116520 · Calibre 4130',
      issue: 'Mechanical performance & escapement inspection',
      service: 'Full Service',
      estimatedCost: '$1,200–$1,800',
      estimatedTime: '6–8 weeks',
      confidence: 92,
      category: 'High-Horology Chronograph',
      preliminaryNote: 'Based on the description provided (deterministic example). Final scope and quotation follow physical inspection.'
    };
  }

  // Scenario A / Heirloom ("grandfather", "heirloom", "grandmother", "inherited", "found an old watch")
  if (d.includes('grandfather') || d.includes('heirloom') || d.includes('grandmother') || d.includes('inherited') || d.includes('found an old watch')) {
    return {
      badge: 'AVR',
      brand: 'Family Heirloom',
      model: 'Mechanical wristwatch',
      reference: 'Vintage caliber · Era and caliber cataloged on arrival',
      issue: 'Stopped ticking · Escapement & gear train inspection',
      service: 'Movement inspection + regulation',
      estimatedCost: 'Based on description',
      estimatedTime: '3–5 weeks',
      confidence: 92,
      category: 'Treasured Heirloom',
      preliminaryNote: 'Based on the description provided. Final scope and quotation follow physical inspection.'
    };
  }

  // Scenario B / Everyday ("daily", "losing time", "everyday", "running slow", "running fast")
  if (d.includes('daily') || d.includes('everyday') || d.includes('losing time') || d.includes('running slow') || d.includes('running fast')) {
    return {
      badge: 'AVR',
      brand: 'Everyday Timepiece',
      model: 'Mechanical wristwatch',
      reference: 'Standard daily caliber · Escapement & rate evaluation',
      issue: 'Timing variance · Rate loss regulation',
      service: 'Movement inspection + regulation',
      estimatedCost: 'Based on description',
      estimatedTime: '1–2 weeks',
      confidence: 92,
      category: 'Everyday Timepiece',
      preliminaryNote: 'Based on the description provided. Final scope and quotation follow physical inspection.'
    };
  }

  // Crystal / Component Care
  if (d.includes('crystal') || d.includes('scratched') || d.includes('glass')) {
    return {
      badge: 'AVR',
      brand: 'TIMEPIECE IDENTIFIED',
      model: 'Mechanical wristwatch',
      reference: 'Crystal assessment · Case and seal evaluation',
      issue: 'Scratched crystal · Bezel & gasket inspection',
      service: 'Crystal replacement + seal check',
      estimatedCost: 'Based on description',
      estimatedTime: '1–2 weeks',
      confidence: 92,
      category: 'Component Conservation',
      preliminaryNote: 'Based on the description provided. Final scope and quotation follow physical inspection.'
    };
  }

  // Vintage or automatic power reserve issues
  if (d.includes('vintage') || d.includes('old') || d.includes('automatic') || d.includes('hours') || d.includes('stops')) {
    return {
      badge: 'AVR',
      brand: 'Vintage / Mechanical',
      model: 'Mechanical wristwatch',
      reference: 'Automatic / hand-wound caliber',
      issue: 'Power reserve decay · Mainspring & auto-winding inspection',
      service: 'Movement inspection + regulation',
      estimatedCost: 'Based on description',
      estimatedTime: '2–3 weeks',
      confidence: 92,
      category: 'Mechanical Timepiece',
      preliminaryNote: 'Based on the description provided. Final scope and quotation follow physical inspection.'
    };
  }

  // Default Generic Timepiece (Requirement 6)
  return defaultGenericWatch;
}

interface CommitmentState {
  // Business State
  intakeState: IntakeState;
  userDescription: string;
  parsedWatch: ParsedWatch | null;
  
  // Actions
  setIntakeState: (state: IntakeState) => void;
  setUserDescription: (desc: string) => void;
  simulateAnalysis: (desc: string) => Promise<void>;
  proceedToCommitment: () => void;
  confirmBooking: () => Promise<void>;
}

export const useCommitmentStore = create<CommitmentState>((set) => ({
  intakeState: 'DESCRIBE',
  userDescription: '',
  parsedWatch: null,

  setIntakeState: (state) => set({ intakeState: state }),
  setUserDescription: (desc) => set({ userDescription: desc }),
  
  simulateAnalysis: async (desc) => {
    set({ intakeState: 'ANALYZING', userDescription: desc });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aevra:ai-emphasis'));
    }
    
    // Simulate concierge extraction delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const parsed = parseHorologicalDescription(desc);
    set({
      intakeState: 'REVIEW',
      parsedWatch: parsed
    });

    if (typeof window !== 'undefined' && (window as any).__lenis) {
      const target = document.getElementById('analysis-scroll-target');
      if (target) (window as any).__lenis.scrollTo(target, { duration: 1.5 });
    }
  },

  proceedToCommitment: () => {
    set({ intakeState: 'CONFIRM' });
    if (typeof window !== 'undefined' && (window as any).__lenis) {
      const target = document.getElementById('commitment-scroll-target');
      if (target) (window as any).__lenis.scrollTo(target, { duration: 1.5 });
    }
  },

  confirmBooking: async () => {
    // Simulate secure handoff
    set({ intakeState: 'SUCCESS' });
    if (typeof window !== 'undefined' && (window as any).__lenis) {
      const target = document.getElementById('final-scroll-target');
      if (target) (window as any).__lenis.scrollTo(target, { duration: 1.5 });
    }
  }
}));
