import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import worker from "../worker/index.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = process.argv[2] || path.join(projectRoot, "YunSuChong_Interactive_Prototype.html");
const response = await worker.fetch(new Request("https://prototype.local/"));

if (!response.ok) throw new Error(`Prototype export failed: ${response.status}`);

await writeFile(outputPath, await response.text(), "utf8");
console.log(`Exported ${outputPath}`);
