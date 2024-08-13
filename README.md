## ci-use-ai
Utilize AI in CI to analyze errors and automatically create issues.

## Usage
### Passing test cases
Passing test cases are the default. Ensure that the file `test-config.js` in the project root is configured as follows:

```json
module.exports = {
	shouldPass: true,
};
```

### Failing test cases
Ensure that the file `test-config.js` in the project root is configured as follows:

```json
module.exports = {
	shouldPass: false,
};
```

Then push it to GitHub, and the CI will build it. An issue will be created automatically.
