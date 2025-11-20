// components/radio-sond-analyzer/radiosondeDecoders.ts
"use client"

export interface DecodedLevel {
  pressure: number
  height: number | null
  temperature: number | null
  dewpoint: number | null
  windDirection: number | null
  windSpeed: number | null
  dewpointDepression: number | null
}

export interface DecodedData {
  station: string
  date: number
  time: number
  surfacePressure: number
  surfaceTemperature: number
  surfaceDewpointDepression: number
  surfaceWindDirection: number
  surfaceWindSpeed: number
  mandatoryLevels: DecodedLevel[]
  significantLevels: DecodedLevel[]
  tropopause: {
    pressure: number
    temperature: number
    dewpoint: number
    windDirection: number
    windSpeed: number
  } | null
  maxWind: {
    pressure: number
    windDirection: number
    windSpeed: number
  } | null
}

// Height conversion based on pressure level
const convertHeightByPressure = (heightCode: string, pressureLevel: number): number | null => {
  if (heightCode === "/////" || !heightCode) return null

  const height = Number.parseInt(heightCode)
  if (isNaN(height)) return null

  if (pressureLevel > 850) {
    return height
  } else if (pressureLevel === 850) {
    return 1000 + height
  } else if (pressureLevel === 700) {
    return 2000 + height
  } else if (pressureLevel >= 300 && pressureLevel <= 500) {
    return height * 10
  } else if (pressureLevel >= 100 && pressureLevel <= 250) {
    return 10000 + height * 10
  }

  return height
}

// Decode temperature (TTTa format)
const decodeTemperature = (tempCode: string): number | null => {
  if (tempCode === "/////" || !tempCode || tempCode.length < 3) return null

  const temp = Number.parseInt(tempCode.substring(0, 3))
  if (isNaN(temp)) return null

  const lastDigit = temp % 10
  const tempValue = Math.floor(temp / 10)

  return lastDigit % 2 === 0 ? tempValue / 10 : -tempValue / 10
}

// Decode dewpoint depression
const decodeDewpointDepression = (ddCode: string): number | null => {
  if (!ddCode || ddCode === "//" || ddCode.length < 2) return null

  const dd = Number.parseInt(ddCode)
  if (isNaN(dd)) return null

  if (dd <= 50) {
    return dd / 10
  } else {
    return dd - 50
  }
}

// Decode wind direction and speed (kept for completeness)
const decodeWind = (windCode: string): { direction: number | null; speed: number | null } => {
  if (!windCode || windCode === "/////" || windCode.length < 5) {
    return { direction: null, speed: null }
  }

  const direction = Number.parseInt(windCode.substring(0, 3))
  const speed = Number.parseInt(windCode.substring(3, 5))

  if (isNaN(direction) || isNaN(speed)) {
    return { direction: null, speed: null }
  }

  let actualDirection = direction
  let actualSpeed = speed

  if (direction % 10 === 1 || direction % 10 === 6) {
    actualDirection = direction % 10 === 1 ? direction - 1 : direction - 6
    actualSpeed = speed + 100
  }

  return {
    direction: actualDirection * 10,
    speed: actualSpeed,
  }
}

