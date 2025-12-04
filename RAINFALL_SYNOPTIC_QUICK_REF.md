# 🚀 Quick Reference Card - Rainfall & Synoptic Code

## One-Page Cheat Sheet

---

## 📍 Location in Codebase

| Component | Path | Purpose |
|-----------|------|---------|
| **UI Form** | `components/weather-form/rainfall-tab.tsx` | User input, auto-detection |
| **DB Schema** | `prisma/schema.prisma` | WeatherObservation model |
| **API Logic** | `app/api/synoptic/route.ts` | tr code calculation |

---

## 🔄 Data Flow (In 5 Steps)

```
Step 1: User enters time slots & amount in Rainfall Tab
   ↓
Step 2: rainfallType auto-detected (gap ≥ 30min = intermittent)
   ↓
Step 3: Data saved to DB (rainfallTimeSlots JSON, rainfallType)
   ↓
Step 4: /api/synoptic fetches & calculates tr code
   ↓
Step 5: 6RRRtR placed at position 47-51 in SYNOP message
```

---

## 📋 Key Formula: 6RRRtR Code

```
Position: 47-51 in SYNOP message
Format:   [6][RRR][tR]

6     = Field code (constant)
RRR   = Rainfall amount (rainfallDuringPrevious)
tR    = Type code (from WMO logic)
       ├─ 0 = Rain but no time (unknown)
       ├─ 1-3 = Intermittent (window-based)
       ├─ 4-9 = Continuous (duration-based)
       └─ / = Invalid/no rainfall
```

---

## 🎯 tr Code Decision

### **INTERMITTENT Rain** (if rainfallType == "intermittent")

```
H-6 ──┬─ H-3 ──┬─ H
      │        │
   1st ├─ 2nd ─┤
  half │  half │

tr = 1: Rain ONLY in [H-6, H-3)
tr = 2: Rain ONLY in [H-3, H)
tr = 3: Rain spans BOTH halves
tr = /: Outside 6-hour window
```

### **CONTINUOUS Rain** (single interval)

```
Duration      | Hours Since Ends | tr
──────────────┼──────────────────┼────
≤ 2 hours     | ≤ 2h            | 4
              | 2-4h            | 5
              | 4-6h            | 6
2-4 hours     | ≤ 2h            | 7
              | 2-4h            | 8
4-6 hours     | ≤ 2h            | 9
```

---

## 📊 Database Fields

```typescript
WeatherObservation {
  // NEW (v2)
  rainfallTimeSlots: [{
    id: "uuid",
    timeStart: "HH:MM",   // e.g., "21:00"
    timeEnd: "HH:MM"      // e.g., "22:30"
  }],
  rainfallType: "continuous" | "intermittent",

  // USED FOR SYNOPTIC
  rainfallDuringPrevious: "8.3",  // ← THIS ONE (RRR)

  // LEGACY (v1)
  rainfallTimeStart: DateTime,    // OLD
  rainfallTimeEnd: DateTime,      // OLD
  
  // UNUSED
  rainfallSincePrevious: "5.2",   // Not used
  rainfallLast24Hours: "15.8"     // Not used
}
```

---

## ⚡ Critical Code Snippets

### Gap Detection (intermittent vs continuous)

```typescript
const gap = nextSlot.timeStart - currentSlot.timeEnd;
if (gap >= 30 minutes) {
  rainfallType = "intermittent"
}
```

### WMO Window Calculation

```typescript
const H = observationTime;     // e.g., 06:00 UTC
const H_3 = H - 3 hours;       // e.g., 03:00 UTC  
const H_6 = H - 6 hours;       // e.g., 00:00 UTC
```

### tr Code for Intermittent

```typescript
if (rainStart >= H_6 && rainStart < H_3 && rainEnd <= H_3) {
  tr = "1";  // First half only
} else if (rainStart >= H_3 && rainStart < H && rainEnd <= H) {
  tr = "2";  // Second half only
} else if (rainStart <= H_6 && rainEnd >= H) {
  tr = "3";  // Both halves
} else {
  tr = "/";  // Invalid
}
```

---

## 🧪 Example: 06:00 UTC Observation

