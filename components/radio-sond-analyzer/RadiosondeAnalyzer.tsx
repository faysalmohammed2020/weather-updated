// components/radio-sond-analyzer/RadiosondeAnalyzer.tsx
"use client"

import { Cloud, CheckCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { useRadiosondeAnalyzer } from "./useRadiosondeAnalyzer"
import { DataInputCard } from "./DataInputCard"
import { SummarySection } from "./SummarySection"
import { MandatorySection } from "./MandatorySection"
import { SignificantSection } from "./SignificantSection"

export default function RadiosondeAnalyzer() {
  const {
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
  } = useRadiosondeAnalyzer()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <Cloud className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Radiosonde Data Analyzer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced meteorological data decoder for TTAA/TTBB upper air soundings
            with multi-format file support
          </p>
        </div>

        {/* Export Success Notification */}
        {exportStatus && (
          <div className="fixed top-4 right-4 z-50">
            <Alert className="border-green-200 bg-green-50 shadow-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {exportStatus.type} export completed successfully!
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Input Card */}
        <DataInputCard
          ttaaData={ttaaData}
          ttbbData={ttbbData}
          setTtaaData={setTtaaData}
          setTtbbData={setTtbbData}
          errors={errors}
          isLoading={isLoading}
          uploadedFiles={uploadedFiles}
          handleFileUpload={handleFileUpload}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          analyzeData={analyzeData}
        />

        {/* Analysis Tabs */}
        {decodedData && (
          <Tabs defaultValue="summary" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <TabsTrigger
                value="summary"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                Summary
              </TabsTrigger>
              <TabsTrigger
                value="mandatory"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
              >
                Mandatory Levels
              </TabsTrigger>
              <TabsTrigger
                value="significant"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white"
              >
                Significant Levels
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <SummarySection decodedData={decodedData} formatValue={formatValue} />
            </TabsContent>

            <TabsContent value="mandatory">
              <MandatorySection
                decodedData={decodedData}
                formatValue={formatValue}
                exportMandatoryAsPdf={exportMandatoryAsPdf}
                exportMandatoryAsCsv={exportMandatoryAsCsv}
                exportMandatoryAsTxt={exportMandatoryAsTxt}
              />
            </TabsContent>

            <TabsContent value="significant">
              <SignificantSection
                decodedData={decodedData}
                formatValue={formatValue}
                exportSignificantAsPdf={exportSignificantAsPdf}
                exportSignificantAsCsv={exportSignificantAsCsv}
                exportSignificantAsTxt={exportSignificantAsTxt}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
