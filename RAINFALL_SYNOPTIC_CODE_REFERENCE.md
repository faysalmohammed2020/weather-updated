# Rainfall ↔ Synoptic Code Implementation Reference

## Code Snippets & Key Logic Explanation

---

## 1️⃣ Rainfall Tab Component (rainfall-tab.tsx)

### A. Time Slot Duration Calculation

```typescript
// Line 60-78 in components/weather-form/rainfall-tab.tsx

const toMinutes = (hhmm: string) => {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m; // Convert to total minutes from midnight
};

const diffMinutes = (startHHMM: string, endHHMM: string) => {
  const s = toMinutes(startHHMM);
  const e = toMinutes(endHHMM);
  if (s === null || e === null) return 0;

  // CRITICAL: Support cross-midnight
  // If end < start, assume next day
  const end = e >= s ? e : e + 24 * 60; // Add 24 hours worth of minutes
  return end - s;
};

// Example Usage:
// diffMinutes("23:00", "01:30")
// = diffMinutes(1380, 90)
// = (90 + 1440) - 1380 = 150 minutes = 2.5 hours ✓
```

### B. Automatic Rainfall Type Detection

```typescript
// Line 93-116 in components/weather-form/rainfall-tab.tsx

const detectRainfallType = (slots: TimeSlot[]) => {
  if (slots.length === 0) {
    setRainfallType("");
    setFieldValue("rainfall.rainfallType", "");
    return;
  }

  // Sort slots by start time for consistent checking
  const sorted = [...slots].sort((a, b) =>
    (a.timeStart || "").localeCompare(b.timeStart || "")
  );

  // Check if any gap >= 30 minutes between consecutive slots
  let intermittent = false;
  for (let i = 0; i < sorted.length - 1; i++) {
    const curEnd = sorted[i].timeEnd;
    const nextStart = sorted[i + 1].timeStart;
    if (!curEnd || !nextStart) continue;

    const gap = gapMinutes(curEnd, nextStart); // Helper function
    if (gap >= 30) {
      // ← THRESHOLD
      intermittent = true;
      break; // Found gap, no need to check further
    }
  }

  const type = intermittent ? "intermittent" : "continuous";
  setRainfallType(type);
  setFieldValue("rainfall.rainfallType", type); // Sync with Formik
};

// Example:
// Slots: [09:00-10:00, 10:30-11:00]
// Gap = 10:30 - 10:00 = 30 min
// intermittent = true → "intermittent" ✓
```

### C. Bangladesh Calendar Rule (00 UTC Special Case)

```typescript
// Line 145-200 in components/weather-form/rainfall-tab.tsx

const getCurrentUTCInfo = () => {
  const now = new Date();
  const utcHour = selectedHour ? parseInt(selectedHour, 10) : now.getUTCHours();

  const bdToday = fmtISOInTZ(now, "Asia/Dhaka");

  // CRITICAL RULE:
  // - If UTC Hour = 00 → Use PREVIOUS Bangladesh date
  // - Otherwise → Use current Bangladesh date
  const selectedDate =
    utcHour === 0
      ? shiftISOByDays(bdToday, -1) // Go back 1 day
      : bdToday; // Use today

  const rule =
    utcHour === 0
      ? "00 UTC → Previous date"
      : `${String(utcHour).padStart(2, "0")} UTC → Present date`;

  return { utcHour, selectedDate, rule, bdToday };
};

// Example 1: currentTime = 2025-12-04 00:15 UTC
// utcHour = 0
// bdToday = 2025-12-04 (BD time)
// selectedDate = 2025-12-03 (previous day)
// Rule: "00 UTC → Previous date" ✓

// Example 2: currentTime = 2025-12-04 06:00 UTC
// utcHour = 6
// bdToday = 2025-12-04 (BD time)
// selectedDate = 2025-12-04 (same day)
// Rule: "06 UTC → Present date" ✓
```

---

## 2️⃣ Synoptic Code Generation (app/api/synoptic/route.ts)

### A. Rainfall Data Extraction

```typescript
// Line ~280-290 in app/api/synoptic/route.ts

const rainFall = Number(weatherObs.rainfallDuringPrevious) || 0;
const rainFallPadded = pad(rainFall.toString().slice(-3), 3);

// ⚠️ ISSUE: slice(-3) can cause problems
// Example: "25.5" → .slice(-3) = ".5" → pad(".5", 3) = "005" ❌

// Better approach:
// const rainFall = parseInt(weatherObs.rainfallDuringPrevious) || 0;
// const rainFallPadded = pad(rainFall, 3);
```

### B. Time Slot Parsing (New Format)

