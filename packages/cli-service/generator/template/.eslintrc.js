module.exports = {
  extends: [
    'standard',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended'
  ],
  // 下面的rules是用来设置从插件来的代码规范的规则，使用必须去掉前缀eslint-plugin-
  rules: {
    'no-console': 0,
    'space-before-function-paren': 'off',
    'no-unused-vars': 2,
    'import/no-unresolved': [2, { commonjs: true, amd: true }],
    'import/named': 2,
    'import/namespace': 2,
    'import/default': 2,
    'import/export': 2,
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          ['internal', 'parent', 'sibling', 'index'],
          'unknown'
        ],
        pathGroups: [
          {
            pattern: '@**/**',
            group: 'external',
            position: 'after'
          },
          {
            pattern: './**',
            patternOptions: {},
            group: 'internal',
            position: 'after'
          }
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always',
        alphabetize: {
          // order: 'asc',
          caseInsensitive: true
          // orderImportKind: 'asc'
        }
      }
    ]
  },
  plugins: ['import', 'react-hooks', '@typescript-eslint'],
  // 指定eslint解析器，解析器必须符合规则，使用ts parser
  parser: '@typescript-eslint/parser',
  settings: {
    'import/resolver': {
      // node: {
      //   extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      //   alias: {
      //     map: [['@', './src']]
      //   }
      // },
      alias: {
        map: [['@', './src']],
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },
  parserOptions: {
    sourceType: 'module',
    // ecmaVersion: 2019,
    // project: 'tsconfig.json',
    ecmaFeatures: {
      jsx: true,
      tsx: true
    }
  },
  // 指定环境的全局变量
  env: {
    es6: true,
    node: true,
    browser: true
  }
}
