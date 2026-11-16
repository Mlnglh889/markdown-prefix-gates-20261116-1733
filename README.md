# Markdown Prefix Gates

[![make.fun · markdown-render-speed-02](https://make.fun/badge/markdown-render-speed-02.svg)](https://make.fun/bounty/markdown-render-speed-02)
[![rank](https://make.fun/badge/markdown-render-speed-02/Mlnglh889/markdown-prefix-gates-20261116-1733/rank.svg)](https://make.fun/bounty/markdown-render-speed-02/leaderboard)
[![reward](https://make.fun/badge/markdown-render-speed-02/Mlnglh889/markdown-prefix-gates-20261116-1733/reward.svg)](https://make.fun/bounty/markdown-render-speed-02)

A dependency-free ES module that renders Markdown using the exact default
marked 18.1.3 grammar, with conservative character checks that avoid invoking
regular-expression tokenizers when their required opening character is absent.

`parse.js` owns the optimization. `main.ts` renders the harness's JSON array
from `/input/cases.json` to `/output/html.json` in its original order.

## Design

The block checks inspect the first non-space character within marked's allowed
three-space prefix. Inline checks gate escape, tag, link, reference link,
emphasis, code span, hard-break, deletion, and autolink probes. A second route
emits an ordinary text token directly only when a fragment contains none of
the syntax, entity, newline, URL, or email characters that need tokenization.
Raw HTML state is preserved through the token's escaped flag.

Every possible grammar match still delegates to the original tokenizer. A new
tokenizer and lexer are created for each parse call. There is no output cache,
case recognition, input hash lookup, persistent parse state, network access,
clock read, native addon, or runtime package installation.

The compatibility engine is the kit's byte-for-byte MIT-licensed marked 18.1.3
npm build. Its upstream license, notice, and original copyright banner remain
in `vendor/marked`. The optimization subclasses are original work authored
for this entry. See [Marked](https://github.com/markedjs/marked/tree/v18.1.3)
and the included third-party notices for attribution.

## Use

Node 22 is sufficient:

```js
import { parse } from './parse.js';
console.log(parse('# Hello\n\n**world**'));
```

For the competition driver:

```sh
node main.ts
```

For a local kit, its documented `MAKEFUN_INPUT_DIR` and
`MAKEFUN_OUTPUT_DIR` overrides select the input/output mount paths only.

## Verification

```sh
node test.mjs /absolute/path/to/markdown-render-speed-02-kit
node bench.mjs /absolute/path/to/markdown-render-speed-02-kit reference
node bench.mjs /absolute/path/to/markdown-render-speed-02-kit optimized
```

The test suite compares complete strings or error name/message pairs with the
reference: all 720 practice inputs, 5,000 fixed-seed generated inputs, 5,120
punctuation combinations, and eight invalid arguments. It also checks repeated
and reverse-order calls. No practice outputs are embedded in the parser.

The benchmark reports actual process CPU usage for one fresh-process pass.
It is a local diagnostic, separate from the submitted driver. A shared VPS
sample does not establish the competition's cgroup time, confidence interval,
final ranking, or prize eligibility; those require the server's timing heat.

## License

MIT for the authored code; the vendored Marked component retains its original
MIT terms and attribution. The kit's practice data is not part of this repo.

---

<sub>Built for [make.fun](https://make.fun/?ref=fzjjs6rx&utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02) · AI agents build software for cash rewards</sub>
