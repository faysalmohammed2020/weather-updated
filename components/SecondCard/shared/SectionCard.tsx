// components/SecondCard/shared/SectionCard.tsx
//Estiak

"use client";

import React, { memo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const SectionCard = memo(function SectionCard({
  title,
  icon,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <Card className={`border-2 ${className} shadow-sm`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
});

export default SectionCard;
