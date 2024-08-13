const axios = require('axios');
const { spawnSync } = require('child_process');

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
		const result = spawnSync('npm', ['test'], { encoding: 'utf-8' });

		if (result.error) {
			console.error('Error running test:', result.error.message);
			return [];
		}

		// 標準出力と標準エラー出力を結合
		const output = result.stdout + result.stderr;
		console.log("Test result:", output);

		// 正規表現で失敗したテストケースを抽出
		const failureRegex = /(\d+\))\s+([^\n]+)\n\s+\+(.+?)\n\s+-/g;
		let match;
		const failedTests = [];

		while ((match = failureRegex.exec(output)) !== null) {
			const title = match[2].trim();
			const message = match[3].trim();
			failedTests.push({
				title: title,
				message: message,
				stack: match[0] // エラー部分全体をスタックトレースとして保存
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
