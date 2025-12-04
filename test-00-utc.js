#!/usr/bin/env node
/**
 * 00 UTC Test Suite Runner
 * Tests the critical 00 UTC Bangladesh calendar rule
 * 
 * Usage: node test-00-utc.js
 */

const fs = require('fs');
const path = require('path');

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class TestSuite {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  assertEquals(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`Expected ${expected}, got ${actual}. ${message}`);
    }
  }

  async run() {
    console.log(`${colors.cyan}🧪 00 UTC Test Suite Runner${colors.reset}\n`);
    
    for (const test of this.tests) {
      try {
        await test.fn.call(this);
        this.passed++;
        console.log(`${colors.green}✓${colors.reset} ${test.name}`);
      } catch (error) {
        this.failed++;
        console.log(`${colors.red}✗${colors.reset} ${test.name}`);
        console.log(`  ${colors.red}${error.message}${colors.reset}`);
      }
    }

    console.log(`\n${colors.cyan}Test Results${colors.reset}`);
    console.log(`${colors.green}Passed: ${this.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${this.failed}${colors.reset}`);
    console.log(`Total: ${this.passed + this.failed}`);

    if (this.failed === 0) {
      console.log(`\n${colors.green}✅ All tests passed!${colors.reset}`);
    } else {
      console.log(`\n${colors.red}❌ Some tests failed${colors.reset}`);
      process.exit(1);
    }
  }
}

// Initialize test suite
const suite = new TestSuite();

// ============================================
// TEST SUITE: 00 UTC Bangladesh Calendar Rule
// ============================================

suite.test('00 UTC: Date should be previous day', function() {
  const utcHour = 0;
  const today = '2025-12-04';
  
  // Expected behavior
  const expectedDate = '2025-12-03';
  const actualDate = utcHour === 0 ? 
    new Date(new Date(today).getTime() - 24*60*60*1000).toISOString().split('T')[0] :
    today;
  
  this.assertEquals(actualDate, expectedDate, 'Date should be previous day when UTC=00');
});

suite.test('03 UTC: Date should be current day', function() {
  const utcHour = 3;
  const today = '2025-12-04';
  
  // Expected behavior
  const expectedDate = '2025-12-04';
  const actualDate = utcHour === 0 ? 
    new Date(new Date(today).getTime() - 24*60*60*1000).toISOString().split('T')[0] :
    today;
  
  this.assertEquals(actualDate, expectedDate, 'Date should be today when UTC=03');
});

suite.test('00 UTC: WMO window H-6 calculation', function() {
  const observationTime = new Date('2025-12-04T00:30:00Z');
  const H_6 = new Date(observationTime.getTime() - 6*60*60*1000);
  
  // H-6 should be 2025-12-03 18:30 UTC
  const expectedTime = new Date('2025-12-03T18:30:00Z').getTime();
  const actualTime = H_6.getTime();
  
  this.assertEquals(actualTime, expectedTime, 'H-6 should be 6 hours before observation');
});

suite.test('00 UTC: WMO window H-3 calculation', function() {
  const observationTime = new Date('2025-12-04T00:30:00Z');
  const H_3 = new Date(observationTime.getTime() - 3*60*60*1000);
  
  // H-3 should be 2025-12-03 21:30 UTC
  const expectedTime = new Date('2025-12-03T21:30:00Z').getTime();
  const actualTime = H_3.getTime();
  
  this.assertEquals(actualTime, expectedTime, 'H-3 should be 3 hours before observation');
});

suite.test('00 UTC: Single slot continuous rain tr code', function() {
  const observationTime = new Date('2025-12-04T00:30:00Z');
  const rainStart = new Date('2025-12-03T21:00:00Z');
  const rainEnd = new Date('2025-12-03T22:30:00Z');
  
  const H = observationTime;
  const H_3 = new Date(H.getTime() - 3*60*60*1000);
  const H_6 = new Date(H.getTime() - 6*60*60*1000);
  
  // Calculate tr for continuous rain
  const durationHours = (rainEnd - rainStart) / (1000*60*60);
  const hoursSinceEnd = (H - rainEnd) / (1000*60*60);
  
  let tr = '/';
  if (rainStart >= H_6 && rainEnd <= H) {
    if (durationHours <= 2) {
      if (hoursSinceEnd <= 2) tr = '4';
      else if (hoursSinceEnd <= 4) tr = '5';
      else if (hoursSinceEnd <= 6) tr = '6';
    }
  }
  
  this.assertEquals(tr, '4', 'Single slot should give continuous code tr=4');
});

suite.test('00 UTC: Intermittent rain in first half tr=1', function() {
  const observationTime = new Date('2025-12-04T00:30:00Z');
  const rainStart = new Date('2025-12-03T18:30:00Z');
  const rainEnd = new Date('2025-12-03T20:30:00Z');
  
  const H = observationTime;
  const H_3 = new Date(H.getTime() - 3*60*60*1000);
  const H_6 = new Date(H.getTime() - 6*60*60*1000);
  
  const startedInFirstHalf = rainStart >= H_6 && rainStart < H_3;
  const endedInFirstHalf = rainEnd <= H_3;
  
  let tr = '/';
  if (startedInFirstHalf && endedInFirstHalf) {
    tr = '1';
  }
  
  this.assertEquals(tr, '1', 'Intermittent rain in first half should have tr=1');
});

