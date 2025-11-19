"use client";

const TableHeader = () => (
  <thead>
    <tr>
      <th
        rowSpan={2}
        className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
      >
        GG
      </th>
      <th
        rowSpan={2}
        className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
      >
        CI
      </th>
      <th
        rowSpan={2}
        className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
      >
        Date
      </th>
      <th
        rowSpan={2}
        className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
      >
        Station
      </th>
      <th
        rowSpan={2}
        colSpan={9}
        className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 p-1 text-purple-800"
      >
        BAR PRESSURE
      </th>
      <th
        colSpan={6}
        className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 p-1 text-cyan-800"
      >
        TEMPERATURE
      </th>
      <th
        rowSpan={2}
        className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 p-1 text-teal-800"
      >
        Td
      </th>
      <th
        rowSpan={2}
        className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 p-1 text-teal-800"
      >
        R.H.
      </th>
      <th
        rowSpan={2}
        colSpan={3}
        className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 text-amber-800"
      >
        SQUALL
      </th>
      <th
        rowSpan={2}
        className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
      >
        VV
      </th>
      <th
        rowSpan={2}
        className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
      >
        Misc
      </th>
      <th
        rowSpan={2}
        colSpan={3}
        className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 text-emerald-800"
      >
        WEATHER
      </th>
      <th
        rowSpan={2}
        className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 p-1 text-gray-800"
      >
        Actions
      </th>
    </tr>
    <tr>
      <th
        colSpan={3}
        className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1 text-cyan-800 text-center"
      >
        As Read
      </th>
      <th
        colSpan={3}
        className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1 text-cyan-800 text-center"
      >
        Corrected
      </th>
    </tr>
    <tr>
      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
        <div className="h-16 text-indigo-800">Time of Observation (UTC)</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
        <div className="h-16 text-indigo-800">Indicator</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
        <div className="h-16 text-indigo-800">Date</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
        <div className="h-16 text-indigo-800">Station Name &amp; ID</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
        <div className="h-16 text-purple-800">
          Attached Thermometer (&deg;C)
        </div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
        <div className="h-16 text-purple-800">Bar As Read (hPa)</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
        <div className="h-16 text-purple-800">Corrected for Index</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
        <div className="h-16 text-purple-800">
          Height Difference Correction (hPa)
        </div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
        <div className="h-16 text-purple-800">
          Station Level Pressure (QFE)
        </div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
        <div className="h-16 text-purple-800">Sea Level Reduction</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
        <div className="h-16 text-purple-800">Sea Level Pressure (QNH)</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
        <div className="h-16 text-purple-800">Altimeter setting (QNH)</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
        <div className="h-16 text-purple-800">24-Hour Pressure Change</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
        <div className="h-16 text-cyan-800">Dry Bulb (&deg;C)</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
        <div className="h-16 text-cyan-800">Wet Bulb (&deg;C)</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
        <div className="h-16 text-cyan-800">MAX/MIN (&deg;C)</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
        <div className="h-16 text-cyan-800">Dry Bulb (&deg;C)</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
        <div className="h-16 text-cyan-800">Wet Bulb (&deg;C)</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
        <div className="h-16 text-cyan-800">MAX/MIN (&deg;C)</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 text-xs p-1">
        <div className="h-16 text-teal-800">Dew Point (&deg;C)</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 text-xs p-1">
        <div className="h-16 text-teal-800">Relative Humidity (%)</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
        <div className="h-16 text-amber-800">Squall Force (kts)</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
        <div className="h-16 text-amber-800">Squall Direction (°)</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
        <div className="h-16 text-amber-800">Squall Time (qt)</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
        <div className="h-16 text-blue-800">Visibility (km)</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
        <div className="h-16 text-blue-800">Misc Meteors</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
        <div className="h-16 text-emerald-800">Past Weather (W1)</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
        <div className="h-16 text-emerald-800">Past Weather (W2)</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
        <div className="h-16 text-emerald-800">Present Weather (ww)</div>
      </th>
      <th className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 text-xs p-1">
        <div className="h-16 text-gray-800">Actions</div>
      </th>
    </tr>
  </thead>
);

export default TableHeader;

