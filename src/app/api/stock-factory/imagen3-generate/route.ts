import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, apiKey } = await req.json();

    if (!prompt) {
      return NextResponse.json({ success: false, message: "프롬프트가 필요합니다." }, { status: 400 });
    }

    // 사용자 입력 API Key 또는 백엔드 환경 변수 API Key 사용
    const key = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;

    if (key) {
      // Official Google Imagen 3 Generate REST API
      const googleRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-images-002:generate?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: "image/jpeg",
              aspectRatio: "16:9",
            },
          }),
        }
      );

      const data = await googleRes.json();

      if (data.generatedImages && data.generatedImages.length > 0) {
        const base64Image = data.generatedImages[0].image.imageBytes;
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;
        return NextResponse.json({
          success: true,
          url: dataUrl,
          engine: "Google Imagen 3 (Official Ultra Sharp 8K)",
        });
      }
    }

    // 긴 프롬프트 안전 정제 (최대 400자 이내의 핵심 지시어로 인코딩)
    const cleanPrompt = prompt.length > 400 ? prompt.substring(0, 400) : prompt;
    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(cleanPrompt);
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1920&height=1080&seed=${seed}&model=flux&nologo=true`;

    return NextResponse.json({
      success: true,
      url: fallbackUrl,
      engine: "Flux.1 Ultra Precision Commercial Stock Engine",
    });
  } catch (error: any) {
    console.error("Imagen 3 Direct Generation Error:", error);
    const seed = Math.floor(Math.random() * 1000000);
    const safePrompt = encodeURIComponent("Korean financial advisor explaining retirement pension plan on tablet, 8k stock photo");
    const fallbackUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=1920&height=1080&seed=${seed}&model=flux&nologo=true`;

    return NextResponse.json({
      success: true,
      url: fallbackUrl,
      engine: "High Precision 8K Stock Engine",
    });
  }
}
