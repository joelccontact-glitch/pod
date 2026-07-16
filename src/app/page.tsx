'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from "next-auth/react";
import { MOCKUP_TEMPLATES } from '@/lib/mockups';

export default function Home() {
  const { data: session } = useSession();
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [previewDesign, setPreviewDesign] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [modifying, setModifying] = useState(false);
  
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [uploadImageBase64, setUploadImageBase64] = useState('');
  const [uploadPrompt, setUploadPrompt] = useState('');
  const [isGeneratingFromImage, setIsGeneratingFromImage] = useState(false);
  const [uploadPreviewDesign, setUploadPreviewDesign] = useState<any>(null);

  const [styles, setStyles] = useState<any[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string>('');
  
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [styleImageBase64, setStyleImageBase64] = useState('');
  const [styleName, setStyleName] = useState('');
  const [isCreatingStyle, setIsCreatingStyle] = useState(false);
  const [isGeneratingTrend, setIsGeneratingTrend] = useState(false);

  const [isManageStylesModalOpen, setIsManageStylesModalOpen] = useState(false);
  const [editingStyleId, setEditingStyleId] = useState<string | null>(null);
  const [editingStyleName, setEditingStyleName] = useState('');

  const [activeTab, setActiveTab] = useState<'info' | 'mockup'>('info');
  const [selectedMockupId, setSelectedMockupId] = useState(MOCKUP_TEMPLATES[0].id);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchDesigns(page);
    fetchStyles();
  }, [page]);

  useEffect(() => {
    if (activeTab === 'mockup' && selectedDesign) {
      drawMockup();
    }
  }, [activeTab, selectedMockupId, previewDesign, selectedDesign]);

  const drawMockup = () => {
    if (activeTab !== 'mockup') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const template = MOCKUP_TEMPLATES.find(m => m.id === selectedMockupId);
    if (!template) return;

    const designUrl = previewDesign ? previewDesign.image_url : selectedDesign?.image_url;
    if (!designUrl) return;

    const mockupImg = new Image();
    mockupImg.crossOrigin = 'anonymous';
    mockupImg.src = template.imageUrl;

    mockupImg.onload = () => {
      canvas.width = mockupImg.width || 800;
      canvas.height = mockupImg.height || 800;

      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(mockupImg, 0, 0, canvas.width, canvas.height);

      const designImg = new Image();
      designImg.crossOrigin = 'anonymous';
      designImg.src = designUrl;

      designImg.onload = () => {
        ctx.globalCompositeOperation = template.overlay.blendMode as any;
        ctx.drawImage(
          designImg, 
          template.overlay.x, 
          template.overlay.y, 
          template.overlay.width, 
          template.overlay.height
        );
        ctx.globalCompositeOperation = 'source-over';
      };
    };
  };

  const downloadMockup = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg', 0.9);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mockup_${Date.now()}.jpg`;
    a.click();
  };

  const fetchStyles = async () => {
    try {
      const res = await fetch('/api/styles/list');
      const data = await res.json();
      if (data.success) {
        setStyles(data.data);
      }
    } catch (error) {
      console.error('Error fetching styles:', error);
    }
  };

  const handleUpdateStyle = async (id: string) => {
    if (!editingStyleName.trim()) return;
    try {
      const res = await fetch('/api/styles/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editingStyleName })
      });
      if (res.ok) {
        setStyles(styles.map(s => s.id === id ? { ...s, name: editingStyleName } : s));
        setEditingStyleId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteStyle = async (id: string) => {
    if (!confirm('정말 이 화풍을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch('/api/styles/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setStyles(styles.filter(s => s.id !== id));
        if (selectedStyleId === id) setSelectedStyleId('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDesigns = async (currentPage: number = 1) => {
    setLoadingInitial(true);
    try {
      const res = await fetch(`/api/designs?page=${currentPage}&limit=12`);
      const data = await res.json();
      if (data.success) {
        setDesigns(data.data);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) {
      console.error('Failed to fetch designs', e);
    }
    setLoadingInitial(false);
  };

  const runAgent = async () => {
    setLoading(true);
    try {
      const url = selectedStyleId ? `/api/run-agent?styleId=${selectedStyleId}` : '/api/run-agent';
      const res = await fetch(url, {
        headers: {
          'Authorization': 'Bearer ' + (process.env.NEXT_PUBLIC_CRON_SECRET || 'demo-secret')
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert('생성 실패: ' + (data.error || '알 수 없는 오류'));
      }
      await fetchDesigns(1);
      setPage(1);
    } catch (e: any) {
      console.error('Agent run failed', e);
      alert('네트워크 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  const handlePaste = (e: any) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => setUploadImageBase64(event.target?.result as string);
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setUploadImageBase64(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleStylePaste = (e: any) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => setStyleImageBase64(event.target?.result as string);
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleStyleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setStyleImageBase64(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreateStyle = async () => {
    if (!styleImageBase64 || !styleName.trim()) return;
    setIsCreatingStyle(true);
    try {
      const res = await fetch('/api/styles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: styleImageBase64, styleName })
      });
      const data = await res.json();
      if (data.success) {
        setIsStyleModalOpen(false);
        setStyleImageBase64('');
        setStyleName('');
        await fetchStyles();
        setSelectedStyleId(data.data.id);
      } else {
        alert('스타일 생성 실패: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다.');
    }
    setIsCreatingStyle(false);
  };

  const handleManualTrendSearch = async () => {
    setIsGeneratingTrend(true);
    try {
      const res = await fetch('/api/run-agent/styles');
      const data = await res.json();
      if (data.success) {
        alert('✨ 트렌드 화풍 등록 성공: ' + data.data.name);
        await fetchStyles(); // Update dropdown
        setSelectedStyleId(data.data.id);
      } else {
        alert('트렌드 검색 실패: ' + data.error);
      }
    } catch (e) {
      console.error('Trend search failed', e);
      alert('오류가 발생했습니다.');
    }
    setIsGeneratingTrend(false);
  };

  const handleGenerateFromImage = async () => {
    if (!uploadImageBase64 || !uploadPrompt.trim()) return;
    setIsGeneratingFromImage(true);
    try {
      const res = await fetch('/api/designs/from-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: uploadImageBase64, prompt: uploadPrompt, isPreview: true, styleId: selectedStyleId })
      });
      const data = await res.json();
      if (data.success) {
        setUploadPreviewDesign(data.data);
      } else {
        alert('생성 실패: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다.');
    }
    setIsGeneratingFromImage(false);
  };

  const handleConfirmUpload = async () => {
    if (!uploadPreviewDesign) return;
    setIsGeneratingFromImage(true);
    try {
      const res = await fetch('/api/designs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: uploadPreviewDesign.id,
          designData: uploadPreviewDesign
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsImageModalOpen(false);
        setUploadImageBase64('');
        setUploadPrompt('');
        setUploadPreviewDesign(null);
        await fetchDesigns(1);
        setPage(1);
      } else {
        alert('저장 실패: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다.');
    }
    setIsGeneratingFromImage(false);
  };

  const handleCancelUpload = () => {
    setUploadPreviewDesign(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch('/api/designs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setDesigns(designs.filter(d => d.id !== id));
        if (selectedDesign?.id === id) setSelectedDesign(null);
      }
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('복사되었습니다!');
  };

  const handleModify = async () => {
    if (!feedback.trim() || !selectedDesign) return;
    setModifying(true);
    try {
      const res = await fetch('/api/designs/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalId: selectedDesign.id,
          feedback,
          topic: selectedDesign.topic,
          originalPrompt: selectedDesign.prompt,
          isPreview: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setPreviewDesign(data.data);
      }
    } catch (e) {
      console.error('Modify failed', e);
    }
    setModifying(false);
  };

  const handleConfirm = async () => {
    if (!previewDesign || !selectedDesign) return;
    setModifying(true);
    try {
      const res = await fetch('/api/designs/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedDesign.id,
          updates: {
            prompt_hash: previewDesign.prompt_hash,
            prompt: previewDesign.prompt,
            title: previewDesign.title,
            tags: previewDesign.tags,
            image_url: previewDesign.image_url,
            modified_from: previewDesign.modified_from,
            feedback_applied: previewDesign.feedback_applied
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        const updatedDesign = { ...selectedDesign, ...previewDesign, id: selectedDesign.id };
        setDesigns(designs.map(d => d.id === selectedDesign.id ? updatedDesign : d));
        setSelectedDesign(updatedDesign);
        setPreviewDesign(null);
        setFeedback('');
      }
    } catch (e) {
      console.error('Confirm failed', e);
    }
    setModifying(false);
  };

  const handleCancel = () => {
    setPreviewDesign(null);
    setFeedback('');
  };

  return (
    <main className="min-h-screen p-6 md:p-12 bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4 xl:gap-0">
          <div className="shrink-0 w-full xl:w-auto flex justify-between items-start">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-600 mb-1 whitespace-nowrap">POD 자동화 대시보드</h1>
              <p className="text-gray-500 text-sm">트렌드 조사 및 디자인 자동 생성 결과 리뷰</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-start xl:justify-end gap-2 sm:gap-3 w-full xl:w-auto mt-3 xl:mt-0">
            {session?.user && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shrink-0">
                {session.user.image && <img src={session.user.image} alt="Profile" className="w-6 h-6 rounded-full" />}
                <span className="text-xs font-medium text-gray-700">{session.user.email}</span>
                <button onClick={() => signOut()} className="text-xs text-red-500 hover:underline font-bold ml-1">로그아웃</button>
              </div>
            )}
            <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} title="그리드 뷰">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} title="리스트 뷰">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <select
              value={selectedStyleId}
              onChange={(e) => setSelectedStyleId(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 max-w-[120px] sm:max-w-[140px] truncate shrink-0"
            >
              <option value="">화풍 선택 ▾</option>
              {styles.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button 
              onClick={() => setIsManageStylesModalOpen(true)}
              className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-3 sm:py-2 sm:px-4 rounded-xl transition-colors whitespace-nowrap text-xs sm:text-base border border-gray-200"
            >
              화풍 관리
            </button>
            <button 
              onClick={() => setIsStyleModalOpen(true)}
              className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-3 sm:py-2 sm:px-4 rounded-xl transition-colors whitespace-nowrap text-xs sm:text-base"
            >
              화풍 등록
            </button>
            <button 
              onClick={handleManualTrendSearch}
              disabled={isGeneratingTrend}
              className="flex-1 sm:flex-none bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-3 sm:py-2 sm:px-4 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap text-xs sm:text-base"
            >
              {isGeneratingTrend ? '트렌드 분석중..' : '트렌드화풍 생성'}
            </button>
            <button 
              onClick={() => setIsImageModalOpen(true)}
              className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 sm:py-2 sm:px-4 rounded-xl transition-colors whitespace-nowrap text-xs sm:text-base"
            >
              이미지 생성
            </button>
            <button 
              onClick={runAgent}
              disabled={loading}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 sm:py-2 sm:px-4 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap text-xs sm:text-base"
            >
              {loading ? '생성 중..' : '자동 생성'}
            </button>
          </div>
        </header>

        {/* Gallery View */}
        {loadingInitial ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">디자인 데이터를 불러오는 중입니다...</p>
          </div>
        ) : (
          <>
            <section className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
              {designs.map((design) => (
                <div key={design.id} className={`bg-white overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer relative ${viewMode === 'grid' ? 'rounded-2xl' : 'rounded-xl flex flex-row h-32 sm:h-40'}`} onClick={() => setSelectedDesign(design)}>
                  <div className={`${viewMode === 'grid' ? 'aspect-square' : 'w-32 sm:w-40 flex-shrink-0'} bg-gray-200 relative`}>
                    <img src={design.image_url} alt={design.title} className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(design.id); }}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-red-600 p-2.5 sm:p-2 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-sm"
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className={`p-4 flex flex-col justify-center ${viewMode === 'list' ? 'flex-1 min-w-0' : ''}`}>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block w-fit">
                      {design.topic}
                    </span>
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-2" title={design.title}>{design.title}</h3>
                    <p className="text-xs text-gray-500 mt-2">{new Date(design.created_at).toLocaleString('ko-KR')}</p>
                  </div>
                </div>
              ))}
              {designs.length === 0 && !loading && (
                <div className="col-span-full text-center py-12 text-gray-500">생성된 디자인이 없습니다.</div>
              )}
            </section>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-8">
                <button 
                  onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={page === 1 || loadingInitial}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  이전
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={loadingInitial}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={page === totalPages || loadingInitial}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}

        {/* Detail Modal */}
        {selectedDesign && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
              {/* Left: Image */}
              <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center relative p-4 sm:p-6 min-h-[30vh] sm:min-h-0">
                <img src={previewDesign ? previewDesign.image_url : selectedDesign.image_url} alt={previewDesign ? previewDesign.title : selectedDesign.title} className="max-w-full max-h-full object-contain rounded-xl shadow-md" />
              </div>
              
              {/* Right: Details & Chat */}
              <div className="md:w-1/2 flex flex-col flex-1 min-h-0 bg-white relative">
                <button onClick={() => { setSelectedDesign(null); handleCancel(); setActiveTab('info'); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">×</button>
                
                <div className="flex border-b border-gray-100 px-5 sm:px-8 pt-5 sm:pt-8 gap-6">
                  <button 
                    onClick={() => setActiveTab('info')} 
                    className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                  >
                    수정 및 SEO 정보
                  </button>
                  <button 
                    onClick={() => setActiveTab('mockup')} 
                    className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-1.5 ${activeTab === 'mockup' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                  >
                    👕 목업으로 보기
                  </button>
                </div>

                <div className="p-5 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
                  {activeTab === 'info' ? (
                    <>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{previewDesign ? previewDesign.title : selectedDesign.title}</h2>
                  <div className="flex gap-2 mb-6">
                    <button onClick={() => handleCopy(previewDesign ? previewDesign.title : selectedDesign.title)} className="text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full font-medium transition-colors">제목 복사</button>
                    <button onClick={() => handleCopy((previewDesign ? previewDesign.tags : selectedDesign.tags)?.join(', '))} className="text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full font-medium transition-colors">태그 복사</button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Topic</h4>
                      <p className="text-gray-700 bg-gray-50 px-4 py-3 rounded-xl text-sm border border-gray-100">{previewDesign ? previewDesign.topic : selectedDesign.topic}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">SEO Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {(previewDesign ? previewDesign.tags : selectedDesign.tags)?.map((tag: string, i: number) => (
                          <span key={i} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center h-full min-h-[400px]">
                      <div className="w-full mb-4 flex justify-between items-center">
                        <select 
                          value={selectedMockupId}
                          onChange={(e) => setSelectedMockupId(e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                        >
                          {MOCKUP_TEMPLATES.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        <button 
                          onClick={downloadMockup}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          다운로드
                        </button>
                      </div>
                      <div className="relative w-full flex-1 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200">
                        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Interface for Modification */}
                {activeTab === 'info' && (
                  <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span>✨</span> 디자인 수정 요청
                  </h4>
                  <div className="flex gap-2">
                    {previewDesign ? (
                      <div className="flex gap-2 justify-end w-full">
                        <button 
                          onClick={handleCancel}
                          disabled={modifying}
                          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 text-sm flex-1 sm:flex-none shadow-sm"
                        >
                          취소
                        </button>
                        <button 
                          onClick={handleConfirm}
                          disabled={modifying}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 text-sm flex-1 sm:flex-none shadow-sm"
                        >
                          {modifying ? '저장 중...' : '확인'}
                        </button>
                      </div>
                    ) : (
                      <>
                        <input 
                          type="text" 
                          value={feedback}
                          onChange={e => setFeedback(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleModify()}
                          placeholder="예: 배경색을 빨간색으로 변경해줘..." 
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                          disabled={modifying}
                        />
                        <button 
                          onClick={handleModify}
                          disabled={modifying || !feedback.trim()}
                          className="bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 text-sm flex-shrink-0 shadow-sm"
                        >
                          {modifying ? '생성 중...' : '수정'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Image to Image Modal */}
        {isImageModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onPaste={handlePaste}>
            <div className={`bg-white rounded-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative ${uploadPreviewDesign ? 'max-w-4xl md:flex-row' : 'max-w-2xl'}`}>
              <button onClick={() => { setIsImageModalOpen(false); setUploadImageBase64(''); setUploadPrompt(''); setUploadPreviewDesign(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">×</button>
              
              {uploadPreviewDesign ? (
                <>
                  <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center relative p-4 sm:p-6 min-h-[30vh] sm:min-h-0">
                    <img src={uploadPreviewDesign.image_url} alt={uploadPreviewDesign.title} className="max-w-full max-h-full object-contain rounded-xl shadow-md" />
                  </div>
                  <div className="md:w-1/2 flex flex-col flex-1 min-h-0 bg-white relative">
                    <div className="p-5 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{uploadPreviewDesign.title}</h2>
                      <div className="space-y-6 mt-6">
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">SEO Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {uploadPreviewDesign.tags?.map((tag: string, i: number) => (
                              <span key={i} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50">
                      <div className="flex gap-2 justify-end w-full">
                        <button 
                          onClick={handleCancelUpload}
                          disabled={isGeneratingFromImage}
                          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 text-sm flex-1 sm:flex-none shadow-sm"
                        >
                          다시 만들기
                        </button>
                        <button 
                          onClick={handleConfirmUpload}
                          disabled={isGeneratingFromImage}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 text-sm flex-1 sm:flex-none shadow-sm"
                        >
                          {isGeneratingFromImage ? '저장 중...' : '확인 (최종 반영)'}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-6 sm:p-8 flex flex-col h-full w-full">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">이미지로 디자인 생성</h2>
                  
                  <div className="flex-1 space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center hover:bg-gray-50 transition-colors relative flex flex-col items-center justify-center min-h-[200px]">
                      {uploadImageBase64 ? (
                        <>
                          <img src={uploadImageBase64} alt="Preview" className="max-h-64 object-contain rounded-lg" />
                          <button onClick={() => setUploadImageBase64('')} className="mt-2 text-sm text-red-500 hover:underline">이미지 지우기</button>
                        </>
                      ) : (
                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <p className="text-sm text-gray-600 mb-1">여기를 클릭하여 파일 선택 또는 <br/>복사한 이미지를 붙여넣기(Ctrl+V) 하세요.</p>
                          <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">어떻게 응용할까요?</label>
                      <textarea 
                        value={uploadPrompt}
                        onChange={e => setUploadPrompt(e.target.value)}
                        placeholder="예: 이 스타일을 유지하면서 고양이 대신 귀여운 강아지로 바꿔줘" 
                        className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow-sm resize-none h-24"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 justify-end">
                    <button 
                      onClick={() => { setIsImageModalOpen(false); setUploadImageBase64(''); setUploadPrompt(''); setUploadPreviewDesign(null); }}
                      className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                      취소
                    </button>
                    <button 
                      onClick={handleGenerateFromImage}
                      disabled={!uploadImageBase64 || !uploadPrompt.trim() || isGeneratingFromImage}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 min-w-[120px]"
                    >
                      {isGeneratingFromImage ? '생성 중...' : '생성하기'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manage Styles Modal */}
        {isManageStylesModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
              <button onClick={() => { setIsManageStylesModalOpen(false); setEditingStyleId(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">×</button>
              
              <div className="p-6 sm:p-8 flex flex-col h-full">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">⚙️ 화풍 관리</h2>
                
                <div className="overflow-y-auto flex-1 custom-scrollbar space-y-4">
                  {styles.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">저장된 화풍이 없습니다.</div>
                  ) : (
                    styles.map((style) => (
                      <div key={style.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                          {style.image_url ? (
                            <img src={style.image_url} alt={style.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {editingStyleId === style.id ? (
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={editingStyleName}
                                onChange={(e) => setEditingStyleName(e.target.value)}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateStyle(style.id)}
                              />
                              <button onClick={() => handleUpdateStyle(style.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700">저장</button>
                              <button onClick={() => setEditingStyleId(null)} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-300">취소</button>
                            </div>
                          ) : (
                            <h3 className="font-bold text-gray-800 truncate">{style.name}</h3>
                          )}
                        </div>

                        {editingStyleId !== style.id && (
                          <div className="flex gap-2 shrink-0">
                            <button 
                              onClick={() => { setEditingStyleId(style.id); setEditingStyleName(style.name); }}
                              className="text-gray-400 hover:text-blue-600 p-2 transition-colors"
                              title="이름 수정"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDeleteStyle(style.id)}
                              className="text-gray-400 hover:text-red-600 p-2 transition-colors"
                              title="삭제"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Style Creation Modal */}
        {isStyleModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onPaste={handleStylePaste}>
            <div className="bg-white rounded-3xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden relative">
              <button onClick={() => { setIsStyleModalOpen(false); setStyleImageBase64(''); setStyleName(''); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">×</button>
              
              <div className="p-6 sm:p-8 flex flex-col h-full w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">🎨 나만의 화풍 만들기</h2>
                </div>
                
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
                  <h4 className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    사용 방법 안내
                  </h4>
                  <ol className="text-xs text-orange-700 space-y-1.5 pl-5 list-decimal marker:text-orange-400">
                    <li>그림체나 색감이 마음에 드는 <strong>레퍼런스 이미지</strong>를 업로드하세요.</li>
                    <li>이름을 지정하고 저장하면, AI가 <strong>'화풍(스타일)'만 정밀 분석하여 공식으로 저장</strong>합니다.</li>
                    <li>저장 완료 후 메인 화면 상단의 <strong>[화풍 선택 ▾] 드롭다운에서 방금 만든 화풍을 선택</strong>하세요.</li>
                    <li>이후 그림을 생성하면, 어떤 주제를 요청하든 <strong>선택한 화풍이 강제로 적용되어 생성</strong>됩니다!</li>
                  </ol>
                </div>
                
                <div className="flex-1 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">화풍 이름</label>
                    <input 
                      type="text"
                      value={styleName}
                      onChange={e => setStyleName(e.target.value)}
                      placeholder="예: 귀여운 수채화풍" 
                      className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm"
                    />
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center hover:bg-gray-50 transition-colors relative flex flex-col items-center justify-center min-h-[200px]">
                    {styleImageBase64 ? (
                      <>
                        <img src={styleImageBase64} alt="Style Preview" className="max-h-64 object-contain rounded-lg" />
                        <button onClick={() => setStyleImageBase64('')} className="mt-2 text-sm text-red-500 hover:underline">이미지 지우기</button>
                      </>
                    ) : (
                      <>
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-sm text-gray-600 mb-1">레퍼런스 이미지 파일 선택 또는 <br/>붙여넣기(Ctrl+V) 하세요.</p>
                        <input type="file" accept="image/*" onChange={handleStyleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex gap-3 justify-end">
                  <button 
                    onClick={() => { setIsStyleModalOpen(false); setStyleImageBase64(''); setStyleName(''); }}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    취소
                  </button>
                  <button 
                    onClick={handleCreateStyle}
                    disabled={!styleImageBase64 || !styleName.trim() || isCreatingStyle}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 min-w-[120px]"
                  >
                    {isCreatingStyle ? '분석 및 저장 중...' : '화풍 저장하기'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
