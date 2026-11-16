// SPDX-License-Identifier: MIT
// Run: node test.mjs /absolute/path/to/kit
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from './parse.js';
import { marked } from './vendor/marked/marked.esm.js';

const kit = process.argv[2];
if (!kit) throw new Error('Provide the competition kit directory');
const cases = JSON.parse(readFileSync(resolve(kit, 'practice/input/cases.json'), 'utf8'));
let checked = 0;
function outcome(render, source) {
  try {
    return { value: render(source) };
  } catch (error) {
    return { name: error.name, message: error.message };
  }
}
function compare(source, label) {
  assert.deepEqual(outcome(parse, source), outcome(marked.parse, source), label);
  checked += 1;
}
const first = cases.map(({ markdown, id }) => {
  compare(markdown, id);
  return parse(markdown);
});
const second = cases.map(({ markdown }) => parse(markdown));
assert.equal(JSON.stringify(first), JSON.stringify(second));
for (let i = cases.length - 1; i >= 0; i -= 1) {
  assert.equal(parse(cases[i].markdown), first[i], `reverse ${cases[i].id}`);
}

// Fixed-seed generation is entirely in the test program, never the parser.
let seed = 0x146b31;
function next(limit) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) % limit;
}
const fragments = [
  'alpha', '  ', '\t', '\n', '\r\n', '# title\n', '> quote\n',
  '- item\n', '1. item\n', '***', '**a**', '_é_', '~~del~~',
  '`x`', '```js\nx\n```\n', '[label](url)', '[ref][x]',
  '[x]: /dest\n', '<b>x</b>', '<pre>raw &', '</pre>',
  'https://example.test/a', 'www.example.test', 'a@b.test',
  '&amp;', '&#0;', '\\*', 'a  \nb', '| a | b |\n|-|-|\n',
  '😀', '\u0000', '\ud800', '\u2028', '\\', '[', ']', '!',
];
for (let i = 0; i < 5000; i += 1) {
  let text = '';
  const length = 1 + next(16);
  for (let j = 0; j < length; j += 1) text += fragments[next(fragments.length)];
  compare(text, `generated ${i}: ${JSON.stringify(text)}`);
}
const punctuation = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
for (const left of punctuation) {
  for (const right of punctuation) {
    for (const middle of ['a', ' ', '\n', 'é', '😀']) {
      compare(`${left}${middle}${right}`, 'punctuation pair');
    }
  }
}
for (const value of [undefined, null, 0, 1, false, {}, [], new String('x')]) {
  compare(value, 'invalid argument');
}
const report = {
  practice: cases.length,
  random: 5000,
  punctuation: punctuation.length ** 2 * 5,
  totalDifferential: checked,
  deterministic: true,
  reverseOrder: true,
  invalidArguments: 8,
};
if (process.argv[3]) writeFileSync(process.argv[3], JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
