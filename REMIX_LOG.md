# REMIX_LOG: AÉVRA owner cockpit (21 Nov 2026)

The cockpit takes ideas from several sources, reworks each, and puts one design system on top. Nothing is copied: no code, text, imagery, icons or logos.

| Source | Idea taken | How it was changed |
|---|---|---|
| taste-skill app library, style `framed-sheet` (seed 873765453), `inbox` pattern | Tinted L-frame with the work on a white sheet inset 8px; fixed list column beside the open item; two-line rows; selected row as a neutral fill | Frame tint set to a neutral stone; AÉVRA's brass is the one hue (selected bar, the request's share of the bench); rows carry price and age instead of channel icons |
| taste-skill app-screen rules (KPIs, lists, one finding, phone) | One finding under the title; counts only on queues that need action; figures right-aligned in tabular digits; one region at a time on a phone | Finding is the trade's own ("oldest waiting 2 days · $2,555 in quotes"); the phone gets a thumb-height action bar |
| Linear's inbox, as a product pattern (from use; not in the library) | Keyboard triage (J/K), selection moving on after an action, an undo toast | Actions are a workshop's (accept and send the quote, ask for photos, decline with a reason sent to the client) |
| Stripe invoices, as a product pattern (from use; not in the library) | Line items with a computed total, right-aligned money, no decoration | Each line also carries bench hours, and the total hours feed the bench strip |
| A watchmaker's bench book (the trade's own artefact) | Booked hours against the bench's capacity | Drawn as one strip: booked, this request, the other quotes, free, with the legend as the marks themselves |
| mobbin web "Table" and "Dashboard" screens (library: `find.py search table` / `dashboard`) | Category references for dense rows and quiet headers | Used as a check on row pitch and header weight only |

Design system on top: IBM Plex Sans (one face) with IBM Plex Mono for request IDs only; tokens in `src/owner/cockpit.css`; 8 px cards, 6 px controls, 16 px sheet; every text colour at 4.5:1 or more (brass text #7d5e28 is 6.0:1, brass marks #a07b3b are 3.9:1).
