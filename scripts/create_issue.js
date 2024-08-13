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
		// Mocha コマンドを実行して標準出力の結果を文字列として取得
		const result = execSync('npm test', { encoding: 'utf-8' });
		console.log("Test result:", result);

		// 正規表現で失敗したテストケースを抽出
		const failureRegex = /(\d+\)) ([\s\S]+?)\n\n\s+(.+?)\n\s+at/g;
		let match;
		const failedTests = [];

		while ((match = failureRegex.exec(result)) !== null) {
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
		console.error('Error running test:', error.message);
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
