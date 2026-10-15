import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

// Each gate fails open silently if its line goes missing, so assert they're all
// present. See AGENTS.md "npm supply-chain gates". Paths are relative to the
// package root, where npm scripts and Vitest run.

// Values by key, in file order. A key set twice is reported as two values, since
// a later line would silently override an earlier gate.
const npmrcValuesByKey = new Map<string, Array<string>>();

for (const line of readFileSync(".npmrc", "utf8").split("\n")) {
  const match = /^\s*([^#;\s][^=]*?)\s*=\s*(.*?)\s*$/.exec(line);

  if (match) {
    const [, key, value] = match;

    npmrcValuesByKey.set(key, [...(npmrcValuesByKey.get(key) ?? []), value]);
  }
}

const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  devEngines?: { packageManager?: unknown };
  scripts?: Record<string, string>;
};

test.each([
  ["min-release-age", "1"],
  ["min-release-age-exclude[]", "@asl-19/*"],
  ["allow-git", "none"],
  ["allow-remote", "none"],
  ["strict-allow-scripts", "true"],
  ["engine-strict", "true"],
])(".npmrc sets %s=%s exactly once", (key, value) => {
  expect(npmrcValuesByKey.get(key)).toEqual([value]);
});

// An older npm ignores every key above
test("devEngines requires npm 11.17 or later", () => {
  expect(packageJson.devEngines?.packageManager).toEqual({
    name: "npm",
    onFail: "error",
    version: ">=11.17.0",
  });
});

// allowScripts covers dependencies only, not this package's own scripts
test.each(["preinstall", "install", "postinstall", "prepare"])(
  "package.json has no %s script",
  (script) => {
    expect(packageJson.scripts).not.toHaveProperty(script);
  },
);
