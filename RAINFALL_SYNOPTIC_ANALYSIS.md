# ☔ Second Card Rainfall & Synoptic Code সম্পর্ক - গভীর বিশ্লেষণ

---

## 📋 সারসংক্ষেপ (Executive Summary)

রেইনফল সেকশন এবং Synoptic Code এর মধ্যে সরাসরি ডেটা-প্রবাহ সম্পর্ক আছে।

**মূল কানেকশন:**

```
Rainfall Tab (Second Card)
    ↓ (Form Data)
    ↓
Weather Observation Model (Prisma)
    ↓ (Database)
    ↓
Synoptic Code Generation (/api/synoptic)
    ↓ (6RRRtR Format)
    ↓
SYNOP Message (WMO Standard)
```

---

## 🔄 ডেটা ফ্লো আর্কিটেকচার

### ১. **Rainfall Input Form** (`components/weather-form/rainfall-tab.tsx`)

**ব্যবহারকারী ইনপুট সেকশন:**

| ফিল্ড               | প্রকার                  | উদ্দেশ্য                                   |
| ------------------- | ----------------------- | ------------------------------------------ |
| **Date Start**      | ISO String (YYYY-MM-DD) | বৃষ্টির শুরু তারিখ                         |
| **Date End**        | ISO String (YYYY-MM-DD) | বৃষ্টির শেষ তারিখ                          |
| **Time Slots**      | JSON Array              | একাধিক সময়ের ব্যবধান (Minute-granular)    |
| **Since Previous**  | Number (mm)             | আগের অবজারভেশন থেকে বৃষ্টি                 |
| **During Previous** | Number (mm)             | আগের ৬ ঘণ্টায় বৃষ্টি (00, 06, 12, 18 UTC) |
| **Last 24 Hours**   | Number (mm)             | গত ২৪ ঘণ্টার বৃষ্টি                        |

**Time Slots স্ট্রাকচার:**

```typescript
interface TimeSlot {
  id: string; // UUID
  timeStart: string; // HH:MM (e.g., "21:00", "22:50")
  timeEnd: string; // HH:MM (e.g., "23:45", "00:30")
}

// Cross-midnight সাপোর্ট:
// যদি End Time < Start Time → Next day হিসাব করা হয়
// Example: 22:00 থেকে 00:30 = ২.৫ ঘণ্টা
```

### ২. **বৃষ্টির ধরন স্বয়ংক্রিয় সনাক্তকরণ**

```typescript
// logic from rainfall-tab.tsx (lines 93-116)

detectRainfallType(timeSlots) {
  if (timeSlots.length === 0) return ""; // কোন স্লট নেই

  // Gap Detection:
  for (i = 0; i < slots.length - 1; i++) {
    gap = slots[i].end থেকে slots[i+1].start এর ব্যবধান

    if (gap >= 30 minutes) → "intermittent" ✓
  }

  return "continuous" or "intermittent"
}

// স্বয়ংক্রিয়ভাবে setFieldValue("rainfall.rainfallType", type) সেট হয়
```

**রেইনফল টাইপ সংজ্ঞা:**

- **Continuous (ধারাবাহিক)**: সব স্লট ৩০ মিনিটের মধ্যে সংযুক্ত
- **Intermittent (অনিয়মিত)**: যেকোনো দুটি স্লটের মধ্যে ≥ ৩০ মিনিট গ্যাপ

---

## 💾 ডেটাবেস স্টোরেজ (Prisma Schema)

### WeatherObservation মডেল (`prisma/schema.prisma`)

```prisma
model WeatherObservation {
  id              String @id @default(cuid())
  observingTimeId String

  // RAINFALL FIELDS (৮ টি ফিল্ড)
  rainfallTimeStart      DateTime?    // পুরানো ফরম্যাট (backward compat)
  rainfallTimeEnd        DateTime?    // পুরানো ফরম্যাট (backward compat)
  rainfallTimeSlots      Json?        // নতুন ফরম্যাট (TimeSlot[] array)
  rainfallSincePrevious  String?      // "since-previous" (mm)
  rainfallDuringPrevious String?      // "during-previous" (mm)
  rainfallLast24Hours    String?      // "last-24-hours" (mm)
  isIntermittentRain     Boolean?     // ডেপ্রিকেটেড (rainfallType ব্যবহার করুন)
  rainfallType           String?      // "continuous" or "intermittent"

  ObservingTime ObservingTime @relation(...)
}
```

