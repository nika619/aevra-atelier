// Demo data for the owner cockpit. Every total and every bench figure is computed from the rows below.

export type View = 'quote' | 'client' | 'bench' | 'ready' | 'closed';
export type Tone = 'neutral' | 'warning' | 'positive' | 'negative';
export type Confidence = 'High' | 'Medium' | 'Low';

export interface QuoteLine { label: string; hours: number; price: number } // price in whole USD; parts have 0 hours
export interface Finding { text: string; confidence: Confidence; evidence: string }
export interface Watchmaker { id: string; name: string; hoursPerWeek: number }

export interface RepairRequest {
  id: string;
  view: View;
  watch: { brand: string; model: string; ref: string; calibre: string; year: string };
  client: { name: string; city: string; since?: string };
  receivedAt: number; // ms epoch
  words: string;
  findings: Finding[];
  lines: QuoteLine[];
  turnaround: string;
  note?: string;
  photos: number;
  channel: 'Website intake' | 'Email' | 'Walk-in';
  mark?: { label: string; tone: Tone }; // the one status mark a row may carry
  assignee?: string;
  due?: string;
  bookedHours?: number; // hours this job holds on the bench in the window below
  history: { at: number; text: string }[];
  demo: boolean;
}

export const VIEWS: { id: View; label: string; empty: string }[] = [
  { id: 'quote', label: 'Needs a quote', empty: 'Nothing needs a quote. New requests from the website land here.' },
  { id: 'client', label: 'Waiting on client', empty: 'No quotes or questions are out with clients.' },
  { id: 'bench', label: 'On the bench', empty: 'The bench is clear.' },
  { id: 'ready', label: 'Ready to return', empty: 'Nothing is waiting to go back.' },
  { id: 'closed', label: 'Closed', empty: 'Nothing closed yet.' },
];

export const WATCHMAKERS: Watchmaker[] = [
  { id: 'IV', name: 'Ilse Varga', hoursPerWeek: 32 },
  { id: 'TR', name: 'Tomás Reyes', hoursPerWeek: 28 },
];

export const BENCH_WINDOW = { label: '30 Nov – 11 Dec', weeks: 2 };

const H = 3_600_000;
const D = 24 * H;
// Ages stay the same whatever day the demo is opened: times are relative to the moment it loads.
const ago = (ms: number) => Date.now() - ms;

