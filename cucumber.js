// cucumber.js
module.exports = {
    default: {
        paths: ["test/bdd/features/**/*.feature"],
        require: ["test/bdd/step-definitions/**/*.steps.ts", "test/bdd/hooks/**/*.hooks.ts"],
        requireModule: ["ts-node/register"],
        format: ["@cucumber/pretty-formatter", "json:test/bdd/reports/cucumber-report.json"],
        formatOptions: { snippetInterface: "async-await" },
        publishQuiet: true,
    },
};
