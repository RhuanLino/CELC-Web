import { apiErrorResponse } from "@/lib/api/client";
import { loadProductLookups } from "@/lib/api/livraria";

export async function GET() {
  try {
    return Response.json(await loadProductLookups());
  } catch (error) {
    return apiErrorResponse(error);
  }
}
