export async function onRequestPost(context: any) {
    const { token, prompt } = await context.request.json();

    if (!token || !prompt) {
        return new Response("Missing token or prompt", { status: 400 });
    }

    const hfResponse = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: prompt
            })
        }
    );

    if (!hfResponse.ok) {
        return new Response("Hugging Face API error", { status: 500 });
    }

    return new Response(hfResponse.body, {
        headers: {
            "Content-Type": "image/png"
        }
    });
}
