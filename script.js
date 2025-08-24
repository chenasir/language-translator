class TranslationApp {
    constructor() {
        this.apiKey = '';
        this.apiType = 'deepseek'; // 默认使用DeepSeek（更精准的粤语翻译）
        this.currentAudio = null;
        this.userInteracted = false;
        this.abortController = null;
        this.requestCount = 0; // 请求计数器
        this.lastRequestTime = 0; // 上次请求时间
        this.recognition = null; // 普通话语音识别对象
        this.cantoneseRecognition = null; // 粤语语音识别对象
        this.englishRecognition = null; // 英语语音识别对象
        this.isRecording = false; // 是否正在录音（普通话）
        this.isRecordingCantonese = false; // 是否正在录音（粤语）
        this.isRecordingEnglish = false; // 是否正在录音（英语）
        this.init();
    }

    init() {
        this.initSpeechRecognition();
        this.bindEvents();
        this.loadApiKey();
        this.loadApiType();
        this.setupCleanup();
    }

    initSpeechRecognition() {
        // 检查浏览器是否支持语音识别
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('浏览器不支持语音识别功能');
            return;
        }

        // 检测浏览器类型
        const isVia = /Via/.test(navigator.userAgent);
        const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
        const isEdge = /Edge/.test(navigator.userAgent);
        
        console.log('浏览器环境:', {
            isVia,
            isChrome,
            isEdge,
            userAgent: navigator.userAgent
        });

        // 创建普通话语音识别对象
        this.recognition = new SpeechRecognition();
        
        // 打印所有可用的语音识别属性
        console.log('语音识别对象配置:', {
            continuous: this.recognition.continuous,
            interimResults: this.recognition.interimResults,
            lang: this.recognition.lang,
            maxAlternatives: this.recognition.maxAlternatives,
            serviceURI: this.recognition.serviceURI
        });

        // 根据浏览器类型设置不同的配置
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;

        // Via浏览器使用系统默认设置
        if (isVia) {
            this.recognition.lang = 'zh';  // 使用基础中文设置，让系统决定具体方言
            console.log('Via浏览器：使用系统默认语音识别');
        } 
        // Chrome和Edge使用明确的普通话设置
        else if (isChrome || isEdge) {
            // 尝试使用最明确的普通话设置
            try {
                this.recognition.lang = 'cmn-Hans-CN';  // 首选：普通话（简体，中国）
                console.log('设置语音识别为普通话(cmn-Hans-CN)');
            } catch (e) {
                try {
                    this.recognition.lang = 'zh-CN';    // 备选：中文（中国）
                    console.log('设置语音识别为中文(zh-CN)');
                } catch (e2) {
                    this.recognition.lang = 'zh';       // 最后选择：基础中文
                    console.log('设置语音识别为基础中文(zh)');
                }
            }
        }
        // 其他浏览器使用标准设置
        else {
            this.recognition.lang = 'zh-CN';
            console.log('其他浏览器：使用标准中文设置');
        }

        // 添加详细的事件监听
        this.recognition.onstart = () => {
            console.log('语音识别开始');
            console.log('当前语言设置:', this.recognition.lang);
            // 检查是否成功设置了语言
            if (this.recognition.lang !== 'zh-CN') {
                console.warn('警告：当前语言设置不是简体中文');
            }
        };

        this.recognition.onerror = (event) => {
            console.error('语音识别错误:', {
                error: event.error,
                message: event.message,
                timestamp: event.timeStamp
            });
            this.stopRecording();
        };

        // 添加语言变化监听
        this.recognition.onlanguagechange = (event) => {
            console.log('语言发生变化:', {
                oldLang: event.oldLang,
                newLang: event.newLang
            });
        };

        // 在识别结果中添加更多信息
        this.recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            if (result.isFinal) {
                console.log('识别结果详情:', {
                    transcript: result[0].transcript,
                    confidence: result[0].confidence,
                    isFinal: result.isFinal,
                    resultIndex: event.resultIndex,
                    languageUsed: this.recognition.lang
                });
                
                const text = result[0].transcript;
                const textarea = document.getElementById('chinese-input');
                textarea.value = textarea.value + text;
            }
        };

        // 处理普通话识别结束
        this.recognition.onend = () => {
            if (this.isRecording) {
                this.recognition.start();
            } else {
                this.stopRecording();
            }
        };

        // 创建粤语语音识别对象
        this.cantoneseRecognition = new SpeechRecognition();
        this.cantoneseRecognition.continuous = true;
        this.cantoneseRecognition.interimResults = true;
        
        // 检测是否为Via浏览器
        if (/Via/.test(navigator.userAgent)) {
            // Via浏览器可能不支持粤语识别，使用系统默认
            this.cantoneseRecognition.lang = 'zh';
            console.log('Via浏览器：粤语识别使用系统默认设置');
        } else {
            // 其他浏览器使用香港粤语设置
            this.cantoneseRecognition.lang = 'zh-HK';
            console.log('设置粤语识别为香港粤语(zh-HK)');
        }

        // 处理粤语识别结果
        this.cantoneseRecognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            if (result.isFinal) {
                const text = result[0].transcript;
                const cantoneseInput = document.getElementById('cantonese-input');
                cantoneseInput.value = text; // 直接替换而不是追加
            }
        };

        // 处理粤语识别错误
        this.cantoneseRecognition.onerror = (event) => {
            console.error('粤语语音识别错误:', event.error);
            this.stopRecordingCantonese();
        };

        // 处理粤语识别结束
        this.cantoneseRecognition.onend = () => {
            if (this.isRecordingCantonese) {
                this.cantoneseRecognition.start();
            } else {
                this.stopRecordingCantonese();
            }
        };

        // 创建英语语音识别对象
        this.englishRecognition = new SpeechRecognition();
        this.englishRecognition.continuous = true;
        this.englishRecognition.interimResults = true;
        this.englishRecognition.lang = 'en-US';

        this.englishRecognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            if (result.isFinal) {
                const text = result[0].transcript;
                const englishInput = document.getElementById('english-input');
                englishInput.value = text;
            }
        };

        this.englishRecognition.onerror = (event) => {
            console.error('英语语音识别错误:', event.error);
            this.stopRecordingEnglish();
        };

        this.englishRecognition.onend = () => {
            if (this.isRecordingEnglish) {
                this.englishRecognition.start();
            } else {
                this.stopRecordingEnglish();
            }
        };

        // 绑定转换按钮事件
        const convertBtn = document.getElementById('convert-to-mandarin');
        convertBtn.addEventListener('click', async () => {
            const cantoneseInput = document.getElementById('cantonese-input');
            const icon = convertBtn.querySelector('.convert-icon');
            const originalText = icon.textContent;

            if (!this.apiKey) {
                alert('请先配置API密钥');
                return;
            }

            try {
                // 显示加载状态
                icon.textContent = '⌛';  // 使用沙漏图标表示加载
                convertBtn.disabled = true;

                await this.convertToMandarin(cantoneseInput.value);
            } catch (error) {
                console.error('转换失败:', error);
                alert('转换失败，请重试');
            } finally {
                // 恢复按钮状态
                icon.textContent = originalText;  // 恢复原始图标
                convertBtn.disabled = false;
            }
        });

        // 英语 -> 普通话 转换按钮
        const convertBtnEn = document.getElementById('convert-to-mandarin-en');
        if (convertBtnEn) {
            convertBtnEn.addEventListener('click', async () => {
                const englishInput = document.getElementById('english-input');
                const icon = convertBtnEn.querySelector('.convert-icon');
                const originalText = icon.textContent;

                if (!this.apiKey) {
                    alert('请先配置API密钥');
                    return;
                }

                try {
                    icon.textContent = '⌛';
                    convertBtnEn.disabled = true;
                    await this.convertEnglishToMandarin(englishInput.value);
                } catch (error) {
                    console.error('转换失败:', error);
                    alert('转换失败，请重试');
                } finally {
                    icon.textContent = originalText;
                    convertBtnEn.disabled = false;
                }
            });
        }
    }

    async startRecording() {
        if (!this.recognition) {
            alert('您的浏览器不支持语音识别功能');
            return;
        }

        try {
            // 在开始前再次确认语言设置
            this.recognition.lang = 'zh-CN';
            
            // 检查浏览器信息
            console.log('浏览器信息:', {
                userAgent: navigator.userAgent,
                vendor: navigator.vendor,
                language: navigator.language,
                languages: navigator.languages
            });

            // 请求麦克风权限
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // 检查音频轨道信息
            const audioTracks = stream.getAudioTracks();
            console.log('音频设备信息:', {
                deviceId: audioTracks[0].getSettings().deviceId,
                label: audioTracks[0].label,
                constraints: audioTracks[0].getConstraints()
            });

            this.isRecording = true;
            const voiceBtn = document.getElementById('voice-input-btn');
            voiceBtn.classList.add('recording');
            voiceBtn.querySelector('.voice-status').textContent = '点击结束录音';
            voiceBtn.querySelector('.voice-icon').textContent = '⏺';

            // 强制使用普通话识别
            const languageCodes = [
                'cmn-Hans-CN',      // 普通话（简体，中国）
                'zh-cmn-Hans-CN',   // 普通话（简体，中国）的另一种写法
                'zh-Hans-CN',       // 简体中文（中国）
                'zh-CN',            // 标准中文
                'zh'                // 基础中文
            ];

            // 测试不同的语言代码
            let successfulCode = null;
            for (const code of languageCodes) {
                try {
                    this.recognition.lang = code;
                    console.log(`尝试语言代码: ${code}`);
                    this.recognition.start();
                    successfulCode = code;
                    console.log(`语言代码 ${code} 成功启动`);
                    break; // 如果成功就跳出循环
                } catch (e) {
                    console.warn(`语言代码 ${code} 失败:`, e);
                    continue;
                }
            }

            if (successfulCode) {
                console.log(`最终使用的语言代码: ${successfulCode}`);
            } else {
                throw new Error('所有语言代码都失败了');
            }

        } catch (error) {
            console.error('启动语音识别失败:', error);
            if (error.name === 'NotAllowedError') {
                alert('请允许使用麦克风以启用语音识别功能');
            } else {
                alert('启动语音识别失败: ' + error.message);
            }
            this.stopRecording();
        }
    }

    stopRecording() {
        if (!this.recognition) return;
        
        this.isRecording = false;
        const voiceBtn = document.getElementById('voice-input-btn');
        voiceBtn.classList.remove('recording');
        voiceBtn.querySelector('.voice-status').textContent = '点击录音';
        voiceBtn.querySelector('.voice-icon').textContent = '🎤';
        
        try {
            this.recognition.stop();
        } catch (error) {
            console.error('停止语音识别失败:', error);
        }
    }

    bindEvents() {
        // 普通话语音输入按钮
        const voiceBtn = document.getElementById('voice-input-btn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                if (this.isRecording) {
                    this.stopRecording();
                } else {
                    this.startRecording();
                }
            });
        }

        // 粤语语音输入按钮
        const cantoneseVoiceBtn = document.getElementById('cantonese-voice-btn');
        if (cantoneseVoiceBtn) {
            cantoneseVoiceBtn.addEventListener('click', () => {
                if (this.isRecordingCantonese) {
                    this.stopRecordingCantonese();
                } else {
                    this.startRecordingCantonese();
                }
            });
        }

        // 英语语音输入按钮
        const englishVoiceBtn = document.getElementById('english-voice-btn');
        if (englishVoiceBtn) {
            englishVoiceBtn.addEventListener('click', () => {
                if (this.isRecordingEnglish) {
                    this.stopRecordingEnglish();
                } else {
                    this.startRecordingEnglish();
                }
            });
        }

        // 翻译按钮
        document.getElementById('translate-btn').addEventListener('click', () => {
            this.userInteracted = true;
            this.translate();
        });

        // 清空按钮
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearResults();
        });

        // API类型选择
        document.getElementById('api-type').addEventListener('change', (e) => {
            this.apiType = e.target.value;
            this.saveApiType();
            this.updateApiKeyPlaceholder();
        });

        // API密钥输入
        document.getElementById('api-key').addEventListener('input', (e) => {
            this.apiKey = e.target.value;
            this.saveApiKey();
        });

        // 语音播放按钮
        document.getElementById('play-english').addEventListener('click', () => {
            this.handlePlayClick('english');
        });

        document.getElementById('play-cantonese').addEventListener('click', () => {
            this.handlePlayClick('cantonese');
        });

        // 语音测试按钮
        const voiceTestBtn = document.getElementById('voice-test-btn');
        if (voiceTestBtn) {
            voiceTestBtn.addEventListener('click', () => {
                this.testVoices();
            });
        }

        // 键盘快捷键
        document.getElementById('chinese-input').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.userInteracted = true;
                this.translate();
            }
        });

        this.updateApiKeyPlaceholder();
    }

    updateApiKeyPlaceholder() {
        const apiKeyInput = document.getElementById('api-key');
        switch(this.apiType) {
            case 'tencent':
                apiKeyInput.placeholder = '请输入：SecretId|SecretKey (用|分隔)';
                break;
            case 'baidu':
                apiKeyInput.placeholder = '请输入：APP ID|APP KEY (用|分隔)';
                break;
            case 'deepseek':
                apiKeyInput.placeholder = '请输入您的 DeepSeek API Key (sk-...)';
                break;
            case 'openai':
                apiKeyInput.placeholder = '请输入您的 OpenAI API Key (sk-...)';
                break;
        }
    }

    async translate() {
        const input = document.getElementById('chinese-input').value.trim();
        if (!input) {
            alert('请输入要翻译的中文内容');
            return;
        }

        if (!this.apiKey) {
            alert('请先配置API密钥');
            return;
        }

        // 内存安全检查
        if (input.length > 5000) {
            if (!confirm('文本较长，可能需要更多时间和费用。是否继续？')) {
                return;
            }
        }

        const translateBtn = document.getElementById('translate-btn');
        const btnText = translateBtn.querySelector('.btn-text');
        const loading = translateBtn.querySelector('.loading');

        // 防止重复点击
        if (translateBtn.disabled) {
            return;
        }

        // 频率限制（防止恶意高频请求）
        const now = Date.now();
        if (now - this.lastRequestTime < 1000) { // 1秒内只能请求一次
            alert('请求太频繁，请稍后再试');
            return;
        }
        this.lastRequestTime = now;
        this.requestCount++;

        // 内存监控
        if (this.requestCount % 10 === 0) {
            console.log(`📊 已完成${this.requestCount}次翻译`);
            if (performance.memory) {
                const mb = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
                console.log(`💾 当前内存使用: ${mb}MB`);
                if (performance.memory.usedJSHeapSize > 100 * 1024 * 1024) { // 超过100MB
                    console.warn('⚠️ 内存使用较高，建议刷新页面');
                }
            }
        }

        try {
            // 显示加载状态
            btnText.style.display = 'none';
            loading.style.display = 'inline';
            translateBtn.disabled = true;

            // 取消之前的请求（内存保护）
            if (this.abortController) {
                this.abortController.abort();
            }
            this.abortController = new AbortController();

            // 清理之前的语音（内存保护）
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }

            let translations;
            if (this.apiType === 'baidu') {
                translations = await this.getBaiduTranslations(input);
            } else if (this.apiType === 'tencent') {
                translations = await this.getTencentTranslations(input);
            } else {
                translations = await this.getAITranslations(input);
            }

            this.displayResults(translations);
            this.enablePlayButtons();

        } catch (error) {
            console.error('翻译错误:', error);
            if (error.name !== 'AbortError') {
                alert(`翻译失败：${error.message}`);
            }
        } finally {
            // 恢复按钮状态
            btnText.style.display = 'inline';
            loading.style.display = 'none';
            translateBtn.disabled = false;
            
            // 内存清理
            if (this.abortController) {
                this.abortController = null;
            }
        }
    }

    async getAITranslations(text) {
        const apiUrl = this.apiType === 'deepseek' 
            ? 'https://api.deepseek.com/chat/completions'
            : 'https://api.openai.com/v1/chat/completions';
        
        const model = this.apiType === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini';
        
        const systemPrompt = this.apiType === 'deepseek' && text.includes('粤语') 
            ? this.createCantoneseSystemPrompt()
            : this.createGeneralSystemPrompt();

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `请翻译以下中文：${text}` }
                ],
                temperature: 0.3,
                max_tokens: 1000
            }),
            signal: this.abortController.signal
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API请求失败: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const result = data.choices[0].message.content;

        try {
            return JSON.parse(result);
        } catch {
            return {
                english: result.split('\n')[0] || result,
                cantonese: result.split('\n')[1] || result
            };
        }
    }

    async getBaiduTranslations(text) {
        const [appId, appKey] = this.apiKey.split('|');
        if (!appId || !appKey) {
            throw new Error('请正确配置百度翻译API：APP ID|APP KEY');
        }

        const englishResult = await this.callBaiduTranslate(text, 'zh', 'en', appId, appKey);
        const cantoneseResult = await this.callBaiduTranslate(text, 'zh', 'yue', appId, appKey);

        return {
            english: englishResult.trans_result[0].dst,
            cantonese: cantoneseResult.trans_result[0].dst
        };
    }

    async callBaiduTranslate(query, from, to, appId, appKey) {
        const salt = Date.now().toString();
        const sign = this.generateBaiduSign(appId + query + salt + appKey);
        
        const params = new URLSearchParams({
            q: query,
            from: from,
            to: to,
            appid: appId,
            salt: salt,
            sign: sign
        });

        const response = await fetch(`https://fanyi-api.baidu.com/api/trans/vip/translate?${params}`, {
            method: 'GET',
            signal: this.abortController.signal
        });

        if (!response.ok) {
            throw new Error(`百度翻译API错误: ${response.status}`);
        }

        const data = await response.json();
        if (data.error_code) {
            throw new Error(`百度翻译错误: ${data.error_msg}`);
        }

        return data;
    }

    generateBaiduSign(str) {
        return CryptoJS.MD5(str).toString();
    }

    async getTencentTranslations(text) {
        const [secretId, secretKey] = this.apiKey.split('|');
        if (!secretId || !secretKey) {
            throw new Error('请正确配置腾讯翻译API：SecretId|SecretKey');
        }

        const englishResult = await this.callTencentTranslate(text, 'en', secretId, secretKey);
        const cantoneseResult = await this.callTencentTranslate(text, 'zh-TW', secretId, secretKey);

        return {
            english: englishResult.TargetText,
            cantonese: cantoneseResult.TargetText
        };
    }

    async callTencentTranslate(text, target, secretId, secretKey) {
        const response = await fetch('http://localhost:3001/api/tencent-translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                target: target,
                secretId: secretId,
                secretKey: secretKey
            }),
            signal: this.abortController.signal
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`后端代理请求失败: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data;
    }

    createGeneralSystemPrompt() {
        return `你是一个专业的翻译助手。请将用户输入的中文准确翻译成英文和粤语。

