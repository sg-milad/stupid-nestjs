module.exports = {
    testEnvironment: "node",
    moduleFileExtensions: ["js", "json", "ts"],
    rootDir: ".",
    // only look for tests under the "test" folder:
    roots: ["<rootDir>/test"],
    // match both *.spec.ts and *.e2e-spec.ts
    testMatch: ["**/?(*.)+(spec|e2e-spec).ts"],
    transform: {
        "^.+\\.(t|j)s$": "ts-jest",
    },
    testEnvironment: "node",
};
