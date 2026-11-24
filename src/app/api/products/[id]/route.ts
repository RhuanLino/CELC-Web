import type { ProductInput } from "@/modules/livraria/types";
import { apiErrorResponse } from "@/lib/api/client";
import { productCatalogApi } from "@/lib/api/livraria";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    return Response.json(await productCatalogApi.getById(id));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  let input: ProductInput;
  try {
    input = await request.json();
  } catch {
    return Response.json({ message: "Requisição inválida." }, { status: 400 });
  }

  try {
    const { id } = await params;
    return Response.json(await productCatalogApi.update(id, input));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    await productCatalogApi.remove(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
