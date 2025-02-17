import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

import { auth } from "@/auth";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/constants";
import { getUserById } from "@/server/lib/users";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const session = await auth();
        if (!session?.user) {
          throw new Error("No se encontró el usuario en la sesión");
        }
        return {
          allowedContentTypes: ACCEPTED_IMAGE_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE,
          tokenPayload: JSON.stringify({
            userId: session.user.id,
          }),
        };
      },
      onUploadCompleted: async ({ tokenPayload }) => {
        const { userId }: { userId: string } = JSON.parse(tokenPayload!);
        const user = await getUserById(userId);
        try {
          if (user && user.image) {
            await del(user.image as string);
          }
        } catch (error) {
          throw new Error("Error al actualizar el perfil");
        }
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
