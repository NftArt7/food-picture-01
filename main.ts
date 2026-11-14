// food-picture-01 entry (Node 22, standard library only).
// The food picture is the entry.png beside this file: an extreme macro
// cheese-pull shot — two halves of a golden grilled cheese sandwich pulled
// apart, long glossy molten cheese strands stretching between them, toasted
// buttery bread, gentle steam, a single warm side light on a black
// background. The program copies it to the grader's output directory
// ($MAKEFUN_OUTPUT_DIR, else /output/entry.png), deterministic, no network.
// It first checks the file really is a whole PNG or JPEG (by magic bytes)
// and refuses to copy anything else, so a bad image fails loudly here
// instead of reaching the judge as garbage.
// Run locally: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const bytes = readFileSync(join(here, "entry.png"));
const isPng = bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
const isJpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
if (!isPng && !isJpeg) {
  throw new Error("entry.png is neither a PNG nor a JPEG (bad magic bytes)");
}
// Whole-image check: a JPEG must end with its EOI marker, a PNG with IEND.
const isWhole =
  (isJpeg && bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9) ||
  (isPng && bytes.length > 12 && bytes.subarray(bytes.length - 12).toString("latin1").includes("IEND"));
if (!isWhole) {
  throw new Error("entry.png looks truncated (missing JPEG EOI / PNG IEND)");
}
if (bytes.length > 1048576) {
  // The competition gate caps the picture at 1 MiB; refuse loudly rather
  // than shipping an entry the scorer would reject as invalid.
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB gate`);
}
mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.png");
writeFileSync(target, bytes);
console.log(`wrote ${bytes.length} bytes (${isPng ? "PNG" : "JPEG"}) to ${target}`);
