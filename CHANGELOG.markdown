# @asl-19/js-utils changelog

## [1.0.0](https://github.com/ASL-19/js-utils/pulls?q=is%3Apr+milestone%3A1.0.0+is%3Aclosed) [2025-08-15]

- Remove @asl-19/shared-package-configs, update configs, misc. cleanup [[#31](https://github.com/ASL-19/js-utils/pull/31)]

## [0.4.1](https://github.com/ASL-19/js-utils/pulls?q=is%3Apr+milestone%3A0.4.1+is%3Aclosed) [2025-07-30]

- Update package.json repository format [[#29](https://github.com/ASL-19/js-utils/pull/29)]

## [0.4.0](https://github.com/ASL-19/js-utils/pulls?q=is%3Apr+milestone%3A0.4.0+is%3Aclosed) [2025-07-30]

- Make package ESM-only, update dependencies [[#27](https://github.com/ASL-19/js-utils/pull/27)]

## [0.3.3](https://github.com/ASL-19/js-utils/pulls?q=is%3Apr+milestone%3A0.3.3+is%3Aclosed) [2023-10-06]

- Update `constructUrl` and `getNormalizedQuery` to accept `Array<string>` and `Array<number>` query segments [[#25](https://github.com/ASL-19/js-utils/pull/25)]

## [0.3.2](https://github.com/ASL-19/js-utils/pulls?q=is%3Apr+milestone%3A0.3.2+is%3Aclosed) [2023-09-21]

### Changes

- In constructUrl enforce that path starts with "/" [[#23](https://github.com/ASL-19/js-utils/pull/23)]

## [0.3.1](https://github.com/ASL-19/js-utils/pulls?q=is%3Apr+milestone%3A0.3.1+is%3Aclosed) [2023-09-20]

### Fixes

- In `constructUrl` exclude `querySegments` with falsy values [[#31](https://github.com/ASL-19/js-utils/pull/21)]

## [0.3.0](https://github.com/ASL-19/js-utils/pulls?q=is%3Apr+milestone%3A0.3.0+is%3Aclosed) [2023-09-08]

### Changes

- Added new functions [[#19](https://github.com/ASL-19/js-utils/pull/19)]:
  - [`asType`](./docs/js-utils.astype.md)
  - [`constructUrl`](./docs/js-utils.constructurl.md)
  - [`getAbsoluteUrl`](./docs/js-utils.getabsoluteurl.md)
  - [`getFirstStringOrString`](./docs/js-utils.getfirststringorstring.md)
  - [`getNormalizedQuery`](./docs/js-utils.getnormalizedquery.md)
  - [`getObjectValueByDotSeparatedKey`](./docs/js-utils.getobjectvaluebydotseparatedkey.md)
  - [`serverLog`](./docs/js-utils.serverlog.md)

    Some of these functions rely on [`ts-pattern`](https://github.com/gvergnaud/ts-pattern), which is now a package dependency.

## [0.2.1](https://github.com/ASL-19/js-utils/pulls?q=is%3Apr+milestone%3A0.2.1+is%3Aclosed) [2020-10-21]

### Changes

- Switch to @asl-19/eslint-config [[#14](https://github.com/ASL-19/js-utils/pull/14)]
- Upgrade dependencies [[#18](https://github.com/ASL-19/js-utils/pull/18)]

## [0.2.0](https://github.com/ASL-19/js-utils/pulls?q=is%3Apr+milestone%3A0.2.0+is%3Aclosed) [2020-06-18]

### Additions

- Added replaceArabicNumeralsWithPersianNumerals function [[#12](https://github.com/ASL-19/js-utils/pull/12)]

## 0.1.11 [2020-06-02]

### Changes

- Upgraded [@asl-19/eslint-config-typescript](https://github.com/ASL-19/eslint-config-typescript) to 0.4.4 [[#6](https://github.com/ASL-19/js-utils/pull/6)]

## 0.1.10 [2020-06-02]

First open-source release
