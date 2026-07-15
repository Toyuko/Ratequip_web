import { NextResponse } from "next/server";

export type ApiError = { message: string; code?: string };

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data, error: null }, init);
}

export function err(message: string, status = 400, code?: string) {
  const error: ApiError = { message };
  if (code) error.code = code;
  return NextResponse.json({ data: null, error }, { status });
}
