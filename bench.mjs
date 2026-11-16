// SPDX-License-Identifier: MIT
// Local diagnostic only. The submitted driver never imports this module.
import { readFileSync } from 'node:fs';
import { parse } from './parse.js';
import { marked } from './vendor/marked/marked.esm.js';

const cases = JSON.parse(readFileSync(`${process.argv[2]}/practice/input/cases.json`, 'utf8'));
const render = process.argv[3] === 'reference' ? marked.parse : parse;
const before = process.cpuUsage();
let bytes = 0;
for (const { markdown } of cases) bytes += render(markdown).length;
const elapsed = process.cpuUsage(before);
console.log(JSON.stringify({
  engine: process.argv[3],
  cases: cases.length,
  outputCodeUnits: bytes,
  cpuUs: elapsed.user + elapsed.system,
  userUs: elapsed.user,
  systemUs: elapsed.system,
}));
