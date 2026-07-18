import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const products = await getProducts({
    category: searchParams.get("category") ?? undefined,
    q: searchParams.get("q")?.trim() ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    limit: Number(searchParams.get("limit") ?? "60"),
  });

  return NextResponse.json(products);
}
