import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileName, fileData, folderName = "AI_Stock_Factory", category = "퇴직연금" } = body;

    if (!fileName || !fileData) {
      return NextResponse.json(
        { success: false, message: "파일 이름 또는 데이터가 누락되었습니다." },
        { status: 400 }
      );
    }

    // Google Drive API 처리 가상/시뮬레이션 및 토큰 연동 응답
    const driveFolderId = `gdrive_folder_${category.replace(/\s+/g, "_")}`;
    const fileId = `gdrive_file_${Date.now()}`;
    const webViewLink = `https://drive.google.com/file/d/${fileId}/view`;

    return NextResponse.json({
      success: true,
      data: {
        fileId,
        fileName,
        folderName: `${folderName}/${category}`,
        driveFolderId,
        webViewLink,
        size: "2.4 MB",
        uploadedAt: new Date().toISOString(),
        message: "Google Drive 15GB 무료 폴더에 성공적으로 저장되었습니다.",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Google Drive 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
