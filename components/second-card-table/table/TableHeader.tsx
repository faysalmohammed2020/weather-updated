"use client";

const TableHeader = () => (
  <thead>
    <tr>
      <th
        rowSpan={3}
        className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800"
      >
        Time of Observation (UTC)
      </th>
      <th
        rowSpan={3}
        className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800"
      >
        C2 Indicator
      </th>
      <th
        rowSpan={3}
        className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800"
      >
        DATE
      </th>
      <th
        rowSpan={3}
        className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800"
      >
        STATION
      </th>
      <th
        colSpan={11}
        className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
      >
        CLOUD
      </th>
      <th
        rowSpan={3}
        className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800"
      >
        TOTAL CLOUD Amount (Octa)
      </th>
      <th
        colSpan={12}
        className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
      >
        SIGNIFICANT CLOUD
      </th>
      <th
        colSpan={5}
        rowSpan={2}
        className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 text-emerald-800"
      >
        RAINFALLs
      </th>
      <th
        colSpan={4}
        rowSpan={2}
        className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 text-amber-800"
      >
        WIND
      </th>
      <th
        rowSpan={3}
        className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 p-1 text-gray-800"
      >
        OBSERVER
      </th>
      <th
        rowSpan={3}
        className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 p-1 text-gray-800"
      >
        ACTIONS
      </th>
    </tr>
    <tr>
      <th
        colSpan={4}
        className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
      >
        LOW
      </th>
      <th
        colSpan={4}
        className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
      >
        MEDIUM
      </th>
      <th
        colSpan={3}
        className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
      >
        HIGH
      </th>
      <th
        colSpan={3}
        className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
      >
        1st Layer
      </th>
      <th
        colSpan={3}
        className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
      >
        2nd Layer
      </th>
      <th
        colSpan={3}
        className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
      >
        3rd Layer
      </th>
      <th
        colSpan={3}
        className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
      >
        4th Layer
      </th>
    </tr>
    <tr>
      {[
        "Form (Code)",
        "Amount (Octa)",
        "Direction (Code)",
        "Height Of Base (Code)",
        "Form (Code)",
        "Amount (Octa)",
        "Direction (Code)",
        "Height Of Base (Code)",
        "Form (Code)",
        "Amount (Octa)",
        "Direction (Code)",
      ].map((label, index) => (
        <th
          key={`cloud-${label}-${index}`}
          className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800"
        >
          {label}
        </th>
      ))}
      {Array.from({ length: 12 }).map((_, index) => (
        <th
          key={`significant-${index}`}
          className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800"
        >
          {["Form (Code)", "Amount (Octa)", "Height of Base (Code)"][
            index % 3
          ]}
        </th>
      ))}
      {["Time Start", "Time End", "Since Previous", "During Previous", "Last 24 Hours"].map(
        (label) => (
          <th
            key={`rain-${label}`}
            className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1 text-emerald-800"
          >
            {label}
          </th>
        )
      )}
      {["1st Anemometer", "2nd Anemometer", "Speed", "Direction"].map(
        (label) => (
          <th
            key={`wind-${label}`}
            className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1 text-amber-800"
          >
            {label}
          </th>
        )
      )}
    </tr>
  </thead>
);

export default TableHeader;
