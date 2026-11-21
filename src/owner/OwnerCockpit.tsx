import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, Menu, Search, X } from 'lucide-react';
import { BENCH_WINDOW, VIEWS, WATCHMAKERS, booked, capacity, hours, total, type RepairRequest } from './data';
import { useCockpit, visibleRows } from './store';
import './cockpit.css';

const FONTS = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap';
const DECLINE_REASONS = ['Parts no longer made', 'Sealed movement, not serviceable', 'Outside what we restore'];
const usd = (n: number) => `$${n.toLocaleString('en-US')}`;
const h = (n: number) => `${n.toFixed(1)} h`; // one decimal for every bench figure

function age(ms: number) {
  const m = Math.max(0, Math.round((Date.now() - ms) / 60_000));
  if (m < 2) return 'just now';
  if (m < 60) return `${m} min`;
  const hr = Math.round(m / 60);
  return hr < 36 ? `${hr} h` : `${Math.round(hr / 24)} days`;
}
const when = (ms: number) =>
  new Date(ms).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const isPhone = () => window.matchMedia('(max-width: 767px)').matches;

function Mark() {
  // A bezel with its crown at three o'clock: AÉVRA's object, drawn once in brass.
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="9" cy="10" r="6.5" fill="none" stroke="#a07b3b" strokeWidth="1.75" />
      <rect x="15.5" y="8.5" width="3" height="3" rx="0.75" fill="#a07b3b" />
      <path d="M9 6.5V10l2.2 1.6" fill="none" stroke="#131416" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Nav({ onPick }: { onPick?: () => void }) {
  const { requests, view, setView } = useCockpit();
  return (
    <nav className="ck-nav" aria-label="Request views">
      {VIEWS.map(v => {
        const n = requests.filter(r => r.view === v.id).length;
        const needsAction = v.id === 'quote' || v.id === 'ready'; // counts only on queues that need the owner
        return (
          <button key={v.id} aria-current={view === v.id} onClick={() => { setView(v.id); onPick?.(); }}>
            <span>{v.label}</span>
            {needsAction && n > 0 && <span className="count">{n}</span>}
          </button>
        );
      })}
    </nav>
  );
}

function SideFoot() {
  return (
    <div className="ck-side-foot">
      <a href={import.meta.env.BASE_URL}>Customer site <ArrowUpRight size={14} aria-hidden="true" /></a>
      <div className="ck-user">
        <span className="ck-avatar" aria-hidden="true">IV</span>
        <span>Ilse Varga<small>Owner, master watchmaker</small></span>
      </div>
    </div>
  );
}

function Row({ r, selected, onOpen }: { r: RepairRequest; selected: boolean; onOpen?: () => void }) {
  const select = useCockpit(s => s.select);
  const late = r.view === 'quote' && Date.now() - r.receivedAt > 36 * 3_600_000;
  const right = (() => {
    if (r.view === 'quote') return <span className="v">{total(r) ? usd(total(r)) : '—'}</span>;
    if (r.view === 'bench') return <span className="v">{h(r.bookedHours ?? 0)}</span>;
    return r.mark ? <span className={`pill ${r.mark.tone}`}>{r.mark.label}</span> : null;
  })();
  const sub = r.view === 'bench'
    ? `${WATCHMAKERS.find(w => w.id === r.assignee)?.name ?? '—'} · ${r.due}`
    : `${r.client.name}${r.client.city && r.client.city !== '—' ? `, ${r.client.city}` : ''}`;
  return (
    <li>
      <button className="ck-row" aria-current={selected} onClick={onOpen ?? (() => select(r.id))} data-id={r.id}>
        <span className="l"><span className={`w${r.view === 'quote' ? ' new' : ''}`}>{r.watch.brand} {r.watch.model}</span>
          <span className={`age${late ? ' late' : ''}`}>{r.view === 'bench' ? '' : age(r.receivedAt)}</span></span>
        <span className="l"><span className="c">{sub}</span>{right}</span>
      </button>
    </li>
  );
}

function Bench({ r, waiting }: { r: RepairRequest; waiting: RepairRequest[] }) {
  const requests = useCockpit(s => s.requests);
  const cap = capacity();
  const b = booked(requests);
  const mine = hours(r);
  const others = waiting.filter(x => x.id !== r.id).reduce((s, x) => s + hours(x), 0);
  const free = Math.max(0, cap - b - mine - others);
  const pct = (n: number) => `${(n / cap) * 100}%`;
  const allIn = b + mine + others;
  return (
    <section className="ck-block" aria-labelledby="bench-h">
      <h3 id="bench-h">Bench, {BENCH_WINDOW.label}<small>{WATCHMAKERS.map(w => `${w.name.split(' ')[0]} ${w.hoursPerWeek * BENCH_WINDOW.weeks} h`).join(' · ')}</small></h3>
      <div className="ck-bench-track" role="img" aria-label={`${h(b)} booked, this request ${h(mine)}, other quotes ${h(others)}, ${h(free)} free of ${h(cap)}`}>
        <i className="booked" style={{ width: pct(b) }} />
        <i className="this" style={{ width: pct(mine) }} />
        <i className="other" style={{ width: pct(others) }} />
      </div>
      <ul className="ck-bench-legend">
        <li><i style={{ background: '#6b6d6e' }} />Booked {h(b)}</li>
        <li><i style={{ background: 'var(--brass)' }} />This request {h(mine)}</li>
        {others > 0 && <li><i style={{ background: 'var(--brass-pale)', boxShadow: 'inset 0 0 0 1px var(--brass)' }} />Other quotes {h(others)}</li>}
        <li><i className="free" />Free {h(free)}</li>
      </ul>
      <p className="ck-bench-fit">
        {allIn <= cap
          ? <>If every waiting quote is accepted, the bench is at <b>{h(allIn)} of {h(cap)}</b>.</>
          : <>Accepting every waiting quote would overbook the bench by <b>{h(allIn - cap)}</b>.</>}
      </p>
    </section>
  );
}

function DeclineMenu({ id, onClose }: { id: string; onClose: () => void }) {
  const decline = useCockpit(s => s.decline);
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => { first.current?.focus(); }, []);
  return (
    <div className="ck-menu" role="menu" aria-label="Reason for declining">
      <p>Reason, sent to the client</p>
      {DECLINE_REASONS.map((reason, i) => (
        <button key={reason} ref={i === 0 ? first : undefined} role="menuitem" onClick={() => { decline(id, reason); onClose(); }}>{reason}</button>
      ))}
    </div>
  );
}

