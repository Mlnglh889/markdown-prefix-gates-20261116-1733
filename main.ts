// SPDX-License-Identifier: MIT
import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from './parse.js';

// Only the kit's documented mount-path overrides are read for local grading.
// They select files, never parser behavior or output variation for an input.
const inputPath = `${process.env.MAKEFUN_INPUT_DIR ?? '/input'}/cases.json`;
const outputPath = `${process.env.MAKEFUN_OUTPUT_DIR ?? '/output'}/html.json`;
const input = JSON.parse(readFileSync(inputPath, 'utf8'));
const rendered = new Array(input.length);
for (let index = 0; index < input.length; index += 1) {
  rendered[index] = parse(input[index].markdown);
}
writeFileSync(outputPath, JSON.stringify(rendered));
