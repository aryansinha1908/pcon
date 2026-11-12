import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api-guard";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 5MB limit. Please upload a smaller image." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. If Cloudinary is configured via environment variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signatureStr = `timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");

        const cFormData = new FormData();
        cFormData.append("file", new Blob([buffer], { type: file.type }));
        cFormData.append("api_key", apiKey);
        cFormData.append("timestamp", String(timestamp));
        cFormData.append("signature", signature);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: cFormData,
        });

        if (uploadRes.ok) {
          const result = await uploadRes.json();
          return NextResponse.json({ url: result.secure_url });
        }
      } catch (err) {
        console.error("Cloudinary upload failed, falling back to local storage:", err);
      }
    }

    // 2. Safe local fallback storage in public/uploads
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `img_${Date.now()}_${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    return NextResponse.json(
      { error: "Upload failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}

