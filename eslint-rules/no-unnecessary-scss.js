import * as sass from 'sass';

// Prefer plain CSS when a stylesheet doesn't use any Sass features
// https://github.com/sindresorhus/eslint-cssicorn/issues/50
const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Require the .css extension when a stylesheet doesn't use Sass",
    },
    schema: [],
    messages: {
      preferCss: "This file doesn't use any Sass features. Rename it to .css.",
    },
  },
  create(context) {
    if (!context.filename.endsWith('.scss')) {
      return {};
    }

    return {
      StyleSheet(node) {
        try {
          sass.compileString(context.sourceCode.text, {
            syntax: 'css',
            logger: sass.Logger.silent,
          });
        } catch {
          // Not valid plain CSS, so Sass is needed
          return;
        }

        context.report({ node, messageId: 'preferCss' });
      },
    };
  },
};

export default rule;
