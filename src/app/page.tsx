'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [modifying, setModifying] = useState(false);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      const res = await fetch('/api/designs');
      const data = await res.json();
      if (data.success) {
        setDesigns(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch designs', e);
    }
  };

  const runAgent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/run-agent', {
        headers: {
          'Authorization': 'Bearer ' + (process.env.NEXT_PUBLIC_CRON_SECRET || 'demo-secret')
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert('생성 실패: ' + (data.error || '알 수 없는 오류'));
      }
      await fetchDesigns();
    } catch (e: any) {
      console.error('Agent run failed', e);
      alert('네트워크 오류가 발생했습니다.');
    }
    setLoading(false);
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
          originalPrompt: selectedDesign.prompt
        })
      });
      const data = await res.json();
      if (data.success) {
        setDesigns([data.data, ...designs]);
        setSelectedDesign(data.data);
        setFeedback('');
      }
    } catch (e) {
      console.error('Modify failed', e);
    }
    setModifying(false);
  };

  return (
    <main className="min-h-screen p-6 md:p-12 bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-600 mb-1">POD 자동화 대시보드</h1>
            <p className="text-gray-500 text-sm">트렌드 조사 및 디자인 자동 생성 결과 리뷰</p>
          </div>
          <button 
            onClick={runAgent}
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 sm:py-2 px-6 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? '생성 중...' : '오늘의 디자인 생성하기'}
          </button>
        </header>

        {/* Gallery View */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {designs.map((design) => (
            <div key={design.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer relative" onClick={() => setSelectedDesign(design)}>
              <div className="aspect-square bg-gray-200 relative">
                <img src={design.image_url} alt={design.title} className="w-full h-full object-cover" />
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(design.id); }}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-red-600 p-2.5 sm:p-2 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-sm"
                  title="삭제"
                >
                  🗑️
                </button>
              </div>
              <div className="p-4">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">
                  {design.topic}
                </span>
                <h3 className="font-bold text-gray-800 text-sm line-clamp-2" title={design.title}>{design.title}</h3>
                <p className="text-xs text-gray-500 mt-2">{new Date(design.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
          {designs.length === 0 && !loading && (
            <div className="col-span-full text-center py-12 text-gray-500">생성된 디자인이 없습니다.</div>
          )}
        </section>

        {/* Detail Modal */}
        {selectedDesign && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
              {/* Left: Image */}
              <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center relative p-4 sm:p-6 min-h-[30vh] sm:min-h-0">
                <img src={selectedDesign.image_url} alt={selectedDesign.title} className="max-w-full max-h-full object-contain rounded-xl shadow-md" />
              </div>
              
              {/* Right: Details & Chat */}
              <div className="md:w-1/2 flex flex-col h-full bg-white relative">
                <button onClick={() => setSelectedDesign(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">×</button>
                
                <div className="p-5 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{selectedDesign.title}</h2>
                  <div className="flex gap-2 mb-6">
                    <button onClick={() => handleCopy(selectedDesign.title)} className="text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full font-medium transition-colors">제목 복사</button>
                    <button onClick={() => handleCopy(selectedDesign.tags?.join(', '))} className="text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full font-medium transition-colors">태그 복사</button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Topic</h4>
                      <p className="text-gray-700 bg-gray-50 px-4 py-3 rounded-xl text-sm border border-gray-100">{selectedDesign.topic}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">SEO Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedDesign.tags?.map((tag: string, i: number) => (
                          <span key={i} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Interface for Modification */}
                <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span>✨</span> 디자인 수정 요청
                  </h4>
                  <div className="flex gap-2">
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
