// app/dashboard/data-entry/first-card/tabs/MeteorsTab.tsx

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Thermometer, ChevronLeft, ChevronRight,  } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  formik: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  prevTab: () => void;
  nextTab: () => void;
  cardClassName: string;
};

const MeteorsTab: React.FC<Props> = ({
  formik,
  handleChange,
  prevTab,
  nextTab,
  cardClassName,
}) => {
  return (
    <Card className={cn("overflow-hidden", cardClassName)}>
      <div className="p-4 bg-linear-to-r from-emerald-100 to-emerald-200 text-blue-800">
        <h3 className="text-lg font-semibold flex items-center">
          <Thermometer className="mr-2" /> Mise Meteors(Code)
        </h3>
      </div>
      <CardContent className="pt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="miscMeteors">Misc Meteors(Code)</Label>
          <Input
            id="miscMeteors"
            name="miscMeteors"
            value={formik.values.miscMeteors || ""}
            onChange={handleChange}
            className="border-slate-600 transition-all focus:border-orange-500 focus:ring-orange-500/30"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-6">
        <Button type="button" variant="outline" onClick={prevTab}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button
          type="button"
          onClick={nextTab}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MeteorsTab;
