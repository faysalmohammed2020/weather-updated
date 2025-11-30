"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

export const LogsFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [action, setAction] = useState(searchParams.get("action") || "");
  const [role, setRole] = useState(searchParams.get("role") || "");
  const [module, setModule] = useState(searchParams.get("module") || "");
  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || ""
  );
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");

  // Debounce timer for search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Apply filters function
  const applyFilters = useCallback(
    (
      searchVal: string,
      actionVal: string,
      roleVal: string,
      moduleVal: string,
      startDateVal: string,
      endDateVal: string
    ) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset to page 1 when applying filters
      params.set("page", "1");

      // Set or remove search params
      if (searchVal.trim()) {
        params.set("search", searchVal);
      } else {
        params.delete("search");
      }

      if (actionVal) {
        params.set("action", actionVal);
      } else {
        params.delete("action");
      }

      if (roleVal) {
        params.set("role", roleVal);
      } else {
        params.delete("role");
      }

      if (moduleVal.trim()) {
        params.set("module", moduleVal);
      } else {
        params.delete("module");
      }

      if (startDateVal) {
        params.set("startDate", startDateVal);
      } else {
        params.delete("startDate");
      }

      if (endDateVal) {
        params.set("endDate", endDateVal);
      } else {
        params.delete("endDate");
      }

      router.replace(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, pathname, searchParams]
  );

  // Real-time filter effect
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search (500ms delay for search field)
    searchTimeoutRef.current = setTimeout(() => {
      applyFilters(search, action, role, module, startDate, endDate);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search, action, role, module, startDate, endDate, applyFilters]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setAction("");
    setRole("");
    setModule("");
    setStartDate("");
    setEndDate("");

    const params = new URLSearchParams();
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  }, [router, pathname]);

  const hasActiveFilters =
    search || action || role || module || startDate || endDate;

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <Input
            placeholder="Search by name, email, action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Action Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Action
          </label>
          <Select value={action || "all"} onValueChange={(val) => setAction(val === "all" ? "" : val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="CREATE">Create</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <Select value={role || "all"} onValueChange={(val) => setRole(val === "all" ? "" : val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="station_admin">Station Admin</SelectItem>
              <SelectItem value="observer">Observer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Module Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Module
          </label>
          <Input
            placeholder="Search module..."
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Start Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full"
          />
        </div>

        {/* End Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Action Buttons */}
      {hasActiveFilters && (
        <div className="flex gap-2 mt-4">
          <Button
            onClick={clearFilters}
            variant="outline"
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Search: {search}
                <button
                  onClick={() => setSearch("")}
                  className="ml-1 hover:text-blue-600"
                >
                  ✕
                </button>
              </span>
            )}
            {action && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Action: {action}
                <button
                  onClick={() => setAction("")}
                  className="ml-1 hover:text-green-600"
                >
                  ✕
                </button>
              </span>
            )}
            {role && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                Role: {role}
                <button
                  onClick={() => setRole("")}
                  className="ml-1 hover:text-purple-600"
                >
                  ✕
                </button>
              </span>
            )}
            {module && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                Module: {module}
                <button
                  onClick={() => setModule("")}
                  className="ml-1 hover:text-orange-600"
                >
                  ✕
                </button>
              </span>
            )}
            {startDate && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                From: {startDate}
                <button
                  onClick={() => setStartDate("")}
                  className="ml-1 hover:text-yellow-600"
                >
                  ✕
                </button>
              </span>
            )}
            {endDate && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                To: {endDate}
                <button
                  onClick={() => setEndDate("")}
                  className="ml-1 hover:text-yellow-600"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
