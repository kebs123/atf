# Architecture and data flow

This document is the map of **who talks to whom** and **what data moves**. It does not implement anything.

---

## 1. System in one picture

```mermaid
flowchart TB
  subgraph clients [People]
    Phone["Feature phone"]
    Browser["Smartphone / laptop"]
  end

  subgraph edge [Edges]
    SMS["SMS gateway<br/>e.g. Africa's Talking"]
    Next["Next.js frontend<br/>verify page, manufacturer, admin"]
  end

  subgraph core [Kebs server]
    Express["Express.js API<br/>auth, codes, verify, recall, SMS reply"]
    SQLite[("SQLite<br/>companies, products, batches,<br/>units, custody, verifications")]
  end

  Phone -->|"SMS: KEBS 7K4P2M9Q"| SMS
  SMS -->|"HTTP webhook"| Express
  Express -->|"send SMS reply"| SMS
  SMS -->|"SMS result"| Phone

  Browser -->|"HTTPS"| Next
  Next -->|"JSON over HTTPS"| Express
  Express -->|"JSON"| Next

  Express -->|"SQL"| SQLite
```

**Rule:** Next.js never talks to SQLite. Only Express reads and writes the database. Next.js is a client of the API. The SMS gateway is also a client of the API.

---

## 2. What each piece is responsible for

```mermaid
flowchart LR
  Next["Next.js"]
  Express["Express.js"]
  SQLite[("SQLite")]
  SMS["SMS gateway"]

  Next -->|"screens, forms, JSON client"| Express
  SMS -->|"inbound webhook + outbound send"| Express
  Express -->|"only writer / reader"| SQLite
```

### Next.js (frontend)

- Screens for people with a browser.
- Public: enter a code, see result, optional “report fake”.
- Logged-in: manufacturer and admin work (products, batches, code export, stats, recalls).
- Sends JSON to Express. Shows API errors in plain language.
- Does **not** send SMS. Does **not** store product codes as the source of truth.

### Express.js (backend)

- The only brain: create codes, verify codes, recall batches, authenticate staff users.
- Two entry doors:
  1. **REST JSON** for Next.js.
  2. **SMS webhook** for the gateway (incoming text → lookup → outbound SMS).
- Same verification **rules** for SMS and web, so answers never disagree.

### SQLite (database)

- Source of truth for companies, products, batches, unit codes, custody, and every verification attempt.
- One file for v1. WAL mode when implemented, so SMS and web can write together without locking the app to death.

### SMS gateway (external)

- Receives the consumer’s text from the mobile network.
- POSTs a payload to Express (`from` phone, `text`, `to` short code).
- Sends Express’s reply string back to that phone.
- Kebs does not run a telco. Without this gateway, SMS does not work.

---

## 3. Trust boundary

```mermaid
flowchart LR
  subgraph untrusted [Untrusted]
    Phone["Any phone"]
    Browser["Any browser"]
    Public["Public verify page"]
  end

  subgraph semitrust [Semi-trusted]
    Gateway["SMS gateway<br/>signed webhook"]
    NextSrv["Next.js server"]
  end

  subgraph trusted [Trusted]
    Express["Express + SQLite<br/>server you control"]
    Admin["Admin after login"]
  end

  Phone --> Gateway
  Browser --> NextSrv
  Public --> NextSrv
  Gateway -->|"signature checked"| Express
  NextSrv -->|"session / JWT"| Express
  Admin --> Express
```

- A verification **code** is a secret printed on a pack. Anyone holding the pack can use it. That is intended.
- A **manufacturer login** is a secret. Only that company may generate codes and recall its own batches.
- Incoming SMS webhooks must be **checked** (gateway signature or shared secret) so strangers cannot fake “SMS checks” and poison the log.
- Consumer phone numbers are **operational data** (needed to reply and to detect repeat checks). Store them hashed or masked in logs where possible; do not put them on public pages.

---

## 4. The unit of truth: one code = one physical pack

```mermaid
flowchart LR
  Product["Product<br/>SKU"] --> Batch["Batch<br/>one production run"]
  Batch --> Unit["Unit<br/>one pack, one code"]
  Unit --> Verification["Verification<br/>one check attempt"]
  Unit --> Custody["Custody event<br/>optional handoff"]
```

| Idea | Meaning |
| --- | --- |
| **Product** | The SKU (e.g. “Paracetamol 500mg 10 tablets”). |
| **Batch** | One production run of that SKU (dates, expiry, quantity). |
| **Unit** | One pack. Has exactly one **verification_code**. |
| **Verification** | One attempt to check a code (SMS or web). Append-only history. |
| **Custody event** | Optional: pack moved from factory to distributor to shop. |

A fake pack either has **no code**, a **copied code**, or a **guessed code**. The data flow is designed so:

