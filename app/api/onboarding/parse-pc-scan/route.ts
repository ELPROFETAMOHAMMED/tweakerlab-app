import { type NextRequest, NextResponse } from "next/server";
// import { parseMSInfo } from "@/lib/parsers/modular-msinfo-parser";

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: "Este endpoint está obsoleto. Usa /upload-pc-scan con el parser principal."
  }, { status: 410 });
}