**ডাটা সংরক্ষণের ক্রমাগত বিবর্তন:**

```
Phase 1 (পুরানো):
  rainfallTimeStart (single timestamp)
  rainfallTimeEnd (single timestamp)

Phase 2 (বর্তমান):
  rainfallTimeSlots (JSON array with multiple intervals)
  rainfallType (explicit type indicator)

Backward Compatibility: উভয় ফরম্যাট সাপোর্ট করা হয়
```

---

## 🎯 Synoptic Code জেনারেশন লজিক

### ১. **৬RRRtR ফিল্ড** (Precipitation Information)

**অবস্থান:** সিনোপ্টিক কোডের ৪৭-৫১ নম্বর অবস্থান
**ফরম্যাট:** `6RRRtR` (৬ বর্ণ)

```
Position structure:
┌─────────┬──────┬───┬─┐
│  Digit  │ 1    │2-4│ 5│
├─────────┼──────┼───┼─┤
│ Meaning │ Code │Rain│ tr
│         │ (=6) │Amt │(Type)
│ Length  │ 1    │ 3  │ 1
└─────────┴──────┴───┴─┘

Example: 6125/ = 6 + 125mm + / (no rainfall type info)
Example: 6015004 = 6 + 015mm + 4 (ended <2h before obs)
```

### ২. **RRR - বৃষ্টির পরিমাণ (Precipitation Amount)**

**সোর্স:**

```typescript
// From: app/api/synoptic/route.ts (line ~285)
const rainFall = Number(weatherObs.rainfallDuringPrevious) || 0;
const rainFallPadded = pad(rainFall.toString().slice(-3), 3);
// শেষ ৩ ডিজিট ব্যবহার করা হয় (যদি > ৯৯৯ মিমি হয়)
measurements[7] = `6${rainFallPadded}${tr}`;
```

**নিয়ম:**

- ০ = no rainfall / অজ্ঞাত পরিমাণ
- ১-৯৯৯ = মিমিতে পরিমাণ
- শেষ ৩ ডিজিট শুধুমাত্র (যেমন ১০২৫ মিমি → ০২৫ স্টোর করা হয়)

### ৩. **tr - বৃষ্টির ধরন & সময়কাল কোড**

এটি **সবচেয়ে জটিল অংশ** যেখানে rainfall type এবং timing logic এ প্রবেশ করে।

#### **কেস ১: Intermittent Rain (অনিয়মিত বৃষ্টি)**

```
WMO Chart-Based Logic (tr = 1, 2, 3):

Observation Time: H
3-hour before: H-3
6-hour before: H-6

┌────────────────────┬─────────────────┬──────┐
│ When Rain Occurs   │ Description     │ tr   │
├────────────────────┼─────────────────┼──────┤
│ H-6 ≤ rainPeriod   │ Between H-6 &   │  1   │
│ < H-3              │ H-3 (first 3h)  │      │
├────────────────────┼─────────────────┼──────┤
│ H-3 ≤ rainPeriod   │ Between H-3 &   │  2   │
│ < H                │ H (last 3h)     │      │
├────────────────────┼─────────────────┼──────┤
│ rainStart ≤ H-6 &  │ Full 6-hour     │  3   │
│ rainEnd ≥ H        │ period covered   │      │
├────────────────────┼─────────────────┼──────┤
│ বাকি সব ক্ষেত্রে   │ Invalid/Unknown │  /   │
└────────────────────┴─────────────────┴──────┘
```

**কোড উদাহরণ** (`app/api/synoptic/route.ts`, lines 302-320):

```typescript
if (isIntermittentRain) {
  const startedInFirstHalf = rainStart >= H_6 && rainStart < H_3;
  const endedInFirstHalf = rainEnd <= H_3;

  if (startedInFirstHalf && endedInFirstHalf) {
    tr = "1"; // পুরোটাই H-6 থেকে H-3 মধ্যে
  } else if (/* H-3 থেকে H */) {
    tr = "2"; // পুরোটাই H-3 থেকে H মধ্যে
  } else if (rainStart <= H_6 && rainEnd >= H) {
    tr = "3"; // পুরো ৬ ঘণ্টা জুড়ে বিস্তৃত
  } else {
    tr = "/"; // ভুল রেঞ্জ
  }
}
```

#### **কেস ২: Continuous Rain (ধারাবাহিক বৃষ্টি)**

