const axios = require('axios');
const { execSync } = require('child_process');

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
				Accept: 'application/vnd.github.v3+json',
				'User-Agent': 'Automated Issue Creator'
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
	let testResult = {};
	try {
		// Mocha コマンドを実行して JSON 結果を取得
		const result = execSync('npm test -- --reporter json', { stdio: ['pipe', 'pipe', 'pipe'] }).toString();
		console.log("Raw test result:", result); // JSONの内容をログに出力

		// 出力から最初の非JSON行を除去
		const jsonStartIndex = result.indexOf('{');
		const jsonString = result.substring(jsonStartIndex).trim();

		// JSONとしてパース
		testResult = JSON.parse(jsonString);
		console.log("Parsed test result:", testResult); // パースされた結果をログに出力

	} catch (error) {
		console.error('Error parsing test results:', error.message);
		console.error('Standard Error Output:', error.stderr ? error.stderr.toString() : 'No stderr');
		process.exit(1); // パースに失敗した場合、スクリプトを終了する
	}

	// テストの失敗をフィルタリング
	const failedTests = testResult.tests ? testResult.tests.filter(test => test.err && Object.keys(test.err).length > 0)
		.map(failure => {
			return {
				title: failure.fullTitle,
				message: failure.err.message,
				stack: failure.err.stack
			};
		}) : [];

	return failedTests;
}

async function main() {
	try {
		const failedTests = parseTestResults();
		console.log('Parsed test failures:', failedTests); // 失敗したテストをログに出力

		if (failedTests.length > 0) {
			for (const test of failedTests) {
				const issueTitle = `Test Failure: ${test.title}`;
				const issueBody = `### Error Message\n\n${test.message}\n\n### Stack Trace\n\`\`\`\n${test.stack}\n\`\`\``;
				await createIssue(issueTitle, issueBody);
			}
		} else {
			console.log('No test failures detected.');
		}
	} catch (error) {
		console.error('Error in main function:', error.message);
		process.exit(1); // エラーが発生した場合、スクリプトを終了する
	}
}

main();
