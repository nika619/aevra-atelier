import { create } from 'zustand';
import { DEMO_REQUESTS, type RepairRequest, type View } from './data';

const KEY = 'aevra.owner.intake.v1'; // only requests sent from the website are kept between visits

const loadIntake = (): RepairRequest[] => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
};
const saveIntake = (rs: RepairRequest[]) => {
  try { localStorage.setItem(KEY, JSON.stringify(rs.filter(r => !r.demo))); } catch { /* private mode: keep in memory */ }
};

interface Undo { prev: RepairRequest; message: string }

interface CockpitState {
  requests: RepairRequest[];
  view: View;
  selectedId: string | null;
  query: string;
  toast: Undo | null;
  setView: (v: View) => void;
  select: (id: string | null) => void;
  setQuery: (q: string) => void;
  accept: (id: string) => void;
  askPhotos: (id: string) => void;
  decline: (id: string, reason: string) => void;
  undo: () => void;
  dismissToast: () => void;
}

export const visibleRows = (s: Pick<CockpitState, 'requests' | 'view' | 'query'>) => {
  const q = s.query.trim().toLowerCase();
  return s.requests
    .filter(r => r.view === s.view)
    .filter(r => !q || [r.watch.brand, r.watch.model, r.watch.ref, r.watch.calibre, r.client.name, r.id].join(' ').toLowerCase().includes(q))
    .sort((a, b) => a.receivedAt - b.receivedAt); // oldest first: the longest wait is answered first
};

export const useCockpit = create<CockpitState>((set, get) => {
  const change = (id: string, patch: Partial<RepairRequest>, message: string, historyText: string) => {
    const prev = get().requests.find(r => r.id === id);
    if (!prev) return;
    const next = { ...prev, ...patch, history: [...prev.history, { at: Date.now(), text: historyText }] };
    const requests = get().requests.map(r => (r.id === id ? next : r));
    // Selection moves to the next row in the same view, so the queue can be cleared without the mouse.
    const rows = visibleRows(get());
    const i = rows.findIndex(r => r.id === id);
    const following = rows[i + 1] ?? rows[i - 1] ?? null;
    set({ requests, toast: { prev, message }, selectedId: following ? following.id : null });
    saveIntake(requests);
  };

  return {
    requests: [...loadIntake(), ...DEMO_REQUESTS],
    view: 'quote',
    selectedId: null,
    query: '',
    toast: null,
    setView: (view) => set({ view, selectedId: null, query: '' }),
    select: (selectedId) => set({ selectedId }),
    setQuery: (query) => set({ query }),
    accept: (id) => {
      const r = get().requests.find(x => x.id === id);
      const price = r ? r.lines.reduce((s, l) => s + l.price, 0) : 0;
      const what = price ? `Quote for $${price.toLocaleString('en-US')}` : 'Invitation to send the watch';
      change(id, { view: 'client', mark: { label: 'Quote sent just now', tone: 'neutral' } },
        `${what} sent to ${r?.client.name}.`, price ? `Quote sent, $${price.toLocaleString('en-US')}` : 'Invited to send the watch');
    },
    askPhotos: (id) => {
      const r = get().requests.find(x => x.id === id);
      change(id, { view: 'client', mark: { label: 'Asked for photos', tone: 'neutral' } },
        `Asked ${r?.client.name} for photos.`, 'Asked for photos');
    },
    decline: (id, reason) => {
      const r = get().requests.find(x => x.id === id);
      change(id, { view: 'closed', mark: { label: `Declined: ${reason.toLowerCase()}`, tone: 'neutral' } },
        `Declined ${r?.client.name}’s ${r?.watch.brand}.`, `Declined: ${reason}`);
    },
    undo: () => {
      const t = get().toast;
      if (!t) return;
      const requests = get().requests.map(r => (r.id === t.prev.id ? t.prev : r));
      set({ requests, toast: null, view: t.prev.view, selectedId: t.prev.id });
      saveIntake(requests);
    },
    dismissToast: () => set({ toast: null }),
  };
});

// A request sent from the customer intake lands at the top of "Needs a quote".
export function addIntakeRequest(description: string, parsed: {
  brand: string; model: string; reference: string; issue: string; service: string; estimatedCost: string; estimatedTime: string; confidence: number;
}) {
  const low = Number((parsed.estimatedCost.match(/\$([\d,]+)/)?.[1] ?? '0').replace(/,/g, ''));
  const now = Date.now();
  const n = useCockpit.getState().requests.filter(r => !r.demo).length + 1;
  const request: RepairRequest = {
    id: `AV-W${String(n).padStart(3, '0')}`, view: 'quote', demo: false,
    watch: { brand: parsed.brand, model: parsed.model, ref: parsed.reference, calibre: '—', year: '—' },
    client: { name: 'Website visitor', city: '—' },
    receivedAt: now,
    words: description,
    findings: [{ text: parsed.issue, confidence: parsed.confidence >= 85 ? 'High' : 'Medium', evidence: `“${description.slice(0, 80)}${description.length > 80 ? '…' : ''}”` }],
    lines: low ? [{ label: `${parsed.service} (low end of the website estimate)`, hours: 0, price: low }] : [],
    turnaround: parsed.estimatedTime, photos: 0, channel: 'Website intake',
    history: [{ at: now, text: 'Request sent from the website' }],
  };
  const requests = [request, ...useCockpit.getState().requests];
  useCockpit.setState({ requests });
  saveIntake(requests);
}