```
WMO Code (tr = 4-9):

বৃষ্টির ধরন + শেষ হওয়ার সময় অনুযায়ী:

┌──────────────────┬──────────────────┬──────┐
│ Duration         │ Hours Since End   │ tr   │
│ of Rain          │ (H - rainEnd)     │      │
├──────────────────┼──────────────────┼──────┤
│ ≤ 2 hours        │ ≤ 2 hours ago    │  4   │ 👈 সবচেয়ে সাম্প্রতিক
│                  │ 2-4 hours ago    │  5   │
│                  │ 4-6 hours ago    │  6   │
├──────────────────┼──────────────────┼──────┤
│ 2-4 hours        │ ≤ 2 hours ago    │  7   │
│                  │ 2-4 hours ago    │  8   │
├──────────────────┼──────────────────┼──────┤
│ 4-6 hours        │ ≤ 2 hours ago    │  9   │ 👈 দীর্ঘ বৃষ্টি
├──────────────────┼──────────────────┼──────┤
│ বাকি সব ক্ষেত্রে  │                  │  /   │
└──────────────────┴──────────────────┴──────┘
```

**কোড উদাহরণ** (`app/api/synoptic/route.ts`, lines 322-345):

```typescript
const durationHours = (rainEnd - rainStart) / (1000 * 60 * 60);
const hoursSinceEnd = (H - rainEnd) / (1000 * 60 * 60);

if (durationHours <= 2) {
  if (hoursSinceEnd <= 2) tr = "4";
  else if (hoursSinceEnd <= 4) tr = "5";
  else if (hoursSinceEnd <= 6) tr = "6";
} else if (durationHours <= 4) {
  if (hoursSinceEnd <= 2) tr = "7";
  else if (hoursSinceEnd <= 4) tr = "8";
} else if (durationHours <= 6 && hoursSinceEnd <= 2) {
  tr = "9";
} else {
  tr = "/"; // Invalid
}
```

#### **কেস ৩: No Time Data**

```typescript
if (!rainStart || !rainEnd) {
  if (rainFall > 0) {
    tr = "0"; // বৃষ্টি হয়েছে কিন্তু সময় অজানা
  } else {
    tr = "/"; // কোন বৃষ্টি নেই
  }
}
```

---

## 📊 বাস্তব উদাহরণ (Real-World Example)

### **পরিস্থিতি ১: ধারাবাহিক ২ ঘণ্টার বৃষ্টি**

```
অবজারভেশন টাইম (H):        18:00 UTC
বৃষ্টি শুরু:                16:15 UTC
বৃষ্টি শেষ:                 18:00 UTC (ঠিক অবজারভেশনে)
বৃষ্টির পরিমাণ:             12 মিমি
ধরন:                        ধারাবাহিক (একটি স্লট)

ক্যালকুলেশন:
─────────────
- Duration = 18:00 - 16:15 = 1:45 hours ✓ (≤ 2h)
- Hours Since End = 18:00 - 18:00 = 0 hours ✓ (≤ 2h)
- tr = 4

সিনোপ্টিক কোড:
─────────────
6RRRtR = 6 + 012 + 4 = 6012-4

Final: 6 0 1 2 4 (5 অক্ষর)
```

### **পরিস্থিতি ২: অনিয়মিত বৃষ্টি (স্টে প্যাটার্ন)**

```
অবজারভেশন টাইম (H):        12:00 UTC
H-3:                        09:00 UTC
H-6:                        06:00 UTC

সময় স্লট ১:
  শুরু: 07:00 UTC
  শেষ:  08:30 UTC
  ✓ গ্যাপ আছে

সময় স্লট ২:
  শুরু: 10:00 UTC
  শেষ:  11:00 UTC
  গ্যাপ = 10:00 - 08:30 = 1.5 hours < 30 mins? NO!
  → Intermittent ✓

বৃষ্টির পরিমাণ: 18 মিমি
ধরন: অনিয়মিত

ক্যালকুলেশন:
─────────────
- Slot 1: 07:00-08:30 → এর মধ্যে H-3 (09:00)? NO
  → Not in first half

- Slot 1 শেষ হয় 08:30 < 09:00 (H-3)? YES
  → ended in first half? Actually NO because 08:30 < 09:00

Wait, recalculate:
- H = 12:00, H-3 = 09:00, H-6 = 06:00
- Slot 1: 07:00 - 08:30
  - Started in first half? 07:00 >= 06:00 && 07:00 < 09:00 ✓
  - Ended in first half? 08:30 <= 09:00 ✓
  → tr = 1 (happened in first 3-hour period)

সিনোপ্টিক কোড:
─────────────
6RRRtR = 6 + 018 + 1 = 6 0 1 8 1
```

