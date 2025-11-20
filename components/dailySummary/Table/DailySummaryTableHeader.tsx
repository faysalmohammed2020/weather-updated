export const DailySummaryTableHeader = () => (
  <thead className="bg-gradient-to-b from-blue-600 to-blue-700 text-sm font-bold uppercase text-center text-white print:bg-blue-700">
    <tr>
      <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
        Date
      </th>
      <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
        Station
      </th>
      <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
        Av. Station Pressure (hPa)
      </th>
      <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
        Av. Sea-Level Pressure (hPa)
      </th>
      <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
        Av. Dry-Bulb Temp (deg C)
      </th>
      <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
        Av. Wet-Bulb Temp (deg C)
      </th>
      <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
        Max Temperature (deg C)
      </th>
      <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
        Min Temperature (deg C)
      </th>
      <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
        Total Precipitation (mm)
      </th>
      <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
        Av. Dew Point Temp (deg C)
      </th>
      <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
        Av. Relative Humidity (%)
      </th>
      <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
        Wind Speed (m/s)
      </th>
      <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
        Wind Direction
      </th>
      <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
        Max Wind Speed (m/s)
      </th>
      <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
        Max Wind Direction
      </th>
      <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
        Av. Total Cloud (oktas)
      </th>
      <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
        Lowest Visibility (km)
      </th>
      <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
        Total Rain Duration (HHMM)
      </th>
      <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
        Actions
      </th>
    </tr>
  </thead>
);