function Detail({ r, waiting, menuOpen, setMenuOpen }: { r: RepairRequest; waiting: RepairRequest[]; menuOpen: boolean; setMenuOpen: (b: boolean) => void }) {
  const { accept, askPhotos, select, view } = useCockpit();
  const t = total(r);
  const acceptLabel = t ? `Accept and send ${usd(t)}` : 'Accept, price after inspection';
  const actions = (where: 'head' | 'bar') => r.view === 'quote' && (
    <div className={where === 'head' ? 'ck-actions' : 'ck-bar'}>
      <button className="btn text" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} title="Decline (D)">Decline</button>
      <button className="btn secondary" onClick={() => askPhotos(r.id)} title="Ask for photos (P)">Ask for photos</button>
      <button className="btn primary" onClick={() => accept(r.id)} title="Accept and send the quote (A)">{acceptLabel}</button>
      {menuOpen && (where === 'bar') === isPhone() && <DeclineMenu id={r.id} onClose={() => setMenuOpen(false)} />}
    </div>
  );
  const viewLabel = VIEWS.find(v => v.id === view)?.label;
  return (
    <>
      <button className="ck-back" onClick={() => select(null)}><ChevronLeft size={18} aria-hidden="true" />{viewLabel}</button>
      <header className="ck-dhead">
        <div>
          <h2>{r.watch.brand} {r.watch.model}</h2>
          <p>Ref. {r.watch.ref} · Calibre {r.watch.calibre} · {r.watch.year} · <span className="ck-id">{r.id}</span></p>
        </div>
        {actions('head')}
      </header>
      <div className="ck-dgrid">
        <div>
          {r.words && (
            <section className="ck-block" aria-labelledby="words-h">
              <h3 id="words-h">In the client’s words</h3>
              <p className="ck-words">{r.words}</p>
              {r.note && <p className="ck-note">{r.note}</p>}
            </section>
          )}
          {r.findings.length > 0 && (
            <section className="ck-block" aria-labelledby="dx-h">
              <h3 id="dx-h">Likely diagnosis<small>Drafted from the description, confirmed on the bench</small></h3>
              <ul className="ck-findings">
                {r.findings.map(f => (
                  <li key={f.text}><span>{f.text}</span><span className={`ck-conf ${f.confidence}`}>{f.confidence}</span><small>From {f.evidence}</small></li>
                ))}
              </ul>
            </section>
          )}
          {r.view === 'quote' && (
            <section className="ck-block" aria-labelledby="q-h">
              <h3 id="q-h">Quote</h3>
              {r.lines.length ? (
                <table className="ck-quote">
                  <thead><tr><th>Work and parts</th><th className="n">Bench</th><th className="n">Price</th></tr></thead>
                  <tbody>
                    {r.lines.map(l => (
                      <tr key={l.label}><td>{l.label}</td><td className={`n${l.hours ? '' : ' muted'}`}>{l.hours ? h(l.hours) : 'part'}</td><td className="n">{usd(l.price)}</td></tr>
                    ))}
                  </tbody>
                  <tfoot><tr><td>Total</td><td className="n">{h(hours(r))}</td><td className="n">{usd(t)}</td></tr></tfoot>
                </table>
              ) : <p className="ck-empty">No price yet: the watch is priced after inspection.</p>}
              {r.turnaround && <p className="ck-turn">Turnaround {r.turnaround} from arrival.</p>}
            </section>
          )}
          {r.view === 'quote' && <Bench r={r} waiting={waiting} />}
          {r.view !== 'quote' && r.mark && <p><span className={`pill ${r.mark.tone}`}>{r.mark.label}</span></p>}
          {r.view === 'bench' && <p className="ck-turn">{WATCHMAKERS.find(w => w.id === r.assignee)?.name} holds {h(r.bookedHours ?? 0)} of bench time for this watch, {r.due?.toLowerCase()}.</p>}
        </div>
        <aside aria-label="Request details">
          <section className="ck-block">
            <h3>Details</h3>
            <dl className="ck-kv">
              <dt>Client</dt><dd>{r.client.name}</dd>
              {r.client.city && <><dt>City</dt><dd>{r.client.city}</dd></>}
              <dt>History</dt><dd>{r.client.since ?? 'First request'}</dd>
              <dt>Received</dt><dd>{when(r.receivedAt)}</dd>
              <dt>Channel</dt><dd>{r.channel}</dd>
              <dt>Photos</dt><dd>{r.photos}</dd>
            </dl>
          </section>
          {r.history.length > 0 && (
            <section className="ck-block">
              <h3>Activity</h3>
              <ol className="ck-history">
                {r.history.map(e => <li key={e.at + e.text}>{e.text}<small>{when(e.at)}</small></li>)}
              </ol>
            </section>
          )}
        </aside>
      </div>
      {actions('bar')}
    </>
  );
}