export const decodeTTAA = (data: string): Partial<DecodedData> => {
  const parts = data.trim().split(/\s+/)
  const _errors: string[] = []

  if (parts.length < 4) {
    _errors.push("Invalid TTAA format - insufficient data")
    return { mandatoryLevels: [] }
  }

  const header = parts[1]
  const station = parts[2]

  const date = Number.parseInt(header.substring(0, 2)) - 50
  const time = Number.parseInt(header.substring(2, 4))

  const decodeCluster = (pphhhCode: string, tttaddCode: string, dddffCode: string) => {
    const pp = Number.parseInt(pphhhCode.substring(0, 2))
    const hhh = Number.parseInt(pphhhCode.substring(2, 5))

    let pressure = 0
    let height: number | null = null

    if (pp === 99) pressure = 1000
    else if (pp === 0) pressure = 1000
    else if (pp === 92) pressure = 925
    else if (pp === 85) pressure = 850
    else if (pp === 70) pressure = 700
    else if (pp === 50) pressure = 500
    else if (pp === 40) pressure = 400
    else if (pp === 30) pressure = 300
    else if (pp === 25) pressure = 250
    else if (pp === 20) pressure = 200
    else if (pp === 15) pressure = 150
    else if (pp === 10) pressure = 100
    else if (pp === 88) pressure = Number.parseInt(pphhhCode.substring(2, 5))
    else if (pp === 77) pressure = Number.parseInt(pphhhCode.substring(2, 5))
    else pressure = pp * 10

    if (!isNaN(hhh)) {
      height = convertHeightByPressure(hhh.toString(), pressure)
    }

    let temperature: number | null = null
    let dewpointDepression: number | null = null
    let dewpoint: number | null = null

    if (tttaddCode && tttaddCode !== "/////") {
      const ttt = Number.parseInt(tttaddCode.substring(0, 3))
      const dd = Number.parseInt(tttaddCode.substring(3, 5))

      if (!isNaN(ttt)) {
        const tempValue = ttt / 10
        const lastDigit = ttt % 10
        temperature = lastDigit % 2 === 0 ? tempValue : -tempValue
      }

      if (!isNaN(dd)) {
        dewpointDepression = decodeDewpointDepression(dd.toString().padStart(2, "0"))
        if (temperature !== null && dewpointDepression !== null) {
          dewpoint = temperature - dewpointDepression
        }
      }
    }

    let windDirection: number | null = null
    let windSpeed: number | null = null

    if (dddffCode && dddffCode !== "/////") {
      const ddd = Number.parseInt(dddffCode.substring(0, 3))
      const ff = Number.parseInt(dddffCode.substring(3, 5))

      if (!isNaN(ddd)) {
        windDirection = ddd
      }
      if (!isNaN(ff)) {
        windSpeed = ff
      }
    }

    return {
      pressure,
      height,
      temperature,
      dewpoint,
      dewpointDepression,
      windDirection,
      windSpeed,
    }
  }

  let surfacePressure = 996
  let surfaceTemperature = 0
  let surfaceDewpointDepression = 0
  let surfaceWindDirection = 0
  let surfaceWindSpeed = 0

  if (parts.length >= 6) {
    const surfacePressureCode = parts[3]
    const surfaceTempCode = parts[4]
    const surfaceWindCode = parts[5]

    surfacePressure = Number.parseInt(surfacePressureCode.substring(2))

    if (surfaceTempCode && surfaceTempCode !== "/////") {
      const surfaceTempValue = Number.parseInt(surfaceTempCode.substring(0, 3))
      const surfaceDDValue = Number.parseInt(surfaceTempCode.substring(3, 5))

      if (!isNaN(surfaceTempValue)) {
        const tempInTenths = surfaceTempValue / 10
        const lastDigit = surfaceTempValue % 10
        surfaceTemperature = lastDigit % 2 === 0 ? tempInTenths : -tempInTenths
      }

      if (!isNaN(surfaceDDValue)) {
        surfaceDewpointDepression = surfaceDDValue / 10
      }
    }

    if (surfaceWindCode && surfaceWindCode !== "/////") {
      const windDir = Number.parseInt(surfaceWindCode.substring(0, 3))
      const windSpd = Number.parseInt(surfaceWindCode.substring(3, 5))

      if (!isNaN(windDir)) surfaceWindDirection = windDir
      if (!isNaN(windSpd)) surfaceWindSpeed = windSpd
    }
  }

  const mandatoryLevels: DecodedLevel[] = []
  let tropopause: DecodedData["tropopause"] = null
  let maxWind: DecodedData["maxWind"] = null

  for (let i = 6; i < parts.length; i++) {
    const pphhhCode = parts[i]
    if (!pphhhCode) break

    if (pphhhCode.startsWith("88")) {
      if (i + 2 >= parts.length) break

      const tttaddCode = parts[i + 1]
      const dddffCode = parts[i + 2]

      const decoded = decodeCluster(pphhhCode, tttaddCode, dddffCode)

      tropopause = {
        pressure: decoded.pressure,
        temperature: decoded.temperature || 0,
        dewpoint: decoded.dewpoint || 0,
        windDirection: decoded.windDirection || 0,
        windSpeed: decoded.windSpeed || 0,
      }

      i += 2
    } else if (pphhhCode.startsWith("77")) {
      if (i + 1 >= parts.length) break

      const dddffCode = parts[i + 1]

      const pressureCode = pphhhCode.substring(2, 5)
      const pressure = Number.parseInt(pressureCode)

      let windDirection: number | null = null
      let windSpeed: number | null = null

      if (dddffCode && dddffCode !== "/////") {
        const ddd = Number.parseInt(dddffCode.substring(0, 3))
        const ff = Number.parseInt(dddffCode.substring(3, 5))

        if (!isNaN(ddd)) windDirection = ddd
        if (!isNaN(ff)) windSpeed = ff
      }

      maxWind = {
        pressure: pressure,
        windDirection: windDirection || 0,
        windSpeed: windSpeed || 0,
      }

      i += 1
    } else if (pphhhCode.startsWith("31")) {
      break
    } else {
      if (i + 2 >= parts.length) break

      const tttaddCode = parts[i + 1]
      const dddffCode = parts[i + 2]

      const decoded = decodeCluster(pphhhCode, tttaddCode, dddffCode)
      mandatoryLevels.push(decoded)

      i += 2
    }
  }

  return {
    station,
    date,
    time,
    surfacePressure,
    surfaceTemperature,
    surfaceDewpointDepression,
    surfaceWindDirection,
    surfaceWindSpeed,
    mandatoryLevels,
    tropopause,
    maxWind,
  }
}

