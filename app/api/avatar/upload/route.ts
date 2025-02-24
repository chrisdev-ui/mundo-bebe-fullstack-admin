import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

import { auth } from "@/auth";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/constants";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ACCEPTED_IMAGE_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE,
          tokenPayload: JSON.stringify({
            userId: session.user.id,
          }),
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      { error: (error as Error).message || "Error al subir la imagen" },
      { status: 400 },
    );
  }
}
