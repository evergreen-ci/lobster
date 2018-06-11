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
        'react/jsx-key': 0
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

    'react/jsx-equals-spacing': 2,
    'react/jsx-wrap-multilines': 2,
    'react/jsx-closing-bracket-location': 2,

    // work towards enabling
    'react/destructuring-assignment': 0,
    'react/no-set-state': 0,
    'react/no-access-state-in-setstate': 0,
    'react/jsx-closing-tag-location': 0,
    'react/jsx-sort-props': 0,
    'react/sort-prop-types': 0,
    'react/sort-comp': 0,
    'react/require-default-props': 0,
    'react/no-unused-state': 0,
    'react/jsx-no-bind': 0,
    'react/self-closing-comp': 0,
    'react/require-optimization': 0,
    'react/forbid-component-props': 0,
    'react/jsx-tag-spacing': 0,
    'react/jsx-first-prop-new-line': 0,
    'react/no-this-in-sfc': 0,
    'react/prefer-stateless-function': 0,

    // might hurt development performance
    'react/forbid-prop-types': 0,
    // not sure about this yet
    'react/jsx-no-literals': 0,

    // no
    // --fix does weird things with this one
    'react/jsx-indent': 0,
    'react/jsx-indent-props': 0,
    // more annoying than valuable
    'react/no-multi-comp': 0,
    'react/jsx-max-depth': 0,
    'react/jsx-max-props-per-line': 0,
    'react/jsx-one-expression-per-line': 0,
    // rule conflict
    'react/jsx-curly-brace-presence': 0,
    // non-obvious terseness
    'react/jsx-boolean-value': 0,
    // Facebook discourages use of the .jsx extension, for better or for worse
    'react/jsx-filename-extension': [2, { 'extensions': ['.js']}]
  }
};