export default function OwnerCockpit() {
  const state = useCockpit();
  const { requests, view, selectedId, query, toast, select, setQuery, accept, askPhotos, undo, dismissToast } = state;
  const rows = useMemo(() => visibleRows({ requests, view, query }), [requests, view, query]);
  const waiting = useMemo(() => requests.filter(r => r.view === 'quote'), [requests]);
  const lastAt = (r: RepairRequest) => r.history.at(-1)?.at ?? r.receivedAt;
  const answered = useMemo(() => requests.filter(r => r.view === 'client' || r.view === 'closed')
    .sort((a, b) => lastAt(b) - lastAt(a)).slice(0, 3), [requests]);
  const selected = requests.find(r => r.id === selectedId && r.view === view) ?? null;
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  const viewMeta = VIEWS.find(v => v.id === view)!;

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONTS}"]`)) {
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = FONTS; document.head.appendChild(l);
    }
    document.title = 'Requests · AÉVRA owner';
  }, []);

  // Desktop opens the oldest request so the detail pane is never blank; the phone starts on the list.
  useEffect(() => {
    if (!selected && rows.length && !isPhone()) select(rows[0].id);
  }, [selected, rows, select]);

  useEffect(() => setMenuOpen(false), [selectedId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismissToast, 6000);
    return () => clearTimeout(t);
  }, [toast, dismissToast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest('input, textarea, [contenteditable="true"]');
      if (e.key === 'Escape') { setMenuOpen(false); setSheetOpen(false); if (typing) (e.target as HTMLElement).blur(); return; }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      const i = rows.findIndex(r => r.id === selectedId);
      const go = (n: number) => { const r = rows[Math.min(rows.length - 1, Math.max(0, n))]; if (r) { select(r.id); document.querySelector(`[data-id="${r.id}"]`)?.scrollIntoView({ block: 'nearest' }); } };
      if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); go(i + 1); }
      else if (e.key === 'k' || e.key === 'ArrowUp') { e.preventDefault(); go(i - 1); }
      else if (e.key === '/') { e.preventDefault(); search.current?.focus(); }
      else if (selected?.view === 'quote' && e.key === 'a') accept(selected.id);
      else if (selected?.view === 'quote' && e.key === 'p') askPhotos(selected.id);
      else if (selected?.view === 'quote' && e.key === 'd') setMenuOpen(true);
      else if (e.key === 'z' && toast) undo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rows, selectedId, selected, select, accept, askPhotos, undo, toast]);

  const oldest = rows[0];
  const sum = rows.reduce((s, r) => s + total(r), 0);
  const finding = view === 'quote' && rows.length
    ? `Oldest waiting ${age(oldest.receivedAt)} · ${usd(sum)} in quotes`
    : view === 'bench' ? `${h(booked(requests))} of ${h(capacity())} booked, ${BENCH_WINDOW.label}` : null;

  return (
    <div className="ck" data-open={selected ? 'true' : 'false'}>
      <aside className="ck-side" aria-label="AÉVRA owner">
        <div className="ck-brand"><Mark /><b>AÉVRA</b><span>Atelier</span></div>
        <Nav />
        <SideFoot />
      </aside>

      <header className="ck-top">
        <label className="ck-search">
          <Search size={14} aria-hidden="true" />
          <input ref={search} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search watches, clients, calibres" aria-label="Search requests" />
          <kbd aria-hidden="true">/</kbd>
        </label>
        <div className="ck-top-right">Demo data · <a href={import.meta.env.BASE_URL}>send a request from the customer site</a></div>
      </header>

      <div className="ck-phonebar">
        <button onClick={() => setSheetOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
        <b>{viewMeta.label}</b>
      </div>
      <div className="ck-sheetmenu" data-show={sheetOpen}>
        <div className="ck-phonebar" style={{ display: 'flex' }}>
          <button onClick={() => setSheetOpen(false)} aria-label="Close menu"><X size={20} /></button>
          <b>AÉVRA Atelier</b>
        </div>
        <Nav onPick={() => setSheetOpen(false)} />
        <div style={{ marginTop: 24 }}><SideFoot /></div>
      </div>

      <main className="ck-sheet">
        <section className="ck-list" aria-labelledby="view-h">
          <div className="ck-list-head">
            <h1 id="view-h">{viewMeta.label}<span>{rows.length}</span></h1>
            {finding && <p className="ck-finding">{finding}</p>}
          </div>
          <div className="ck-phone-search">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search" aria-label="Search requests" />
          </div>
          <div className="ck-scroll">
            {rows.length ? (
              <ul className="ck-rows">{rows.map(r => <Row key={r.id} r={r} selected={r.id === selected?.id} />)}</ul>
            ) : <p className="ck-empty">{query ? `Nothing matches “${query}”.` : viewMeta.empty}</p>}
            {view === 'quote' && !query && answered.length > 0 && (
              <section aria-labelledby="ans-h">
                <h2 id="ans-h" className="ck-group">Answered recently</h2>
                <ul className="ck-rows">{answered.map(r => (
                  <Row key={r.id} r={r} selected={false} onOpen={() => { state.setView(r.view); select(r.id); }} />
                ))}</ul>
              </section>
            )}
          </div>
          <p className="ck-keys"><kbd>J</kbd> <kbd>K</kbd> move · <kbd>A</kbd> accept · <kbd>P</kbd> photos · <kbd>D</kbd> decline</p>
        </section>
        <section className="ck-detail" aria-label="Request">
          {selected
            ? <Detail r={selected} waiting={waiting} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
            : <p className="ck-pick">{rows.length ? 'Choose a request.' : viewMeta.empty}</p>}
        </section>
      </main>

      {toast && (
        <div className="ck-toast" role="status">
          <span>{toast.message}</span>
          <button onClick={undo}>Undo</button>
        </div>
      )}
    </div>
  );
}
