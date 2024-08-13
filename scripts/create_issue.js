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

function runTests() {
	try {
		// npm test コマンドを実行して結果を取得
		const result = execSync('npm test', { encoding: 'utf-8', stdio: 'pipe' });
		console.log("Test result:", result);
		return result;
	} catch (error) {
		// 標準エラー出力からエラーメッセージを取得
		console.error('Test failed:', error.stderr.toString());
		return error.stdout.toString() + '\n' + error.stack.toString();
	}
}

async function main() {
	const testResult = runTests();

	// 固定のタイトル
	const issueTitle = 'Test Failure Detected';

	// エラーメッセージ全体をボディとして設定
	const issueBody = `### Test Run Result\n\n\`\`\`\n${testResult}\n\`\`\``;

	// エラーメッセージが存在する場合、GitHub Issue を作成
	if (testResult.includes('npm ERR!') || testResult.includes('Error:')) {
		await createIssue(issueTitle, issueBody);
	} else {
		console.log('No test failures detected.');
	}
}

main();
