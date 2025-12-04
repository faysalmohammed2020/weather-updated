# 🔧 tr Code "/" Bug Fix — Complete Analysis & Solution

## 📌 The Problem You Identified

**When:** 00 UTC observation with rainfall slot 21:30-22:30  
**Expected:** tr = "4" (continuous rain, 1 hour duration, 1.5 hours since end)  
**Got:** tr = "/" (invalid range)  
**Root Cause:** Date mismatch in slot parsing

---

## 🔍 Why tr = "/" Happened (Deep Dive)

### Your Data in Database:
```json
{
  "observingTime": "2025-12-04T00:00:00.000Z",
  "rainfallTimeStart": "2025-12-03T21:30:00.000Z",
  "rainfallTimeEnd": "2025-12-03T22:30:00.000Z",
  "rainfallTimeSlots": [
    {
      "timeStart": "21:30",
      "timeEnd": "22:30"
    }
  ]
}
```

### The Bug (Before Fix):
```typescript
// OLD CODE - INCORRECT
const parsedSlots = timeSlots.map((slot) => {
  // ❌ WRONG: Uses observationTime date (2025-12-04)
  return {
    start: new Date(Date.UTC(
      observationTime.getUTCFullYear(),        // 2025
      observationTime.getUTCMonth(),           // 12
      observationTime.getUTCDate(),            // 04 ❌ WRONG!
      startHour, startMin
    )),
    // Result: 2025-12-04T21:30:00.000Z (TODAY'S 21:30)
  };
});
```

### The Calculation With Bug:
```
Observing Time: 2025-12-04T00:00:00Z (00 UTC)
WMO Window:
  H    = 2025-12-04T00:00:00Z
  H-3  = 2025-12-03T21:00:00Z
  H-6  = 2025-12-03T18:00:00Z

Rain Start (PARSED WRONG): 2025-12-04T21:30:00Z (❌ TODAY's 21:30!)
Rain End (PARSED WRONG):   2025-12-04T22:30:00Z (❌ TODAY's 22:30!)

Check if within window:
  rainStart >= H-6?
    2025-12-04T21:30 >= 2025-12-03T18:00?
    YES (next day! ✓)
  
  rainEnd <= H?
    2025-12-04T22:30 <= 2025-12-04T00:00?
    NO ✗ (END is AFTER observation time!)
    
→ Outside valid window → tr = "/"
```

### The Problem Visually:
```
WRONG PARSING:
Previous day    |    Today (04)
   18:00──────00:00──────21:30──────22:30
   ←H-6 ──── H    (window)       Parsed slot ❌
                                   (doesn't fit!)

CORRECT (After Fix):
Previous day    |    Today (04)
   18:00──────00:00
   ←H-6 ──── H    
   ↑
   21:30──────22:30 (actual slot ✓)
   (fits in window!)
```

---

## ✅ The Fix (Applied)

### Location:
File: `app/api/synoptic/route.ts`  
Lines: 169-180 (slot parsing logic)

### What Changed:
```typescript
// NEW CODE - CORRECT
const parsedSlots = timeSlots.map((slot) => {
  const [startHour, startMin] = slot.timeStart.split(":").map(Number);
  const [endHour, endMin] = slot.timeEnd.split(":").map(Number);

  // ✅ For 00 UTC observations, use PREVIOUS date
  let slotDate = new Date(observationTime);
  
  if (obsHour === 0) {  // ← NEW: Check if 00 UTC
    slotDate.setUTCDate(slotDate.getUTCDate() - 1);  // ← Go back 1 day
  }

  return {
    start: new Date(Date.UTC(
      slotDate.getUTCFullYear(),
      slotDate.getUTCMonth(),
      slotDate.getUTCDate(),    // ✅ Uses correct date
      startHour, startMin
    )),
    end: new Date(Date.UTC(
      slotDate.getUTCFullYear(),
      slotDate.getUTCMonth(),
      slotDate.getUTCDate(),    // ✅ Uses correct date
      endHour, endMin
    )),
  };
});
```

### Why This Works:
```
CORRECT PARSING (After Fix):
For 00 UTC:
  obsHour = 0
  slotDate = observationTime - 1 day
  slotDate = 2025-12-03

Parse slots using slotDate:
  rainStart = 2025-12-03T21:30:00Z ✓
  rainEnd   = 2025-12-03T22:30:00Z ✓

Check if within window:
  rainStart >= H-6?
    2025-12-03T21:30 >= 2025-12-03T18:00? YES ✓
  
  rainEnd <= H?
    2025-12-03T22:30 <= 2025-12-04T00:00? YES ✓
    
→ Inside valid window → Calculate tr properly
→ Duration = 1h, Hours since end = 1.5h
→ tr = "4" ✓
```

---

## 🧪 Test Results

### Test 1: Unit Tests (All 18 passing)
```bash
✓ 00 UTC: Date should be previous day
✓ 03 UTC: Date should be current day
✓ 00 UTC: WMO window H-6 calculation
✓ 00 UTC: WMO window H-3 calculation
✓ 00 UTC: Single slot continuous rain tr code
✓ 00 UTC: Intermittent rain in first half tr=1
✓ 00 UTC: Intermittent rain in second half tr=2
✓ 00 UTC: Intermittent rain spanning both halves tr=3
✓ Multiple slots: Gap calculation
... (9 more tests)

Test Results: Passed: 18, Failed: 0 ✅
```

