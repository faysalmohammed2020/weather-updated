"use client";

import { useState } from "react";

interface FileData {
  csvs?: Record<string, string>;
}

export default function UploadAndVisualizeCsv() {
  const [fileData, setFileData] = useState<FileData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_ENDPOINT =
    "https://django-netcdf-visualizer.onrender.com/api/upload-csv/";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file extension
    if (!file.name.endsWith(".nc")) {
      setError("Please upload a valid NetCDF file (.nc extension)");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError(null);
    setFileData({});

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process file");
      }

      const data = await response.json();
      setFileData({
        csvs: data.csvs,
      });
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to process file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          NetCDF to CSV Converter
        </h1>
        <p className="text-gray-600 mt-2">
          Upload your NetCDF file to extract data as CSV
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <label className="block mb-4">
          <span className="block text-sm font-medium text-gray-700 mb-2">
            Select NetCDF File
          </span>
          <input
            type="file"
            accept=".nc"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            disabled={loading}
          />
        </label>

        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-4 text-gray-700">Processing your file...</span>
          </div>
        )}
      </div>

      {/* CSV Export Section */}
      {fileData.csvs && Object.keys(fileData.csvs).length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Data Exports
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(fileData.csvs).map((key) => (
              <div
                key={key}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 text-center mb-2">
                    {key.replace(/_/g, " ").toUpperCase()}
                  </h3>
                </div>
                <div className="p-4 bg-gray-50">
                  <a
                    href={`https://django-netcdf-visualizer.onrender.com${fileData.csvs[key]}`}
                    download
                    className="flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download CSV
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
