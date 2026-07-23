import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const cjsDirectory = resolve(import.meta.dirname, "..", "dist", "cjs");
await mkdir(cjsDirectory, { recursive: true });
await writeFile(resolve(cjsDirectory, "package.json"), '{"type":"commonjs"}\n');
