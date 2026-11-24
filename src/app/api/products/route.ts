import type { ProductInput } from "@/modules/livraria/types";
import { apiErrorResponse } from "@/lib/api/client";
import { productCatalogApi } from "@/lib/api/livraria";

export async function GET() {
  try {
    return Response.json(await productCatalogApi.list());
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  let input: ProductInput;
  try {
    input = await request.json();
  } catch {
    return Response.json({ message: "Requisição inválida." }, { status: 400 });
  }

  try {
    return Response.json(await productCatalogApi.create(input), { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