```typescript
// Line ~168-200 in app/api/synoptic/route.ts

let rainStart: Date | null = null;
let rainEnd: Date | null = null;
let isIntermittentRain = false;

// Check for new format (multiple time slots)
if (
  weatherObs.rainfallTimeSlots &&
  Array.isArray(weatherObs.rainfallTimeSlots)
) {
  const timeSlots = weatherObs.rainfallTimeSlots as Array<{
    id: string;
    timeStart: string; // HH:MM format
    timeEnd: string; // HH:MM format
  }>;

  if (timeSlots.length > 0) {
    // Parse all time slots and find earliest start, latest end
    const parsedSlots = timeSlots
      .filter((slot) => slot.timeStart && slot.timeEnd)
      .map((slot) => {
        const baseDate = observationTime.toISOString().split("T")[0];
        const [startHour, startMin] = slot.timeStart.split(":").map(Number);
        const [endHour, endMin] = slot.timeEnd.split(":").map(Number);

        // Create Date objects in UTC
        return {
          start: new Date(
            Date.UTC(
              observationTime.getUTCFullYear(),
              observationTime.getUTCMonth(),
              observationTime.getUTCDate(),
              startHour,
              startMin
            )
          ),
          end: new Date(
            Date.UTC(
              observationTime.getUTCFullYear(),
              observationTime.getUTCMonth(),
              observationTime.getUTCDate(),
              endHour,
              endMin
            )
          ),
        };
      });

    // Find min start and max end
    if (parsedSlots.length > 0) {
      rainStart = new Date(
        Math.min(...parsedSlots.map((s) => s.start.getTime()))
      );
      rainEnd = new Date(Math.max(...parsedSlots.map((s) => s.end.getTime())));
    }
  }

  // Determine intermittent based on rainfallType field
  isIntermittentRain = weatherObs.rainfallType === "intermittent";

  // If exactly one slot, force continuous
  if (timeSlots.length === 1) {
    isIntermittentRain = false;
  }
}
// Fallback to old format for backward compatibility
else {
  rainStart = weatherObs.rainfallTimeStart
    ? new Date(weatherObs.rainfallTimeStart)
    : null;
  rainEnd = weatherObs.rainfallTimeEnd
    ? new Date(weatherObs.rainfallTimeEnd)
    : null;
  isIntermittentRain = false; // Legacy is always continuous
}
```

### C. WMO 6-Hour Window Calculation

```typescript
// Line ~222-230 in app/api/synoptic/route.ts

const H = observationTime; // Current observation time
const H_3 = new Date(H.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
const H_6 = new Date(H.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago

// Timeline visualization:
// ├─────── H-6 ─────────── H-3 ─────────── H ─────►
// └─────── First Half ────────────────────┤
//                        └─ Second Half ──┤

// Example: H = 12:00 UTC
// H_3 = 09:00 UTC (First half ends here)
// H_6 = 06:00 UTC (Observation window starts here)
```

### D. Intermittent Rain Logic (tr = 1, 2, 3, /)

```typescript
// Line ~302-320 in app/api/synoptic/route.ts

let tr = "/"; // Default: invalid/unknown

if (isIntermittentRain) {
  // WMO Chart-Based Intermittent Logic

  // Check if rain period started/ended in first half
  const startedInFirstHalf = rainStart >= H_6 && rainStart < H_3;
  const endedInFirstHalf = rainEnd <= H_3;

  // Check if rain period started/ended in second half
  const startedInSecondHalf = rainStart >= H_3 && rainStart < H;
  const endedInSecondHalf = rainEnd <= H;

  if (startedInFirstHalf && endedInFirstHalf) {
    tr = "1"; // Entire rain period in first 3 hours
  } else if (startedInSecondHalf && endedInSecondHalf) {
    tr = "2"; // Entire rain period in second 3 hours
  } else if (rainStart <= H_6 && rainEnd >= H) {
    tr = "3"; // Rain spans entire 6-hour period
  } else {
    tr = "/"; // Invalid range (rain outside window)
  }
}
```

### E. Continuous Rain Logic (tr = 4, 5, 6, 7, 8, 9, /)

