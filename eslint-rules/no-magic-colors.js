const colorFunctions = new Set(
  'rgb rgba hsl hsla hwb lab lch oklab oklch color'.split(' '),
);

// `transparent`, `currentcolor` and system colors are intentionally allowed
const namedColors = new Set(
  `aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen`.split(
    ' ',
  ),
);

const colorInRaw =
  /#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/i;

// Colors must come from the theme variables in `index.scss`
const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow color literals outside of the theme variables',
    },
    schema: [],
    messages: {
      magicColor:
        'Use a theme variable from index.scss instead of the color `{{color}}`.',
    },
  },
  create(context) {
    const report = (node, color) => {
      context.report({ node, messageId: 'magicColor', data: { color } });
    };

    return {
      'Declaration Hash'(node) {
        report(node, `#${node.value}`);
      },
      'Declaration Function'(node) {
        if (colorFunctions.has(node.name.toLowerCase())) {
          report(node, `${node.name}()`);
        }
      },
      'Declaration Identifier'(node) {
        if (namedColors.has(node.name.toLowerCase())) {
          report(node, node.name);
        }
      },
      // Custom property values aren't parsed
      'Declaration Raw'(node) {
        const match = colorInRaw.exec(node.value);
        if (match) {
          report(node, match[0]);
        }
      },
    };
  },
};

export default rule;
