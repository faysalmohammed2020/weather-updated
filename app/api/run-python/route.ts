import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file = data.get("file") as File;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadPath = path.join(process.cwd(), "public/uploads", file.name);
  fs.writeFileSync(uploadPath, buffer);

  const scriptPath = path.join(process.cwd(), "scripts", "process_netcdf.py");
  const python = spawn("python", [scriptPath, file.name]);

  return new Promise((resolve) => {
    let stdoutData = "";
    python.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    python.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    python.on("close", () => {
      try {
        const result = JSON.parse(stdoutData.replace(/'/g, '"'));
        resolve(NextResponse.json({ images: result }));
      } catch (e) {
        console.error("Parsing Error", e);
        resolve(NextResponse.json({ images: {} }));
      }
    });
  });
}