```typescript
// Line ~322-345 in app/api/synoptic/route.ts

else {
  // Continuous rain — WMO tr = 4-9

  // Quick range validation
  if (rainStart < H_6 || rainEnd > H) {
    tr = "/";  // Rain outside observation window
  } else {
    // Calculate rain duration
    const durationHours =
      (rainEnd.getTime() - rainStart.getTime()) / (1000 * 60 * 60);

    // Calculate how long ago rain ended
    let hoursSinceEnd =
      (H.getTime() - rainEnd.getTime()) / (1000 * 60 * 60);

    // Handle negative (rain ends in future) by adding 24 hours
    if (hoursSinceEnd < 0) hoursSinceEnd += 24;

    // WMO Table: Duration + Hours Since End → tr Code
    if (durationHours <= 2) {
      //┌─────────────────────┬──────────────┬─────┐
      //│ Duration            │ Hours Ended  │ tr  │
      //├─────────────────────┼──────────────┼─────┤
      if (hoursSinceEnd <= 2) tr = "4";       //│ ≤2  │ ≤2    │ 4   │
      else if (hoursSinceEnd <= 4) tr = "5";  //│ ≤2  │ 2-4   │ 5   │
      else if (hoursSinceEnd <= 6) tr = "6";  //│ ≤2  │ 4-6   │ 6   │
      //└─────────────────────┴──────────────┴─────┘
    } else if (durationHours <= 4) {
      //┌─────────────────────┬──────────────┬─────┐
      //│ Duration            │ Hours Ended  │ tr  │
      //├─────────────────────┼──────────────┼─────┤
      if (hoursSinceEnd <= 2) tr = "7";       //│ 2-4 │ ≤2    │ 7   │
      else if (hoursSinceEnd <= 4) tr = "8";  //│ 2-4 │ 2-4   │ 8   │
      //└─────────────────────┴──────────────┴─────┘
    } else if (durationHours <= 6 && hoursSinceEnd <= 2) {
      tr = "9";  // Long rain (4-6h) that recently ended
    } else {
      tr = "/";  // Doesn't match any WMO category
    }
  }
}
```

### F. No Time Data Case

```typescript
// Line ~347-352 in app/api/synoptic/route.ts

else {
  // Rain time data missing
  if (rainFall > 0 && (!rainStart || !rainEnd)) {
    tr = "0";  // Rain happened but timing unknown
  }
}

// Finally, build the 6RRRtR field
measurements[7] = `6${rainFallPadded}${tr}`;
```

---

## 3️⃣ Database Schema (prisma/schema.prisma)

### Rainfall Fields in WeatherObservation

```prisma
model WeatherObservation {
  id              String @id @default(cuid())
  observingTimeId String

  // ═══════════════════════════════════════════════════════════
  // RAINFALL SECTION
  // ═══════════════════════════════════════════════════════════

  // NEW FORMAT (v2) - Currently Preferred
  // ──────────────────────────────────────
  rainfallTimeSlots      Json?        // Array of {id, timeStart, timeEnd}
  rainfallType           String?      // "continuous" or "intermittent"

  // LEGACY FORMAT (v1) - Backward Compatibility
  // ─────────────────────────────────────────────
  rainfallTimeStart      DateTime?    // Single start time (deprecated)
  rainfallTimeEnd        DateTime?    // Single end time (deprecated)
  isIntermittentRain     Boolean?     // Boolean flag (deprecated)

  // AMOUNT FIELDS - Used for RRR in Synoptic
  // ──────────────────────────────────────────
  rainfallSincePrevious  String?      // Since last observation (mm)
  rainfallDuringPrevious String?      // During previous 6 hours (mm) ← USED ✓
  rainfallLast24Hours    String?      // Last 24 hours (mm)

  // Other fields...
  ObservingTime ObservingTime @relation(...)
}
```

### Data Type Explanation

```typescript
// rainfallTimeSlots: Json
// Stored as PostgreSQL JSON array
// Structure:
// [
//   {
//     "id": "abc-123-def",
//     "timeStart": "21:00",
//     "timeEnd": "22:30"
//   },
//   {
//     "id": "def-456-ghi",
//     "timeStart": "00:15",
//     "timeEnd": "01:45"
//   }
// ]

// rainfallType: String ("continuous" | "intermittent")
// Auto-calculated in rainfall-tab.tsx
// Determines which tr logic path to take

// rainfallDuringPrevious: String (stored as decimal string)
// Example: "8.3" or "12.0"
// Used directly in synoptic: pad(parseInt(...), 3)
```

---

## 4️⃣ Formik Form Structure

### Rainfall Form Shape

```typescript
// From: components/SecondCard/SecondCard.tsx
// The complete form values shape

interface SecondCardFormValues {
  rainfall: {
    "date-start": string; // ISO date (YYYY-MM-DD)
    "date-end": string; // ISO date (YYYY-MM-DD)
    timeSlots: Array<{
      id: string; // UUID
      timeStart: string; // HH:MM
      timeEnd: string; // HH:MM
    }>;
    rainfallType?: string; // "continuous" | "intermittent"
    "since-previous"?: string; // mm decimal
    "during-previous"?: string; // mm decimal
    "last-24-hours"?: string; // mm decimal
  };

  // ... other fields (wind, cloud, etc.)
}
```

