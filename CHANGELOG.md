# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.2] - 2023-10-09

### Changed

- Added type-checking for test, by [@compulim](https://github.com/compulim), in PR [#20](https://github.com/compulim/react-chain-of-responsibility/pull/20)
- Updates `tsconfig.json` to extend from [`@tsconfig/strictest`](https://npmjs.com/package/@tsconfig/strictest), by [@compulim](https://github.com/compulim), in PR [#20](https://github.com/compulim/react-chain-of-responsibility/pull/20)
- Bump dependencies, by [@compulim](https://github.com/compulim), in PR [#24](https://github.com/compulim/react-chain-of-responsibility/pull/24), and PR [#36](https://github.com/compulim/react-chain-of-responsibility/pull/36)
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

- Bump dependencies, by [@compulim](https://github.com/compulim), in PR [#1](https://github.com/compulim/react-chain-of-responsibility/pull/1)
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

[0.0.2]: https://github.com/compulim/react-chain-of-responsibility/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/compulim/react-chain-of-responsibility/releases/tag/v0.0.1
