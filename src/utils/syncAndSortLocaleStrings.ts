import lodashMerge from "lodash/merge.js";

import recursivelySortObjectByKeys from "./recursivelySortObjectByKeys.js";

/**
 * Add strings missing from `localeStrings` from `sourceStrings`, and sort by
 * key. Returns a new object (doesn’t mutate either argument).
 *
 * @public
 */
const syncAndSortLocaleStrings = ({
  localeStrings,
  sourceStrings,
}: {
  localeStrings: Record<string, unknown>;
  sourceStrings: Record<string, unknown>;
}): Record<string, unknown> =>
  recursivelySortObjectByKeys(
    // Note: lodash merge mutates its first argument, so we merge into a clone
    // of sourceStrings (otherwise values from one locale would leak into the
    // next locale processed)
    lodashMerge(structuredClone(sourceStrings), localeStrings),
  );

export default syncAndSortLocaleStrings;