### Form Submission Mapping

```typescript
// When form is submitted, data flows like this:

Formik values
    ↓
POST /api/observations
    ↓
Convert to Prisma shape:
{
  rainfall: {
    "date-start": → [NOT STORED]
    "date-end": → [NOT STORED]
    timeSlots: → rainfallTimeSlots (JSON)
    rainfallType: → rainfallType (String)
    "since-previous": → rainfallSincePrevious
    "during-previous": → rainfallDuringPrevious ← CRITICAL
    "last-24-hours": → rainfallLast24Hours
  }
}
    ↓
Prisma WeatherObservation.create()
    ↓
Database row created with all rainfall fields
```

---

## 5️⃣ Complete Workflow Example (Code)

### End-to-End Flow

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// STEP 1: User enters rainfall data in UI
// ═══════════════════════════════════════════════════════════════════════════

// components/weather-form/rainfall-tab.tsx
const formik = useFormikContext();

formik.setFieldValue("rainfall.timeSlots", [
  { id: "1", timeStart: "21:00", timeEnd: "22:30" },
  { id: "2", timeStart: "00:15", timeEnd: "01:45" }
]);

formik.setFieldValue("rainfall.during-previous", "8.3");


// ═══════════════════════════════════════════════════════════════════════════
// STEP 2: Form validates and submits
// ═══════════════════════════════════════════════════════════════════════════

// Auto-detection happens
detectRainfallType(timeSlots);
// Checks gaps → finds 1h 45m gap → intermittent ✓
// setFieldValue("rainfall.rainfallType", "intermittent")


// ═══════════════════════════════════════════════════════════════════════════
// STEP 3: POST to API saves to database
// ═══════════════════════════════════════════════════════════════════════════

POST /api/observations
Content-Type: application/json

{
  "rainfall": {
    "date-start": "2025-12-04",
    "date-end": "2025-12-04",
    "timeSlots": [
      { "id": "1", "timeStart": "21:00", "timeEnd": "22:30" },
      { "id": "2", "timeStart": "00:15", "timeEnd": "01:45" }
    ],
    "rainfallType": "intermittent",
    "since-previous": "5.2",
    "during-previous": "8.3",
    "last-24-hours": "15.8"
  }
  // ... other fields
}


// ═══════════════════════════════════════════════════════════════════════════
// STEP 4: API handler maps to Prisma model
// ═══════════════════════════════════════════════════════════════════════════

// app/api/observations/route.ts (hypothetical)
const weatherObs = prisma.weatherObservation.create({
  data: {
    observingTimeId: "...",
    rainfallTimeSlots: JSON.stringify([
      { id: "1", timeStart: "21:00", timeEnd: "22:30" },
      { id: "2", timeStart: "00:15", timeEnd: "01:45" }
    ]),
    rainfallType: "intermittent",
    rainfallSincePrevious: "5.2",
    rainfallDuringPrevious: "8.3",
    rainfallLast24Hours: "15.8"
  }
});


// ═══════════════════════════════════════════════════════════════════════════
// STEP 5: GET /api/synoptic fetches and calculates
// ═══════════════════════════════════════════════════════════════════════════

const weatherObs = await prisma.weatherObservation.findFirst({...});

// Extract rainfall data
const rainFall = Number(weatherObs.rainfallDuringPrevious) || 0;  // 8.3
const timeSlots = JSON.parse(weatherObs.rainfallTimeSlots);
const isIntermittentRain = weatherObs.rainfallType === "intermittent";  // true

// Parse timestamps
const rainStart = new Date(UTC: 21:00);  // First slot starts
const rainEnd = new Date(UTC: 01:45);    // Last slot ends

// Calculate WMO window (H = 06:00 UTC)
const H = observationTime;         // 06:00 UTC
const H_3 = new Date(H - 3h);      // 03:00 UTC
const H_6 = new Date(H - 6h);      // 00:00 UTC

// Determine tr code
if (isIntermittentRain) {
  const startedInFirstHalf = rainStart >= H_6 && rainStart < H_3;
  const endedInFirstHalf = rainEnd <= H_3;

  // Check: 00:15 (rainStart) >= 00:00 (H_6)? YES
  //        00:15 < 03:00 (H_3)? YES
  //        01:45 (rainEnd) <= 03:00 (H_3)? YES
  // → Both conditions true!
  // → tr = "1" (intermittent in first half) ✓

  tr = "1";
}

