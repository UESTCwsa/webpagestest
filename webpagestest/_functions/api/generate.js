// functions/api/generate.js

export async function onRequestPost(context) {
    // 1. 获取环境变量中的 Token (一定要在 Cloudflare 后台设置 HF_TOKEN)
    const API_TOKEN = context.env.HF_TOKEN;

    // 指定模型：这里用的是 Stability AI 的 SDXL 模型，你也可以换成其他的
    const MODEL_ID = "stabilityai/stable-diffusion-xl-base-1.0";
    const API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;

    // 2. 检查是否有 Token
    if (!API_TOKEN) {
        return new Response(JSON.stringify({ error: "服务器端未配置 API Token" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        // 3. 解析前端发来的 JSON 数据
        const requestBody = await context.request.json();
        const prompt = requestBody.prompt;

        if (!prompt) {
            return new Response(JSON.stringify({ error: "请输入提示词" }), { status: 400 });
        }

        // 4. 向 Hugging Face 发起请求 (这一步是在云端进行的，用户看不见)
        const hfResponse = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: prompt }),
        });

        // 5. 处理 Hugging Face 的响应
        if (!hfResponse.ok) {
            const errorText = await hfResponse.text();
            return new Response(JSON.stringify({ error: `模型调用失败: ${errorText}` }), {
                status: hfResponse.status,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 6. 直接把图片数据(二进制流)转发给前端
        const imageBlob = await hfResponse.blob();
        return new Response(imageBlob, {
            headers: {
                "Content-Type": "image/jpeg",
                // 允许你的网页访问这个接口
                "Access-Control-Allow-Origin": "*"
            }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}