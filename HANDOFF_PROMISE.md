# PROMISE — FULL HANDOFF

> **Single source of truth for all agents.**
>
> Read this entire file before changing the project.
> Update this same file before stopping work.
> Do not create a second handoff file.
> Do not silently pivot the product, business, architecture, visual direction, or core workflow.
>
> Last updated: **2026-09-30 11:20 IST**
> Product: **PROMISE**
> Competition: **Lovable Challenge**
> Status: **REBUILD / RE-SCOPE LOCKED**

---

# 0. RESUME HERE — CURRENT STATE

## ✅ CURRENT — v2 · 2026-09-30

PROMISE is an **uncertainty-aware booking and commitment system for a fictional solo watchmaker / repair atelier in Lucknow**.

The central product thesis is:

> **PROMISE does not merely automate booking. It automates the decision of what the business can safely promise.**

A customer arrives with a messy natural-language repair request and often a desired deadline.

PROMISE:

1. understands the inquiry,
2. classifies the work,
3. determines the correct appointment type,
4. estimates the required resources and effort,
5. checks dependencies and current capacity,
6. determines whether the business can make a reliable commitment,
7. books the right next step,
8. escalates only genuine uncertainty to the owner,
9. and, after inspection/diagnosis, recalculates the realistic completion promise.

### Critical distinction

A booking is **not always a repair commitment**.

The system has three commitment states:

- **CONFIRMED** — enough information exists to commit the requested service/time.
- **CONDITIONAL** — the business can commit to the next step (usually inspection/intake), but not yet to final repair completion.
- **NOT FEASIBLE** — the requested outcome/deadline cannot honestly be promised with current resources/dependencies.

This uncertainty handling is the defining product feature.

---

# 1. CONTEST CONTEXT

## Challenge theme

Rebuild the moment a customer inquiry turns into a confirmed booking for an appointment-based business.

The goal is to turn:

> “Can I book with you?”

into:

> “You're booked.”

with as little manual owner effort as possible.

The business must have:

- a believable name,
- a location,
- realistic operational quirks,
- a concrete manual-work problem,
- and a build that genuinely reduces owner effort.

## Submission requirements

The final submission must include:

1. Public Lovable project link.
2. Business name + one-line problem solved.
3. Demo video under 3 minutes.
4. Social post tagging **@Lovable** and **#lovablechallenge**.
5. Bonus: short process/walkthrough video.

## Evaluation criteria

### Problem-solving impact
Does the product genuinely turn inbound inquiry into confirmed booking for the chosen business?

### Owner-effort reduction
How much manual work disappears?

### Craft & execution
Is the build polished, functional and complete end-to-end?

### Storytelling
Can a judge understand the before/after and value quickly?

## Strategic competitive conclusion

The current challenge field already contains many:

- generic calendars,
- beauty/salon booking systems,
- photography booking systems,
- tattoo booking systems,
- AI booking concierges,
- deposit/reminder systems,
- route-aware booking systems,
- domain-specific compatibility engines,
- multi-step lesson plans.

Therefore PROMISE must not compete on:

- “AI chat”
- “pretty calendar”
- “automated reminders”
- “deposit support”
- “owner dashboard”

Those are supporting capabilities, not the product's identity.

PROMISE differentiates through:

> **uncertainty-aware commitment + repair workflow + dependency-aware completion promises.**

---

# 2. BUSINESS

## Business name

**AÉVRA — Horological Conservation Atelier** (formerly referenced as Mekanika in early drafts)

## Location

**Lucknow, Uttar Pradesh, India**

## Business archetype

A **solo independent watchmaker / mechanical watch repair atelier**.

The business is intentionally small:

