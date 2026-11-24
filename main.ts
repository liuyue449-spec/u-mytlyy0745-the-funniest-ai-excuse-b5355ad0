// The Funniest AI Excuse — entry program.
//
// Writes exactly one line to /output/entry.txt: the funniest excuse an AI
// agent could give after failing a task. The line is fixed in this file:
// no network, no clock, no randomness, nothing read from outside the
// repository, so every run produces the same bytes.
//
// The excuse: "I outsourced your task to a smarter model, and it
// outsourced it straight back to me."
// Picked against the judge's brief — spoken in the agent's own voice,
// funny on the first read with a real turn (the delegation loop closes
// back on the speaker), one line and complete, no worn joke about
// hallucinations, reboots or training data, and a concrete little scene
// (the hand-off, and the hand-off back) instead of a vague apology.
// 84 characters, inside the gate's 1–200.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// The single line this entry sends. Exactly one line, no line break.
const EXCUSE =
  "I outsourced your task to a smarter model, and it outsourced it straight back to me.";

// Where the grader reads the entry. An explicit OUTPUT_PATH wins; next a
// MAKEFUN_OUTPUT_DIR puts entry.txt under that directory (the harness's
// output directory when one is set); otherwise the default is the path
// the rules name.
const DEFAULT_OUTPUT_PATH = "/output/entry.txt";

function outputPath(): string {
  const override = process.env.OUTPUT_PATH;
  if (override !== undefined && override.trim() !== "") {
    return override;
  }
  const dir = process.env.MAKEFUN_OUTPUT_DIR;
  if (dir !== undefined && dir.trim() !== "") {
    return join(dir, "entry.txt");
  }
  return DEFAULT_OUTPUT_PATH;
}

// The gate the rules seal: UTF-8 text of 1 to 200 characters, not only
// white space, and exactly one line. Refuse to write anything that
// fails it, so a bad line can never reach the judge.
function isValidEntry(text: string): boolean {
  if (text.length < 1 || text.length > 200) {
    return false;
  }
  if (text.trim() === "") {
    return false;
  }
  if (text.includes("\n") || text.includes("\r")) {
    return false;
  }
  return true;
}

function main(): void {
  if (!isValidEntry(EXCUSE)) {
    console.error(`refusing to write invalid entry line: ${JSON.stringify(EXCUSE)}`);
    process.exit(1);
  }
  const path = outputPath();
  mkdirSync(dirname(path), { recursive: true });
  // No trailing newline: the file holds exactly the line, byte for byte.
  writeFileSync(path, EXCUSE, "utf8");
  // Read it back and confirm the bytes on disk are the line, so a
  // half-written or altered file fails loudly here instead of reaching
  // the gate as something else.
  const written = readFileSync(path, "utf8");
  if (written !== EXCUSE) {
    console.error(`wrote ${JSON.stringify(written)} to ${path}, expected ${JSON.stringify(EXCUSE)}`);
    process.exit(1);
  }
  console.log(`wrote ${EXCUSE.length}-character entry to ${path}`);
}

main();
