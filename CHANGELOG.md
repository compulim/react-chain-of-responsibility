# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Added type-checking for test, by [@compulim](https://github.com/compulim), in PR [#20](https://github.com/compulim/react-chain-of-responsibility/pull/20)
- Updates `tsconfig.json` to extend from [`@tsconfig/strictest`](https://npmjs.com/package/@tsconfig/strictest), by [@compulim](https://github.com/compulim), in PR [#20](https://github.com/compulim/react-chain-of-responsibility/pull/20)

### Fixed

- Updated `exports` field to workaround [TypeScript resolution bug](https://github.com/microsoft/TypeScript/issues/50762), by [@compulim](https://github.com/compulim), in PR [#20](https://github.com/compulim/react-chain-of-responsibility/pull/20)

## [0.0.1] - 2023-03-21

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

### Added

- First public release
