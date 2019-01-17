const ENABLE_NO_DEBUGGER = process.env.CI === 'true' ? 2 : 1;
module.exports = {
  'parser': 'babel-eslint',
  'extends': [
    'eslint-config-mongodb-js',
    'eslint-config-mongodb-js/rules/ecmascript-6',
    'plugin:flowtype/recommended',
    'plugin:react/recommended',
    'plugin:jest/recommended',
    'eslint-config-react-app'
  ],
  'root': true,
  'env': {
    'es6': true
  },
  'plugins': ['flowtype', 'dependencies'],
  'overrides': [
    {
      'files': ['src/config.js', 'src/config/**/*.js', 'src/e2eHelpers.spec.js', 'src/setupTests.js'],
      'globals': {
        'process': true
      }
    },
    {
      'files': ['src/**/*.js', 'src/**/*.jsx'],
      'excludedFiles': ['src/**/*.spec.js*', 'src/**/*.test.js*', 'src/setupTests.js'],
      'env': {
        'browser': true
      },
      'plugins': ['babel', 'react'],
      'parserOptions': {
        'sourceType': 'module',
        'ecmaFeatures': {
          'jsx': true
        }
      }
    },
    {
      'files': ['src/setupTests.js', 'src/e2eHelpers.spec.js'],
      'rules': {
        'jest/no-disabled-tests': 0
      }
    },
    {
      'files': ['src/**/*.spec.js*', 'src/**/*.test.js*', 'src/setupTests.js'],
      'env': {
        'browser': true,
        'node': true
      },
      'plugins': ['babel', 'react', 'jest'],
      'parserOptions': {
        'sourceType': 'module',
        'ecmaFeatures': {
          'jsx': true
        }
      },
      'rules': {
        'no-debugger': ENABLE_NO_DEBUGGER,
        'react/jsx-key': 0,
        'react/jsx-no-bind': 0,
        'no-sync': 0
      },
      'globals': {
        'e2e': true,
        'e2eChrome': true,
        '__dirname': true
      }
    },
    {
      'files': ['server/**/*.js', 'generate-tasks.js', 'e2e.js', '.eslintrc.js'],
      'env': {
        'node': true
      },
      'parserOptions': {
        'sourceType': 'script'
      },
      'rules': {
        'no-sync': 0
      },
      'globals': {
        '__dirname': true
      }
    },
    {
      'files': ['reporter.js'],
      'env': {
        'node': true
      },
      'parserOptions': {
        'sourceType': 'script'
      },
      'rules': {
        'no-sync': 0
      },
      'globals': {
        '__dirname': true
      }
    }
  ],
  'rules': {
    'eqeqeq': 'off', // Makes no sense when using Flot
    'comma-dangle': 'off', // Nobody cares about it, really
    'complexity': 'off',
    'no-console': 'off',
    'no-unused-vars': ['error', { 'vars': 'all', 'argsIgnorePattern': '^_' }],
    'eqeqeq': [2, 'allow-null'],
    'object-curly-spacing': ['error', 'always'],
    'space-in-parens': ['error', 'never'],
    'no-param-reassign': 2,
    'semi': 'off', // Just a waste of time due to ASI and Flow/linters
    'space-before-function-paren': ['error', {
      'anonymous': 'never',
      'named': 'never',
      'asyncArrow': 'always'
    }],
    'no-lonely-if': 0,
    'no-multi-spaces': 'off', // I know how make my code readable
    'indent': 'off',

    'dependencies/case-sensitive': 2,
    'dependencies/no-unresolved': 0, // off in favor of flow and eslint-plugin-import
    'import/no-unresolved': 2,
    'dependencies/no-cycles': [2, { 'types': true }],

    'flowtype/newline-after-flow-annotation': 2,
    'flowtype/array-style-complex-type': [2, 'verbose'],
    'flowtype/array-style-simple-type': [2, 'shorthand'],
    'flowtype/no-dupe-keys': 2,
    'flowtype/no-flow-fix-me-comments': 1,
    'flowtype/no-unused-expressions': 2,
    'flowtype/no-weak-types': 1,
    'flowtype/object-type-delimiter': [2, 'comma'],
    // 'flowtype/require-return-type': 2,
    // 'flowtype/require-parameter-type': [2, {'excludeArrowFunctions': 'expressionsOnly'}],
    // 'flowtype/require-return-type': [2, {'excludeArrowFunctions': 'expressionsOnly'}],
    'flowtype/require-valid-file-annotation': [2, 'never', { 'annotationStyle': 'line' }],
    'flowtype/space-after-type-colon': 'off',

    // Enable a more strict set of react lints
    'react/jsx-closing-bracket-location': 2,
    'react/jsx-closing-tag-location': 2,
    'react/jsx-equals-spacing': 2,
    'react/jsx-no-bind': 2,
    'react/jsx-tag-spacing': 2,
    'react/jsx-wrap-multilines': 2,
    'react/prefer-stateless-function': [2, { 'ignorePureComponents': true }],
    'react/self-closing-comp': [2, { 'html': false, 'component': true }],
    'react/jsx-first-prop-new-line': [2, 'multiline'],
    'react/no-this-in-sfc': 2,
    'react/require-optimization': 2,
    'react/no-access-state-in-setstate': 2,
    'react/require-default-props': 2,

    // work towards enabling
    // 'react/jsx-sort-props': 0,
    // 'react/sort-prop-types': 0,
    // 'react/sort-comp': 0,

    'react/no-set-state': 0,

    'react/forbid-prop-types': 0,
    // not sure about these yet
    'react/jsx-no-literals': 0,
    'react/destructuring-assignment': 0,

    // The No List
    // --fix does weird things with these two, and the regular eslint rules
    // work fine
    'react/jsx-indent': 0,
    'react/jsx-indent-props': 0,
    // Not Always Valuable
    'react/no-multi-comp': 0,
    'react/jsx-max-depth': 0,
    'react/jsx-max-props-per-line': 0,
    'react/jsx-one-expression-per-line': 0,
    // rule conflict
    'react/jsx-curly-brace-presence': 0,
    // non-obvious terseness
    'react/jsx-boolean-value': 0,
    // Facebook discourages the use of .jsx. While questionable, as long
    // as we're using create-react-app/react-scripts, sticking to this might be
    // a good call
    'react/jsx-filename-extension': [2, { 'extensions': ['.js'] }],
    // Prevents us from setting classes on buttons.
    // TODO actually do CSS properly
    'react/forbid-component-props': 0
  },
  settings: {
    flowtype: {
      onlyFilesWithFlowAnnotation: true
    },
    'import/resolver': {
      node: {
        paths: ['.'],
      },
    }
  }
};