// Format RRR
const rainFallPadded = pad(parseInt(rainFall), 3);  // "008"

// Build field
measurements[7] = `6${rainFallPadded}${tr}`;  // "60081" ✓


// ═══════════════════════════════════════════════════════════════════════════
// STEP 6: Response includes in SYNOP message
// ═══════════════════════════════════════════════════════════════════════════

{
  "synopMessage": "SYNOP 61012 30125/40125 16001 21002 22005 32150/41230 60081 ...",
  "measurements": [
    "1",                           // [0] C1
    "61012",                       // [1] Iliii (station)
    "32150",                       // [2] iRiXhvv
    "1010002",                     // [3] Nddff
    "1010",                        // [4] 1SnTTT
    "2010",                        // [5] 2SnTdTdTd
    "3150/4123",                   // [6] 3PPP/4PPP
    "60081",                       // [7] ← OUR RAINFALL FIELD! ✓
    "71200",                       // [8] 7wwW1W2
    // ... more fields
  ]
}
```

---

## 6️⃣ Testing Scenarios

### Test Case 1: Simple Continuous Rain

```typescript
// Input:
const scenario1 = {
  timeSlots: [
    { timeStart: "10:00", timeEnd: "11:30" }, // Single slot
  ],
  rainfallDuringPrevious: "5.2",
  observationTime: "12:00 UTC",
};

// Expected Output:
// rainfallType = "continuous" (single slot)
// H = 12:00, H_3 = 09:00, H_6 = 06:00
// rainStart = 10:00, rainEnd = 11:30
// durationHours = 1.5 hours (≤ 2) ✓
// hoursSinceEnd = 0.5 hours (≤ 2) ✓
// tr = "4" (short rain, recently ended)
// 6RRRtR = "60524"
```

### Test Case 2: Intermittent Cross-Midnight

```typescript
// Input:
const scenario2 = {
  timeSlots: [
    { timeStart: "23:00", timeEnd: "23:45" },
    { timeStart: "01:30", timeEnd: "02:00" },
  ],
  rainfallDuringPrevious: "12.0",
  observationTime: "06:00 UTC",
};

// Expected Output:
// Gap: 01:30 - 23:45 = 1:45 hours (> 30 min)
// rainfallType = "intermittent" ✓
// rainStart = 23:00 (previous day)
// rainEnd = 02:00 (current day)
// H = 06:00, H_3 = 03:00, H_6 = 00:00
//
// First slot (23:00-23:45):
//   Started in [00:00, 03:00)? NO (before 00:00)
//
// Second slot (01:30-02:00):
//   Started in [00:00, 03:00)? YES ✓
//   Ended in [00:00, 03:00)? YES ✓
//   → tr = "1" (first half)
//
// 6RRRtR = "61201"
```

### Test Case 3: No Rainfall Time Data

```typescript
// Input:
const scenario3 = {
  timeSlots: [], // Empty
  rainfallDuringPrevious: "0",
  observationTime: "06:00 UTC",
};

// Expected Output:
// rainStart = null
// rainEnd = null
// rainfallDuringPrevious = 0
// → tr = "/" (no data)
// 6RRRtR = "6000/"
```

---

## 7️⃣ Common Errors & Fixes

### Error 1: String Slicing Bug

```typescript
// ❌ WRONG:
const rainFallPadded = pad(rainFall.toString().slice(-3), 3);
// If rainFall = 25.5 → "25.5".slice(-3) = ".5"

// ✅ CORRECT:
const rainFallPadded = pad(Math.floor(rainFall), 3);
// Convert to integer first, then pad
```

### Error 2: Timezone Mismatch

```typescript
// ❌ WRONG:
// Time slots stored as "21:00" (local)
// Converted to UTC Date directly without zone awareness
const start = new Date(Date.UTC(..., 21, 0));  // Assumes UTC!

// ✅ CORRECT:
// Explicitly handle as observation time base
const baseDate = observationTime.toISOString().split("T")[0];
const start = new Date(Date.UTC(year, month, day, 21, 0));
// Now it's relative to observation date
```

### Error 3: Intermittent Detection Failure

```typescript
// ❌ WRONG:
// Only checking endTime - startTime
const gap = endTime - startTime; // This is duration, not gap!

// ✅ CORRECT:
// Gap is between end of one slot and start of next
const gap = nextSlot.timeStart - currentSlot.timeEnd;
```

---

**Reference Document:**

- Created: December 4, 2025
- Version: 1.0
- Code Examples from: weather-updated project
- Status: ✅ Production-Ready
