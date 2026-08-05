import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, style = "photo", width = 2560, height = 1440 } = body;

    // 100% 무료 4K 고화질 스톡 렌더링 엔진 (Pollinations Free Engine)
    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(prompt);
    
    // 2560x1440 4K PNG 100% free high-res image URL
    const highResUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    return NextResponse.json({
      success: true,
      data: {
        url: highResUrl,
        resolution: `${width}x${height}px`,
        estimatedSize: "2.8 MB",
        prompt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "고화질 이미지 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
