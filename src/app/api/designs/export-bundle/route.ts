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

    for (let i = 0; i < designs.length; i++) {
      const d = designs[i];
      const imageUrl = d.image_url || d.transparent_png_url || d.url;
      if (!imageUrl) continue;

      try {
        const fetchRes = await fetch(imageUrl);
        if (!fetchRes.ok) continue;

        const arrayBuffer = await fetchRes.arrayBuffer();
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