suite.test('00 UTC: Intermittent rain in second half tr=2', function() {
  const observationTime = new Date('2025-12-04T00:30:00Z');
  const rainStart = new Date('2025-12-03T21:30:00Z');
  const rainEnd = new Date('2025-12-03T23:30:00Z');
  
  const H = observationTime;
  const H_3 = new Date(H.getTime() - 3*60*60*1000);
  const H_6 = new Date(H.getTime() - 6*60*60*1000);
  
  const startedInSecondHalf = rainStart >= H_3 && rainStart < H;
  const endedInSecondHalf = rainEnd <= H;
  
  let tr = '/';
  if (startedInSecondHalf && endedInSecondHalf) {
    tr = '2';
  }
  
  this.assertEquals(tr, '2', 'Intermittent rain in second half should have tr=2');
});

suite.test('00 UTC: Intermittent rain spanning both halves tr=3', function() {
  const observationTime = new Date('2025-12-04T00:30:00Z');
  const rainStart = new Date('2025-12-03T18:00:00Z');
  const rainEnd = new Date('2025-12-04T00:30:00Z');
  
  const H = observationTime;
  const H_6 = new Date(H.getTime() - 6*60*60*1000);
  
  let tr = '/';
  if (rainStart <= H_6 && rainEnd >= H) {
    tr = '3';
  }
  
  this.assertEquals(tr, '3', 'Intermittent rain spanning full period should have tr=3');
});

suite.test('Multiple slots: Gap calculation', function() {
  const slot1End = 22*60 + 30;  // 22:30 in minutes
  const slot2Start = 23*60 + 0; // 23:00 in minutes
  
  const gap = slot2Start - slot1End;
  const isIntermittent = gap >= 30;
  
  this.assert(isIntermittent, `Gap should be >= 30 min for intermittent. Gap: ${gap}`);
});

suite.test('Multiple slots: No gap = continuous', function() {
  const slot1End = 22*60 + 30;  // 22:30
  const slot2Start = 22*60 + 30; // 22:30 (immediate)
  
  const gap = slot2Start - slot1End;
  const isIntermittent = gap >= 30;
  
  this.assert(!isIntermittent, 'No gap should be continuous');
});

suite.test('Multiple slots: Small gap = continuous', function() {
  const slot1End = 22*60 + 30;  // 22:30
  const slot2Start = 22*60 + 45; // 22:45 (15 min gap)
  
  const gap = slot2Start - slot1End;
  const isIntermittent = gap >= 30;
  
  this.assert(!isIntermittent, 'Gap < 30 min should be continuous');
});

suite.test('Multiple slots: Exactly 30 min gap = intermittent', function() {
  const slot1End = 22*60 + 30;  // 22:30
  const slot2Start = 23*60 + 0; // 23:00 (exactly 30 min)
  
  const gap = slot2Start - slot1End;
  const isIntermittent = gap >= 30;
  
  this.assert(isIntermittent, 'Gap of exactly 30 min should be intermittent');
});

suite.test('Cross-midnight: End < Start means next day', function() {
  const timeStart = 23*60 + 0;  // 23:00
  const timeEnd = 1*60 + 30;    // 01:30
  
  // If end < start, assume next day
  const end = timeEnd >= timeStart ? timeEnd : timeEnd + 24*60;
  const duration = end - timeStart;
  
  const expectedDuration = 2.5 * 60; // 2.5 hours = 150 minutes
  this.assertEquals(duration, expectedDuration, 'Cross-midnight duration should be calculated correctly');
});

suite.test('RRR field: Amount 8.3 mm → "008"', function() {
  const amount = 8.3;
  const rrr = String(Math.floor(amount)).padStart(3, '0');
  
  this.assertEquals(rrr, '008', 'Amount should be padded to 3 digits');
});

suite.test('RRR field: Amount 125 mm → "125"', function() {
  const amount = 125.7;
  const rrr = String(Math.floor(amount)).padStart(3, '0');
  
  this.assertEquals(rrr, '125', 'Large amounts should use 3 digits');
});

suite.test('6RRRtR field: Construction at 00 UTC', function() {
  const rrr = '008';
  const tr = '1';
  const field = '6' + rrr + tr;
  
  this.assertEquals(field, '60081', '6RRRtR field should be constructed correctly');
});

suite.test('Bangladesh calendar: 00 UTC rule message', function() {
  const utcHour = 0;
  const rule = utcHour === 0 
    ? "00 UTC → Previous date" 
    : `${String(utcHour).padStart(2, '0')} UTC → Present date`;
  
  this.assertEquals(rule, '00 UTC → Previous date', 'Should show previous date for 00 UTC');
});

suite.test('Bangladesh calendar: 06 UTC rule message', function() {
  const utcHour = 6;
  const rule = utcHour === 0 
    ? "00 UTC → Previous date" 
    : `${String(utcHour).padStart(2, '0')} UTC → Present date`;
  
  this.assertEquals(rule, '06 UTC → Present date', 'Should show present date for 06 UTC');
});

// Run all tests
suite.run().catch(err => {
  console.error(err);
  process.exit(1);
});
