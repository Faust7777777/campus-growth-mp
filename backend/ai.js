// OpenAI 兼容的 AI 调用封装（DeepSeek 默认）。带超时与 JSON 解析容错。
const API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.deepseek.com/v1').replace(/\/$/, '');
const MODEL = process.env.OPENAI_MODEL || 'deepseek-chat';
const TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || '20000', 10);

function isConfigured() {
  return Boolean(API_KEY && API_KEY.trim() && !API_KEY.includes('你的'));
}

// 从模型返回里抽出 JSON（容忍 ```json 代码块或前后多余文本）
function extractJson(text) {
  if (!text) throw new Error('empty AI response');
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) throw new Error('no JSON object found');
  return JSON.parse(t.slice(start, end + 1));
}

async function callAI(messages) {
  if (!isConfigured()) throw new Error('AI not configured (missing OPENAI_API_KEY)');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const resp = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      throw new Error(`AI HTTP ${resp.status}: ${body.slice(0, 200)}`);
    }

    const json = await resp.json();
    const content = json?.choices?.[0]?.message?.content;
    return extractJson(content);
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { callAI, isConfigured, MODEL };