- Unknown code → “Not in Kebs”.
- Copied code → first check looks genuine; later checks warn.
- Recalled batch → every check says recalled, even the first.

---

## 5. End-to-end flows

### Flow A — Manufacturer issues codes

```mermaid
sequenceDiagram
  actor M as Manufacturer
  participant Next as Next.js
  participant API as Express
  participant DB as SQLite
  participant Print as Printer / pack line

  M->>Next: Login, create product, create batch
  Next->>API: POST /products, POST /batches
  API->>DB: INSERT products, batches
  M->>Next: Generate N codes
  Next->>API: POST /batches/:id/codes
  API->>DB: INSERT N units status unused
  API-->>Next: batch id, count, download link
  Next-->>M: CSV / PDF of codes
  M->>Print: Print code + SMS KEBS code to 20880
  Note over Print: Packs leave the factory
```

**Data written:** `users` (already exists), `products`, `batches`, `units` (status = `unused`).  
**Data not written yet:** verifications, custody (unless they log a shipment).

---

### Flow B — Optional custody (factory → shop)

```mermaid
sequenceDiagram
  actor Party as Manufacturer or distributor
  participant Next as Next.js
  participant API as Express
  participant DB as SQLite

  Party->>Next: Ship these codes / Confirm receipt
  Next->>API: POST /custody
  API->>DB: INSERT custody_events
  API->>DB: UPDATE units current_holder
  API-->>Next: ok
```

This is **Should**, not required for the first SMS pilot. Verification still works if custody is empty. Custody answers: “where was this pack supposed to be?”

```mermaid
flowchart LR
  Factory["Factory"] --> Dist["Distributor"]
  Dist --> Shop["Retailer / kiosk"]
  Shop --> Buyer["Consumer verifies"]
```

---

### Flow C — Consumer verifies by SMS (core hook)

```mermaid
sequenceDiagram
  actor C as Consumer phone
  participant Net as Mobile network
  participant GW as SMS gateway
  participant API as Express
  participant DB as SQLite

  C->>Net: SMS to 20880 text KEBS 7K4P2M9Q
  Net->>GW: deliver inbound SMS
  GW->>API: POST /webhooks/sms from, text, message_id

  API->>API: Parse code strip KEBS, spaces, case
  API->>DB: SELECT unit JOIN batch, product, company
  API->>DB: INSERT verifications always
  alt first genuine check
    API->>DB: UPDATE unit status, first_verified_at, verify_count
  else already verified / recalled / unknown
    API->>DB: UPDATE verify_count if unit exists
  end
  API->>API: Build SMS under 160 chars
  API->>GW: send SMS to same from-number
  GW->>Net: outbound SMS
  Net->>C: Genuine / Warning / Recalled / Not found
```

**Data written:** always `verifications`. Sometimes `units` (status/counters).  
**Data read:** `units`, `batches`, `products`, `companies`.

**If the gateway cannot send the reply:** the check is still stored. Support can resend. The pack’s first-check flag must only flip when the lookup succeeded and the rules say so — not when SMS delivery fails. (Implementation detail for later; the rule belongs here: **lookup and state change are not the same as SMS delivery**.)

---

### Flow D — Consumer verifies on the web

```mermaid
sequenceDiagram
  actor C as Consumer browser
  participant Next as Next.js /verify
  participant API as Express
  participant DB as SQLite

  C->>Next: Type code or open QR /verify?code=...
  Next->>API: POST /verify code, channel web
  Note over API: Same verifyCode function as SMS
  API->>DB: lookup + insert verification + maybe update unit
  API-->>Next: JSON result, product, batch, expiry, message
  Next-->>C: Same meaning as SMS, more room to explain
```

**Invariant:** SMS and web must call one shared function: `verifyCode(code, channel, actor)`. Different doors, one brain.

```mermaid
flowchart LR
  SMSDoor["POST /webhooks/sms"] --> Brain["verifyCode"]
  WebDoor["POST /verify"] --> Brain
  Brain --> DB[("SQLite")]
  Brain --> Result["genuine / already_verified / recalled / expired / unknown / flagged"]
```

---

### Flow E — Duplicate / likely copy

```mermaid
flowchart TD
  A["New check on a unit that already has first_verified_at"] --> B["result = already_verified"]
  B --> C["INSERT verifications"]
  C --> D["increment verify_count"]
  D --> E{"verify_count past threshold e.g. 5?"}
  E -->|no| F["Reply WARNING: first checked on date"]
  E -->|yes| G["Flag unit for admin / manufacturer"]
  G --> F
```

No extra product is created. The **history of checks** is what exposes the copy.

---

### Flow F — Recall

