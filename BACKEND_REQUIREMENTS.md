# Aries V10 — Backend API Requirements

> Comprehensive backend specification covering every API, data model, field, and interaction required to power the Aries frontend application.

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Data Models & Database Schema](#2-data-models--database-schema)
3. [API Endpoints](#3-api-endpoints)
4. [KPI & Dashboard Aggregations](#4-kpi--dashboard-aggregations)
5. [Import & AI Generation](#5-import--ai-generation)
6. [ServiceNow Integration](#6-servicenow-integration)
7. [Real-Time & WebSocket Events](#7-real-time--websocket-events)
8. [Environment & Configuration](#8-environment--configuration)

---

## 1. Authentication & Authorization

### 1.1 Login (Email + Password)

**`POST /api/auth/login`**

| Field      | Type   | Required | Validation                         |
|------------|--------|----------|------------------------------------|
| `email`    | string | Yes      | Valid email format                 |
| `password` | string | Yes      | Min 8 chars                        |

**Response `200`**
```json
{
  "token": "jwt-string",
  "refreshToken": "refresh-jwt-string",
  "user": {
    "id": "uuid",
    "email": "user@aztra.ai",
    "name": "Varun Singh",
    "role": "admin | editor | viewer",
    "avatar": "url-or-null",
    "org": {
      "id": "uuid",
      "name": "AZTRA Inc"
    }
  }
}
```

**Response `401`**
```json
{ "error": "Invalid email or password" }
```

**Notes:**
- The frontend shows an error message string — backend must return a human-readable `error` field.
- Frontend has a 600ms loading spinner delay — backend should respond within that window.
- JWT token should be stored in `localStorage` under key `aries_auth`. Token should contain `userId`, `orgId`, `role`, `exp`.

---

### 1.2 SSO (OAuth 2.0)

**`GET /api/auth/sso/google`** — Redirects to Google OAuth consent screen
**`GET /api/auth/sso/microsoft`** — Redirects to Microsoft OAuth consent screen
**`GET /api/auth/sso/callback`** — OAuth callback handler

**Callback Response:** Same as `POST /api/auth/login` response.

**Provider Config Required:**
| Provider  | Fields Needed                               |
|-----------|---------------------------------------------|
| Google    | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`  |
| Microsoft | `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID` |

---

### 1.3 Session Management

**`POST /api/auth/refresh`** — Refresh expired JWT using refresh token
**`POST /api/auth/logout`** — Invalidate current session/token
**`GET /api/auth/me`** — Return current user (used on page load to validate token)

---

## 2. Data Models & Database Schema

### 2.1 Endpoint

Represents an API endpoint being tested.

| Field        | Type     | Required | Description                                    | Example                    |
|--------------|----------|----------|------------------------------------------------|----------------------------|
| `id`         | UUID     | Auto     | Primary key                                    | `"r0"`                     |
| `method`     | ENUM     | Yes      | HTTP method                                    | `"GET"`                    |
| `path`       | string   | Yes      | API path                                       | `"/api/v1/patients/{id}"`  |
| `time`       | string   | Yes      | Average response time                          | `"12ms"`, `"1.2s"`        |
| `fieldCount` | integer  | Yes      | Number of fields in schema                     | `23`                       |
| `orgId`      | UUID     | Yes      | Organization this belongs to                   | FK → Organization          |
| `createdAt`  | datetime | Auto     | Creation timestamp                             |                            |
| `updatedAt`  | datetime | Auto     | Last update timestamp                          |                            |

**Allowed `method` values:** `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD`, `OPTIONS`

**`time` format:** Integer milliseconds stored in DB; formatted as `"Xms"` or `"X.Xs"` on response. Examples:
- `12` → `"12ms"`
- `1200` → `"1.2s"`

---

### 2.2 Schema Field

Represents a field within an endpoint's request/response schema.

| Field       | Type    | Required | Description                    | Example       |
|-------------|---------|----------|--------------------------------|---------------|
| `id`        | UUID    | Auto     | Primary key                    |               |
| `endpointId`| UUID    | Yes      | FK → Endpoint                  |               |
| `name`      | string  | Yes      | Field name                     | `"id"`        |
| `type`      | ENUM    | Yes      | Data type                      | `"string"`    |
| `required`  | boolean | Yes      | Whether field is required      | `true`        |
| `order`     | integer | Yes      | Display order in schema        | `0`           |

**Allowed `type` values:** `string`, `integer`, `boolean`, `number`, `array`, `object`, `uuid`, `date-time`, `email`, `enum`

**UI Display Notes:**
- **Tree View** shows each field with a folder icon, field name, type pill (colored by type), required indicator (`"*"`), and a default value placeholder.
- **Raw View** generates a JSON schema object with example values per type:
  - `string` → `"example_value"`
  - `integer` → `0`
  - `number` → `0.0`
  - `boolean` → `true`
  - `array` → `[]`
  - `object` → `{}`
  - `uuid` → `"550e8400-e29b-41d4-a716-446655440000"`
  - `date-time` → `"2025-01-15T09:30:00Z"`
  - `email` → `"user@example.com"`
  - `enum` → `"active"`

**Type → Color Mapping (for frontend display):**
| Type       | Color                    |
|------------|--------------------------|
| `string`   | Green (`#059669`)        |
| `integer`  | Blue (`#2563EB`)         |
| `number`   | Blue (`#2563EB`)         |
| `boolean`  | Purple (`#7C3AED`)       |
| `array`    | Amber (`#B45309`)        |
| `object`   | Dark (`#0F172A`)         |
| Others     | Grey (`#64748B`)         |

---

### 2.3 Probe (Test)

Represents an AI-generated or manually created test probe.

| Field         | Type     | Required | Description                              | Example / Constraints               |
|---------------|----------|----------|------------------------------------------|--------------------------------------|
| `id`          | UUID     | Auto     | Primary key                              |                                      |
| `endpointId`  | UUID     | Yes      | FK → Endpoint (`ep` in frontend)         |                                      |
| `name`        | string   | Yes      | Human-readable probe name                | `"Validates CRUD operations for patients"` |
| `desc`        | text     | Yes      | AI-generated description                 | Paragraph explaining what the probe tests |
| `pos`         | integer  | Yes      | Count of positive assertions             | Range: `0–10`, default: `1`         |
| `neg`         | integer  | Yes      | Count of negative assertions             | Range: `0–10`, default: `0`         |
| `review`      | ENUM     | Yes      | Review status                            | `"pending"` (default)               |
| `aiConf`      | integer  | Yes      | AI confidence percentage                 | Range: `0–100`                       |
| `aiGenerated` | boolean  | Yes      | Whether AI-generated                     | Default: `true`                      |
| `orgId`       | UUID     | Yes      | Organization                             |                                      |
| `createdBy`   | UUID     | Opt      | User who created/approved                |                                      |
| `reviewedBy`  | UUID     | Opt      | User who approved/rejected               |                                      |
| `reviewedAt`  | datetime | Opt      | When review action was taken             |                                      |
| `createdAt`   | datetime | Auto     | Creation timestamp                       |                                      |
| `updatedAt`   | datetime | Auto     | Last update timestamp                    |                                      |

**Allowed `review` values:** `"pending"`, `"approved"`, `"rejected"`

**Confidence Badge Color Rules (frontend display):**
| Range   | Color                  |
|---------|------------------------|
| ≥ 90    | Green (`#059669`)      |
| ≥ 75    | Amber (`#B45309`)      |
| < 75    | Red (`#DC2626`)        |

**Probe Row Visual States:**
| Status     | Left Border Color | Opacity | Text Style          |
|------------|-------------------|---------|---------------------|
| `pending`  | Amber `#D97706`   | 1.0     | Normal              |
| `approved` | Green `#059669`   | 1.0     | Normal              |
| `rejected` | Transparent       | 0.4     | Strikethrough + grey|

---

### 2.4 Suite

Represents a test suite grouping probes together.

| Field       | Type     | Required | Description                              | Example / Constraints                    |
|-------------|----------|----------|------------------------------------------|------------------------------------------|
| `id`        | UUID     | Auto     | Primary key                              |                                          |
| `name`      | string   | Yes      | Suite name                               | `"patient-smoke"`, `"order-regression-1"`|
| `tests`     | UUID[]   | Yes      | Array of Probe IDs in this suite         | `["t0","t1","t5"]`                       |
| `freq`      | ENUM     | Yes      | Run frequency                            | `"Daily"` (default)                      |
| `schedule`  | string   | Yes      | UTC time for scheduled run               | `"09:30 UTC"`, `"14:45 UTC"`            |
| `lastRun`   | string   | Yes      | Relative time since last run             | `"12h ago"`, `"48h ago"`, `"Never"`     |
| `nextRun`   | string   | Yes      | Next scheduled run status                | `"Scheduled"`                            |
| `enabled`   | boolean  | Yes      | Whether suite is active                  | Default: `true`                          |
| `orgId`     | UUID     | Yes      | Organization                             |                                          |
| `createdAt` | datetime | Auto     | Creation timestamp                       |                                          |
| `updatedAt` | datetime | Auto     | Last update timestamp                    |                                          |

**Allowed `freq` values:** `"Hourly"`, `"Daily"`, `"Weekly"`, `"Bi-Weekly"`, `"On Deploy"`

**Frequency → Color Mapping (frontend display):**
| Frequency   | Color                  |
|-------------|------------------------|
| `Hourly`    | Red (`#DC2626`)        |
| `Daily`     | Blue (`#2563EB`)       |
| `Weekly`    | Purple (`#7C3AED`)     |
| `Bi-Weekly` | Amber (`#B45309`)      |
| `On Deploy` | Grey (`#334155`)       |

---

### 2.5 Run

Represents a single execution of a suite.

| Field      | Type     | Required | Description                   | Example                    |
|------------|----------|----------|-------------------------------|----------------------------|
| `id`       | UUID     | Auto     | Primary key                   |                            |
| `suiteId`  | UUID     | Yes      | FK → Suite                    |                            |
| `status`   | ENUM     | Yes      | Run result                    | `"pass"` or `"fail"`      |
| `duration` | string   | Yes      | Run duration                  | `"5m 23s"`                 |
| `startedAt`| datetime | Yes      | When run began                |                            |
| `finishedAt`| datetime| Yes      | When run completed            |                            |
| `createdAt`| datetime | Auto     | Record creation               |                            |

**Allowed `status` values:** `"pass"`, `"fail"`

**Duration format:** `"{minutes}m {seconds}s"` — e.g., `"5m 23s"`, `"0m 45s"`

**Frontend uses runs to compute:**
- Pass rate: `passed / total * 100` (rounded to integer %)
- Average duration: Sum of all durations / count
- Fail streak: Count of consecutive failures from most recent run
- Runs are ordered most-recent-first

---

### 2.6 Incident (ServiceNow Link)

| Field      | Type   | Required | Description                          | Example               |
|------------|--------|----------|--------------------------------------|------------------------|
| `id`       | UUID   | Auto     | Primary key                          |                        |
| `suiteId`  | UUID   | Yes      | FK → Suite                           |                        |
| `key`      | string | Yes      | ServiceNow incident number           | `"INC12345"`           |
| `status`   | ENUM   | Yes      | Incident status                      | `"Investigating"`      |
| `url`      | string | Opt      | Deep link to ServiceNow              |                        |
| `createdAt`| datetime| Auto    | When link was created                |                        |

**Allowed `status` values:** `"Investigating"`, `"Monitoring"`, `"Resolved"`, `"Closed"`

**Frontend Display:**
- If incident exists on a suite → show ServiceNow icon + `INC` key in red (clickable, opens ServiceNow)
- If no incident → show ServiceNow icon (clickable, opens ServiceNow to create new incident with suite name pre-filled)
- ServiceNow URL pattern: `https://aztra.service-now.com/nav_to.do?uri=incident.do?sysparm_query=number={key}`
- New incident URL: `https://aztra.service-now.com/nav_to.do?uri=incident.do?sys_id=-1&sysparm_query=short_description={suite_name}`

---

## 3. API Endpoints

### 3.1 Endpoints (API Under Test)

#### List All Endpoints
**`GET /api/endpoints`**

Query params:
| Param    | Type   | Default | Description                                     |
|----------|--------|---------|-------------------------------------------------|
| `search` | string | `""`    | Filter by path or method (case-insensitive)     |
| `page`   | int    | `1`     | Pagination page                                 |
| `limit`  | int    | `100`   | Items per page                                  |

**Response `200`**
```json
{
  "data": [
    {
      "id": "r0",
      "method": "GET",
      "path": "/api/v1/patients",
      "time": "12ms",
      "fieldCount": 23,
      "schema": [
        { "name": "id", "type": "uuid", "required": true },
        { "name": "status", "type": "string", "required": true },
        { "name": "name", "type": "string", "required": false }
      ],
      "probeCount": 3,
      "pendingCount": 1
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 100
}
```

**Frontend uses `probeCount`** to show the small count next to each endpoint in the sidebar.
**Frontend uses `pendingCount`** to show the amber dot indicator next to endpoints with pending probes.

---

#### Get Single Endpoint
**`GET /api/endpoints/:id`**

**Response `200`** — Same as single item from list, with full `schema` array.

---

#### Create Endpoint (from import)
**`POST /api/endpoints`**

```json
{
  "method": "POST",
  "path": "/api/v1/orders",
  "time": "120ms",
  "schema": [
    { "name": "id", "type": "uuid", "required": true },
    { "name": "amount", "type": "number", "required": true }
  ]
}
```

---

### 3.2 Probes

#### List Probes for an Endpoint
**`GET /api/endpoints/:endpointId/probes`**

**Response `200`**
```json
{
  "data": [
    {
      "id": "t0",
      "endpointId": "r0",
      "name": "Validates CRUD operations for patients",
      "desc": "Tests basic create, read, update, and delete operations...",
      "pos": 3,
      "neg": 1,
      "review": "pending",
      "aiConf": 87,
      "aiGenerated": true,
      "createdAt": "2026-01-15T09:30:00Z"
    }
  ],
  "total": 3
}
```

---

#### List All Probes (for suite builder, KPI calculations)
**`GET /api/probes`**

Query params:
| Param     | Type   | Default | Description                           |
|-----------|--------|---------|---------------------------------------|
| `review`  | ENUM   | all     | Filter: `pending`, `approved`, `rejected` |
| `ep`      | UUID   | all     | Filter by endpoint ID                 |

---

#### Update Probe Review Status
**`PATCH /api/probes/:id/review`**

This is the **most frequent mutation** in the app. Used when clicking:
- ✓ (check icon) → approve
- ✕ (X icon) → reject
- "Undo" → reset to pending

```json
{ "review": "approved" }
```

**Allowed values:** `"approved"`, `"rejected"`, `"pending"`

**Response `200`**
```json
{
  "id": "t0",
  "review": "approved",
  "reviewedBy": "user-uuid",
  "reviewedAt": "2026-03-02T21:00:00Z"
}
```

---

#### Bulk Approve All Probes for Endpoint
**`POST /api/endpoints/:endpointId/probes/approve-all`**

Sets `review: "approved"` on all probes for the given endpoint that currently have `review: "pending"`.

**Response `200`**
```json
{
  "updated": 5,
  "probeIds": ["t0", "t1", "t2", "t3", "t4"]
}
```

---

#### Update Probe Assertions (Pos/Neg Stepper)
**`PATCH /api/probes/:id`**

Used when clicking +/- buttons on pos/neg steppers in expanded probe detail.

```json
{
  "pos": 4,
  "neg": 2
}
```

**Validation:**
- `pos`: integer, min `0`, no hard max (frontend min is `0`)
- `neg`: integer, min `0`, no hard max (frontend min is `0`)

---

#### Generate Probes (AI)
**`POST /api/endpoints/:endpointId/probes/generate`**

Triggers AI to analyze the endpoint schema and generate new probes.

**Request (optional body):**
```json
{
  "selectedProbeIds": ["t0", "t2"],
  "action": "generate_description"
}
```

**If `selectedProbeIds` provided** → regenerate descriptions for those specific probes (sparkle icon action).
**If no body** → generate new probes for the endpoint (Generate button action).

**Response `200`**
```json
{
  "probes": [
    {
      "id": "t-new-1",
      "name": "Validates input sanitization for patients",
      "desc": "Ensures all user-supplied inputs are properly sanitized...",
      "pos": 2,
      "neg": 1,
      "review": "pending",
      "aiConf": 82,
      "aiGenerated": true
    }
  ]
}
```

---

### 3.3 Suites

#### List All Suites
**`GET /api/suites`**

Query params:
| Param    | Type   | Default | Description                              |
|----------|--------|---------|------------------------------------------|
| `search` | string | `""`    | Filter by name (case-insensitive)        |
| `freq`   | ENUM   | all     | Filter by frequency                      |
| `sort`   | string | `name`  | Sort: `name`, `freq`, `pass`, `schedule` |
| `enabled`| boolean| all     | Filter by enabled state                  |

**Response `200`**
```json
{
  "data": [
    {
      "id": "s0",
      "name": "patient-smoke",
      "tests": ["t0", "t1", "t5"],
      "runs": [
        { "s": "pass", "d": "5m 23s" },
        { "s": "fail", "d": "6m 10s" },
        { "s": "pass", "d": "4m 55s" }
      ],
      "freq": "Daily",
      "schedule": "09:30 UTC",
      "lastRun": "12h ago",
      "nextRun": "Scheduled",
      "enabled": true,
      "incident": null
    }
  ],
  "total": 100
}
```

**The `runs` array** must be ordered most-recent-first. The frontend uses:
- `runs[0].s` to determine if suite is currently failing (for status dot color, 24h timeline)
- All runs to calculate pass rate, average duration, fail streak
- Run count typically ranges from 3–18 per suite

**The `lastRun` field** should be computed server-side as relative time: `"12h ago"`, `"2d ago"`, `"Never"`.

---

#### Get Suites Related to an Endpoint
**`GET /api/endpoints/:endpointId/suites`**

Returns suites that contain at least one probe belonging to the given endpoint.

**Response** — Same structure as list above, filtered.

---

#### Create Suite
**`POST /api/suites`**

```json
{
  "name": "patient-smoke",
  "tests": ["t0", "t1", "t5"],
  "freq": "Daily"
}
```

**Validation:**
- `name`: required, non-empty string, trimmed
- `tests`: required, non-empty array of valid probe UUIDs
- `freq`: required, one of allowed values

**Response `201`**
```json
{
  "id": "s-new-1",
  "name": "patient-smoke",
  "tests": ["t0", "t1", "t5"],
  "runs": [],
  "freq": "Daily",
  "schedule": "00:00 UTC",
  "lastRun": "Never",
  "nextRun": "Scheduled",
  "enabled": true,
  "incident": null
}
```

---

#### Update Suite
**`PUT /api/suites/:id`**

Used when clicking "Save" in the inline edit panel on a suite card.

```json
{
  "name": "patient-smoke-v2",
  "freq": "Hourly",
  "tests": ["t0", "t1", "t5", "t8"]
}
```

**Frontend edit panel** allows editing:
- Suite name (text input)
- Frequency (Hourly / Daily / Weekly segmented control)
- Test selection (checkboxes, max 25 shown, excludes rejected probes)

---

#### Toggle Suite Enabled/Disabled
**`PATCH /api/suites/:id/toggle`**

```json
{ "enabled": false }
```

Used in Pipelines view — each row has a toggle switch.

**Frontend display:**
- Disabled suites render at `opacity: 0.45`
- Status dot turns grey (`#CBD5E1`) when disabled

---

#### Run Suite Manually
**`POST /api/suites/:id/run`**

Triggers an immediate suite execution.

**Response `202` (Accepted)**
```json
{
  "runId": "run-uuid",
  "status": "queued",
  "estimatedDuration": "5m 30s"
}
```

**Frontend has two "Run" triggers:**
1. "Run Now" button in expanded suite card (Suites sub-tab)
2. "Run" button in each pipeline row (Pipelines view)

---

### 3.4 Runs (Suite Execution History)

#### List Runs for a Suite
**`GET /api/suites/:suiteId/runs`**

Query params:
| Param  | Type | Default | Description           |
|--------|------|---------|-----------------------|
| `limit`| int  | `20`    | Number of recent runs |

**Response `200`**
```json
{
  "data": [
    {
      "id": "run-1",
      "suiteId": "s0",
      "status": "pass",
      "duration": "5m 23s",
      "startedAt": "2026-03-02T09:30:00Z",
      "finishedAt": "2026-03-02T09:35:23Z"
    }
  ]
}
```

---

### 3.5 Specs (Generated Test Code)

#### Get Generated Test Specs for Probes
**`GET /api/endpoints/:endpointId/specs`**

Generates Jest/Supertest code for each probe attached to the endpoint.

**Response `200`**
```json
{
  "probes": [
    {
      "id": "t0",
      "name": "Validates CRUD operations for patients",
      "review": "approved",
      "aiGenerated": true,
      "pos": 3,
      "neg": 1,
      "code": "describe(\"Validates CRUD operations for patients\", () => {\n  it(\"should handle valid GET /api/v1/patients\", async () => {\n    const response = await request.get(\"/api/v1/patients\")\n      .set(\"Authorization\", \"Bearer ${token}\");\n\n    expect(response.status).toBe(200);\n    expect(response.body).toHaveProperty(\"data\");\n    expect(response.headers[\"content-type\"]).toContain(\"application/json\");\n  });\n\n  it(\"should reject invalid input\", async () => {\n    const errorResponse = await request.get(\"/api/v1/patients\")\n      .send({ invalid: true });\n\n    expect(errorResponse.status).toBe(404);\n  });\n});"
    }
  ]
}
```

**Code generation rules:**

Positive assertions (based on `pos` count):
| Count | Assertion                                                          |
|-------|--------------------------------------------------------------------|
| ≥ 1   | `expect(response.status).toBe(200)` (or `400` if rejected)        |
| ≥ 1   | `expect(response.body).toHaveProperty("data")` (or `"id"` if path has `{id}`) |
| ≥ 2   | `expect(response.headers["content-type"]).toContain("application/json")` |
| ≥ 3   | `expect(response.body.data).toBeDefined()`                        |
| ≥ 4   | `expect(response.latency).toBeLessThan({endpoint_time_ms})`       |

Negative assertions (based on `neg` count):
| Count | Assertion                                                          |
|-------|--------------------------------------------------------------------|
| ≥ 1   | `expect(errorResponse.status).toBe(404)` (GET) or `toBe(422)` (other methods) |
| ≥ 2   | `expect(errorResponse.body).toHaveProperty("error")`              |
| ≥ 3   | `expect(unauthorizedResponse.status).toBe(401)`                   |

---

## 4. KPI & Dashboard Aggregations

### 4.1 KPI Strip Data
**`GET /api/dashboard/kpis`**

The KPI Health Strip shows 8 metrics. Backend should compute these server-side.

**Response `200`**
```json
{
  "passRate": {
    "value": 82,
    "unit": "%",
    "color": "green"
  },
  "endpoints": {
    "value": 100,
    "unit": null,
    "color": "dark"
  },
  "suites": {
    "value": 100,
    "unit": null,
    "color": "dark"
  },
  "probes": {
    "value": 400,
    "unit": null,
    "color": "red"
  },
  "coverage": {
    "value": 65,
    "unit": "%",
    "color": "purple"
  },
  "pending": {
    "value": 12,
    "unit": null,
    "color": "amber"
  },
  "incidents": {
    "value": 3,
    "unit": null,
    "color": "red"
  },
  "failing": {
    "value": 5,
    "unit": null,
    "color": "red"
  }
}
```

**Computation rules:**

| Metric       | Formula                                                              | Color Logic                          |
|--------------|----------------------------------------------------------------------|--------------------------------------|
| **Pass Rate**| `(passed_runs / total_runs) * 100`                                   | Always green                         |
| **Endpoints**| Count of all endpoints                                               | Always dark (`#0F172A`)              |
| **Suites**   | Count of all suites                                                  | Always dark (`#0F172A`)              |
| **Probes**   | Count of all probes                                                  | Always red (`#DC2626`)               |
| **Coverage** | `(approved_probes / total_probes) * 100`                             | Always purple (`#7C3AED`)            |
| **Pending**  | Count of probes where `review == "pending"`                          | Amber if > 0, Green if 0            |
| **Incidents**| Count of suites with non-null `incident`                             | Red if > 0, Green if 0              |
| **Failing**  | Count of suites where `runs[0].status == "fail"`                     | Red if > 0, Green if 0              |

---

### 4.2 Suite Metrics (Computed per Suite)

These are computed on the frontend per suite, but can be cached server-side for performance:

**`GET /api/suites/:id/metrics`** (optional — can be embedded in suite response)

```json
{
  "passRate": 85,
  "avgDuration": "5m 12s",
  "avgConfidence": 87,
  "testCount": 8,
  "failStreak": 0
}
```

**Computation details:**

| Metric           | Formula                                                        |
|------------------|----------------------------------------------------------------|
| `passRate`       | `(runs where status=pass) / total_runs * 100`, rounded int    |
| `avgDuration`    | Sum all run durations in seconds / count, format as `"Xm Ys"` |
| `avgConfidence`  | Average of all `aiConf` for probes in suite, rounded int       |
| `testCount`      | Count of probe IDs in `tests` array                            |
| `failStreak`     | Count of consecutive `"fail"` runs from most recent            |

**Duration parsing:** `"5m 23s"` → `323 seconds`. Formula: `minutes * 60 + seconds`

**Fail streak example:**
- Runs: `[fail, fail, pass, fail, pass]` → `failStreak = 2`
- Runs: `[pass, fail, fail]` → `failStreak = 0`

---

### 4.3 24h Timeline Data (Pipelines View)
**`GET /api/dashboard/timeline`**

Returns suite health data grouped by hour for the 24h timeline bar chart.

**Response `200`**
```json
{
  "hours": [
    {
      "hour": 0,
      "suiteCount": 3,
      "failCount": 0,
      "health": "green"
    },
    {
      "hour": 1,
      "suiteCount": 0,
      "failCount": 0,
      "health": "grey"
    },
    {
      "hour": 9,
      "suiteCount": 8,
      "failCount": 2,
      "health": "amber"
    }
  ]
}
```

**Bar height calculation:** `max(2, round((suiteCount / 8) * 32))` pixels

**Health color logic:**
| Condition                       | Color    | Hex       |
|---------------------------------|----------|-----------|
| `suiteCount == 0`               | Grey     | `#F1F5F9` |
| `failCount == 0`                | Green    | `#059669` |
| `failCount < suiteCount / 2`    | Amber    | `#B45309` |
| `failCount >= suiteCount / 2`   | Red      | `#DC2626` |

**Suite-to-hour mapping:** A suite maps to an hour based on `parseInt(suite.schedule)` (extracts the hour from `"09:30 UTC"` → `9`). Only `enabled` suites are counted.

---

### 4.4 Pipelines Summary
**`GET /api/dashboard/pipelines-summary`**

```json
{
  "enabledCount": 85,
  "totalCount": 100,
  "frequencyCounts": {
    "Hourly": 20,
    "Daily": 35,
    "Weekly": 15,
    "Bi-Weekly": 10,
    "On Deploy": 20
  }
}
```

Used in Pipelines header: `"85 / 100 active"` and frequency filter pill counts.

---

## 5. Import & AI Generation

### 5.1 Import from Swagger/OpenAPI
**`POST /api/import/swagger`**

```json
{
  "url": "https://api.example.com/swagger.json"
}
```

**Response `200`**
```json
{
  "imported": 25,
  "endpoints": [
    { "id": "r-new-1", "method": "GET", "path": "/api/v1/users", "fieldCount": 12 }
  ],
  "generatedProbes": 75
}
```

The backend should:
1. Fetch the OpenAPI/Swagger spec from the URL
2. Parse all paths + methods into Endpoint records
3. Extract request/response schemas into Schema Field records
4. Auto-generate probes per endpoint using AI
5. Return summary of what was created

---

### 5.2 Import from File Upload
**`POST /api/import/file`** (multipart/form-data)

| Field  | Type | Accepted Formats                     |
|--------|------|--------------------------------------|
| `file` | File | `.yaml`, `.json`, `.har`, `.postman` |

**Processing per format:**
- `.yaml` / `.json` → Parse as OpenAPI spec
- `.har` → Extract HTTP requests from HAR archive
- `.postman` → Parse Postman Collection v2.1

---

### 5.3 Import from Pasted Content
**`POST /api/import/paste`**

```json
{
  "content": "openapi: 3.0.0\ninfo:\n  title: API\n..."
}
```

Accepts raw YAML or JSON content pasted by the user.

---

### 5.4 Import from Jira/Confluence
**`POST /api/import/jira`**

```json
{
  "reference": "PROJ-123"
}
```

**OR**
```json
{
  "reference": "https://aztra.atlassian.net/wiki/spaces/..."
}
```

Backend should:
1. Connect to Jira/Confluence via API
2. Extract requirements/acceptance criteria
3. Parse into endpoints and generate probes

---

### 5.5 Generate AI Description for Probes
**`POST /api/probes/generate-description`**

Used when clicking the sparkle (✨) icon on a probe row.

```json
{
  "probeIds": ["t0", "t2"]
}
```

**Response `200`**
```json
{
  "updated": [
    {
      "id": "t0",
      "desc": "Updated AI-generated description for this probe..."
    }
  ]
}
```

---

## 6. ServiceNow Integration

### 6.1 Configuration
**`GET /api/integrations/servicenow/config`**

```json
{
  "instanceUrl": "https://aztra.service-now.com",
  "enabled": true
}
```

### 6.2 Link Incident to Suite
**`POST /api/suites/:suiteId/incident`**

```json
{
  "key": "INC12345",
  "status": "Investigating"
}
```

### 6.3 Create Incident in ServiceNow
**`POST /api/integrations/servicenow/incidents`**

```json
{
  "shortDescription": "patient-smoke suite failing",
  "suiteId": "s0",
  "severity": "3"
}
```

**Response `201`**
```json
{
  "key": "INC67890",
  "url": "https://aztra.service-now.com/nav_to.do?uri=incident.do?sysparm_query=number=INC67890",
  "status": "New"
}
```

### 6.4 Frontend URL Patterns

**View existing incident:**
```
https://aztra.service-now.com/nav_to.do?uri=incident.do?sysparm_query=number={incident.key}
```

**Create new incident (pre-filled):**
```
https://aztra.service-now.com/nav_to.do?uri=incident.do?sys_id=-1&sysparm_query=short_description={encodeURIComponent(suite.name)}
```

---

## 7. Real-Time & WebSocket Events

### 7.1 Recommended WebSocket Events

For live dashboard updates, implement WebSocket or SSE for:

| Event                  | Payload                                      | Trigger                    |
|------------------------|----------------------------------------------|----------------------------|
| `suite:run:started`    | `{ suiteId, runId }`                         | Suite run begins           |
| `suite:run:completed`  | `{ suiteId, runId, status, duration }`       | Suite run finishes         |
| `probe:reviewed`       | `{ probeId, review, reviewedBy }`            | Probe approved/rejected    |
| `kpi:updated`          | Full KPI payload                             | Any data change            |
| `import:completed`     | `{ endpointsCreated, probesGenerated }`       | Import job finishes        |
| `incident:created`     | `{ suiteId, incidentKey }`                   | ServiceNow incident linked |

---

## 8. Environment & Configuration

### 8.1 Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/aries

# Authentication
JWT_SECRET=<256-bit-secret>
JWT_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=30d

# OAuth / SSO
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_TENANT_ID=

# AWS (current deployment)
AWS_REGION=us-east-1
S3_BUCKET=aries23
CLOUDFRONT_DISTRIBUTION_ID=E3C62LA0QBUJ2T

# ServiceNow
SERVICENOW_INSTANCE=https://aztra.service-now.com
SERVICENOW_API_USER=
SERVICENOW_API_PASSWORD=

# Jira/Confluence (for import)
JIRA_BASE_URL=https://aztra.atlassian.net
JIRA_API_TOKEN=
JIRA_EMAIL=

# AI (for probe generation)
AI_PROVIDER=anthropic
AI_API_KEY=
AI_MODEL=claude-sonnet-4-20250514

# Application
APP_URL=https://aries.aztra.ai
NODE_ENV=production
PORT=3000
```

### 8.2 Suggested Tech Stack

| Layer         | Technology              | Reason                                    |
|---------------|-------------------------|-------------------------------------------|
| Runtime       | Node.js 20 LTS         | Same ecosystem as Next.js frontend        |
| Framework     | Express.js or Fastify   | Lightweight, well-documented              |
| Database      | PostgreSQL 16           | Relational data with complex queries      |
| ORM           | Prisma or Drizzle       | Type-safe queries, migrations             |
| Cache         | Redis                   | KPI caching, session store, rate limiting |
| Queue         | Bull/BullMQ (Redis)     | Suite run jobs, import jobs               |
| Auth          | Passport.js + JWT       | OAuth strategies built-in                 |
| AI            | Anthropic Claude API    | Probe generation, description generation  |
| File Storage  | AWS S3                  | Import file uploads                       |
| Deployment    | AWS EC2 or ECS          | Existing AWS infrastructure               |

### 8.3 Database Schema (Prisma Example)

```prisma
model Organization {
  id        String     @id @default(uuid())
  name      String
  users     User[]
  endpoints Endpoint[]
  probes    Probe[]
  suites    Suite[]
  createdAt DateTime   @default(now())
}

model User {
  id        String       @id @default(uuid())
  email     String       @unique
  password  String?
  name      String
  role      Role         @default(EDITOR)
  orgId     String
  org       Organization @relation(fields: [orgId], references: [id])
  createdAt DateTime     @default(now())
}

enum Role {
  ADMIN
  EDITOR
  VIEWER
}

model Endpoint {
  id         String        @id @default(uuid())
  method     HttpMethod
  path       String
  timeMs     Int
  orgId      String
  org        Organization  @relation(fields: [orgId], references: [id])
  fields     SchemaField[]
  probes     Probe[]
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
}

enum HttpMethod {
  GET
  POST
  PUT
  DELETE
  PATCH
  HEAD
  OPTIONS
}

model SchemaField {
  id         String   @id @default(uuid())
  endpointId String
  endpoint   Endpoint @relation(fields: [endpointId], references: [id], onDelete: Cascade)
  name       String
  type       String
  required   Boolean  @default(false)
  order      Int      @default(0)
}

model Probe {
  id          String       @id @default(uuid())
  endpointId  String
  endpoint    Endpoint     @relation(fields: [endpointId], references: [id], onDelete: Cascade)
  name        String
  desc        String       @db.Text
  pos         Int          @default(1)
  neg         Int          @default(0)
  review      ReviewStatus @default(PENDING)
  aiConf      Int          @default(80)
  aiGenerated Boolean      @default(true)
  orgId       String
  org         Organization @relation(fields: [orgId], references: [id])
  reviewedBy  String?
  reviewedAt  DateTime?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  suites      SuiteProbe[]
}

enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
}

model Suite {
  id        String       @id @default(uuid())
  name      String
  freq      Frequency    @default(DAILY)
  schedule  String       @default("00:00 UTC")
  enabled   Boolean      @default(true)
  orgId     String
  org       Organization @relation(fields: [orgId], references: [id])
  probes    SuiteProbe[]
  runs      Run[]
  incident  Incident?
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
}

model SuiteProbe {
  suiteId String
  probeId String
  suite   Suite  @relation(fields: [suiteId], references: [id], onDelete: Cascade)
  probe   Probe  @relation(fields: [probeId], references: [id], onDelete: Cascade)

  @@id([suiteId, probeId])
}

enum Frequency {
  HOURLY
  DAILY
  WEEKLY
  BI_WEEKLY
  ON_DEPLOY
}

model Run {
  id         String   @id @default(uuid())
  suiteId    String
  suite      Suite    @relation(fields: [suiteId], references: [id], onDelete: Cascade)
  status     RunStatus
  durationMs Int
  startedAt  DateTime
  finishedAt DateTime
  createdAt  DateTime @default(now())
}

enum RunStatus {
  PASS
  FAIL
}

model Incident {
  id        String   @id @default(uuid())
  suiteId   String   @unique
  suite     Suite    @relation(fields: [suiteId], references: [id], onDelete: Cascade)
  key       String
  status    String   @default("Investigating")
  url       String?
  createdAt DateTime @default(now())
}
```

---

## Appendix A: Frontend-to-API Mapping

| User Action                           | API Call                                          | HTTP Method |
|---------------------------------------|---------------------------------------------------|-------------|
| Page load                             | `GET /api/auth/me`                                | GET         |
| Login                                 | `POST /api/auth/login`                            | POST        |
| SSO Login                             | `GET /api/auth/sso/{provider}`                    | GET         |
| Sign out                              | `POST /api/auth/logout`                           | POST        |
| Load endpoint list                    | `GET /api/endpoints`                              | GET         |
| Search endpoints                      | `GET /api/endpoints?search={query}`               | GET         |
| Select endpoint → load probes         | `GET /api/endpoints/{id}/probes`                  | GET         |
| Select endpoint → load schema         | `GET /api/endpoints/{id}` (schema in response)    | GET         |
| Select endpoint → load related suites | `GET /api/endpoints/{id}/suites`                  | GET         |
| Click ✓ approve probe                 | `PATCH /api/probes/{id}/review`                   | PATCH       |
| Click ✕ reject probe                  | `PATCH /api/probes/{id}/review`                   | PATCH       |
| Click "Undo" on probe                 | `PATCH /api/probes/{id}/review`                   | PATCH       |
| Adjust pos/neg stepper                | `PATCH /api/probes/{id}`                          | PATCH       |
| Click "Generate" button               | `POST /api/endpoints/{id}/probes/generate`        | POST        |
| Click sparkle icon (generate desc)    | `POST /api/probes/generate-description`           | POST        |
| View Specs tab                        | `GET /api/endpoints/{id}/specs`                   | GET         |
| Load KPI strip                        | `GET /api/dashboard/kpis`                         | GET         |
| Load Pipelines view                   | `GET /api/suites?sort={sort}&freq={freq}`         | GET         |
| Toggle suite enabled                  | `PATCH /api/suites/{id}/toggle`                   | PATCH       |
| Click "Run" / "Run Now"               | `POST /api/suites/{id}/run`                       | POST        |
| Create new suite                      | `POST /api/suites`                                | POST        |
| Edit suite (save)                     | `PUT /api/suites/{id}`                            | PUT         |
| Load 24h timeline                     | `GET /api/dashboard/timeline`                     | GET         |
| Import Swagger URL                    | `POST /api/import/swagger`                        | POST        |
| Import file                           | `POST /api/import/file`                           | POST        |
| Import pasted content                 | `POST /api/import/paste`                          | POST        |
| Import Jira reference                 | `POST /api/import/jira`                           | POST        |
| Click ServiceNow incident link        | Opens external URL (no API call)                  | —           |
| Click ServiceNow create incident      | Opens external URL (no API call)                  | —           |

---

## Appendix B: Error Response Format

All error responses should follow this consistent format:

```json
{
  "error": "Human-readable error message",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "name",
    "message": "Name is required"
  }
}
```

**Standard HTTP Status Codes:**
| Code | Usage                              |
|------|------------------------------------|
| 200  | Success (GET, PATCH, PUT)          |
| 201  | Created (POST)                     |
| 202  | Accepted (async jobs like Run)     |
| 400  | Validation error                   |
| 401  | Unauthorized (invalid/expired JWT) |
| 403  | Forbidden (insufficient role)      |
| 404  | Resource not found                 |
| 409  | Conflict (duplicate name, etc.)    |
| 422  | Unprocessable (invalid import)     |
| 500  | Internal server error              |