```
Input:
  • Time: 21:00 - 22:30 (Slot 1)
  • Time: 00:15 - 01:45 (Slot 2)
  • Gap: 1h 45m (> 30m) → intermittent ✓
  • Amount: 8.3 mm

Calculation:
  • H = 06:00 UTC, H_3 = 03:00, H_6 = 00:00
  • Slot 2: [00:15, 01:45] 
  • 00:15 >= 00:00? YES
  • 00:15 < 03:00? YES
  • 01:45 <= 03:00? YES
  • → tr = "1" ✓

Output:
  • RRR = pad(8.3, 3) = "008"
  • 6RRRtR = "6" + "008" + "1" = "60081"
```

---

## ✅ Bangladesh Calendar Rule

```typescript
If (UTC Hour == 0) {
  selectedDate = previous_day
} else {
  selectedDate = today
}
```

Example:
- 00:15 UTC → Select previous Bangladesh date
- 06:00 UTC → Select today's Bangladesh date

---

## 🚨 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| tr = "/" | Rain outside 6h window | Check slot times vs observation time |
| RRR = "000" | rainfallDuringPrevious is null | Add fallback: `|| 0` |
| Wrong type | Gap not detected | Check if gap ≥ exactly 30min threshold |
| Cross-midnight broken | Time not adjusted | End < Start? Add 24h to end |

---

## 📍 Files to Check

```
1. rainfall-tab.tsx
   └─ Find: detectRainfallType()
   └─ Find: gapMinutes()
   
2. route.ts (/api/synoptic)
   └─ Find: rainFall = Number(...)
   └─ Find: if (isIntermittentRain)
   
3. schema.prisma
   └─ Find: model WeatherObservation
   └─ Look for: rainfall* fields
```

---

## 🎓 How to Debug

1. **Log the timeSlots after parsing**
   ```typescript
   console.log("Slots:", timeSlots);
   ```

2. **Check calculated gap**
   ```typescript
   console.log("Gap:", gap, "minutes");
   ```

3. **Verify WMO windows**
   ```typescript
   console.log("H:", H, "H_3:", H_3, "H_6:", H_6);
   ```

4. **Log final tr code**
   ```typescript
   console.log("tr =", tr);
   ```

5. **Check final 6RRRtR**
   ```typescript
   console.log("measurements[7] =", measurements[7]);
   ```

---

## 🔗 Related Documents

- 📄 `RAINFALL_SYNOPTIC_ANALYSIS.md` - Full technical analysis
- 📄 `RAINFALL_SYNOPTIC_DIAGRAMS.md` - Visual guides & flowcharts
- 📄 `RAINFALL_SYNOPTIC_CODE_REFERENCE.md` - Code examples
- 📄 `RAINFALL_SYNOPTIC_SUMMARY.md` - Executive summary

---

## 📞 When to Use Each tr Code

```
Use tr = 1: Intermittent rain entirely in first 3-hour period
Use tr = 2: Intermittent rain entirely in second 3-hour period
Use tr = 3: Intermittent rain spanning both halves
Use tr = 4: Continuous rain ≤2h, ended ≤2h ago
Use tr = 5: Continuous rain ≤2h, ended 2-4h ago
Use tr = 6: Continuous rain ≤2h, ended 4-6h ago
Use tr = 7: Continuous rain 2-4h, ended ≤2h ago
Use tr = 8: Continuous rain 2-4h, ended 2-4h ago
Use tr = 9: Continuous rain 4-6h, ended ≤2h ago
Use tr = 0: Rain occurred but time/type unknown
Use tr = /: No rainfall or invalid range
```

---

## 🌐 Related Functions

| Function | File | Purpose |
|----------|------|---------|
| `detectRainfallType()` | rainfall-tab.tsx | Auto-detect intermittent |
| `gapMinutes()` | rainfall-tab.tsx | Calculate gap between slots |
| `diffMinutes()` | rainfall-tab.tsx | Calculate duration |
| `getCurrentUTCInfo()` | rainfall-tab.tsx | Bangladesh calendar rule |

---

**Card Version:** 1.0
**Updated:** December 4, 2025
**Quick Reference:** ✅ Ready to Use