export const DEMO_REQUESTS: RepairRequest[] = [
  {
    id: 'AV-2614', view: 'quote', demo: true,
    watch: { brand: 'Omega', model: 'Speedmaster Professional', ref: '145.022', calibre: '861', year: 'c. 1969' },
    client: { name: 'Daniel Okafor', city: 'Lisbon', since: 'Client since 2023' },
    receivedAt: ago(2 * D + 3 * H),
    words: 'It stops overnight even when it is fully wound. My father wore it every day; I think the last service was around 2009. The chronograph pushers feel stiff.',
    findings: [
      { text: 'Mainspring fatigued, power reserve short', confidence: 'High', evidence: '“stops overnight even when it is fully wound”' },
      { text: 'Overdue full service, oils dried', confidence: 'High', evidence: '“last service was around 2009”' },
      { text: 'Pusher gaskets hardened', confidence: 'Medium', evidence: '“pushers feel stiff”' },
    ],
    lines: [
      { label: 'Full service, calibre 861', hours: 6, price: 640 },
      { label: 'Mainspring, genuine Omega', hours: 0, price: 95 },
      { label: 'Hesalite crystal (scratched in photo 2)', hours: 0, price: 70 },
      { label: 'Pusher gaskets and pressure test', hours: 0.5, price: 45 },
    ],
    turnaround: '4–5 weeks', photos: 3, channel: 'Website intake',
    history: [
      { at: ago(2 * D + 3 * H), text: 'Request sent from the website' },
      { at: ago(2 * D + 3 * H - 60_000), text: 'Assessment drafted from the description' },
    ],
  },
  {
    id: 'AV-2615', view: 'quote', demo: true,
    watch: { brand: 'Jaeger-LeCoultre', model: 'Reverso Classic', ref: 'Q2508410', calibre: '822/2', year: '2019' },
    client: { name: 'Hannah Lindqvist', city: 'Stockholm' },
    receivedAt: ago(23 * H),
    words: 'Since I dropped it on a tiled floor it gains about 40 seconds a day. The case still flips normally.',
    findings: [
      { text: 'Hairspring knocked out of flat or magnetised', confidence: 'Medium', evidence: '“gains about 40 seconds a day”' },
      { text: 'Balance staff intact (still runs)', confidence: 'Medium', evidence: '“since I dropped it”' },
    ],
    lines: [
      { label: 'Inspection, demagnetise and regulate', hours: 2.5, price: 300 },
      { label: 'Case and strap clean', hours: 0.5, price: 40 },
    ],
    turnaround: '2 weeks', photos: 2, channel: 'Website intake',
    history: [
      { at: ago(23 * H), text: 'Request sent from the website' },
      { at: ago(23 * H - 60_000), text: 'Assessment drafted from the description' },
    ],
  },
  {
    id: 'AV-2616', view: 'quote', demo: true,
    watch: { brand: 'Seiko', model: '6139-6002 “Pogue”', ref: '6139-6002', calibre: '6139B', year: '1974' },
    client: { name: 'Marcus Bell', city: 'Leeds' },
    receivedAt: ago(3 * H),
    words: 'The chronograph hand will not go back to zero and the day is stuck on Monday.',
    findings: [
      { text: 'Reset hammer worn or out of adjustment', confidence: 'High', evidence: '“will not go back to zero”' },
      { text: 'Day jumper spring weak', confidence: 'Medium', evidence: '“stuck on Monday”' },
    ],
    lines: [
      { label: 'Full service, calibre 6139B', hours: 5, price: 420 },
      { label: 'Reset hammer (sourced, new old stock)', hours: 0, price: 65 },
      { label: 'Day jumper spring', hours: 0, price: 25 },
      { label: 'Fit and adjust parts', hours: 0.5, price: 40 },
    ],
    turnaround: '5–6 weeks (parts)', photos: 1, channel: 'Email',
    history: [
      { at: ago(3 * H), text: 'Request received by email' },
      { at: ago(3 * H - 120_000), text: 'Assessment drafted from the description' },
    ],
  },
  {
    id: 'AV-2617', view: 'quote', demo: true,
    watch: { brand: 'Longines', model: 'Manual-wind heirloom', ref: 'Unknown', calibre: '12.68Z', year: 'c. 1952' },
    client: { name: 'Priya Raman', city: 'Toronto' },
    receivedAt: ago(70 * 60_000),
    words: 'It was my grandfather’s. It stopped years ago and the dial has brown spots. Please don’t make it look new.',
    findings: [
      { text: 'Train seized by dried oil', confidence: 'High', evidence: '“stopped years ago”' },
      { text: 'Dial foxing, keep as found', confidence: 'High', evidence: '“don’t make it look new”' },
    ],
    note: 'Conservation only: the client wants the dial and case left as found.',
    lines: [
      { label: 'Conservation service, calibre 12.68Z', hours: 7, price: 760 },
      { label: 'Crown and stem, if worn', hours: 0, price: 55 },
    ],
    turnaround: '6–8 weeks', photos: 4, channel: 'Website intake',
    history: [
      { at: ago(70 * 60_000), text: 'Request sent from the website' },
      { at: ago(69 * 60_000), text: 'Assessment drafted from the description' },
    ],
  },
  {
    id: 'AV-2609', view: 'client', demo: true,
    watch: { brand: 'Rolex', model: 'Datejust 36', ref: '16234', calibre: '3135', year: '1996' },
    client: { name: 'Sofia Marchetti', city: 'Milan', since: 'Client since 2021' },
    receivedAt: ago(5 * D), words: 'Running slow by a minute a day and the date changes at noon.',
    findings: [{ text: 'Date set 12 h out, rate slow', confidence: 'High', evidence: '“date changes at noon”' }],
    lines: [{ label: 'Full service, calibre 3135', hours: 7, price: 780 }],
    turnaround: '5 weeks', photos: 2, channel: 'Website intake',
    mark: { label: 'Quote sent 4 days ago', tone: 'warning' },
    history: [{ at: ago(5 * D), text: 'Request sent from the website' }, { at: ago(4 * D), text: 'Quote sent, $780' }],
  },
  {
    id: 'AV-2611', view: 'client', demo: true,
    watch: { brand: 'Tudor', model: 'Black Bay Fifty-Eight', ref: '79030N', calibre: 'MT5402', year: '2020' },
    client: { name: 'Ahmed Khalil', city: 'Dubai' },
    receivedAt: ago(3 * D), words: 'Moisture under the crystal after swimming.',
    findings: [{ text: 'Crown tube or gasket failed', confidence: 'Medium', evidence: '“moisture under the crystal”' }],
    lines: [{ label: 'Dry, inspect, reseal', hours: 2, price: 260 }],
    turnaround: '2 weeks', photos: 0, channel: 'Website intake',
    mark: { label: 'Asked for photos', tone: 'neutral' },
    history: [{ at: ago(3 * D), text: 'Request sent from the website' }, { at: ago(3 * D - 2 * H), text: 'Asked for photos of the dial' }],
  },
  ...([
    ['AV-2598', 'Patek Philippe', 'Calatrava', '3919', '215', '1991', 'Eleanor Whitcombe', 'IV', '4 Dec', 12],
    ['AV-2600', 'Breguet', 'Classique', '5140', '502.3', '2008', 'Luca Ferraro', 'TR', '9 Dec', 18],
    ['AV-2601', 'Omega', 'Seamaster 300', '165.024', '552', '1966', 'James Harlow', 'TR', '11 Dec', 26],
    ['AV-2603', 'Grand Seiko', 'Spring Drive GMT', 'SBGE201', '9R66', '2017', 'Kenji Mori', 'IV', '7 Dec', 18],
    ['AV-2605', 'IWC', 'Pilot’s Mark XV', '3253', '37524', '2001', 'Clara Novak', 'IV', '11 Dec', 22],
  ] as const).map(([id, brand, model, ref, calibre, year, name, assignee, due, booked]): RepairRequest => ({
    id, view: 'bench', demo: true,
    watch: { brand, model, ref, calibre, year }, client: { name, city: '' },
    receivedAt: ago(16 * D), words: '', findings: [], lines: [], turnaround: '', photos: 0, channel: 'Website intake',
    assignee, due: `Due ${due}`, bookedHours: booked, history: [],
  })),
  {
    id: 'AV-2592', view: 'ready', demo: true,
    watch: { brand: 'Cartier', model: 'Tank Louis', ref: 'W1529756', calibre: '8971 MC', year: '2004' },
    client: { name: 'Margaux Petit', city: 'Paris' },
    receivedAt: ago(30 * D), words: '', findings: [], lines: [{ label: 'Full service', hours: 6, price: 690 }], turnaround: '', photos: 0,
    channel: 'Walk-in', mark: { label: 'Ready 2 days', tone: 'positive' }, history: [],
  },
  {
    id: 'AV-2588', view: 'closed', demo: true,
    watch: { brand: 'Swatch', model: 'Sistem51', ref: 'SUTB400', calibre: 'Sistem51', year: '2016' },
    client: { name: 'Tom Ashby', city: 'Bristol' },
    receivedAt: ago(9 * D), words: '', findings: [], lines: [], turnaround: '', photos: 0, channel: 'Email',
    mark: { label: 'Declined: sealed movement', tone: 'neutral' }, history: [],
  },
];

export const total = (r: RepairRequest) => r.lines.reduce((s, l) => s + l.price, 0);
export const hours = (r: RepairRequest) => r.lines.reduce((s, l) => s + l.hours, 0);
export const capacity = () => WATCHMAKERS.reduce((s, w) => s + w.hoursPerWeek, 0) * BENCH_WINDOW.weeks;
export const booked = (rs: RepairRequest[]) => rs.filter(r => r.view === 'bench').reduce((s, r) => s + (r.bookedHours ?? 0), 0);

// Self-checks: the figures the screen shows must agree with each other.
const quotes = DEMO_REQUESTS.filter(r => r.view === 'quote');
console.assert(capacity() === 120, 'capacity is 2 weeks of 60 h');
console.assert(booked(DEMO_REQUESTS) === 96, 'bench booked hours sum to 96');
console.assert(quotes.reduce((s, r) => s + hours(r), 0) === 22, 'waiting quotes add 22 h');
console.assert(quotes.reduce((s, r) => s + total(r), 0) === 2555, 'waiting quotes total $2,555');
console.assert(total(quotes[0]) === 850 && hours(quotes[0]) === 6.5, 'Speedmaster quote is $850 for 6.5 h');
