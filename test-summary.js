const http = require('http');

function testEndpoint(path, description) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve({ success: true, status: res.statusCode });
                } else {
                    resolve({ success: false, status: res.statusCode });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Farcaster Frame 测试报告\n');
    console.log('=' .repeat(50));

    const tests = [
        { path: '/', desc: '主页' },
        { path: '/api/proposal?id=1', desc: '提案 API' },
        { path: '/api/og?proposalId=1', desc: 'Frame 图片生成' },
        { path: '/api/result?view=true&proposalId=1', desc: '投票结果页面' }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            const result = await testEndpoint(test.path, test.desc);
            if (result.success) {
                console.log(`✅ ${test.desc}: OK (HTTP ${result.status})`);
                passed++;
            } else {
                console.log(`❌ ${test.desc}: 失败 (HTTP ${result.status})`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.desc}: 连接失败`);
            failed++;
        }
    }

    console.log('=' .repeat(50));
    console.log(`\n📊 测试结果: ${passed} 通过, ${failed} 失败\n`);

    console.log('📍 访问地址:');
    console.log('   - 主页: http://localhost:3000');
    console.log('   - API: http://localhost:3000/api/proposal?id=1');
    console.log('   - Frame 图片: http://localhost:3000/api/og?proposalId=1\n');

    console.log('🔗 在 Farcaster 中使用:');
    console.log('   1. 打开 Warpcast 客户端');
    console.log('   2. 创建新 Cast');
    console.log('   3. 粘贴 URL: http://localhost:3000');
    console.log('   4. 发布即可看到可交互的 Frame\n');
}

runTests().catch(console.error);
