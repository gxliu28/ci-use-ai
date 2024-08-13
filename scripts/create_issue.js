const axios = require('axios');
const { execSync } = require('child_process');
require('dotenv').config(); // .env ファイルから環境変数を読み込む

const MY_PERSONAL_TOKEN = process.env.MY_PERSONAL_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY;

async function createIssue(title, body) {
	const url = `https://api.github.com/repos/${REPO}/issues`;
	try {
		const response = await axios.post(url, {
			title: title,
			body: body
		}, {
			headers: {
				Authorization: `token ${MY_PERSONAL_TOKEN}`,
				Accept: 'application/vnd.github.v3+json'
			}
		});

		if (response.status === 201) {
			console.log(`Issue created: ${response.data.html_url}`);
		} else {
			console.error('Failed to create issue. Status code:', response.status);
			console.error('Response data:', response.data);
		}
	} catch (error) {
		console.error('Error creating issue:', error.response ? error.response.data : error.message);
	}
}

function parseTestResults() {
	try {
		// Mocha コマンドを実行して JSON 結果を取得
		const result = execSync('npm test -- --reporter json').toString();
		console.log("Raw test result:", result); // JSONの内容をログに出力

		// 出力から最初の非JSON行を除去
		const jsonStartIndex = result.indexOf('{');
		const jsonString = result.substring(jsonStartIndex).trim();

		// JSONとしてパース
		const parsedResult = JSON.parse(jsonString);
		console.log("Parsed test result:", parsedResult); // パースされた結果をログに出力

		// テストの失敗をフィルタリング
		const failedTests = parsedResult.tests.filter(test => test.err && Object.keys(test.err).length > 0)
			.map(failure => {
				return {
					title: failure.fullTitle,
					message: failure.err.message,
					stack: failure.err.stack
				};
			});

		return failedTests;
	} catch (error) {
		console.error('Error parsing test results:', error.message);
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
