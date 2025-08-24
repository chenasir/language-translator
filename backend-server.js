const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const https = require('https');

const app = express();
const PORT = 3001;

// 启用CORS和JSON解析
app.use(cors());
app.use(express.json());

// 使用原生HTTPS模块发送请求的函数
function makeHttpsRequest(hostname, options) {
    return new Promise((resolve, reject) => {
        const postData = options.body;
        
        const reqOptions = {
            hostname: hostname,
            port: 443,
            path: '/',
            method: options.method,
            headers: {
                ...options.headers,
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(reqOptions, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error(`JSON解析失败: ${error.message}, 响应: ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`HTTPS请求失败: ${error.message}`));
        });

        req.write(postData);
        req.end();
    });
}

// 腾讯云API签名算法 V3
function generateTencentSignatureV3(host, service, region, action, version, timestamp, payload, secretId, secretKey) {
    const algorithm = 'TC3-HMAC-SHA256';
    const date = new Date(timestamp * 1000).toISOString().substr(0, 10);
    
    // Step 1: 拼接规范请求串
    const httpRequestMethod = 'POST';
    const canonicalUri = '/';
    const canonicalQueryString = '';
    const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${host}\n`;
    const signedHeaders = 'content-type;host';
    const hashedRequestPayload = crypto.createHash('sha256').update(payload).digest('hex');
    
    const canonicalRequest = [
        httpRequestMethod,
        canonicalUri,
        canonicalQueryString,
        canonicalHeaders,
        signedHeaders,
        hashedRequestPayload
    ].join('\n');

    // Step 2: 拼接待签名字符串
    const credentialScope = `${date}/${service}/tc3_request`;
    const hashedCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
    
    const stringToSign = [
        algorithm,
        timestamp,
        credentialScope,
        hashedCanonicalRequest
    ].join('\n');

    // Step 3: 计算签名
    const secretDate = crypto.createHmac('sha256', 'TC3' + secretKey).update(date).digest();
    const secretService = crypto.createHmac('sha256', secretDate).update(service).digest();
    const secretSigning = crypto.createHmac('sha256', secretService).update('tc3_request').digest();
    const signature = crypto.createHmac('sha256', secretSigning).update(stringToSign).digest('hex');

    // Step 4: 拼接 Authorization
    const authorization = `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    
    return authorization;
}

// 腾讯翻译API代理路由
app.post('/api/tencent-translate', async (req, res) => {
    try {
        const { text, source, target, secretId, secretKey } = req.body;
        
        // 验证必需参数
        if (!text || !source || !target || !secretId || !secretKey) {
            return res.status(400).json({
                error: '缺少必需参数',
                required: ['text', 'source', 'target', 'secretId', 'secretKey']
            });
        }

        const host = 'tmt.tencentcloudapi.com';
        const service = 'tmt';
        const region = 'ap-beijing';
        const action = 'TextTranslate';
        const version = '2018-03-21';
        const timestamp = Math.floor(Date.now() / 1000);
        
        // 请求体
        const payload = JSON.stringify({
            SourceText: text,
            Source: source,
            Target: target,
            ProjectId: 0
        });

        // 生成签名
        const authorization = generateTencentSignatureV3(
            host, service, region, action, version, timestamp, payload, secretId, secretKey
        );

        // 发送请求到腾讯云API
        const data = await makeHttpsRequest(host, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Host': host,
                'Authorization': authorization,
                'X-TC-Action': action,
                'X-TC-Version': version,
                'X-TC-Region': region,
                'X-TC-Timestamp': timestamp.toString(),
            },
            body: payload
        });
        
        if (data.Response.Error) {
            console.error('腾讯翻译API错误详情:', {
                code: data.Response.Error.Code,
                message: data.Response.Error.Message,
                requestParams: { text, source, target }
            });
            return res.status(400).json({
                error: `腾讯翻译错误: ${data.Response.Error.Code}`,
                message: data.Response.Error.Message,
                details: `请求参数: 文本="${text}", 源语言="${source}", 目标语言="${target}"`
            });
        }

        // 返回翻译结果
        res.json({
            success: true,
            translatedText: data.Response.TargetText,
            originalText: text,
            source: source,
            target: target
        });

    } catch (error) {
        console.error('翻译服务器错误:', error);
        res.status(500).json({
            error: '服务器内部错误',
            message: error.message
        });
    }
});

// 健康检查路由
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: '腾讯翻译代理服务运行正常' });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 腾讯翻译代理服务器启动成功！`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`🔗 健康检查: http://localhost:${PORT}/health`);
    console.log(`🌐 翻译接口: POST http://localhost:${PORT}/api/tencent-translate`);
    console.log(`\n✨ 现在可以使用腾讯翻译了！`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭服务器...');
    process.exit(0);
});
