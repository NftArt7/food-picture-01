// Cheese-pull food picture for make.fun food-picture-01.
// The picture beside this file is an extreme close-up of a grilled cheese
// being pulled apart: molten strands stretching between two golden halves,
// steam curling up, one warm light against black. It is the most
// mouth-watering frame of the three candidates I shot for this bounty.
// This program just ships those bytes to the grader: it reads entry.png, proves it is a whole JPEG
// or PNG inside the 1 MiB cap, and writes it to the output directory.
// Same bytes in, same bytes out, every run. No network involved.
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath as toPath } from "node:url";

const folder = path.dirname(toPath(import.meta.url));
const destination = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const picture = fs.readFileSync(path.join(folder, "entry.png"));
const pngMagic = picture.length > 8 && picture[0] === 0x89 && picture[1] === 0x50 && picture[2] === 0x4e && picture[3] === 0x47;
const jpgMagic = picture.length > 3 && picture[0] === 0xff && picture[1] === 0xd8 && picture[2] === 0xff;
if (pngMagic === false && jpgMagic === false) {
  throw new Error("entry.png failed the magic-byte check: not a PNG or JPEG");
}
const lastTwo = picture.subarray(picture.length - 2);
const wholeJpg = jpgMagic && lastTwo[0] === 0xff && lastTwo[1] === 0xd9;
const tail = picture.subarray(picture.length - 12).toString("latin1");
const wholePng = pngMagic && tail.includes("IEND");
if (wholeJpg === false && wholePng === false) {
  throw new Error("entry.png looks cut off: no JPEG end marker or PNG IEND");
}
const ONE_MIB = 1024 * 1024;
if (picture.length > ONE_MIB) {
  throw new Error("entry.png is " + picture.length + " bytes, past the 1 MiB cap");
}
fs.mkdirSync(destination, { recursive: true });
const writtenTo = path.join(destination, "entry.png");
fs.writeFileSync(writtenTo, picture);
const label = pngMagic ? "PNG" : "JPEG";
console.log("wrote " + picture.length + " bytes (" + label + ") to " + writtenTo);
