const ENABLE_NO_DEBUGGER = process.env.CI === 'true' ? 2 : 1;
module.exports = {
  'parser': 'babel-eslint',
  'extends': ['eslint-config-mongodb-js', 'eslint-config-mongodb-js/rules/ecmascript-6',
    'plugin:jest/recommended', 'plugin:react/recommended'],
  'root': true,
  'env': {
    'es6': true
  },
  'overrides': [
    {
      'files': ['src/**/*.js', 'src/**/*.jsx'],
      'excludedFiles': ['src/**/*.spec.js*', 'src/**/*.test.js*', 'src/setupTests.js'],
      'env': {
        'browser': true
      },
      'plugins': ['react', 'babel'],
      'parserOptions': {
        'sourceType': 'module',
        'ecmaFeatures': {
          'jsx': true
        }
      }
    },
    {
      'files': ['src/**/*.spec.js*', 'src/**/*.test.js*', 'src/setupTests.js'],
      'env': {
        'browser': true
      },
      'plugins': ['react', 'jest', 'babel'],
      'parserOptions': {
        'sourceType': 'module',
        'ecmaFeatures': {
          'jsx': true
        }
      },
      'rules': {
        'no-debugger': ENABLE_NO_DEBUGGER,
        'react/jsx-key': 0,
        'react/jsx-no-bind': 0
      }
    },
    {
      'files': ['server/**/*.js', 'generate-tasks.js', '.eslintrc.js'],
      'env': {
        'node': true,
        'parserOptions': {
          'sourceType': 'scripts'
        }
      },
      'rules': {
        'no-sync': 0
      }
    }
  ],
  'rules': {
    'complexity': 'off',
    'no-console': 'off',
    'no-unused-vars': ['error', {'argsIgnorePattern': '^_'}],

    // Enable a more strict set of react lints
    'react/jsx-closing-bracket-location': 2,
    'react/jsx-closing-tag-location': 2,
    'react/jsx-equals-spacing': 2,
    'react/jsx-no-bind': 2,
    'react/jsx-tag-spacing': 2,
    'react/jsx-wrap-multilines': 2,
    'react/prefer-stateless-function': [2, {'ignorePureComponents': true}],
    'react/self-closing-comp': [2, {html: false, component: true}],
    'react/jsx-first-prop-new-line': [2, 'multiline'],

    // work towards making these errors
    'react/no-access-state-in-setstate': 1,

    // work towards enabling
    'react/jsx-sort-props': 0,
    'react/no-set-state': 0,
    'react/no-this-in-sfc': 0,
    'react/require-default-props': 0,
    'react/require-optimization': 0,
    'react/sort-prop-types': 0,
    'react/sort-comp': 0,

    // might hurt development performance
    'react/forbid-prop-types': 0,
    // not sure about this yet
    'react/jsx-no-literals': 0,
    'react/destructuring-assignment': 0,

    // The No List
    // --fix does weird things with this one
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
    // Facebook discourages use of the .jsx extension, for better or for worse
    'react/jsx-filename-extension': [2, { 'extensions': ['.js']}],
    // Prevents us from setting classes on buttons
    'react/forbid-component-props': 0
  }
};
