// components/radio-sond-analyzer/useRadiosondeAnalyzer.ts
"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { jsPDF } from "jspdf"
import { decodeTTAA, decodeTTBB, type DecodedData, type DecodedLevel } from "./radiosondeDecoders"

// অন্য কম্পোনেন্টগুলো যেন আগের মতোই কাজ করে,
// তাই এখান থেকেও type re-export করে দিচ্ছি
export type { DecodedData, DecodedLevel } from "./radiosondeDecoders"

export function useRadiosondeAnalyzer() {
  const [ttaaData, setTtaaData] = useState("")
  const [ttbbData, setTtbbData] = useState("")
  const [decodedData, setDecodedData] = useState<DecodedData | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [exportStatus, setExportStatus] = useState<{
    type: string
    success: boolean
  } | null>(null)

  // File processing function
  const processFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        resolve(content)
      }
      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`))
      }

      if (file.type === "application/pdf") {
        reader.readAsText(file)
      } else if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        reader.readAsText(file)
      } else {
        reader.readAsText(file)
      }
    })
  }

  // Handle file upload
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files || files.length === 0) return

      setIsLoading(true)
      setErrors([])

      try {
        const fileArray = Array.from(files)
        setUploadedFiles(fileArray)

        let combinedContent = ""

        for (const file of fileArray) {
          try {
            const content = await processFile(file)
            if (file.type === "text/csv" || file.name.endsWith(".csv")) {
              const lines = content.split("\n").filter((line) => line.trim())
              combinedContent += lines.join(" ") + "\n"
            } else {
              combinedContent += content + "\n"
            }
          } catch (error) {
            setErrors((prev) => [
              ...prev,
              `Error processing ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
            ])
          }
        }

        const lines = combinedContent.split("\n").filter((line) => line.trim())
        let ttaaContent = ""
        let ttbbContent = ""
        let currentSection: "TTAA" | "TTBB" | "" = ""

        for (const line of lines) {
          if (line.includes("TTAA")) {
            currentSection = "TTAA"
            ttaaContent += line + "\n"
          } else if (line.includes("TTBB")) {
            currentSection = "TTBB"
            ttbbContent += line + "\n"
          } else if (currentSection === "TTAA") {
            ttaaContent += line + "\n"
          } else if (currentSection === "TTBB") {
            ttbbContent += line + "\n"
          } else {
            ttaaContent += line + "\n"
          }
        }

        setTtaaData(ttaaContent.trim() || combinedContent.trim())
        setTtbbData(ttbbContent.trim())
      } catch (error) {
        setErrors([`File processing error: ${error instanceof Error ? error.message : "Unknown error"}`])
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()

      const files = e.dataTransfer.files
      if (files.length > 0) {
        const fakeEvent = {
          target: { files },
        } as React.ChangeEvent<HTMLInputElement>
        await handleFileUpload(fakeEvent)
      }
    },
    [handleFileUpload],
  )

  const analyzeData = () => {
    setErrors([])
    setIsLoading(true)

    if (!ttaaData.trim()) {
      setErrors(["TTAA data is required"])
      setIsLoading(false)
      return
    }

    try {
      const ttaaDecoded = decodeTTAA(ttaaData)
      const ttbbDecoded = ttbbData.trim() ? decodeTTBB(ttbbData) : { significantLevels: [] }

      const combined: DecodedData = {
        station: ttaaDecoded.station || "",
        date: ttaaDecoded.date || 0,
        time: ttaaDecoded.time || 0,
        surfacePressure: ttaaDecoded.surfacePressure || 0,
        surfaceTemperature: ttaaDecoded.surfaceTemperature || 0,
        surfaceDewpointDepression: ttaaDecoded.surfaceDewpointDepression || 0,
        surfaceWindDirection: ttaaDecoded.surfaceWindDirection || 0,
        surfaceWindSpeed: ttaaDecoded.surfaceWindSpeed || 0,
        mandatoryLevels: ttaaDecoded.mandatoryLevels || [],
        significantLevels: ttbbDecoded.significantLevels,
        tropopause: ttaaDecoded.tropopause ?? null,
        maxWind: ttaaDecoded.maxWind ?? null,
      }

      setDecodedData(combined)
    } catch (error) {
      setErrors([`Error decoding data: ${error instanceof Error ? error.message : "Unknown error"}`])
    } finally {
      setIsLoading(false)
    }
  }

  const formatValue = (value: number | null, unit = "", decimals = 1): string => {
    if (value === null) return "N/A"
    return `${value.toFixed(decimals)}${unit}`
  }

  const showExportSuccess = (type: string) => {
    setExportStatus({ type, success: true })
    setTimeout(() => setExportStatus(null), 3000)
  }

  const exportMandatoryAsTxt = () => {
    if (!decodedData) return

    const currentDate = new Date().toISOString().split("T")[0]
    const currentTime = new Date().toLocaleTimeString()

    let txtContent = `RADIOSONDE DATA ANALYSIS REPORT - MANDATORY LEVELS
${"=".repeat(60)}

STATION INFORMATION:
  Station ID: ${decodedData.station}
  Observation Date: Day ${decodedData.date}
  Observation Time: ${String(decodedData.time).padStart(2, "0")}:00 UTC
  Report Generated: ${currentDate} at ${currentTime}

SURFACE CONDITIONS:
  Pressure: ${decodedData.surfacePressure} mb
  Temperature: ${formatValue(decodedData.surfaceTemperature, "°C")}
  Dewpoint Depression: ${formatValue(decodedData.surfaceDewpointDepression, "°C")}
  Wind Direction: ${decodedData.surfaceWindDirection}°
  Wind Speed: ${decodedData.surfaceWindSpeed} knots

MANDATORY PRESSURE LEVELS:
${"=".repeat(60)}
${"Pressure".padEnd(10)} ${"Height".padEnd(10)} ${"Temp".padEnd(8)} ${"Dewpt".padEnd(8)} ${"WDir".padEnd(6)} ${"WSpd".padEnd(6)}
${"(mb)".padEnd(10)} ${"(m)".padEnd(10)} ${"(°C)".padEnd(8)} ${"(°C)".padEnd(8)} ${"(°)".padEnd(6)} ${"(kt)".padEnd(6)}
${"-".repeat(60)}
`

    decodedData.mandatoryLevels
      .filter((level) => level.pressure >= 100)
      .forEach((level) => {
        txtContent += `${level.pressure.toString().padEnd(10)} ${(level.height?.toString() || "N/A").padEnd(
          10,
        )} ${formatValue(level.temperature, "").padEnd(8)} ${formatValue(level.dewpoint, "").padEnd(
          8,
        )} ${formatValue(level.windDirection, "", 0).padEnd(6)} ${formatValue(level.windSpeed, "", 0).padEnd(6)}\n`
      })

    if (decodedData.tropopause) {
      txtContent += `\nTROPOPAUSE LEVEL:
${"-".repeat(30)}
  Pressure: ${decodedData.tropopause.pressure} mb
  Temperature: ${formatValue(decodedData.tropopause.temperature, "°C")}
  Dewpoint: ${formatValue(decodedData.tropopause.dewpoint, "°C")}
  Wind Direction: ${decodedData.tropopause.windDirection}°
  Wind Speed: ${decodedData.tropopause.windSpeed} knots
`
    }

    if (decodedData.maxWind) {
      txtContent += `\nMAXIMUM WIND LEVEL:
${"-".repeat(30)}
  Pressure: ${decodedData.maxWind.pressure} mb
  Wind Direction: ${decodedData.maxWind.windDirection}°
  Wind Speed: ${decodedData.maxWind.windSpeed} knots
`
    }

    txtContent += `\n${"=".repeat(60)}
Total Mandatory Levels: ${decodedData.mandatoryLevels.filter((l) => l.pressure >= 100).length}
Report End
${"=".repeat(60)}`

    const blob = new Blob([txtContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mandatory_levels_${decodedData.station}_${currentDate}.txt`
    a.click()
    URL.revokeObjectURL(url)
    showExportSuccess("TXT")
  }

  const exportMandatoryAsCsv = () => {
    if (!decodedData) return

    let csv = `Station,Date,Time,Pressure (mb),Height (m),Temperature (°C),Dewpoint (°C),Dewpoint Depression (°C),Wind Direction (°),Wind Speed (kt)\n`

    decodedData.mandatoryLevels
      .filter((level) => level.pressure >= 100)
      .forEach((level) => {
        csv += `${decodedData.station},Day ${decodedData.date},${String(decodedData.time).padStart(
          2,
          "0",
        )}:00,${level.pressure},${level.height ?? ""},${level.temperature ?? ""},${level.dewpoint ?? ""},${
          level.dewpointDepression ?? ""
        },${level.windDirection ?? ""},${level.windSpeed ?? ""}\n`
      })

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mandatory_levels_${decodedData.station}_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showExportSuccess("CSV")
  }

  const exportMandatoryAsPdf = () => {
    if (!decodedData) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 20
    let y = margin

    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("RADIOSONDE DATA ANALYSIS - MANDATORY LEVELS", pageWidth / 2, y, { align: "center" })
    y += 15

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(
      `Station: ${decodedData.station} | Date: Day ${decodedData.date} | Time: ${String(decodedData.time).padStart(
        2,
        "0",
      )}:00 UTC`,
      margin,
      y,
    )
    y += 10
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, y)
    y += 15

    doc.setFont("helvetica", "bold")
    doc.text("SURFACE CONDITIONS:", margin, y)
    y += 8
    doc.setFont("helvetica", "normal")
    doc.text(
      `Pressure: ${decodedData.surfacePressure} mb | Temperature: ${formatValue(decodedData.surfaceTemperature, "°C")}`,
      margin,
      y,
    )
    y += 6
    doc.text(`Wind: ${decodedData.surfaceWindDirection}° at ${decodedData.surfaceWindSpeed} knots`, margin, y)
    y += 15

    doc.setFont("helvetica", "bold")
    doc.text("MANDATORY LEVELS:", margin, y)
    y += 8
    doc.setFont("helvetica", "normal")
    doc.text("Press(mb)  Height(m)  Temp(°C)  Dewpt(°C)  WDir(°)  WSpd(kt)", margin, y)
    y += 6

    decodedData.mandatoryLevels
      .filter((level) => level.pressure >= 100)
      .forEach((level) => {
        if (y > 270) {
          doc.addPage()
          y = margin
        }
        const row = `${level.pressure.toString().padEnd(8)} ${(level.height?.toString() || "N/A").padEnd(
          10,
        )} ${formatValue(level.temperature, "").padEnd(8)} ${formatValue(level.dewpoint, "").padEnd(
          9,
        )} ${formatValue(level.windDirection, "", 0).padEnd(7)} ${formatValue(level.windSpeed, "", 0)}`
        doc.text(row, margin, y)
        y += 6
      })

    if (decodedData.tropopause) {
      y += 10
      if (y > 250) {
        doc.addPage()
        y = margin
      }
      doc.setFont("helvetica", "bold")
      doc.text("TROPOPAUSE:", margin, y)
      y += 6
      doc.setFont("helvetica", "normal")
      doc.text(
        `${decodedData.tropopause.pressure} mb | ${formatValue(
          decodedData.tropopause.temperature,
          "°C",
        )} | Wind: ${decodedData.tropopause.windDirection}°/${decodedData.tropopause.windSpeed}kt`,
        margin,
        y,
      )
    }

    if (decodedData.maxWind) {
      y += 10
      if (y > 250) {
        doc.addPage()
        y = margin
      }
      doc.setFont("helvetica", "bold")
      doc.text("MAXIMUM WIND:", margin, y)
      y += 6
      doc.setFont("helvetica", "normal")
      doc.text(
        `${decodedData.maxWind.pressure} mb | Wind: ${decodedData.maxWind.windDirection}°/${decodedData.maxWind.windSpeed}kt`,
        margin,
        y,
      )
    }

    doc.save(`mandatory_levels_${decodedData.station}_${new Date().toISOString().split("T")[0]}.pdf`)
    showExportSuccess("PDF")
  }

  const exportSignificantAsTxt = () => {
    if (!decodedData) return

    const currentDate = new Date().toISOString().split("T")[0]
    const currentTime = new Date().toLocaleTimeString()

    let txtContent = `RADIOSONDE DATA ANALYSIS REPORT - SIGNIFICANT LEVELS
${"=".repeat(65)}

STATION INFORMATION:
  Station ID: ${decodedData.station}
  Observation Date: Day ${decodedData.date}
  Observation Time: ${String(decodedData.time).padStart(2, "0")}:00 UTC
  Report Generated: ${currentDate} at ${currentTime}

SIGNIFICANT PRESSURE LEVELS:
${"=".repeat(65)}
${"Pressure".padEnd(10)} ${"Temp".padEnd(8)} ${"Dewpt".padEnd(8)} ${"Depr".padEnd(8)} ${"WDir".padEnd(6)} ${"WSpd".padEnd(
      6,
    )} ${"Type".padEnd(10)}
${"(mb)".padEnd(10)} ${"(°C)".padEnd(8)} ${"(°C)".padEnd(8)} ${"(°C)".padEnd(8)} ${"(°)".padEnd(6)} ${"(kt)".padEnd(
      6,
    )} ${" ".padEnd(10)}
${"-".repeat(65)}
`

    decodedData.significantLevels.forEach((level) => {
      const levelType = level.pressure === decodedData.surfacePressure ? "Surface" : "Significant"
      txtContent += `${level.pressure.toString().padEnd(10)} ${formatValue(level.temperature, "").padEnd(
        8,
      )} ${formatValue(level.dewpoint, "").padEnd(8)} ${formatValue(level.dewpointDepression, "").padEnd(
        8,
      )} ${formatValue(level.windDirection, "", 0).padEnd(6)} ${formatValue(level.windSpeed, "", 0).padEnd(
        6,
      )} ${levelType.padEnd(10)}\n`
    })

    txtContent += `\nDATA SUMMARY:
${"-".repeat(30)}
Total Significant Levels: ${decodedData.significantLevels.length}
Temperature Levels: ${decodedData.significantLevels.filter((l) => l.temperature !== null).length}
Dewpoint Levels: ${decodedData.significantLevels.filter((l) => l.dewpoint !== null).length}
Wind Levels: ${decodedData.significantLevels.filter((l) => l.windSpeed !== null).length}
Surface Level Included: ${
      decodedData.significantLevels.some((l) => l.pressure === decodedData.surfacePressure) ? "Yes" : "No"
    }

Maximum Wind Speed: ${Math.max(...decodedData.significantLevels.map((l) => l.windSpeed || 0))} knots
Average Wind Speed: ${Math.round(
      decodedData.significantLevels
        .filter((l) => l.windSpeed !== null)
        .reduce((sum, l) => sum + (l.windSpeed || 0), 0) /
        decodedData.significantLevels.filter((l) => l.windSpeed !== null).length,
    )} knots

${"=".repeat(65)}
Report End
${"=".repeat(65)}`

    const blob = new Blob([txtContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `significant_levels_${decodedData.station}_${currentDate}.txt`
    a.click()
    URL.revokeObjectURL(url)
    showExportSuccess("TXT")
  }

  const exportSignificantAsCsv = () => {
    if (!decodedData) return

    let csv = `Station,Date,Time,Pressure (mb),Temperature (°C),Dewpoint (°C),Dewpoint Depression (°C),Wind Direction (°),Wind Speed (kt),Level Type\n`

    decodedData.significantLevels.forEach((level) => {
      const levelType = level.pressure === decodedData.surfacePressure ? "Surface" : "Significant"
      csv += `${decodedData.station},Day ${decodedData.date},${String(decodedData.time).padStart(
        2,
        "0",
      )}:00,${level.pressure},${level.temperature ?? ""},${level.dewpoint ?? ""},${level.dewpointDepression ?? ""},${
        level.windDirection ?? ""
      },${level.windSpeed ?? ""},${levelType}\n`
    })

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `significant_levels_${decodedData.station}_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showExportSuccess("CSV")
  }

  const exportSignificantAsPdf = () => {
    if (!decodedData) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 20
    let y = margin

    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("RADIOSONDE DATA ANALYSIS - SIGNIFICANT LEVELS", pageWidth / 2, y, { align: "center" })
    y += 15

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(
      `Station: ${decodedData.station} | Date: Day ${decodedData.date} | Time: ${String(decodedData.time).padStart(
        2,
        "0",
      )}:00 UTC`,
      margin,
      y,
    )
    y += 10
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, y)
    y += 15

    doc.setFont("helvetica", "bold")
    doc.text("SIGNIFICANT LEVELS:", margin, y)
    y += 8
    doc.setFont("helvetica", "normal")
    doc.text("Press(mb)  Temp(°C)  Dewpt(°C)  Depr(°C)  WDir(°)  WSpd(kt)  Type", margin, y)
    y += 6

    decodedData.significantLevels.forEach((level) => {
      if (y > 270) {
        doc.addPage()
        y = margin
      }
      const levelType = level.pressure === decodedData.surfacePressure ? "Surface" : "Signif"
      const row = `${level.pressure.toString().padEnd(8)} ${formatValue(level.temperature, "").padEnd(
        8,
      )} ${formatValue(level.dewpoint, "").padEnd(9)} ${formatValue(level.dewpointDepression, "").padEnd(
        8,
      )} ${formatValue(level.windDirection, "", 0).padEnd(7)} ${formatValue(level.windSpeed, "", 0).padEnd(
        7,
      )} ${levelType}`
      doc.text(row, margin, y)
      y += 6
    })

    y += 10
    if (y > 250) {
      doc.addPage()
      y = margin
    }
    doc.setFont("helvetica", "bold")
    doc.text("SUMMARY:", margin, y)
    y += 6
    doc.setFont("helvetica", "normal")
    doc.text(
      `Total Levels: ${decodedData.significantLevels.length} | Max Wind: ${Math.max(
        ...decodedData.significantLevels.map((l) => l.windSpeed || 0),
      )} kt`,
      margin,
      y,
    )

    doc.save(`significant_levels_${decodedData.station}_${new Date().toISOString().split("T")[0]}.pdf`)
    showExportSuccess("PDF")
  }

  return {
    ttaaData,
    setTtaaData,
    ttbbData,
    setTtbbData,
    decodedData,
    errors,
    isLoading,
    uploadedFiles,
    exportStatus,
    handleFileUpload,
    handleDragOver,
    handleDrop,
    analyzeData,
    formatValue,
    exportMandatoryAsTxt,
    exportMandatoryAsCsv,
    exportMandatoryAsPdf,
    exportSignificantAsTxt,
    exportSignificantAsCsv,
    exportSignificantAsPdf,
  }
}
