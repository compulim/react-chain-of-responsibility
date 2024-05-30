# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking changes

- Removed named exports, please import the defaults instead
   - Use `import { createChainOfResponsibility } from 'react-chain-of-responsibility'` instead
   - `import { createChainOfResponsibilityForFluentUI } from 'react-chain-of-responsibility/fluentUI'` for Fluent UI renderer function
- Moved build tools from Babel to tsup/esbuild

### Changed

- Bumped dependencies, by [@compulim](https://github.com/compulim), in PR [#49](https://github.com/compulim/react-chain-of-responsibility/pull/49)
   - Production dependencies
      - [`@babel/runtime-corejs3@7.24.6`](https://npmjs.com/package/@babel/runtime-corejs3)
   - Development dependencies
      - [`@babel/cli@7.24.6`](https://npmjs.com/package/@babel/cli)
      - [`@babel/core@7.24.6`](https://npmjs.com/package/@babel/core)
      - [`@babel/plugin-transform-runtime@7.24.6`](https://npmjs.com/package/@babel/plugin-transform-runtime)
      - [`@babel/preset-env@7.24.6`](https://npmjs.com/package/@babel/preset-env)
      - [`@babel/preset-react@7.24.6`](https://npmjs.com/package/@babel/preset-react)
      - [`@babel/preset-typescript@7.24.6`](https://npmjs.com/package/@babel/preset-typescript)
      - [`@fluentui/react@8.118.5`](https://npmjs.com/package/@fluentui/react)
      - [`@testing-library/react@15.0.7`](https://npmjs.com/package/@testing-library/react)
      - [`@tsconfig/recommended@1.0.6`](https://npmjs.com/package/@tsconfig/recommended)
      - [`@tsconfig/strictest@2.0.5`](https://npmjs.com/package/@tsconfig/strictest)
      - [`@types/node@20.12.12`](https://npmjs.com/package/@types/node)
      - [`@types/react@18.3.3`](https://npmjs.com/package/@types/react)
      - [`esbuild@0.21.3`](https://npmjs.com/package/esbuild)
      - [`react@18.3.1`](https://npmjs.com/package/react)
      - [`react-dom@18.3.1`](https://npmjs.com/package/react-dom)
      - [`react-test-renderer@18.3.1`](https://npmjs.com/package/react-test-renderer)
      - [`typescript@5.4.5`](https://npmjs.com/package/typescript)

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

[0.1.0]: https://github.com/compulim/react-chain-of-responsibility/compare/v0.0.2...v0.1.0
[0.0.2]: https://github.com/compulim/react-chain-of-responsibility/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/compulim/react-chain-of-responsibility/releases/tag/v0.0.1