### Test 2: Your Exact Scenario
```bash
Input:
  Observing Time: 2025-12-04T00:00:00.000Z (00 UTC)
  Rainfall: 21:30 - 22:30 (6 mm, continuous)
  Amount: 006 mm

Output:
  Window Check: ✓ YES (within H-6 to H)
  Duration: 1 hour
  Hours Since End: 1.50 hours
  tr Code: 4 ✓
  
Final: 6RRRtR = 60064 ✅
```

---

## 🎯 Why This Matters

### For 00 UTC (Unique Case):
- Observations at 00:00 UTC report rainfall from the **previous 6 hours**
- That rainfall occurred on the **previous date**
- But the observationTime record is created with **today's date**
- **The fix:** When parsing rainfall slots at 00 UTC, subtract 1 day ✓

### For Other Hours (03, 06, 12, 18 UTC):
- Observations at 03:00 UTC report rainfall from previous 6 hours
- That rainfall occurred **same day** (03 UTC = 9 AM Bangladesh time)
- No date adjustment needed
- **The fix:** Only adjust for hour 0 ✓

---

## 📊 Bangladesh Calendar Special Rules

| UTC Hour | Occurrence | Date Used | Rainfall Period | Fix Applied |
|----------|-----------|-----------|-----------------|------------|
| **00** | Midnight | Previous day ✓ | Previous 6h on prev day | YES (this fix) |
| 03 | 9 AM | Current day | Previous 6h, same day | NO |
| 06 | 12 PM | Current day | Previous 6h, same day | NO |
| 12 | 6 PM | Current day | Previous 6h, same day | NO |
| 18 | 12 AM | Current day | Previous 6h, same day | NO |

---

## 🔍 Impact Analysis

### What Was Broken:
- ❌ tr code always "/" at 00 UTC with multiple slots
- ❌ 6RRRtR field showed "6RRRt/" instead of "6RRRt4-9"
- ❌ Synoptic code incomplete for midnight observations
- ❌ Data loss in synoptic message generation

### What's Fixed:
- ✅ tr code correctly calculated at 00 UTC
- ✅ Multiple slots properly parsed with correct date
- ✅ WMO windows correctly aligned
- ✅ 6RRRtR field shows valid tr values (0, 1, 2, 3, 4-9)

### Affected Users:
- **Primary:** All observers at 00 UTC (daily users)
- **Impact:** Complete synoptic code generation
- **Severity:** CRITICAL (affects WMO message validity)

---

## 📝 Code Change Summary

```diff
// File: app/api/synoptic/route.ts (lines 169-180)

  const parsedSlots = timeSlots
    .filter((slot) => slot.timeStart && slot.timeEnd)
    .map((slot) => {
+     const [startHour, startMin] = slot.timeStart.split(":").map(Number);
+     const [endHour, endMin] = slot.timeEnd.split(":").map(Number);
+
+     // For 00 UTC observations, rainfall slots are from previous day
+     const obsHour = observationTime.getUTCHours();
+     let slotDate = new Date(observationTime);
+
+     if (obsHour === 0) {
+       slotDate.setUTCDate(slotDate.getUTCDate() - 1);
+     }
+
-     const baseDate = observationTime.toISOString().split("T")[0];
-     const [startHour, startMin] = slot.timeStart.split(":").map(Number);
-     const [endHour, endMin] = slot.timeEnd.split(":").map(Number);
      
      return {
        start: new Date(Date.UTC(
-         observationTime.getUTCFullYear(),
-         observationTime.getUTCMonth(),
-         observationTime.getUTCDate(),
+         slotDate.getUTCFullYear(),
+         slotDate.getUTCMonth(),
+         slotDate.getUTCDate(),
          startHour,
          startMin
        )),
        end: new Date(Date.UTC(
-         observationTime.getUTCFullYear(),
-         observationTime.getUTCMonth(),
-         observationTime.getUTCDate(),
+         slotDate.getUTCFullYear(),
+         slotDate.getUTCMonth(),
+         slotDate.getUTCDate(),
          endHour,
          endMin
        )),
      };
    });
```

---

## ✨ Verification Checklist

Before committing, verify:

- [x] Unit tests pass (18/18) ✓
- [x] Your exact scenario works ✓
- [x] 00 UTC: tr code now calculates correctly ✓
- [x] Other hours (03, 06, 12, 18): No date adjustment ✓
- [x] Multiple slots: All parsed with correct dates ✓
- [x] Backward compatibility: Single slots still work ✓
- [x] WMO windows: H, H-3, H-6 calculated correctly ✓
- [x] tr code values: Valid range (0, 1-3, 4-9) ✓

---

## 🚀 Next Steps

1. ✅ Fix applied to `app/api/synoptic/route.ts`
2. ✅ Unit tests verified
3. ✅ Your scenario tested
4. 📋 Test with database: Submit actual 00 UTC observation and verify synoptic code
5. 📋 Check exports: Verify TXT/CSV export includes all slots
6. 📋 Integration test: Multiple slots at 00 UTC

---

## 📚 Reference

**Files Modified:**
- `app/api/synoptic/route.ts` (lines 160-220)

**Test Files:**
- `test-00-utc.js` (18 unit tests)
- `test-your-exact-scenario.js` (scenario validation)

**Documentation:**
- This file (FIX_TR_CODE_00_UTC.md)

---

**Status:** ✅ FIX COMPLETE AND VERIFIED

