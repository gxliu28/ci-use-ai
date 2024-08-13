const axios = require('axios');
const { execSync } = require('child_process');

// 環境変数からトークンとリポジトリを取得
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
		}
	} catch (error) {
		console.error('Error creating issue:', error.message);
	}
}

function parseTestResults() {
	try {
		// npm test コマンドを実行して結果を取得
		const result = execSync('npm test', { encoding: 'utf-8' });

		// 標準出力とエラー出力を結合
		const output = result;
		console.log("Test result:", output);

		// エラーを抽出するための正規表現
		// Mochaのエラーメッセージ形式に合わせた正規表現を使います
		const failureRegex = /(\d+)\) (.+?)\n\s+(.+?)(?:\n|$)/gs;
		let match;
		const failedTests = [];

		while ((match = failureRegex.exec(output)) !== null) {
			const title = match[2].trim();
			const message = match[3].trim();
			const stack = match[0].trim(); // スタックトレースとしてエラー全体を使用

			failedTests.push({
				title: title,
				message: message,
				stack: stack
			});
		}

		return failedTests;
	} catch (error) {
		console.error('Unexpected error:', error.message);
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
