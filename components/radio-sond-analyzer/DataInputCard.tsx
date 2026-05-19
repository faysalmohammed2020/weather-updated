// components/radio-sond-analyzer/DataInputCard.tsx
"use client"

import type React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  Cloud,
  FileText,
  File,
  Loader2,
  Upload,
} from "lucide-react"

interface DataInputCardProps {
  ttaaData: string
  ttbbData: string
  setTtaaData: (v: string) => void
  setTtbbData: (v: string) => void
  errors: string[]
  isLoading: boolean
  uploadedFiles: File[]
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void
  analyzeData: () => void
}

export function DataInputCard({
  ttaaData,
  ttbbData,
  setTtaaData,
  setTtbbData,
  errors,
  isLoading,
  uploadedFiles,
  handleFileUpload,
  handleDragOver,
  handleDrop,
  analyzeData,
}: DataInputCardProps) {
  return (
    <Card className="overflow-hidden gap-0 border-0 bg-white/80 py-0 shadow-xl backdrop-blur-sm">
      <CardHeader className="bg-linear-to-r from-blue-500 via-indigo-500 to-purple-600 px-6 py-5 text-white">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
            <Upload className="h-6 w-6" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-blue-50 uppercase ring-1 ring-white/20">
              Data Input
            </div>
            <CardTitle className="text-2xl font-bold leading-tight text-white md:text-3xl">
              Radiosonde Data Analyzer
            </CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-relaxed text-blue-100 md:text-base">
              Advanced meteorological data decoder for TTAA/TTBB upper air soundings with multi-format file support. Upload files or enter data manually below.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* File Upload Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-700">File Upload</span>
          </div>
          <div
            className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                ) : (
                  <Upload className="h-6 w-6 text-blue-600" />
                )}
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {isLoading ? "Processing files..." : "Drop files here or click to browse"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports TXT, CSV, PDF files up to 10MB each
                </p>
              </div>
            </div>
            <Input
              id="file-input"
              type="file"
              multiple
              accept=".txt,.csv,.pdf,.dat"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading}
            />
          </div>
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-green-100 text-green-800 border-green-200"
                  >
                    <File className="h-3 w-3 mr-1" />
                    {file.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator className="my-6" />

        {/* Manual Input Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-gray-700">Manual Input</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                TTAA Data (Required)
              </label>
              <Textarea
                placeholder="TTAA 51231 03808 99996 07819 17005 00057 ///// ///// 92698..."
                value={ttaaData}
                onChange={(e) => setTtaaData(e.target.value)}
                rows={4}
                className="font-mono text-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                TTBB Data (Optional)
              </label>
              <Textarea
                placeholder="TTBB 51238 03808 00996 07819 11995 08018 22990..."
                value={ttbbData}
                onChange={(e) => setTtbbData(e.target.value)}
                rows={4}
                className="font-mono text-sm border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={analyzeData}
            className="flex-1 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Cloud className="mr-2 h-4 w-4" />
                Analyze Data
              </>
            )}
          </Button>
        </div>

        {errors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