```mermaid
sequenceDiagram
  actor M as Manufacturer or admin
  participant Next as Next.js
  participant API as Express
  participant DB as SQLite
  actor C as Later consumer

  M->>Next: Recall batch B12
  Next->>API: POST /batches/:id/recall
  API->>DB: batches.status = recalled
  API->>DB: units in batch status = recalled
  C->>API: verify that code SMS or web
  API->>DB: lookup
  API-->>C: result recalled beats genuine
```

---

### Flow G — Unknown code (likely fake or mis-typed)

```mermaid
flowchart TD
  A["Lookup misses"] --> B["result = unknown"]
  B --> C["INSERT verifications unit_id null"]
  C --> D["Reply: code not in system. Check digits. If print is clear, do not buy."]
```

Unknown attempts are gold for admin: clusters of guesses or cloned “pretty” codes.

---

## 6. Request map (who calls what)

```mermaid
flowchart TB
  Next["Next.js"]
  GW["SMS gateway"]
  API["Express"]
  DB[("SQLite")]

  Next -->|"POST /auth/login"| API
  Next -->|"POST /products"| API
  Next -->|"POST /batches"| API
  Next -->|"POST /batches/:id/codes"| API
  Next -->|"GET /batches/:id/codes.csv"| API
  Next -->|"POST /verify"| API
  Next -->|"POST /reports"| API
  Next -->|"POST /batches/:id/recall"| API
  Next -->|"GET /stats/..."| API
  GW -->|"POST /webhooks/sms"| API
  API -->|"send SMS"| GW
  API -->|"SQL"| DB
```

| From | To | When | Payload (idea) |
| --- | --- | --- | --- |
| Next.js | `POST /auth/login` | Staff login | email, password |
| Next.js | `POST /products` | New SKU | name, category, … |
| Next.js | `POST /batches` | New run | product_id, quantity, dates |
| Next.js | `POST /batches/:id/codes` | Generate units | count (or use batch quantity) |
| Next.js | `GET /batches/:id/codes.csv` | Print shop | auth required |
| Next.js | `POST /verify` | Public check | code, channel=web |
| Next.js | `POST /reports` | Consumer report | code, note |
| Next.js | `POST /batches/:id/recall` | Recall | reason |
| Next.js | `GET /stats/...` | Dashboard | auth, company scope |
| Gateway | `POST /webhooks/sms` | Inbound SMS | from, text, id, signature |
| Express | Gateway send API | Outbound SMS | to, message |
| Express | SQLite | Every command above | SQL |

Full route list lives in [BACKEND.md](./BACKEND.md). Screen list lives in [FRONTEND.md](./FRONTEND.md). Tables live in [DATABASE.md](./DATABASE.md).

---

## 7. Sequence: SMS verify (happy path)

```mermaid
sequenceDiagram
  participant Consumer
  participant Gateway
  participant Express
  participant SQLite

  Consumer->>Gateway: SMS
  Gateway->>Express: POST /webhooks/sms
  Express->>SQLite: SELECT unit
  SQLite-->>Express: row
  Express->>SQLite: INSERT verification
  Express->>SQLite: UPDATE unit
  Express-->>Gateway: 200 + send instruction
  Gateway->>Consumer: SMS result
```

Express should respond to the webhook quickly. Sending the SMS can be in-process for v1 (pilot volume is low). If volume grows, a queue can sit between “decision” and “send”.

---

## 8. Data lifecycle of one unit

```mermaid
stateDiagram-v2
  [*] --> unused: codes generated
  unused --> unused: optional custody updates
  unused --> verified: first successful verify
  unused --> recalled: batch recall
  unused --> flagged: admin / fraud hold
  verified --> verified: more verifies reply warning
  verified --> recalled: batch recall
  verified --> flagged: too many checks or admin
  flagged --> recalled: batch recall
  recalled --> [*]
```

States are listed in [DATABASE.md](./DATABASE.md). Express owns transitions. Next.js only displays them.

---

## 9. What SQLite is good for — and the limit

**Good for now**

- One pilot country, one short code, thousands to low millions of units.
- Simple backup: copy the file.
- Matches “small manufacturers, small IT”.

**Not the long-term ceiling**

- Many concurrent SMS writes across regions will want **Postgres** (or similar).
- The **schema ideas** stay. The engine can change. Do not design tables that only SQLite can express.

---

## 10. Languages and message length

SMS replies must be **short**. Store templates in the backend (later: table). Default English for v1. Design every reply so a Swahili (or other) template can replace it without changing verify logic.

QR (optional): encodes a URL `https://kebs.example/verify?code=...` **and** the pack still shows the SMS instructions. QR without SMS text would exclude feature phones — that violates the product.

---

## 11. What we explicitly do not flow (v1)

- No payment data.
- No blockchain write.
- No consumer accounts for SMS users.
- No live GPS from feature phones (network location is optional and coarse if the gateway provides it).
- Next.js does not generate codes itself; Express does, so codes are never “invented” only in the browser.