### **পরিস্থিতি ৩: সম্পূর্ণ ৬-ঘণ্টা জুড়ে বৃষ্টি**

```
অবজারভেশন টাইম:            06:00 UTC
H-6:                       00:00 UTC
H-3:                       03:00 UTC

বৃষ্টি: 23:30 (আগের দিন) → 06:15 UTC (পরের দিন)
পরিমাণ: 25 মিমি
ধরন: অনিয়মিত (intermediate gap থাকলে)

ক্যালকুলেশন:
─────────────
- rainStart (23:30) <= H-6 (00:00)?
  🔴 যদি আগের দিন হয় → technically NOT
  🟢 লক্ষ্য করুন: এ ক্ষেত্রে কোড ক্রস-মিডনাইট হ্যান্ডল করে

যদি একই দিনে থাকে:
- rainStart = 22:00, rainEnd = 05:00 (next day converted)
- rainStart <= H-6? YES
- rainEnd >= H? YES
- → tr = 3

সিনোপ্টিক কোড:
─────────────
6RRRtR = 6 + 025 + 3 = 6 0 2 5 3
```

---

## 🔗 সংযোগ চার্ট

```
┌─────────────────────────────────────────────────────────────┐
│                   RAINFALL TAB (Second Card)                │
│                  components/weather-form/                   │
│              rainfall-tab.tsx                               │
├─────────────────────────────────────────────────────────────┤
│  • Time Slots (minute-granular)                             │
│  • Rainfall Type auto-detection (continuous/intermittent)   │
│  • Formik Field Values                                      │
└────────────────────┬────────────────────────────────────────┘
                     │ setFieldValue("rainfall.*")
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            WEATHER OBSERVATION (Database)                   │
│              prisma/schema.prisma                           │
├─────────────────────────────────────────────────────────────┤
│  WeatherObservation {                                       │
│    rainfallTimeSlots: Json[]  ← Time intervals stored      │
│    rainfallDuringPrevious: mm ← Amount for 6RRRtR          │
│    rainfallType: "continuous"|"intermittent"               │
│    rainfallSincePrevious: mm  ← Not used in synoptic       │
│    rainfallLast24Hours: mm    ← Not used in synoptic       │
│  }                                                          │
└────────────────────┬────────────────────────────────────────┘
                     │ Data fetch from DB
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         SYNOPTIC CODE GENERATION (API)                      │
│              app/api/synoptic/route.ts                      │
├─────────────────────────────────────────────────────────────┤
│  1. Parse rainfallTimeSlots → Calculate duration            │
│  2. Check rainfallType → intermittent or continuous?        │
│  3. Apply WMO tr logic (0-9 or /)                          │
│  4. Format: 6 + RRR(amount) + tr(type) = 6RRRtR           │
│  5. Place at position 47-51 in SYNOP message               │
└────────────────────┬────────────────────────────────────────┘
                     │ WMO SYNOP Message
                     ▼
┌─────────────────────────────────────────────────────────────┐
│     FINAL SYNOP TRANSMISSION (Global Network)              │
│         Example: SYNOP 61012 30125/40015504...             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🐛 বর্তমান বাস্তবায়নের সমস্যা & সীমাবদ্ধতা

### **সমস্যা ১: rainfallDuringPrevious হার্ডকোডেড ব্যবহার**

```typescript
// app/api/synoptic/route.ts, line ~285
const rainFall = Number(weatherObs.rainfallDuringPrevious) || 0;
```

**সমস্যা:**

- শুধুমাত্র "during previous" (আগের ৬ ঘণ্টা) ব্যবহার করা হয়
- `rainfallLast24Hours` বা `rainfallSincePrevious` ব্যবহার করা হয় না
- যখন specific value উপলব্ধ না থাকে, fallback logic নেই

**উন্নতির পরামর্শ:**

```typescript
// Better logic:
const rainFall =
  Number(weatherObs.rainfallDuringPrevious) ||
  Number(weatherObs.rainfallLast24Hours) ||
  0;
