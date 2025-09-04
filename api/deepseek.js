module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    try {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            res.status(500).json({ error: '未配置环境变量 DEEPSEEK_API_KEY' });
            return;
        }

        const { model, messages, temperature, max_tokens } = req.body || {};
        if (!messages || !Array.isArray(messages)) {
            res.status(400).json({ error: '缺少必需参数: messages' });
            return;
        }

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model || 'deepseek-chat',
                messages,
                temperature: typeof temperature === 'number' ? temperature : 0.3,
                max_tokens: typeof max_tokens === 'number' ? max_tokens : 1000
            })
        });

        const data = await response.json();
        if (!response.ok) {
            res.status(response.status).json({ error: 'DeepSeek API 错误', details: data });
            return;
        }

        res.status(200).json(data);
    } catch (e) {
        res.status(500).json({ error: '服务器内部错误', message: e.message });
    }
};