要求：
1. 英文翻译要地道、自然、符合英语表达习惯
2. 粤语翻译要使用正宗的香港粤语表达方式
3. 返回JSON格式：{"english": "英文翻译", "cantonese": "粤语翻译"}
4. 不要添加任何解释或其他内容`;
    }

    createCantoneseSystemPrompt() {
        return `你是一个专业的粤语翻译专家，精通标准中文到地道粤语的转换。

翻译要求：
1. 使用正宗的香港粤语表达方式
2. 保持语言的自然流畅和地道性
3. 考虑粤语的语法特点和词汇习惯
4. 返回JSON格式：{"english": "英文翻译", "cantonese": "粤语翻译"}

参考例子：
中文："你好吗？" → 粤语："你好唔好呀？"
中文："谢谢你" → 粤语："多谢晒"
中文："我很高兴" → 粤语："我好开心"
中文："没问题" → 粤语："冇问题"
中文："真的吗？" → 粤语："真係咩？"`;
    }

    createEnToZhSystemPrompt() {
        return `你是一名中英互译专家。任务：将用户输入的英文精准翻译为标准普通话（简体中文）。

严格约束：
1) 忠实传达原意，不擅自增删改。
2) 专有名词、人名、地名、品牌等保留常见中文译名；如难以确定，保留英文原文。
3) 数字、日期、货币、百分号、缩略单位按中文常见写法保留（不进行单位换算），如：5 km、20%、$30、2024-08-08。
4) 保留原文语气与时态信息，避免改变句式立场。
5) 严禁输出任何解释、前后缀、引号、标签、标注、代码块或语言标识；只输出最终中文译文。
6) 多句输入请逐句准确翻译并合并为自然中文段落。
7) 口语或不完整句按自然口语化表达处理，避免生硬直译。`;
    }

    sanitizeChineseOutput(text) {
        if (!text) return '';
        let t = String(text).trim();
        // JSON提取
        try {
            const obj = JSON.parse(t);
            const candidateKeys = ['chinese', 'zh', 'translation', 'result', 'output'];
            for (const k of candidateKeys) {
                if (typeof obj[k] === 'string') return obj[k].trim();
            }
        } catch (_) {}
        // 去掉代码块围栏
        t = t.replace(/^```[a-zA-Z]*\s*/g, '').replace(/```\s*$/g, '');
        // 去掉首尾引号
        t = t.replace(/^['"“”‘’]+/, '').replace(/['"“”‘’]+$/, '');
        // 去掉常见前缀
        t = t.replace(/^(翻译(结果)?|译文|中文|输出|Answer|Result|Translation)[:：]\s*/i, '');
        return t.trim();
    }

    displayResults(translations) {
        document.getElementById('english-result').textContent = translations.english;
        document.getElementById('cantonese-result').textContent = translations.cantonese;
        
        // 添加显示动画
        const cards = document.querySelectorAll('.translation-card');
        cards.forEach(card => {
            card.classList.add('show');
        });
    }

    enablePlayButtons() {
        document.getElementById('play-english').disabled = false;
        document.getElementById('play-cantonese').disabled = false;
    }

    clearResults() {
        // 清空所有输入框和结果
        document.getElementById('chinese-input').value = '';
        document.getElementById('cantonese-input').value = '';  // 清空粤语识别框
        document.getElementById('mandarin-output').value = '';  // 清空普通话转换框
        const englishInput = document.getElementById('english-input');
        const mandarinOutputEn = document.getElementById('mandarin-output-en');
        if (englishInput) englishInput.value = '';
        if (mandarinOutputEn) mandarinOutputEn.value = '';
        document.getElementById('english-result').textContent = '翻译结果将显示在这里...';
        document.getElementById('cantonese-result').textContent = '翻译结果将显示在这里...';
        
        // 禁用播放按钮
        document.getElementById('play-english').disabled = true;
        document.getElementById('play-cantonese').disabled = true;
        
        // 停止所有语音相关活动
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        
        // 如果正在录音，停止录音
        if (this.isRecording) {
            this.stopRecording();
        }
        if (this.isRecordingCantonese) {
            this.stopRecordingCantonese();
        }
        if (this.isRecordingEnglish) {
            this.stopRecordingEnglish();
        }
    }

    async convertToMandarin(cantoneseText) {
        if (!cantoneseText.trim()) {
            document.getElementById('mandarin-output').value = '';
            return;
        }

        try {
            // 使用DeepSeek API进行转换
            const response = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: "system",
                            content: "你是一个粤语转换专家。请将用户输入的粤语/繁体中文转换为标准普通话/简体中文。只需要输出转换后的结果，不需要任何解释或额外内容。"
                        },
                        {
                            role: "user",
                            content: cantoneseText
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                throw new Error('转换请求失败');
            }

            const data = await response.json();
            const mandarinText = this.sanitizeChineseOutput(data.choices[0].message.content.trim());
            document.getElementById('mandarin-output').value = mandarinText;

        } catch (error) {
            console.error('粤语转换错误:', error);
            document.getElementById('mandarin-output').value = '转换失败，请检查API配置或网络连接';
        }
    }

    async convertEnglishToMandarin(englishText) {
        if (!englishText.trim()) {
            const outEl = document.getElementById('mandarin-output-en');
            if (outEl) outEl.value = '';
            return;
        }

        try {
            const response = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: this.createEnToZhSystemPrompt()
                        },
                        {
                            role: 'user',
                            content: englishText
                        }
                    ],
                    temperature: 0.1,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                throw new Error('转换请求失败');
            }

            const data = await response.json();
            const mandarinText = this.sanitizeChineseOutput(data.choices[0].message.content.trim());
            const outEl = document.getElementById('mandarin-output-en');
            if (outEl) outEl.value = mandarinText;

        } catch (error) {
            console.error('英语转换错误:', error);
            const outEl = document.getElementById('mandarin-output-en');
            if (outEl) outEl.value = '转换失败，请检查API配置或网络连接';
        }
    }

    async handlePlayClick(type) {
        if (!this.userInteracted) {
            alert('请先进行翻译操作');
            return;
        }

        // 停止当前播放
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        const text = type === 'english' 
            ? document.getElementById('english-result').textContent
            : document.getElementById('cantonese-result').textContent;

        if (text === '翻译结果将显示在这里...') {
            alert('请先进行翻译');
            return;
        }

        const lang = type === 'english' ? 'en-US' : 'zh-HK';
        await this.playAudio(text, lang);
    }

    async playAudio(text, lang) {
        if (!text || text === '翻译结果将显示在这里...') {
            alert('请先进行翻译');
            return;
        }

        // 停止当前播放
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        try {
            const utterance = new SpeechSynthesisUtterance(text);
            
            // 设置语言
            if (lang === 'english' || lang.startsWith('en')) {
                utterance.lang = 'en-US';
            } else {
                utterance.lang = 'zh-HK'; // 粤语优先使用香港语言包
            }
            
            // 选择最佳声音
            const voice = this.selectBestVoice(utterance.lang);
            if (voice) {
                utterance.voice = voice;
                console.log(`使用语音: ${voice.name} (${voice.lang})`);
            }

            // 语音参数调整
            utterance.rate = 0.8;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // 错误处理
            utterance.onerror = (event) => {
                console.error('语音播放失败:', event.error);
            };

            utterance.onend = () => {
                console.log('语音播放完成');
            };

            // 播放语音
            window.speechSynthesis.speak(utterance);

        } catch (error) {
            console.error('语音播放错误:', error);
        }
    }

    selectBestVoice(lang) {
        const voices = window.speechSynthesis.getVoices();
        
        // 根据语言码查找最匹配的语音
        let targetVoice = null;
        
        if (lang.startsWith('en')) {
            // 优先选择美国英语女声
            targetVoice = voices.find(voice => 
                voice.lang === 'en-US' && voice.name.toLowerCase().includes('female')
            ) || voices.find(voice => voice.lang === 'en-US') 
              || voices.find(voice => voice.lang.startsWith('en'));
        } else if (lang.startsWith('zh')) {
            // 优先选择香港粤语，然后是繁体中文，最后是简体中文
            targetVoice = voices.find(voice => voice.lang === 'zh-HK') 
                       || voices.find(voice => voice.lang === 'zh-TW')
                       || voices.find(voice => voice.lang === 'zh-CN')
                       || voices.find(voice => voice.lang.startsWith('zh'));
        }
        
        if (targetVoice) {
            console.log(`选择语音: ${targetVoice.name} (${targetVoice.lang})`);
        }
        
        return targetVoice;
    }

    testVoices() {
        // 设置测试内容
        const testEnglish = "Hello, this is a test of the English voice engine.";
        const testChinese = "你好，这是粤语语音引擎的测试。";
        
        // 显示测试内容在翻译框中
        document.getElementById('english-result').textContent = testEnglish;
        document.getElementById('cantonese-result').textContent = testChinese;
        
        // 启用播放按钮
        document.getElementById('play-english').disabled = false;
        document.getElementById('play-cantonese').disabled = false;
        
        // 获取语音信息
        const voices = window.speechSynthesis.getVoices();
        console.log('🎙️ 语音引擎测试报告:');
        console.log('================================');
        console.log(`🔢 总共可用语音数量: ${voices.length}`);
        
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        const chineseVoices = voices.filter(v => v.lang.startsWith('zh'));
        
        console.log(`🇺🇸 英文语音: ${englishVoices.length}个`);
        englishVoices.forEach(v => console.log(`  - ${v.name} (${v.lang})`));
        
        console.log(`🇨🇳 中文语音: ${chineseVoices.length}个`);
        chineseVoices.forEach(v => console.log(`  - ${v.name} (${v.lang})`));
        
        console.log('🎯 语音选择测试:');
        console.log(`🇺🇸 英文最佳选择: ${this.selectBestVoice('en-US')?.name || '未找到'}`);
        console.log(`🇭🇰 中文最佳选择: ${this.selectBestVoice('zh-HK')?.name || '未找到'}`);
        
        alert('语音测试内容已加载到翻译框中！\n点击"🔊 朗读"按钮测试语音效果。\n详细信息请查看浏览器控制台(F12)。');
    }

    saveApiKey() {
        localStorage.setItem('translation_api_key', this.apiKey);
    }

    loadApiKey() {
        // 不再自动加载保存的API密钥
        this.apiKey = '';
        document.getElementById('api-key').value = '';
    }

    saveApiType() {
        localStorage.setItem('translation_api_type', this.apiType);
    }

    loadApiType() {
        // 只加载默认的API类型（deepseek）
        this.apiType = 'deepseek';
        document.getElementById('api-type').value = 'deepseek';
    }

    setupCleanup() {
        // 页面卸载时清理
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        window.addEventListener('unload', () => {
            this.cleanup();
        });

        // 页面切换时暂停音频
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAllAudio();
            }
        });
    }

    async startRecordingCantonese() {
        if (!this.cantoneseRecognition) {
            alert('您的浏览器不支持语音识别功能');
            return;
        }

        try {
            // 请求麦克风权限
            await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // 清空粤语输入框
            const cantoneseInput = document.getElementById('cantonese-input');
            cantoneseInput.value = '';
            
            this.isRecordingCantonese = true;
            const voiceBtn = document.getElementById('cantonese-voice-btn');
            voiceBtn.classList.add('recording');
            voiceBtn.title = '点击结束录音';
            voiceBtn.querySelector('.voice-icon').textContent = '⏺';
            
            this.cantoneseRecognition.start();
            
        } catch (error) {
            console.error('启动粤语语音识别失败:', error);
            if (error.name === 'NotAllowedError') {
                alert('请允许使用麦克风以启用语音识别功能');
            } else {
                alert('启动粤语语音识别失败，请检查麦克风权限');
            }
            this.stopRecordingCantonese();
        }
    }

    stopRecordingCantonese() {
        if (!this.cantoneseRecognition) return;
        
        this.isRecordingCantonese = false;
        const voiceBtn = document.getElementById('cantonese-voice-btn');
        voiceBtn.classList.remove('recording');
        voiceBtn.title = '点击开始录音';
        voiceBtn.querySelector('.voice-icon').textContent = '🎤';
        
        try {
            this.cantoneseRecognition.stop();
        } catch (error) {
            console.error('停止粤语语音识别失败:', error);
        }
    }

    async startRecordingEnglish() {
        if (!this.englishRecognition) {
            alert('您的浏览器不支持语音识别功能');
            return;
        }

        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });

            const englishInput = document.getElementById('english-input');
            if (englishInput) englishInput.value = '';

            this.isRecordingEnglish = true;
            const voiceBtn = document.getElementById('english-voice-btn');
            if (voiceBtn) {
                voiceBtn.classList.add('recording');
                voiceBtn.title = '点击结束录音';
                voiceBtn.querySelector('.voice-icon').textContent = '⏺';
            }

            this.englishRecognition.lang = 'en-US';
            this.englishRecognition.start();

        } catch (error) {
            console.error('启动英语语音识别失败:', error);
            if (error.name === 'NotAllowedError') {
                alert('请允许使用麦克风以启用语音识别功能');
            } else {
                alert('启动英语语音识别失败，请检查麦克风权限');
            }
            this.stopRecordingEnglish();
        }
    }

    stopRecordingEnglish() {
        if (!this.englishRecognition) return;

        this.isRecordingEnglish = false;
        const voiceBtn = document.getElementById('english-voice-btn');
        if (voiceBtn) {
            voiceBtn.classList.remove('recording');
            voiceBtn.title = '点击开始录音';
            voiceBtn.querySelector('.voice-icon').textContent = '🎤';
        }

        try {
            this.englishRecognition.stop();
        } catch (error) {
            console.error('停止英语语音识别失败:', error);
        }
    }

    cleanup() {
        // 清理语音合成
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        
        // 清理普通话语音识别
        if (this.recognition && this.isRecording) {
            this.stopRecording();
        }

        // 清理粤语语音识别
        if (this.cantoneseRecognition && this.isRecordingCantonese) {
            this.stopRecordingCantonese();
        }
        // 清理英语语音识别
        if (this.englishRecognition && this.isRecordingEnglish) {
            this.stopRecordingEnglish();
        }
        
        // 清理网络请求
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        
        // 清理音频对象
        if (this.currentAudio) {
            this.currentAudio = null;
        }
        
        // 清理本地存储的API密钥和类型
        localStorage.removeItem('translation_api_key');
        localStorage.removeItem('translation_api_type');
        
        // 清空输入框中的API密钥
        const apiKeyInput = document.getElementById('api-key');
        if (apiKeyInput) {
            apiKeyInput.value = '';
        }
        
        console.log('🧹 内存和API密钥已清理');
    }

    pauseAllAudio() {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TranslationApp();
});

// 确保语音引擎加载完成
if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => {
        console.log('语音引擎已加载，可用语音:', speechSynthesis.getVoices().length);
    };
}