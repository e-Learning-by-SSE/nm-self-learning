# Self Learning

![Build Status](https://jenkins-2.sse.uni-hildesheim.de/buildStatus/icon?job=Teaching_nm-self-learn/master/)
![Tests](https://jenkins-2.sse.uni-hildesheim.de/buildStatus/icon?job=Teaching_nm-self-learn/master&subject=Tests&status=${numberOfTest})
![Line Coverage](https://jenkins-2.sse.uni-hildesheim.de/buildStatus/icon?job=Teaching_nm-self-learn/master&subject=Coverage&status=${lineCoverage})
![Lines of Code](https://jenkins-2.sse.uni-hildesheim.de/buildStatus/icon?job=Teaching_nm-self-learn/master&subject=Lines%20of%20Code&status=${lineOfCode}&color=blue)

## Development

If you want to develop and contribute to this project, please consider reading one of these guides:

- For a development setup: [Development Environment](https://github.com/e-Learning-by-SSE/nm-self-learning/wiki/Development-Environment)
- Easy setup with focus on convenience: [Development Environment with Docker](https://github.com/e-Learning-by-SSE/nm-self-learning/wiki/Development-Quickstart-Guide)

In this project we use contributing guidelines you can find here: https://github.com/e-Learning-by-SSE/

## Lint report for Jenkins

Run `npm run lint:report` after installing dependencies to execute the existing `lint` targets.
Projects without a `lint` target are skipped. Each target keeps its configured file patterns,
even if they point to another project; patterns without matching files produce empty results.
The command uses each target's existing ESLint configuration and writes a combined Checkstyle
report to `output/lint/eslint.xml` and the original results to `output/lint/eslint.json`, containing
file paths, locations, rule IDs, severities and messages.
Reports are regenerated without the Nx cache; source files are not modified.

Exit codes are `0` for no lint errors (warnings are allowed), `1` for lint errors and `2` for an
incomplete analysis or execution failure. Use `npm run lint:report -- --report-only` to collect
findings without failing on lint errors; execution failures still return `2`. If a target fails
to produce a report, the available reports from the other targets are still combined.

The `Lint analysis` branch in the `Pipeline` stage runs on `master` and pull requests. It archives the
combined report and publishes it using the [Warnings Next Generation plugin](https://plugins.jenkins.io/warnings-ng/),
which must be installed on Jenkins. It uses the plugin's `esLint` parser, which expects
[Checkstyle XML](https://github.com/jenkinsci/warnings-ng-plugin/blob/main/SUPPORTED-FORMATS.md):

```groovy
recordIssues tools: [esLint(pattern: 'output/lint/eslint.xml', reportEncoding: 'UTF-8')], enabledForFailure: true, failOnError: true, skipPublishingChecks: true
```

The analysis stage does not add a quality gate for existing lint findings. Existing lint checks
in the build pipeline still apply.

## Deploy the Plattform

Please see [the Production guide](https://github.com/e-Learning-by-SSE/nm-self-learning/wiki/Development-Environment#production) and the [configuration guide](https://github.com/e-Learning-by-SSE/nm-self-learning/wiki/ENV-Configuration) for necessary environment variables.
