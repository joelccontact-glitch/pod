import { NextResponse } from 'next/server';
import JSZip from 'jszip';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { designs } = body;

    if (!designs || !Array.isArray(designs) || designs.length === 0) {
      return NextResponse.json(
        { error: '최소 1개 이상의 디자인이 필요합니다.' },
        { status: 400 }
      );
    }

    const zip = new JSZip();
    const folder = zip.folder('Pygmy_Pumpkin_Friends_Sticker_PNG_Bundle');

    const reqUrl = new URL(req.url);
    const origin = reqUrl.origin;

    for (let i = 0; i < designs.length; i++) {
      const d = designs[i];
      let imageUrl = d.transparent_png_url || d.image_url || d.imageUrl || d.url || d.image || d.preview_url;
      if (!imageUrl) continue;

      try {
        let arrayBuffer: ArrayBuffer;

        if (imageUrl.startsWith('data:image/')) {
          // Base64 Data URL
          const base64Data = imageUrl.split(',')[1];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let b = 0; b < binaryString.length; b++) {
            bytes[b] = binaryString.charCodeAt(b);
          }
          arrayBuffer = bytes.buffer;
        } else {
          // HTTP(S) URL or relative URL
          const fullUrl = imageUrl.startsWith('/') ? `${origin}${imageUrl}` : imageUrl;
          const fetchRes = await fetch(fullUrl);
          if (!fetchRes.ok) {
            console.error(`Fetch failed for URL ${fullUrl}: status ${fetchRes.status}`);
            continue;
          }
          arrayBuffer = await fetchRes.arrayBuffer();
        }

        const animalName = (d.title || d.prompt || `sticker_${i + 1}`)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .slice(0, 30);
          
        const fileName = `${String(i + 1).padStart(2, '0')}_${animalName}_300dpi.png`;
        folder?.file(fileName, arrayBuffer);
      } catch (err) {
        console.error(`Failed to fetch design image index ${i}:`, err);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    return new Response(zipBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="Pygmy_Pumpkin_Friends_Sticker_PNG_Bundle_${Date.now()}.zip"`,
      },
    });
  } catch (error: any) {
    console.error('ZIP Bundle Export Error:', error);
    return NextResponse.json(
      { error: error.message || 'ZIP 번들 내보내기 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
