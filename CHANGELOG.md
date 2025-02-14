# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-02-14

### Added

- Support nested provider of same type, by [@compulim](https://github.com/compulim) in PR [#64](https://github.com/compulim/react-chain-of-responsibility/pull/64)
   - Components will be built using middleware from `<Provider>` closer to the `<Proxy>` and fallback to those farther away
- Support `<Provider>`-less usage if `fallbackComponent` is specified, by [@compulim](https://github.com/compulim) in PR [#65](https://github.com/compulim/react-chain-of-responsibility/pull/65)
- Support omitting `init` or `request` props in `<Provider>` and `<Proxy>` if they are of type `void`, by [@compulim](https://github.com/compulim) in PR [#66](https://github.com/compulim/react-chain-of-responsibility/pull/66)

### Changed

- 💢 Moved build tools from Babel to tsup/esbuild
- 💢 Outside of `<Provider>`, when `useBuildComponentCallback` and `<Proxy>` is used with `fallbackComponent`, they will render the fallback component and no longer throwing exception
- Bumped dependencies, by [@compulim](https://github.com/compulim), in PR [#49](https://github.com/compulim/react-chain-of-responsibility/pull/49), [#58](https://github.com/compulim/react-chain-of-responsibility/pull/58), [#63](https://github.com/compulim/react-chain-of-responsibility/pull/63), and [#67](https://github.com/compulim/react-chain-of-responsibility/pull/67)
   - Production dependencies
      - [`@babel/runtime-corejs3@7.24.6`](https://npmjs.com/package/@babel/runtime-corejs3)
   - Development dependencies
      - [`@babel/cli@7.24.6`](https://npmjs.com/package/@babel/cli)
      - [`@babel/core@7.24.6`](https://npmjs.com/package/@babel/core/v/7.24.6)
      - [`@babel/plugin-transform-runtime@7.24.6`](https://npmjs.com/package/@babel/plugin-transform-runtime)
      - [`@babel/preset-env@7.24.7`](https://npmjs.com/package/@babel/preset-env/v/7.24.7)
      - [`@babel/preset-react@7.24.7`](https://npmjs.com/package/@babel/preset-react/v/7.24.7)
      - [`@babel/preset-typescript@7.24.7`](https://npmjs.com/package/@babel/preset-typescript/v/7.24.7)
      - [`@fluentui/react@8.119.0`](https://npmjs.com/package/@fluentui/react/v/8.119.0)
      - [`@testing-library/dom@10.2.0`](https://npmjs.com/package/@testing-library/dom/v/10.2.0)
      - [`@testing-library/react@16.0.0`](https://npmjs.com/package/@testing-library/react/v/16.0.0)
      - [`@tsconfig/recommended@1.0.6`](https://npmjs.com/package/@tsconfig/recommended)
      - [`@tsconfig/strictest@2.0.5`](https://npmjs.com/package/@tsconfig/strictest/v/2.0.5)
      - [`@types/jest@29.5.12`](https://npmjs.com/package/@types/jest/v/29.5.12)
      - [`@types/node@20.14.9`](https://npmjs.com/package/@types/node/v/20.14.9)
      - [`@types/react-dom@18.3.0`](https://npmjs.com/package/@types/react-dom/v/18.3.0)
      - [`@types/react@18.3.3`](https://npmjs.com/package/@types/react/v/18.3.3)
      - [`esbuild@0.21.5`](https://npmjs.com/package/esbuild/v/0.21.5)
      - [`jest-environment-jsdom@29.7.0`](https://npmjs.com/package/jest-environment-jsdom/v/29.7.0)
      - [`jest@29.7.0`](https://npmjs.com/package/jest/v/29.7.0)
      - [`prettier@3.3.2`](https://npmjs.com/package/prettier/v/3.3.2)
      - [`react-dom@18.3.1`](https://npmjs.com/package/react-dom/v/18.3.1)
      - [`react-test-renderer@18.3.1`](https://npmjs.com/package/react-test-renderer/v/18.3.1)
      - [`react@18.3.1`](https://npmjs.com/package/react/v/18.3.1)
      - [`tsup@8.1.0`](https://npmjs.com/package/tsup/v/8.1.0)
      - [`typescript@5.5.2`](https://npmjs.com/package/typescript/v/5.5.2)
- Added [ESLint import/export syntax](https://npmjs.com/package/eslint-plugin-import), in PR [#68](https://github.com/compulim/react-chain-of-responsibility/pull/68)
- Added [`publint`](https://npmjs.com/package/publint), in PR [#68](https://github.com/compulim/react-chain-of-responsibility/pull/68)
- Bumped dependencies, in PR [#70](https://github.com/compulim/react-chain-of-responsibility/pull/70)
  - Development dependencies
    - [`@babel/preset-env@7.25.8`](https://npmjs.com/package/@babel/preset-env/v/7.25.8)
    - [`@babel/preset-react@7.25.7`](https://npmjs.com/package/@babel/preset-react/v/7.25.7)
    - [`@babel/preset-typescript@7.25.7`](https://npmjs.com/package/@babel/preset-typescript/v/7.25.7)
    - [`@fluentui/react@8.121.4`](https://npmjs.com/package/@fluentui/react/v/8.121.4)
    - [`@testing-library/dom@10.4.0`](https://npmjs.com/package/@testing-library/dom/v/10.4.0)
    - [`@testing-library/react@16.0.1`](https://npmjs.com/package/@testing-library/react/v/16.0.1)
    - [`@tsconfig/recommended@1.0.7`](https://npmjs.com/package/@tsconfig/recommended/v/1.0.7)
    - [`@types/jest@29.5.13`](https://npmjs.com/package/@types/jest/v/29.5.13)
    - [`@types/node@22.7.5`](https://npmjs.com/package/@types/node/v/22.7.5)
    - [`@types/react@18.3.11`](https://npmjs.com/package/@types/react/v/18.3.11)
    - [`@types/react-dom@18.3.1`](https://npmjs.com/package/@types/react-dom/v/18.3.1)
    - [`@typescript-eslint/eslint-plugin@8.8.1`](https://npmjs.com/package/@typescript-eslint/eslint-plugin/v/8.8.1)
    - [`@typescript-eslint/parser@8.8.1`](https://npmjs.com/package/@typescript-eslint/parser/v/8.8.1)
    - [`esbuild@0.24.0`](https://npmjs.com/package/esbuild/v/0.24.0)
    - [`eslint@9.12.0`](https://npmjs.com/package/eslint/v/9.12.0)
    - [`eslint-plugin-prettier@5.2.1`](https://npmjs.com/package/eslint-plugin-prettier/v/5.2.1)
    - [`eslint-plugin-react@7.37.1`](https://npmjs.com/package/eslint-plugin-react/v/7.37.1)
    - [`prettier@3.3.3`](https://npmjs.com/package/prettier/v/3.3.3)
    - [`tsup@8.3.0`](https://npmjs.com/package/tsup/v/8.3.0)
    - [`typescript@5.6.3`](https://npmjs.com/package/typescript/v/5.6.3)

### Removed

- 💢 Removed named exports, please import the defaults instead
   - Use `import { createChainOfResponsibility } from 'react-chain-of-responsibility'` instead
   - `import { createChainOfResponsibilityForFluentUI } from 'react-chain-of-responsibility/fluentUI'` for Fluent UI renderer function

## [0.1.0] - 2024-04-01

### Changed

- Relaxed peer dependencies requirements to `react@>=16.8.0`, by [@compulim](https://github.com/compulim) in PR [#45](https://github.com/compulim/react-chain-of-responsibility/pull/45)
- Bumped dependencies, by [@compulim](https://github.com/compulim), in PR [#42](https://github.com/compulim/react-chain-of-responsibility/pull/42), [#43](https://github.com/compulim/react-chain-of-responsibility/pull/43), and [#45](https://github.com/compulim/react-chain-of-responsibility/pull/45)
   - Production dependencies
      - [`@babel/runtime-corejs3@7.24.1`](https://npmjs.com/package/@babel/runtime-corejs3)
   - Development dependencies
      - [`@babel/cli@7.24.1`](https://npmjs.com/package/@babel/cli)
      - [`@babel/core@7.24.3`](https://npmjs.com/package/@babel/core)
      - [`@babel/plugin-transform-runtime@7.24.3`](https://npmjs.com/package/@babel/plugin-transform-runtime)
      - [`@babel/preset-env@7.24.3`](https://npmjs.com/package/@babel/preset-env)
      - [`@babel/preset-react@7.24.1`](https://npmjs.com/package/@babel/preset-react)
      - [`@babel/preset-typescript@7.24.1`](https://npmjs.com/package/@babel/preset-typescript)
      - [`@fluentui/react@8.117.0`](https://npmjs.com/package/@fluentui/react)
      - [`@testing-library/react@14.2.2`](https://npmjs.com/package/@testing-library/react)
      - [`@tsconfig/recommended@1.0.4`](https://npmjs.com/package/@tsconfig/recommended)
      - [`@tsconfig/strictest@2.0.4`](https://npmjs.com/package/@tsconfig/strictest)
      - [`@types/jest@29.5.12`](https://npmjs.com/package/@types/jest)
      - [`@types/node@20.11.30`](https://npmjs.com/package/@types/node)
      - [`@types/react@18.2.70`](https://npmjs.com/package/@types/react)
      - [`@typescript-eslint/eslint-plugin@7.4.0`](https://npmjs.com/package/@typescript-eslint/eslint-plugin)
      - [`@typescript-eslint/parser@7.4.0`](https://npmjs.com/package/@typescript-eslint/parser)
      - [`esbuild@0.20.2`](https://npmjs.com/package/esbuild)
      - [`eslint-plugin-prettier@5.1.3`](https://npmjs.com/package/eslint-plugin-prettier)
      - [`eslint-plugin-react@7.34.1`](https://npmjs.com/package/eslint-plugin-react)
      - [`eslint@8.57.0`](https://npmjs.com/package/eslint)
      - [`prettier@3.2.5`](https://npmjs.com/package/prettier)
      - [`react-wrap-with@0.1.0`](https://npmjs.com/package/react-wrap-with)
      - [`typescript@5.4.3`](https://npmjs.com/package/typescript)
- Updated pull request validation to test against various React versions, in PR [#44](https://github.com/compulim/react-chain-of-responsibility/pull/44)
   - Moved from JSX Runtime to JSX Classic to support testing against React 16
   - Added NPM scripts `switch:react:*` to provide a one-way door to switch to a specific React version for testing purpose

## [0.0.2] - 2023-10-09

### Changed

- Added type-checking for test, by [@compulim](https://github.com/compulim), in PR [#20](https://github.com/compulim/react-chain-of-responsibility/pull/20)
- Updates `tsconfig.json` to extend from [`@tsconfig/strictest`](https://npmjs.com/package/@tsconfig/strictest), by [@compulim](https://github.com/compulim), in PR [#20](https://github.com/compulim/react-chain-of-responsibility/pull/20)
- Bumped dependencies, by [@compulim](https://github.com/compulim), in PR [#24](https://github.com/compulim/react-chain-of-responsibility/pull/24), and PR [#36](https://github.com/compulim/react-chain-of-responsibility/pull/36)
   - Production dependencies
      - [`@babel/runtime-corejs3@7.23.1`](https://npmjs.com/package/@babel/runtime-corejs3)
   - Development dependencies
      - [`@babel/cli@7.23.0`](https://npmjs.com/package/@babel/cli)
      - [`@babel/core@7.23.0`](https://npmjs.com/package/@babel/core)
      - [`@babel/preset-env@7.22.20`](https://npmjs.com/package/@babel/preset-env)
      - [`@babel/preset-typescript@7.23.0`](https://npmjs.com/package/@babel/preset-typescript)
      - [`@fluentui/react@8.112.2`](https://npmjs.com/package/@fluentui/react)
      - [`@testing-library/react@14.0.0`](https://npmjs.com/package/@testing-library/react)
      - [`@tsconfig/recommended@1.0.3`](https://npmjs.com/package/@tsconfig/recommended)
      - [`@types/jest@29.5.5`](https://npmjs.com/package/@types/jest)
      - [`@types/node@20.8.3`](https://npmjs.com/package/@types/node)
      - [`@types/react@18.2.25`](https://npmjs.com/package/@types/react)
      - [`@typescript-eslint/eslint-plugin@6.7.4`](https://npmjs.com/package/@typescript-eslint/eslint-plugin)
      - [`@typescript-eslint/parser@6.7.4`](https://npmjs.com/package/@typescript-eslint/parser)
      - [`esbuild@0.19.4`](https://npmjs.com/package/esbuild)
      - [`eslint@8.51.0`](https://npmjs.com/package/eslint)
      - [`jest-environment-jsdom@29.7.0`](https://npmjs.com/package/jest-environment-jsdom)
      - [`jest@29.7.0`](https://npmjs.com/package/jest)
      - [`react-dom@18.2.0`](https://npmjs.com/package/react-dom)
      - [`react-test-renderer@18.2.0`](https://npmjs.com/package/react-test-renderer)
      - [`react-wrap-with@0.0.4`](https://npmjs.com/package/react-wrap-with)
      - [`react@18.2.0`](https://npmjs.com/package/react)

### Fixed

- Updated `exports` field to workaround [TypeScript resolution bug](https://github.com/microsoft/TypeScript/issues/50762), by [@compulim](https://github.com/compulim), in PR [#20](https://github.com/compulim/react-chain-of-responsibility/pull/20)
- Fixed [#32](https://github.com/compulim/react-chain-of-responsibility/issues/32), readonly middleware array should not return type error, by [@compulim](https://github.com/compulim), in PR [#33](https://github.com/compulim/react-chain-of-responsibility/pull/33)
- Fixed [#29](https://github.com/compulim/react-chain-of-responsibility/issues/29), support `memo()` and other built-in components, by [@compulim](https://github.com/compulim), in PR [#34](https://github.com/compulim/react-chain-of-responsibility/pull/34)

## [0.0.1] - 2023-03-21

### Added

- First public release

### Changed

- Bumped dependencies, by [@compulim](https://github.com/compulim), in PR [#1](https://github.com/compulim/react-chain-of-responsibility/pull/1)
   -  Production dependencies
      -  [`@babel/runtime-corejs3@7.21.0`](https://npmjs.com/package/@babel/runtime-corejs3)
   -  Development dependencies
      -  [`@babel/cli@7.21.0`](https://npmjs.com/package/@babel/cli)
      -  [`@babel/core@7.21.0`](https://npmjs.com/package/@babel/core)
      -  [`@babel/plugin-transform-runtime@7.21.0`](https://npmjs.com/package/@babel/plugin-transform-runtime)
      -  [`@babel/preset-typescript@7.21.0`](https://npmjs.com/package/@babel/preset-typescript)
      -  [`@types/node@18.14.0`](https://npmjs.com/package/@types/node)
      -  [`@types/react@17.0.53`](https://npmjs.com/package/@types/react)
      -  [`@typescript-eslint/eslint-plugin@5.53.0`](https://npmjs.com/package/@typescript-eslint/eslint-plugin)
      -  [`@typescript-eslint/parser@5.53.0`](https://npmjs.com/package/@typescript-eslint/parser)
      -  [`esbuild@0.17.10`](https://npmjs.com/package/esbuild)
      -  [`eslint-plugin-react@7.32.2`](https://npmjs.com/package/eslint-plugin-react)
      -  [`eslint@8.34.0`](https://npmjs.com/package/eslint)
      -  [`jest-environment-jsdom@29.4.3`](https://npmjs.com/package/jest-environment-jsdom)
      -  [`jest@29.4.3`](https://npmjs.com/package/jest)
      -  [`prettier@2.8.4`](https://npmjs.com/package/prettier)
      -  [`typescript@4.9.5`](https://npmjs.com/package/typescript)

[0.2.0]: https://github.com/compulim/react-chain-of-responsibility/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/compulim/react-chain-of-responsibility/compare/v0.0.2...v0.1.0
[0.0.2]: https://github.com/compulim/react-chain-of-responsibility/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/compulim/react-chain-of-responsibility/releases/tag/v0.0.1
