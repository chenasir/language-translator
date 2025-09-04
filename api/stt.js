let tokenCache = { token: null, expiresAt: 0 };

async function getBaiduAccessToken() {
    const apiKey = process.env.BAIDU_API_KEY;
    const secretKey = process.env.BAIDU_SECRET_KEY;
    if (!apiKey || !secretKey) {
        throw new Error('未配置环境变量 BAIDU_API_KEY/BAIDU_SECRET_KEY');
    }
    const now = Date.now();
    if (tokenCache.token && tokenCache.expiresAt > now + 60 * 1000) {
        return tokenCache.token;
    }
    const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${encodeURIComponent(apiKey)}&client_secret=${encodeURIComponent(secretKey)}`;
    const resp = await fetch(url, { method: 'POST' });
    const data = await resp.json();
    if (!resp.ok || !data.access_token) {
        throw new Error(`获取百度AccessToken失败: ${resp.status} ${JSON.stringify(data)}`);
    }
    tokenCache = {
        token: data.access_token,
        // 官方默认过期时间3600s或更长，这里保守取1小时
        expiresAt: Date.now() + (data.expires_in ? data.expires_in * 1000 : 3600 * 1000)
    };
    return tokenCache.token;
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    try {
        const { audioBase64, mimeType, lang } = req.body || {};
        if (!audioBase64) {
            res.status(400).json({ error: '缺少必需参数: audioBase64' });
            return;
        }

        // 兼容 data URL 或纯 base64
        let base64String = audioBase64;
        const dataUrlMatch = /^data:(.*?);base64,(.*)$/.exec(audioBase64);
        if (dataUrlMatch) {
            base64String = dataUrlMatch[2];
        }
        const audioBuffer = Buffer.from(base64String, 'base64');

        const token = await getBaiduAccessToken();

        // 语言模型 dev_pid：
        // 1537 普通话(16k)，1737 英语，1637 粤语
        let devPid = 1537;
        if (lang === 'en') devPid = 1737;
        if (lang === 'yue' || lang === 'zh-HK') devPid = 1637;

        const payload = {
            format: 'wav',
            rate: 16000,
            channel: 1,
            token: token,
            cuid: 'vercel-stt-client',
            len: audioBuffer.length,
            speech: base64String,
            dev_pid: devPid
        };

        const resp = await fetch('https://vop.baidu.com/server_api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await resp.json();
        if (!resp.ok || data.err_no !== 0) {
            res.status(500).json({ error: 'Baidu STT 错误', details: data });
            return;
        }

        const text = Array.isArray(data.result) ? (data.result[0] || '') : '';
        res.status(200).json({ text });
    } catch (e) {
        res.status(500).json({ error: '服务器内部错误', message: e.message });
    }
};