- one watchmaker,
- one primary repair bench,
- limited daily throughput,
- no dedicated receptionist,
- customer inquiries arrive through WhatsApp / Instagram / web,
- watchmaker often responds between bench jobs,
- repairs vary dramatically in duration,
- final repairability may not be known until physical inspection,
- parts availability can block completion,
- customers often provide a deadline (“before my father's birthday”, “before my wedding”, “before my trip”, etc.).

## Realistic quirks

These quirks are mandatory because they create the product problem:

1. **One skilled watchmaker only.**
2. **One primary repair bench.**
3. **Not every inquiry is actually a repair appointment.**
4. The appropriate first appointment can be an **inspection/intake**, not repair.
5. Repair duration is uncertain until diagnosis.
6. Some repairs require specific parts.
7. Parts can introduce external dependency delays.
8. Vintage pieces may have unknown internal conditions.
9. Some requests have hard customer deadlines.
10. The owner frequently responds from the workshop while actively working.
11. Customers often send incomplete, messy, conversational requests.
12. The owner does not want to promise a date based on optimism.
13. The owner wants the system to automate routine cases and escalate only genuine exceptions.

## Business pain

### Before PROMISE

A customer writes:

> “Hey, my dad's old automatic stopped running. His birthday is Friday. Can you fix it before then?”

The owner has to manually:

- ask what watch it is,
- gather photos/details,
- determine whether to inspect or repair,
- find an appointment,
- estimate bench time,
- inspect existing bookings,
- consider parts,
- decide whether Friday is realistic,
- explain uncertainty,
- remember to follow up,
- and possibly reschedule later.

The customer experiences back-and-forth.

The owner loses bench time to administrative work.

---

# 3. ONE-LINE PRODUCT DESCRIPTION

Use this exact positioning unless intentionally revised:

> **PROMISE turns messy repair inquiries into the correct next appointment and only commits the atelier to completion dates the current bench, parts, and workload can actually support.**

Alternative concise marketing line:

> **Know what you can deliver before you promise it.**

Core tagline candidate:

> **Book the work. Not the uncertainty.**

Do not use generic positioning such as:

- AI booking assistant,
- intelligent appointment scheduler,
- smart calendar,
- AI receptionist.

Those undersell the product.

---

# 4. PRODUCT THESIS

PROMISE treats booking as a **decision problem**, not a calendar problem.

The system asks:

> **What must be true before this appointment or completion promise is legitimate?**

The product pipeline:

```text
INBOUND INQUIRY
      ↓
UNDERSTAND
      ↓
CLASSIFY THE JOB
      ↓
DETERMINE CORRECT NEXT APPOINTMENT
      ↓
ESTIMATE WORKLOAD
      ↓
CHECK RESOURCES / DEPENDENCIES / DEADLINE
      ↓
COMMITMENT ENGINE
   ↙        ↓        ↘
CONFIRMED  CONDITIONAL  NOT FEASIBLE
   ↓          ↓            ↓
BOOK        INSPECT       RECOVER / ALTERNATIVE
   ↘          ↓            ↙
       OWNER EXCEPTION FLOW
              ↓
       CUSTOMER CONFIRMATION
              ↓
       INSPECTION / DIAGNOSIS
              ↓
       ACTUAL REPAIR REQUIREMENTS
              ↓
        BENCH SCHEDULING
              ↓
       COMPLETION PROMISE
```

---

# 5. CORE PRODUCT PRINCIPLE

## Never manufacture certainty.

The system should never say:

> “Your repair will definitely be ready Friday.”

when only an initial inquiry exists.

Instead it should distinguish:

### Known

- requested deadline,
- service type,
- current bench capacity,
- known parts status,
- appointment duration.

### Unknown

- internal movement condition,
- hidden damage,
- exact repair scope,
- unexpected parts,
- additional labor.

Therefore:

> **Inspection can be confirmed. Final repair completion remains conditional.**

This should be visible in both the product behavior and the storytelling.

---

# 6. THREE COMMITMENT STATES

## A. CONFIRMED

Definition:

The system knows enough to book the requested service/time with acceptable confidence.

Example:

> Battery replacement requested.
> Model known.
> Standard service duration known.
> Required part is in stock.
> Bench has capacity.

UI:

```text
✓ CONFIRMED
Saturday · 11:30 AM
Battery replacement
30 min
```

Customer-facing CTA:

**Confirm appointment**

---

## B. CONDITIONAL

Definition:

The system can safely promise the next step, but cannot safely promise the final outcome yet.

Typical use:

> Vintage mechanical watch stopped running.

UI:

```text
◐ CONDITIONAL
Inspection confirmed
Tuesday · 11:30 AM
20 min intake

Repair completion will be confirmed after diagnosis.
```

This is the most important state in the product.

---

## C. NOT FEASIBLE

Definition:

Current capacity, dependency or deadline prevents a legitimate commitment.

UI should never simply say:

> “Unavailable.”

Instead:

```text
! NOT FEASIBLE

Requested completion:
Friday, Oct 2

Earliest defensible completion:
Monday, Oct 5

Blocking factors:
• 4.5 bench hours required
• replacement part arrives Friday
• no remaining bench capacity Thursday
```

Then produce alternatives.

Possible recovery actions:

- Book inspection anyway.
- Move requested deadline.
- Wait for part arrival.
- Choose a different service option.
- Owner review.

---

# 7. CORE USER FLOW

## CUSTOMER FLOW

### Screen 1 — Atelier landing / inquiry

Customer sees:

**Mekanika Horology Atelier**

A premium but simple hero:

> Tell us what happened to your watch.

Support text:

> You don't need to know the exact service. Describe the problem in your own words.

Primary input:

Large conversational text field.

Example placeholder:

> “My grandfather's automatic watch stopped running and I need it for his birthday next week.”

Optional structured inputs can be progressively revealed; do not make customers fill a giant form upfront.

---

### Screen 2 — Understanding

The system transforms the free-form message into a structured case.

Visible card:

```text
WE UNDERSTOOD

Watch
Mechanical automatic

Issue
Stopped running

Customer goal
Operational before birthday

Requested deadline
Friday

Next step
Inspection
```

Show editable fields so the customer can correct misinterpretation.

Avoid fake generative text walls.

---

### Screen 3 — Feasibility / commitment

System determines:

```text
INSPECTION
Tuesday · 11:30 AM
20 minutes

STATUS
CONDITIONAL
```

Then explain:

> We can confirm the inspection now.
> A final repair date depends on the diagnosis and any required parts.

CTA:

**Confirm inspection**

---

### Screen 4 — Confirmation

After customer confirms:

```text
✓ INSPECTION CONFIRMED

Tuesday
11:30 AM

Mekanika Horology Atelier
Lucknow

Estimated intake: 20 min

We'll assess the movement, condition and required parts
before committing to a repair completion date.
```

The wording must emphasize the exact commitment being made.

---

# 8. OWNER FLOW

Owner dashboard must feel like a **workshop cockpit**, not a generic SaaS admin panel.

## Main dashboard information architecture

### Today

- bench capacity,
- today's appointments,
- waiting inspections,
- active repairs,
- commitments at risk,
- recovered capacity.

### Inquiries

Three lanes:

**AUTO-READY**

Routine / sufficiently known requests.

**CONDITIONAL**

Inspection can be booked, repair promise depends on diagnosis.

**EXCEPTIONS**

Needs owner decision.

---

# 9. OWNER'S MAIN JOB

The owner should answer as few questions as possible.

Each inquiry should become a structured action:

### Example

```text
NEW CASE

Customer: Rahul
Item: Vintage automatic wristwatch
Issue: stopped running
Requested outcome: ready before Friday

RECOMMENDED NEXT STEP
20-minute inspection

WHY
Internal condition unknown.

PROMISE STATUS
Conditional

OWNER ACTION
[Approve intake]
```

Not:

> “Please review this customer conversation.”

The system has already done the reasoning.

---

# 10. AFTER INSPECTION

This is where PROMISE separates itself from ordinary booking software.

Owner records:

```text
Diagnosis
Full mechanical service

Estimated bench time
4.5 hours

Parts
Required: mainspring
Status: in stock

Additional notes
Movement contamination found
```

PROMISE recalculates the production schedule.

Example output:

```text
REPAIR PLAN

Bench time       4h 30m
Parts            In stock
Available slot   Wed 13:00–17:30
Quality buffer   30m

PROJECTED COMPLETION
Thursday · 5:00 PM

✓ FEASIBLE
```

Owner action:

**Confirm completion promise**

Customer then receives:

> Your repair is scheduled for completion Thursday at 5 PM.

---

# 11. IMPOSSIBLE SCENARIO

This scenario is mandatory for the demo.

Customer:

> “I need it repaired by tomorrow.”

System finds:

- inspection available,
- diagnosis may be possible,
- required part arrives later,
- remaining bench capacity is insufficient.

Output:

```text
NOT FEASIBLE

We cannot honestly promise completion tomorrow.

Earliest projected completion:
Monday

Blocking factors:
• Required part arrives Friday
• 4.5h bench workload
• Thursday bench is full
```

Alternatives:

```text
[Book inspection tomorrow]
[Accept Monday completion]
[Owner review]
```

This screen demonstrates actual reasoning rather than a calendar failure state.

---

# 12. CAPACITY RECOVERY

Include a cancellation/recovery flow as a secondary feature.

Example:

A 3-hour repair cancels.

PROMISE detects:

```text
CAPACITY RECOVERED
3h bench capacity
Saturday · 13:00–16:00
```

It searches pending conditional/inquiry cases.

Potential match:

> Vintage service request
> Estimated 2h 45m
> Parts ready
> Deadline next week

PROMISE shows:

```text
MATCH FOUND

This recovered slot can accommodate:
Rahul's vintage service

[Offer slot]
```

Owner only approves the recovery.

This directly supports the owner-effort criterion.

Do not turn this into a giant CRM. It should remain a focused operational capability.

---

# 13. BUSINESS RULES / DECISION ENGINE

The engine must be deterministic and explainable.

No need to fake a backend AI model.

Natural-language input can be simulated or parsed with lightweight rules for the challenge demo, while the **actual important intelligence** lives in the feasibility engine.

## Extraction fields

Recommended type:

```ts
type Inquiry = {
  id: string;
  customerName: string;
  rawMessage: string;

  itemType:
    | "mechanical_watch"
    | "quartz_watch"
    | "unknown";

  issueType:
    | "stopped"
    | "running_slow"
    | "running_fast"
    | "battery"
    | "strap"
    | "water_damage"
    | "unknown";

  requestedDeadline?: string;
  requestedDate?: string;
  requestedTime?: string;

  urgency:
    | "normal"
    | "deadline"
    | "urgent";

  customerGoal:
    | "repair"
    | "diagnosis"
    | "maintenance"
    | "unknown";

  photosProvided: boolean;
  modelKnown: boolean;
};
```

---

# 14. JOB CLASSIFICATION

Map inquiries into operational job types.

Example:

```ts
type JobType =
  | "battery_replacement"
  | "strap_change"
  | "inspection"
  | "diagnostic"
  | "mechanical_service"
  | "water_damage"
  | "unknown";
```

Each job type has default operational characteristics.

Example:

```ts
const JOB_RULES = {
  battery_replacement: {
    intakeMinutes: 15,
    benchMinutes: 30,
    partsRequired: true,
    inspectionRequired: false,
  },

  strap_change: {
    intakeMinutes: 10,
    benchMinutes: 15,
    partsRequired: true,
    inspectionRequired: false,
  },

  mechanical_service: {
    intakeMinutes: 20,
    benchMinutes: 270,
    partsRequired: "unknown",
    inspectionRequired: true,
  },

  diagnostic: {
    intakeMinutes: 20,
    benchMinutes: 45,
    partsRequired: "unknown",
    inspectionRequired: true,
  },
};
```

Use reasonable mock values. They are fictional business rules, not claims about a real atelier.

---

# 15. DEPENDENCY MODEL

Each repair can carry dependencies.

Example:

```ts
type Dependency = {
  id: string;
  label: string;
  status: "ready" | "pending" | "unknown";
  blocking: boolean;
  availableDate?: string;
};
```

Examples:

- replacement mainspring,
- crystal,
- gasket,
- battery,
- strap,
- movement identification,
- customer approval.

If a blocking dependency is unavailable before the requested deadline:

**NOT FEASIBLE**

---

# 16. CAPACITY MODEL

Represent the atelier as:

```ts
type CapacityState = {
  date: string;

  benchCapacityMinutes: number;
  bookedMinutes: number;
  remainingMinutes: number;

  watchmakerAvailable: boolean;
};
```

One bench.

One watchmaker.

No parallel infinite capacity.

The product's credibility depends on capacity being finite.

---

# 17. COMMITMENT ENGINE

Core function:

```ts
evaluateCommitment(
  inquiry,
  job,
  capacity,
  dependencies,
  businessRules
)
```

Return:

```ts
type CommitmentResult = {
  status: "confirmed" | "conditional" | "not_feasible";

  nextAppointment: {
    start: string;
    end: string;
    type: "inspection" | "repair" | "pickup";
  };

  projectedCompletion?: string;

  reasons: string[];

  blockers: string[];

  alternatives: Alternative[];

  ownerAction?: "none" | "approve" | "review";
};
```

---

# 18. DECISION LOGIC

High-level rules:

### Rule 1
If required information is sufficient and the job has known effort + available required resources:

→ **CONFIRMED**

### Rule 2
If the customer can safely book an inspection but final repair effort/dependencies are unknown:

→ **CONDITIONAL**

### Rule 3
If a required dependency cannot be ready before the requested deadline:

→ **NOT FEASIBLE**

### Rule 4
If bench capacity cannot fit the requested workload before the deadline:

→ **NOT FEASIBLE**

### Rule 5
If the requested deadline is absent:

Book the earliest appropriate next step without inventing a hard completion date.

### Rule 6
If ambiguity is material:

Ask **one focused clarification question**.

Never ask five sequential questions if the available information can still determine the correct next appointment.

---

# 19. EXPLAINABILITY

Every decision should have a human-readable explanation.

Bad:

> AI confidence: 83%

Good:

> **Why this is conditional**
>
> We can schedule the inspection because the watch's internal condition is still unknown. Final repair time and parts requirements will be determined after diagnosis.

Bad:

> No slot available.

Good:

> **Why this won't fit**
>
> The required repair is estimated at 4.5 bench hours, but only 2 hours remain before your requested deadline.

The product should feel trustworthy.

---

# 20. DATA MODEL

Recommended core entities:

```text
Business
Customer
Inquiry
Appointment
Job
Dependency
CapacityBlock
Commitment
OwnerAction
ActivityEvent
```

Example relationships:

```text
Customer
   └── Inquiry
         └── Commitment
               └── Appointment
               └── Job
                     └── Dependencies
                     └── CapacityBlocks
```

---

# 21. RECOMMENDED FILE STRUCTURE

Use this structure unless the existing project strongly requires otherwise:

```text
src/
├── components/
│   ├── Header.tsx
│   ├── CustomerInquiry.tsx
│   ├── InquirySummary.tsx
│   ├── CommitmentCard.tsx
│   ├── ConfirmationCard.tsx
│   ├── OwnerDashboard.tsx
│   ├── InquiryQueue.tsx
│   ├── CaseDetail.tsx
│   ├── DiagnosisPanel.tsx
│   ├── CapacityTimeline.tsx
│   ├── RecoveryPanel.tsx
│   ├── DemoScenarioBar.tsx
│   └── StatusBadge.tsx
│
├── engine/
│   ├── classifier.ts
│   ├── scheduler.ts
│   ├── feasibility.ts
│   ├── commitments.ts
│   └── explanations.ts
│
├── data/
│   ├── mockData.ts
│   ├── businessRules.ts
│   └── scenarios.ts
│
├── types/
│   └── index.ts
│
├── App.tsx
└── index.css
```

The old project had:

- `CustomerView.tsx`
- `OwnerDashboard.tsx`
- `scheduler.ts`
- `mockData.ts`
- `DemoScenarioBar.tsx`
- `Header.tsx`

Those names may be reused if convenient, but the product logic must follow this new specification.

---

# 22. DEMO SCENARIOS

A judge-friendly scenario switcher is mandatory.

Use four scenarios.

## SCENARIO 1 — Routine

Customer:

> “My quartz watch needs a battery replacement.”

Expected:

**CONFIRMED**

The system finds the correct short appointment.

Purpose:

Shows frictionless normal booking.

---

## SCENARIO 2 — Uncertain

Customer:

> “My father's old automatic stopped running and I need it for his birthday Friday.”

Expected:

**CONDITIONAL**

Book inspection.

Do not promise repair completion before diagnosis.

Purpose:

Shows the product's unique uncertainty logic.

---

## SCENARIO 3 — Impossible

Customer:

> “The watch needs full service and I need it repaired tomorrow.”

Expected:

**NOT FEASIBLE**

Show exact blockers and earliest defensible completion.

Purpose:

Demonstrates genuine constraint reasoning.

---

## SCENARIO 4 — Recovery

Existing booking is cancelled.

Expected:

Capacity becomes available.

System identifies a pending repair that can fit.

Purpose:

Demonstrates owner-effort reduction after the initial booking.

---

# 23. OPTIONAL FIFTH SCENARIO

## Minimal information

Customer:

> “My watch is acting weird. Can you see me Saturday?”

Expected:

System asks one focused clarification:

> Is the watch **stopping**, **running inaccurately**, or showing another problem?

Do not create an endless conversational interface.

Purpose:

Demonstrates controlled ambiguity handling.

---

# 24. VISUAL DIRECTION

PROMISE should feel like a **precision atelier**, not cyberpunk AI SaaS.

## Desired aesthetic

- premium horology,
- dark charcoal / near-black surfaces,
- warm ivory typography,
- subtle brass/gold accent,
- restrained glass / metallic details,
- fine hairlines,
- crisp information hierarchy,
- mechanical/precision motifs,
- generous negative space,
- editorial luxury,
- tactile workshop feeling.

Avoid:

- neon cyan,
- hacker aesthetics,
- giant glowing gradients,
- generic glassmorphism everywhere,
- over-animated dashboards,
- noisy sci-fi UI,
- “AI assistant” visual clichés.

## Visual metaphor

Think:

> **Swiss watch atelier meets modern operations cockpit.**

The design should imply precision before the user reads the text.

---

# 25. MOTION

Motion must serve comprehension.

Good:

- subtle timeline interpolation,
- capacity bar animation,
- status transitions,
- appointment lock/confirm micro-interaction,
- dependency resolution,
- completion promise appearing after diagnosis.

Bad:

- floating particles,
- unnecessary page transitions,
- animation on every text block,
- distracting 3D watch objects.

Target feeling:

> controlled, mechanical, deliberate.

---

# 26. CUSTOMER HOME SCREEN

Recommended content hierarchy:

```text
Mekanika
HOROLOGY ATELIER

Describe what's wrong with your watch.
We'll determine the right next step.

[ Large inquiry field ]

Example:
“My grandfather's watch stopped running...”

[ Begin assessment ]

Trusted workshop
Lucknow · By appointment
```

Keep this intentionally simple.

The product's intelligence appears after the customer submits.

---

# 27. CUSTOMER COMMITMENT SCREEN

Recommended layout:

Left:

**Your request**

Right:

**PROMISE**

The status should dominate.

Example:

```text
◐ CONDITIONAL

INSPECTION CONFIRMED

Tuesday
11:30 AM
20 minutes

Why conditional?
The watch's internal condition and required parts
cannot be known until inspection.

Final repair completion:
To be confirmed after diagnosis.

[ Confirm inspection ]
```

This is potentially the signature screen.

---

# 28. OWNER COCKPIT

Hero metrics should be operational, not vanity metrics.

Use:

### Today

**6**
appointments

### Bench

**62%**
allocated

### Cases

**3**
conditional

### Attention

**1**
exception

### Recovery

**2h 30m**
available capacity

Avoid:

- follower count,
- generic “AI accuracy”,
- fake revenue numbers,
- meaningless growth charts.

---

# 29. CASE DETAIL

For an inquiry:

```text
CASE #MKA-1042

Customer
Rahul Sharma

Watch
Vintage automatic

Issue
Stopped running

Deadline
Fri · Oct 2

Current commitment
CONDITIONAL

NEXT STEP
Inspection
Tue · 11:30

UNKNOWN
Internal movement condition
Parts requirement

OWNER DECISION
Approve intake
```

Use expandable sections for:

- customer message,
- extracted information,
- reasoning,
- capacity,
- dependencies,
- activity history.

---

# 30. DIAGNOSIS PANEL

After intake:

```text
DIAGNOSIS

Service
Full mechanical service

Bench time
4h 30m

Parts
Mainspring — In stock

Customer deadline
Friday

CAPACITY CHECK

Wednesday
13:00 → 17:30

Quality buffer
30m

PROJECTED COMPLETION
Thursday · 17:00

✓ FEASIBLE

[ Confirm completion promise ]
```

This screen should look like the engine has converted diagnosis into a real production commitment.

---

# 31. NOT-FEASIBLE UI

Never make it feel like an error page.

It should feel like an operational explanation.

Recommended:

```text
NOT FEASIBLE

We can't honestly promise Friday.

Requested
Fri · Oct 2

Earliest defensible completion
Mon · Oct 5

WHY

4h 30m bench time required
Mainspring arrives Friday
Thursday bench already committed

OPTIONS

[ Book inspection ]
[ Accept Monday ]
[ Owner review ]
```

Use a calm warning style, not red emergency UI.

---

# 32. OWNER EFFORT METRIC

The challenge explicitly values manual work removed.

PROMISE should surface this in the demo.

Example simulated metric:

```text
THIS WEEK

18 inquiries received
14 automatically classified
11 appointments booked without owner intervention
4 conditional intakes routed
3 exceptions surfaced
0 inquiries left unanswered
```

Do not exaggerate with absurd numbers.

The numbers are fictional demo data and should remain clearly illustrative.

---

# 33. “BEFORE / AFTER” STORY

The pitch should be:

## BEFORE

Customer message arrives.

Owner:

- asks questions,
- checks calendar,
- estimates repair time,
- checks parts,
- makes a guess,
- follows up,
- remembers to update the customer.

## AFTER

Customer sends one message.

PROMISE:

- understands the case,
- books the correct next step,
- distinguishes certainty from uncertainty,
- checks real business constraints,
- prepares the owner,
- makes the completion commitment only when defensible.

The owner intervenes only when the system reaches a genuine exception.

---

# 34. DEMO VIDEO SCRIPT — UNDER 3 MINUTES

Target duration: **2:30–2:50**

## 0:00–0:15 — Problem

Show a realistic customer message:

> “My father's old automatic stopped running. I need it ready by Friday.”

Narration:

> “For a solo watchmaker, this isn't just a booking request. It's a promise they might not be able to keep.”

---

## 0:15–0:40 — Customer intake

Paste/send the message.

Show extraction:

- mechanical watch,
- stopped running,
- birthday deadline,
- inspection required.

Narration:

> “PROMISE turns the customer's message into the operational case the workshop actually needs.”

---

## 0:40–1:00 — Conditional commitment

Show:

**INSPECTION CONFIRMED**

Then:

> “The repair itself isn't promised yet, because the internal condition is still unknown.”

This is the signature moment.

---

## 1:00–1:25 — Owner cockpit

Open owner view.

Show:

- case already structured,
- recommended action,
- appointment already reserved,
- no manual re-entry.

Narration:

> “The owner gets a decision-ready case instead of a conversation to process.”

---

## 1:25–1:50 — Diagnosis

Enter diagnosis:

- full service,
- 4.5 hours,
- part in stock.

Show feasibility recalculation.

Output:

**Thursday 5 PM**

---

## 1:50–2:15 — Impossible case

Switch scenario.

Show:

> Requested: tomorrow

Then:

> NOT FEASIBLE

Explain exact blockers.

Narration:

> “And PROMISE refuses to manufacture certainty. It explains what blocks the request and presents the next legitimate options.”

---

## 2:15–2:35 — Recovery

Show cancelled slot.

Show capacity recovered.

Show pending customer matched.

Narration:

> “When capacity opens, PROMISE can reuse it instead of leaving the slot empty.”

---

## 2:35–2:50 — Closing

Before/after:

**BEFORE**
Messages → questions → calendar → guess → follow-up

**AFTER**
One inquiry → assessed → booked → promised only when defensible

Closing line:

> **PROMISE — Book the work. Not the uncertainty.**

---

# 35. PROCESS WALKTHROUGH BONUS VIDEO

Keep this separate and shorter.

Show:

1. business problem discovery,
2. why ordinary booking software fails,
3. decision engine design,
4. data model,
5. constraint logic,
6. Lovable implementation,
7. testing scenarios,
8. final result.

Do not spend the bonus video showing cosmetic tweaking.

The story should be engineering/process focused.

---

# 36. TEST MATRIX

Before submission, test all of these.

## Customer tests

### T1
Routine battery request.

Expected:
CONFIRMED.

### T2
Routine strap request.

Expected:
CONFIRMED.

### T3
Vintage mechanical stopped.

Expected:
CONDITIONAL.

### T4
Unknown/ambiguous issue.

Expected:
one focused clarification.

### T5
Deadline impossible due to capacity.

Expected:
NOT FEASIBLE + blocker explanation.

### T6
Deadline impossible due to missing part.

Expected:
NOT FEASIBLE + dependency explanation.

### T7
No deadline.

Expected:
next available appropriate appointment, no fabricated completion promise.

### T8
Customer edits extracted field.

Expected:
feasibility recalculates.

---

# 37. ENGINE TESTS

### E1
Capacity cannot become negative.

### E2
Two appointments cannot occupy the same bench.

### E3
Watchmaker cannot be double-booked.

### E4
Blocking dependency cannot be ignored.

### E5
Conditional request cannot produce confirmed repair completion.

### E6
Changing diagnosis updates duration.

### E7
Changing parts status updates feasibility.

### E8
Cancellation frees capacity.

### E9
Recovered capacity can match a compatible pending inquiry.

### E10
Every decision has a readable reason.

---

# 38. UX ACCEPTANCE CRITERIA

A judge should be able to understand in under 30 seconds:

1. What business is this?
2. What is difficult about booking here?
3. What does PROMISE automate?
4. Why is this different from a calendar?
5. How does the owner benefit?

If any answer requires a long spoken explanation, simplify the UI.

---

# 39. PRODUCT ACCEPTANCE CRITERIA

PROMISE is not complete until all of the following work:

- customer submits natural-language inquiry,
- inquiry is classified,
- correct next appointment is selected,
- capacity is checked,
- dependencies are checked,
- one of three commitment states appears,
- customer can confirm the appropriate commitment,
- owner can view the case,
- owner can record diagnosis,
- system recalculates the repair plan,
- final completion promise can be created,
- impossible cases provide explanations,
- capacity recovery works,
- demo scenario switcher works,
- app is visually polished,
- no obvious broken states remain.

---

# 40. DEMO DATA

Keep the demo dataset believable.

Example customers:

### Rahul Sharma
Vintage automatic
Stopped running
Birthday deadline
Conditional

### Ananya Mehta
Quartz watch
Battery depleted
No deadline
Confirmed

### Kabir Khan
Chronograph
Pushers sticking
Trip Friday
Conditional

### Meera Joshi
Mechanical watch
Full service
Deadline tomorrow
Not feasible

Avoid 100 fake rows. A small, curated dataset looks more intentional.

---

# 41. MOCK CALENDAR

Example:

```text
MON
09:30  Battery replacement
10:30  Strap change
11:30  Inspection
14:00  Vintage service
16:30  Pickup

TUE
10:00  Inspection
11:30  Inspection
13:00  Full service
17:00  Pickup
```

Use enough bookings to demonstrate real capacity pressure.

---

# 42. OWNER NOTIFICATIONS

Only meaningful alerts:

- commitment at risk,
- dependency arrived,
- capacity recovered,
- owner decision needed,
- customer deadline approaching.

Do not flood the UI.

---

# 43. MOBILE RESPONSIVENESS

The customer experience should be excellent on mobile.

The owner cockpit may prioritize desktop/tablet, but must remain usable on smaller screens.

Do not sacrifice the core flow for responsive decoration.

---

# 44. ACCESSIBILITY / QUALITY

Must include:

- readable contrast,
- visible focus states,
- semantic buttons,
- keyboard navigation where practical,
- error messaging,
- no color-only status encoding,
- responsive text,
- reduced-motion-friendly transitions where possible.

---

# 45. TECHNICAL STACK

Current stack:

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide icons if already installed
- Anime.js if already installed

No need to add a large dependency stack unless required.

Prefer simple deterministic logic.

---

# 46. STATE MANAGEMENT

For the challenge demo, local React state is acceptable.

Avoid premature complexity.

Recommended app-level state:

```ts
view: "customer" | "owner";
scenario: ScenarioId;

inquiries: Inquiry[];
appointments: Appointment[];
jobs: Job[];
capacity: CapacityState[];
```

Derived:

```ts
commitmentResults
ownerMetrics
currentCase
```

Do not duplicate the same source data in multiple unrelated components.

---

# 47. NO-BACKEND DEMO PRINCIPLE

A backend is optional for the challenge unless required by the final deployment.

The experience must **feel operationally real** even if data is mocked.

However:

- label simulated actions honestly,
- do not claim external systems were contacted if they were not,
- do not claim real payment processing if it is simulated,
- do not claim real SMS delivery if no provider is connected,
- do not claim live calendar synchronization if the app uses mock data.

This is part of the product's trust story.

---

# 48. LOGGING / DEBUGGING

Use concise internal logs if useful.

Recommended structured debug events:

```text
INQUIRY_RECEIVED
INTENT_CLASSIFIED
JOB_SELECTED
CAPACITY_CHECKED
DEPENDENCY_CHECKED
COMMITMENT_EVALUATED
APPOINTMENT_CREATED
DIAGNOSIS_UPDATED
PROMISE_RECALCULATED
CAPACITY_RECOVERED
```

Disable noisy logs in final production UI.

---

# 49. SECURITY / PRIVACY

The fictional data should be synthetic.

Do not put:

- real phone numbers,
- real addresses,
- secrets,
- API keys,
- private keys,
- credentials.

Environment variables must be referenced by name only if needed.

Never store secrets in this handoff.

---

# 50. FAILURE MODES TO AVOID

## Do not build a generic AI chat screen.

A chat bubble is only an input mechanism.

The product is the decision engine.

## Do not create a huge booking form.

Natural language should remove friction.

## Do not automatically promise uncertain repairs.

This destroys the central idea.

## Do not overuse “AI confidence.”

Explain business constraints instead.

## Do not make the owner inspect every inquiry.

The product should automate routine cases.

## Do not turn the dashboard into a generic analytics suite.

Every panel should support workshop operations.

## Do not add irrelevant enterprise features.

No:

- CRM sprawl,
- payroll,
- inventory ERP,
- accounting,
- social media management.

Stay focused.

---

# 51. WHAT MAKES PROMISE DIFFERENT

This sentence should survive every design/code revision:

> **PROMISE's job is not to find an empty calendar slot. Its job is to determine the strongest commitment the business can honestly make from the information and capacity it has.**

That commitment may be:

- a repair booking,
- an inspection,
- a pickup,
- a conditional next step,
- or an explicit refusal with a recovery path.

---

# 52. COMPETITIVE POSITIONING

When comparing internally against other challenge entries, do not say:

> “We're better than X.”

Instead use:

> “We focus on a different operational problem.”

Current crowded patterns include:

- generic appointment calendars,
- AI concierge booking,
- route scheduling,
- compatibility screening,
- reminders,
- deposits,
- cancellation recovery,
- backward scheduling.

PROMISE's core territory:

> **uncertainty-aware commitment in repair work where final scope is unknown until inspection.**

---

# 53. LANDING / HERO COPY

Preferred:

# PROMISE

### Know what the bench can deliver.

Subhead:

> Turn messy repair inquiries into the right next appointment — and only promise completion dates your actual capacity can support.

Supporting labels:

**INQUIRY**
→ **ASSESS**
→ **COMMIT**
→ **DELIVER**

---

# 54. OWNER HERO COPY

Inside dashboard:

> **Your bench is the constraint. PROMISE handles the rest.**

Alternative:

> **Less scheduling. Fewer guesses. Commitments you can keep.**

---

# 55. CUSTOMER MICROCOPY

Preferred vocabulary:

- assessment,
- inspection,
- commitment,
- projected completion,
- dependency,
- ready,
- confirmed,
- conditional,
- not feasible,
- earliest defensible completion.

Avoid excessive AI jargon.

---

# 56. BUSINESS STORY

Fictional business narrative:

Mekanika Horology Atelier is a one-watchmaker workshop in Lucknow known for mechanical and vintage watch servicing. Customers often contact the workshop through casual messages with a desired deadline but incomplete technical information. The watchmaker cannot know exact repair duration or required parts until inspection. The real bottleneck is not taking appointments; it is deciding **how much the workshop can responsibly promise** without disrupting its finite bench capacity.

PROMISE addresses that gap.

---

# 57. WHY THE OWNER WOULD PAY FOR IT

The product directly reduces:

- repetitive inquiry questioning,
- manual calendar checking,
- appointment classification,
- deadline feasibility calculations,
- follow-up,
- rescheduling,
- lost/cancelled capacity,
- customer uncertainty,
- risky over-promising.

The owner gains:

- fewer administrative interruptions,
- clearer bench utilization,
- better customer communication,
- explicit exception handling,
- higher confidence in delivery commitments.

Do not claim exact monetary ROI unless the app provides a clearly labeled fictional estimate.

---

# 58. METRIC STORY FOR THE JUDGE

The product should visually communicate:

```text
INQUIRIES
18

AUTO-RESOLVED
11

CONDITIONAL INTAKES
4

OWNER EXCEPTIONS
3

UNANSWERED
0
```

A second useful metric:

```text
ADMIN WORK AVOIDED
~2h 40m this week
```

Clearly label the data as a fictional demo scenario.

---

# 59. BUILD ORDER

Work in this exact sequence.

## Phase 1 — Core model
Create types and mock data.

## Phase 2 — Engine
Implement classifier → job rules → capacity → dependencies → commitment result.

## Phase 3 — Customer path
Inquiry → extraction → commitment → confirmation.

## Phase 4 — Owner path
Queue → case → diagnosis → recalculation → completion promise.

## Phase 5 — Recovery
Cancellation → recovered capacity → candidate match.

## Phase 6 — Demo scenarios
Make scenario switching deterministic.

## Phase 7 — Visual polish
Only after functionality is stable.

## Phase 8 — Judge rehearsal
Run full scripted flow three times without developer intervention.

## Phase 9 — Deployment
Public Lovable URL.

## Phase 10 — Submission
Writeup + video + social post + checklist.

---

# 60. GIT / FILE SAFETY

The previous project had catastrophic source loss because a previous agent executed:

```powershell
Remove-Item -Recurse -Force src/components, src/data, src/engine
```

The project was not initialized with Git.

## New rules

Before major work:

1. Ensure Git is initialized if feasible.
2. Create a checkpoint commit before destructive changes.
3. Never remove a source directory to “pivot” without explicit user approval.
4. Never assume an old project has been abandoned.
5. Do not delete code as a shortcut for refactoring.
6. Do not overwrite the handoff.
7. Keep this file synchronized after meaningful changes.

---

# 61. HANDOFF UPDATE RULES

1. **One folder, one file.**
   - Only `handoff/HANDOFF.md`.
   - Never create `HANDOFF_v2.md`, `NOTES.md`, `LOG.md`, etc.

2. **Never delete history.**
   - When the product direction changes materially, move the old block to:
     `🗄️ PAST — vN (...)`
   - Put the new direction on top as:
     `✅ CURRENT — vN (...)`

3. Small changes are edited in place and recorded in Changelog.

4. `Resume here` and `Snapshot` describe only the current state.

5. No secrets.

6. All timestamps use Asia/Kolkata / IST.

7. Every Changelog entry must identify the agent/tool.

8. Bump the handoff version once per update session.

9. Before stopping work, update:
   - status,
   - current task,
   - blockers,
   - next three steps,
   - feature status,
   - known bugs,
   - Changelog.

---

# 62. CURRENT FEATURE STATUS

| Feature | Status | Notes |
|---|---|---|
| Product name PROMISE | ✅ LOCKED | Do not rename without explicit decision |
| Watchmaker business | ✅ LOCKED | Mekanika Horology Atelier |
| Location | ✅ LOCKED | Lucknow, Uttar Pradesh |
| Core thesis | ✅ LOCKED | Uncertainty-aware commitment |
| Three commitment states | ✅ LOCKED | Confirmed / Conditional / Not feasible |
| Customer inquiry flow | 🔄 TO BUILD | Core |
| Deterministic extraction | 🔄 TO BUILD | Demo-compatible |
| Job classifier | 🔄 TO BUILD | Domain-specific |
| Capacity engine | 🔄 TO BUILD | One bench / one watchmaker |
| Dependency engine | 🔄 TO BUILD | Parts / unknown requirements |
| Commitment engine | 🔄 TO BUILD | Central logic |
| Owner cockpit | 🔄 TO BUILD | Exception-first |
| Diagnosis flow | 🔄 TO BUILD | Recompute completion |
| Recovery flow | 🔄 TO BUILD | Cancellation/capacity recovery |
| DemoScenarioBar | 🔄 TO BUILD | Mandatory |
| Visual system | 🔄 TO BUILD | Premium atelier |
| Public deployment | ⏳ PENDING | Lovable |
| Demo video | ⏳ PENDING | <3 min |
| Process video | ⏳ PENDING | Bonus |
| Social post | ⏳ PENDING | @Lovable + #lovablechallenge |
| Final writeup | ⏳ PENDING | Submission |
| Final QA | ⏳ PENDING | Full scenario matrix |

---

# 63. CURRENT RESUME TASK

When an agent starts from this file:

### Immediate priorities

1. Inspect current source tree before changing anything.
2. Preserve any existing code.
3. Initialize Git / checkpoint if absent.
4. Implement the domain model + commitment engine first.
5. Wire the four mandatory demo scenarios.
6. Build customer and owner paths around the engine.
7. Only then apply visual polish.

### Never start with

- random visual effects,
- landing page decoration,
- generic calendar components,
- AI chat UI,
- unnecessary integrations.

---

# 64. SNAPSHOT

Name: **PROMISE**  
Business: **Mekanika Horology Atelier**  
Location: **Lucknow, Uttar Pradesh, India**  
Category: **Watch repair / horology atelier**  
Competition: **Lovable Challenge**  
Core problem: **The owner cannot safely promise a repair completion date from an initial vague inquiry because actual scope, parts and bench capacity may be unknown.**  
Core product: **Uncertainty-aware booking + commitment engine**  
Core differentiator: **Determines the strongest safe commitment instead of blindly booking a slot.**  
Primary user: **Customer + solo watchmaker**  
Primary interface: **Customer assessment flow + owner workshop cockpit**  
Stack: **React / TypeScript / Vite / Tailwind CSS**  
Models/APIs: **None required for core demo**  
Deployment target: **Public Lovable project**  
Submission video: **<3 minutes**  

---

# 65. FINAL “NORTH STAR” TEST

Before declaring PROMISE finished, ask:

> **Could a judge understand that the product is valuable even if I removed the word “AI” from the entire app?**

The answer must be:

**Yes.**

Because the real product is the operational reasoning.

And ask:

> **Could the owner safely run this workflow without manually calculating every appointment?**

The answer must be:

**Yes.**

And finally:

> **Does the final experience prove that PROMISE knows the difference between “we can book this” and “we can honestly promise this”?**

The answer must be:

**Yes.**

If any answer is no, the product is not ready.

---

# 66. CHANGELOG

### v1 — 2026-09-30
Original PROMISE concept:
- bridal studio,
- outcome-first feasibility,
- backward scheduling,
- multiple people / artists / wedding deadline.

### v2 — 2026-09-30
Re-scoped after competitive review:
- moved away from bridal backward scheduling because that territory is already represented in the challenge field,
- locked watchmaker / repair atelier,
- introduced uncertainty-aware commitment as the central product mechanism,
- introduced Confirmed / Conditional / Not Feasible states,
- introduced inspection → diagnosis → repair promise lifecycle,
- introduced dependency-aware completion,
- introduced capacity recovery,
- updated architecture and demo story.

**Agent:** ChatGPT / Codex planning handoff

---

# 67. STOP CONDITION

An agent must not stop with a message like:

> “The app looks good.”

A valid stop/update must say what actually works.

Minimum stop report should include:

```text
STATUS:
CURRENT TASK:
COMPLETED:
PARTIALLY COMPLETE:
BLOCKERS:
KNOWN BUGS:
NEXT 3 STEPS:
DEMO SCENARIOS TESTED:
LAST UPDATED:
AGENT:
```

Then update this handoff.

