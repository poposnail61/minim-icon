import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Font ID is required" }, { status: 400 });
        }

        const publicDir = path.join(process.cwd(), "public");
        const sourceDir = path.join(publicDir, "test", id);
        const targetDir = path.join(publicDir, "release", id);

        // Check source existence
        try {
            await fs.access(sourceDir);
        } catch {
            return NextResponse.json({ error: "Test font not found" }, { status: 404 });
        }

        // Clean target directory if exists
        await fs.rm(targetDir, { recursive: true, force: true });

        // Create target directory
        await fs.mkdir(targetDir, { recursive: true });

        // Copy all files recursively
        await fs.cp(sourceDir, targetDir, { recursive: true });

        // No need to rewrite CSS URLs because they are relative and valid in the new location too.

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Release error:", error);
        return NextResponse.json({ error: "Failed to release font" }, { status: 500 });
    }
}