export const decodeTTBB = (data: string): { significantLevels: DecodedLevel[] } => {
  const parts = data.trim().split(/\s+/)
  const significantLevels: DecodedLevel[] = []

  if (parts.length < 4) {
    return { significantLevels }
  }

  const header = parts[1]
  const _station = parts[2]

  const _day = Number.parseInt(header.substring(0, 2)) - 50
  const _time = Number.parseInt(header.substring(2, 4))

  let surfacePressureIndex = -1
  for (let i = 3; i < parts.length; i++) {
    if (parts[i].startsWith("00") && parts[i].length === 5) {
      surfacePressureIndex = i
      break
    }
  }

  if (surfacePressureIndex === -1) {
    return { significantLevels }
  }

  const surfacePressure = Number.parseInt(parts[surfacePressureIndex].substring(2))

  if (surfacePressureIndex + 1 < parts.length) {
    const surfaceTempCode = parts[surfacePressureIndex + 1]
    if (surfaceTempCode && surfaceTempCode.length === 5) {
      const tempValue = Number.parseInt(surfaceTempCode.substring(0, 3))
      const dewpointDepressionValue = Number.parseInt(surfaceTempCode.substring(3, 5))

      let surfaceTemp: number | null = null
      let surfaceDewpoint: number | null = null
      let surfaceDewpointDepression: number | null = null

      if (!isNaN(tempValue)) {
        const lastDigit = tempValue % 10
        surfaceTemp = lastDigit % 2 === 0 ? tempValue / 10 : -tempValue / 10
      }

      if (!isNaN(dewpointDepressionValue)) {
        surfaceDewpointDepression = dewpointDepressionValue / 10
        if (surfaceTemp !== null) {
          surfaceDewpoint = surfaceTemp - surfaceDewpointDepression
        }
      }

      significantLevels.push({
        pressure: surfacePressure,
        height: null,
        temperature: surfaceTemp,
        dewpoint: surfaceDewpoint,
        dewpointDepression: surfaceDewpointDepression,
        windDirection: null,
        windSpeed: null,
      })
    }
  }

  const separatorIndex = parts.findIndex((part) => part === "21212")

  let index = surfacePressureIndex + 2
  while (index < (separatorIndex === -1 ? parts.length : separatorIndex) && index + 1 < parts.length) {
    const pressureCode = parts[index]
    const tempCode = parts[index + 1]

    if (!pressureCode || !tempCode) break

    if (pressureCode.length === 5 && /^[1-9][1-9]\d{3}$/.test(pressureCode)) {
      const pressure = Number.parseInt(pressureCode.substring(2))
      if (!isNaN(pressure)) {
        let temperature: number | null = null
        let dewpoint: number | null = null
        let dewpointDepression: number | null = null

        if (tempCode.length === 5) {
          const tempValue = Number.parseInt(tempCode.substring(0, 3))
          const dewpointDepressionValue = Number.parseInt(tempCode.substring(3, 5))

          if (!isNaN(tempValue)) {
            const lastDigit = tempValue % 10
            temperature = lastDigit % 2 === 0 ? tempValue / 10 : -tempValue / 10
          }

          if (!isNaN(dewpointDepressionValue)) {
            dewpointDepression = dewpointDepressionValue / 10
            if (temperature !== null) {
              dewpoint = temperature - dewpointDepression
            }
          }
        }

        significantLevels.push({
          pressure,
          height: null,
          temperature,
          dewpoint,
          dewpointDepression,
          windDirection: null,
          windSpeed: null,
        })
      }
    }

    index += 2
  }

  if (separatorIndex !== -1) {
    let windIndex = separatorIndex + 1
    while (windIndex < parts.length && windIndex + 1 < parts.length) {
      const pressureCode = parts[windIndex]
      const windCode = parts[windIndex + 1]

      if (pressureCode === "31313") {
        break
      }

      if (!pressureCode || !windCode) break

      if (pressureCode.length === 5 && (/^00\d{3}$/.test(pressureCode) || /^[1-9][1-9]\d{3}$/.test(pressureCode))) {
        const pressure = Number.parseInt(pressureCode.substring(2))
        if (!isNaN(pressure)) {
          let windDirection: number | null = null
          let windSpeed: number | null = null

          if (windCode.length === 5) {
            const direction = Number.parseInt(windCode.substring(0, 3)) % 360
            const speed = Number.parseInt(windCode.substring(3, 5))

            if (!isNaN(direction)) {
              windDirection = direction
            }
            if (!isNaN(speed)) {
              windSpeed = speed
            }
          }

          const existingLevel = significantLevels.find((level) => level.pressure === pressure)
          if (existingLevel) {
            existingLevel.windDirection = windDirection
            existingLevel.windSpeed = windSpeed
          } else {
            significantLevels.push({
              pressure,
              height: null,
              temperature: null,
              dewpoint: null,
              dewpointDepression: null,
              windDirection,
              windSpeed,
            })
          }
        }
      }

      windIndex += 2
    }
  }

  significantLevels.sort((a, b) => b.pressure - a.pressure)

  return { significantLevels }
}