```

### **সমস্যা ২: Cross-Midnight Handling**

```typescript
// কোড সঠিকভাবে কাজ করে, কিন্তু:
const baseDate = observationTime.toISOString().split("T")[0];
const [startHour, startMin] = slot.timeStart.split(":").map(Number);
// ... creates new Date(UTC(...))
```

**সমস্যা:**

- ক্রস-মিডনাইট রেইনফল সঠিকভাবে হ্যান্ডেল করা হয়
- কিন্তু `end < start` এর ক্ষেত্রে পরের দিন ধরে নেওয়া হয়
- ডেটাবেসে ISO string হিসেবে স্টোর করা হয় (UTC timestamps নয়)

**সীমাবদ্ধতা:**

- ২-দিনের বৃষ্টি সাপোর্ট করে না (বিরল কিন্তু সম্ভব)

### **সমস্যা ৩: rainfallType Auto-Detection vs Manual Entry**

```typescript
// rainfall-tab.tsx
const detectRainfallType = (slots: TimeSlot[]) => {
  // Automatically calculates based on 30-min gap
  const type = intermittent ? "intermittent" : "continuous";
  setFieldValue("rainfall.rainfallType", type);
};
```

**সমস্যা:**

- ব্যবহারকারী রোধ করতে পারে না (শুধু auto-detect)
- WMO কখনো আলাদা মান প্রয়োজন হলে?
- যদি অবজারভেশন প্রক্রিয়ায় ম্যানুয়াল রিপোর্টিং হয়?

---

## 💡 সুপারিশ & উন্নতির জন্য রোডম্যাপ

### **স্বল্পমেয়াদী (Quick Wins):**

1. **Rainfall Amount Fallback Logic**
   - সিনোপ্টিক জেনারেশনে multiple sources চেক করুন
2. **Manual Override Option**
   - `rainfallType` এর জন্য ম্যানুয়াল সিলেক্টর যোগ করুন
3. **Better Validation**
   - tr কোড generation এ error handling

### **দীর্ঘমেয়াদী (Major Refactoring):**

1. **Unified Rainfall Schema**
   - সব rainfall fields একটি nested object হিসেবে অর্গানাইজ করুন
2. **Time Zone Awareness**
   - Bangladesh calendar rule consistent করুন সর্বত্র
3. **WMO Compliance Checker**
   - Synoptic code validation module তৈরি করুন

---

## 📚 রেফারেন্স

- **WMO Manual on Codes:**

  - Section 3.1.1.2 - Precipitation (6RRRtR)
  - Group 4 - Time-based codes

- **Bangladesh Meteorological Department:**

  - Observation Standards
  - Synoptic Reporting Guidelines

- **Project Schema:**
  - Rainfall TAB Component: `components/weather-form/rainfall-tab.tsx`
  - Synoptic Generation: `app/api/synoptic/route.ts`
  - Database Model: `prisma/schema.prisma`

---

## 🎯 সংক্ষেপ Q&A

**Q: Rainfall tab এর primary purpose কী?**
A: UTC hour অনুযায়ী Bangladesh calendar rule ফলো করে বৃষ্টির detail তথ্য সংগ্রহ করা এবং WMO SYNOP format এ পরিবর্তন করার জন্য প্রস্তুত করা।

**Q: Synoptic code এ rainfall data কোথায় ব্যবহৃত হয়?**
A: Position 47-51 এ `6RRRtR` ফিল্ড হিসেবে:

- `6` = ফিল্ড identifier
- `RRR` = পরিমাণ (rainfallDuringPrevious থেকে)
- `tR` = ধরন+সময় কোড (time slot logic থেকে)

**Q: Continuous vs Intermittent এর পার্থক্য কী?**
A:

- **Continuous**: সব intervals consecutive (30 min গ্যাপ ছাড়াই)
- **Intermittent**: কমপক্ষে একটি 30+ মিনিট গ্যাপ থাকে

**Q: Cross-midnight rainfall কীভাবে হ্যান্ডেল হয়?**
A: End time < Start time হলে পরের দিনের বলে ধরা হয়। Duration calculation এ এটি বিবেচনা করা হয় (e.g., 22:00 থেকে 00:30 = 2.5 hours)।

---

**ডকুমেন্ট তৈরি করা হয়েছে:** December 4, 2025
**ভাষা:** বাংলা & ইংরেজি (Bilingual)
**প্রযোজ্যতা:** Weather Application, Second Card Rainfall Module
