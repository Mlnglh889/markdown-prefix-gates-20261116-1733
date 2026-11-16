// SPDX-License-Identifier: MIT
// Character-gated tokenization for the default marked 18.1.3 grammar.
// The MIT reference engine remains responsible for grammar and diagnostics.
import { Marked, Tokenizer, Lexer } from './vendor/marked/marked.esm.js';

// These are necessary conditions, never sufficient grammar recognizers.
// Each accepted branch delegates to the original tokenizer without changing
// the supplied source, lexer state, options, links, or returned token.
class GatedTokenizer extends Tokenizer {
  // Block prefixes allow up to three spaces. Tabs and four-space indentation
  // stay with the reference code tokenizer, which runs before these methods.
  blockMarker(source) {
    let offset = 0;
    while (offset < 3 && source.charCodeAt(offset) === 32) offset += 1;
    return source.charCodeAt(offset);
  }

  fences(source) {
    const marker = this.blockMarker(source);
    if (marker === 96 || marker === 126) return super.fences(source);
  }

  heading(source) {
    if (this.blockMarker(source) === 35) return super.heading(source);
  }

  hr(source) {
    const marker = this.blockMarker(source);
    if (marker === 42 || marker === 45 || marker === 95) return super.hr(source);
  }

  blockquote(source) {
    if (this.blockMarker(source) === 62) return super.blockquote(source);
  }

  list(source) {
    const marker = this.blockMarker(source);
    if (marker === 42 || marker === 43 || marker === 45 ||
        (marker >= 48 && marker <= 57)) {
      return super.list(source);
    }
  }

  html(source) {
    if (this.blockMarker(source) === 60) return super.html(source);
  }

  def(source) {
    if (this.blockMarker(source) === 91) return super.def(source);
  }

  escape(source) {
    if (source.charCodeAt(0) === 92) return super.escape(source);
  }

  tag(source) {
    if (source.charCodeAt(0) === 60) return super.tag(source);
  }

  link(source) {
    const first = source.charCodeAt(0);
    if (first === 91 || first === 33) return super.link(source);
  }

  reflink(source, links) {
    const first = source.charCodeAt(0);
    if (first === 91 || first === 33) return super.reflink(source, links);
  }

  emStrong(source, masked, previous) {
    const first = source.charCodeAt(0);
    if (first === 42 || first === 95) {
      return super.emStrong(source, masked, previous);
    }
  }

  codespan(source) {
    if (source.charCodeAt(0) === 96) return super.codespan(source);
  }

  br(source) {
    const first = source.charCodeAt(0);
    if (first === 32 || first === 92) return super.br(source);
  }

  del(source, masked, previous) {
    if (source.charCodeAt(0) === 126) {
      return super.del(source, masked, previous);
    }
  }

  autolink(source) {
    if (source.charCodeAt(0) === 60) return super.autolink(source);
  }
}

// Ampersands require marked's numeric-entity decoding even without markup.
const INLINE_SYNTAX = /[&\\<!\[\]`*_~\n\r:@.]/;

// A plain inline fragment cannot mutate inLink/inRawBlock/linkEmitted.
// Keep the raw-block escaped flag: raw HTML's content does not get escaped.
class GatedLexer extends Lexer {
  inlineTokens(source, tokens = []) {
    if (source.length !== 0 && !INLINE_SYNTAX.test(source)) {
      this.tokenizer.lexer = this;
      const last = tokens.at(-1);
      if (last?.type === 'text') {
        last.raw += source;
        last.text += source;
      } else {
        tokens.push({
          type: 'text',
          raw: source,
          text: source,
          escaped: this.state.inRawBlock,
        });
      }
      return tokens;
    }
    return super.inlineTokens(source, tokens);
  }
}

const engine = new Marked();
// Supply a new tokenizer per call: its lexer and recursive state are local.
engine.use({
  hooks: {
    provideLexer() {
      return (source, options) => {
        options.tokenizer = new GatedTokenizer(options);
        return new GatedLexer(options).lex(source);
      };
    },
  },
});

/** Render one independent string with marked's default HTML and errors. */
export function parse(markdown) {
  return engine.parse(markdown);
}
