"use client";

import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";

export default function UserTableSkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="animate-pulse">
          <TableCell className="p-3">
            <div className="h-4 w-40 bg-slate-200 rounded" />
          </TableCell>
          <TableCell className="p-3">
            <div className="h-4 w-52 bg-slate-200 rounded" />
          </TableCell>
          <TableCell className="p-3">
            <div className="h-4 w-24 bg-slate-200 rounded" />
          </TableCell>
          <TableCell className="p-3">
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </TableCell>
          <TableCell className="p-3">
            <div className="h-4 w-32 bg-slate-200 rounded" />
          </TableCell>
          <TableCell className="p-3">
            <div className="h-4 w-28 bg-slate-200 rounded" />
          </TableCell>
          <TableCell className="p-3">
            <div className="flex gap-2">
              <div className="h-8 w-16 bg-slate-200 rounded" />
              <div className="h-8 w-20 bg-slate-200 rounded" />
              <div className="h-8 w-24 bg-slate-200 rounded" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
