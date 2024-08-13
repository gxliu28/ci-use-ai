const axios = require('axios');
const fs = require('fs');
const { execSync } = require('child_process');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY;

async function createIssue(title, body) {
  const url = `https://api.github.com/repos/${REPO}/issues`;
  const response = await axios.post(url, {
    title: title,
    body: body
  }, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });

  if (response.status === 201) {
    console.log(`Issue created: ${response.data.html_url}`);
  } else {
    console.error('Failed to create issue');
  }
}

function parseTestResults() {
  try {
    const result = execSync('npm test -- --reporter json').toString();
    const parsedResult = JSON.parse(result);

    const failedTests = parsedResult.failures.map(failure => {
      return {
        title: failure.fullTitle,
        message: failure.err.message,
        stack: failure.err.stack
      };
    });

    return failedTests;
  } catch (error) {
    console.error('Error parsing test results:', error);
    return [];
  }
}

async function main() {
  const failedTests = parseTestResults();
  if (failedTests.length > 0) {
    for (const test of failedTests) {
      const issueTitle = `Test Failure: ${test.title}`;
      const issueBody = `### Error Message\n\n${test.message}\n\n### Stack Trace\n\`\`\`\n${test.stack}\n\`\`\``;
      await createIssue(issueTitle, issueBody);
    }
  } else {
    console.log('No test failures detected.');
  }
}

main();
