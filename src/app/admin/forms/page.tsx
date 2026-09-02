"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface FormItem {
  id: string;
  title: string;
  description: string;
  file_url: string;
  downloads: number;
  created_at: string;
}

export default function AdminForms() {
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 폼 입력 상태
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setForms(data);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !file) {
      alert('모든 필드를 입력하고 파일을 선택해주세요.');
      return;
    }

    setUploading(true);
    try {
      // 1. Storage에 파일 업로드
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `forms/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ssakdamoa-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. 파일의 Public URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('ssakdamoa-files')
        .getPublicUrl(filePath);

      // 3. Database에 데이터 Insert
      const { error: insertError } = await supabase
        .from('forms')
        .insert([
          {
            title,
            description,
            file_url: publicUrl,
          }
        ]);

      if (insertError) throw insertError;

      alert('성공적으로 업로드되었습니다!');
      // 폼 초기화
      setTitle('');
      setDescription('');
      setFile(null);
      // 목록 새로고침
      fetchForms();

    } catch (error: any) {
      console.error('Upload Error:', error);
      alert('업로드 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm('정말로 삭제하시겠습니까? (파일도 스토리지에서 삭제됩니다)')) return;

    try {
      // DB에서 먼저 삭제
      const { error: dbError } = await supabase.from('forms').delete().eq('id', id);
      if (dbError) throw dbError;

      // Storage에서 파일 삭제 (파일명 추출)
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `forms/${fileName}`;
      
      const { error: storageError } = await supabase.storage
        .from('ssakdamoa-files')
        .remove([filePath]);
        
      if (storageError) {
         console.warn('DB는 삭제되었으나, 스토리지 파일 삭제에 실패했습니다.', storageError);
      }

      fetchForms();
    } catch (error: any) {
      console.error('Delete Error:', error);
      alert('삭제 중 오류가 발생했습니다: ' + error.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">실무 서식·양식함 관리</h1>
      <p className="text-gray-500 mb-8">메인 페이지의 서식 리스트와 실시간으로 연동됩니다.</p>

      {/* Upload Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="text-lg font-bold mb-4">새 양식 업로드</h3>
        <form onSubmit={handleUpload} className="flex flex-col gap-4 max-w-2xl">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">양식 제목</label>
            <input 
              type="text" 
              placeholder="예) 근태일지 (출퇴근 기록부)" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">설명 (가이드)</label>
            <input 
              type="text" 
              placeholder="예) 직원/알바 출퇴근 및 근무시간 기록 양식" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">파일 선택 (PDF, HWP, DOCX 등)</label>
            <input 
              type="file" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              disabled={uploading}
            />
          </div>
          <button 
            type="submit" 
            disabled={uploading}
            className="mt-2 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {uploading ? '업로드 중...' : '서식 등록하기'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold">등록된 서식 목록</h3>
          <span className="text-sm text-gray-500">총 {forms.length}건</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="px-6 py-3 font-semibold">제목</th>
                <th className="px-6 py-3 font-semibold">설명</th>
                <th className="px-6 py-3 font-semibold text-center">다운로드 수</th>
                <th className="px-6 py-3 font-semibold text-center">관리</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">데이터를 불러오는 중입니다...</td>
                </tr>
              ) : forms.map((form) => (
                <tr key={form.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-800">{form.title}</td>
                  <td className="px-6 py-4 text-gray-500">{form.description}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold">
                      {form.downloads}회
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleDelete(form.id, form.file_url)}
                      className="text-red-500 hover:text-red-700 font-semibold px-3 py-1 bg-red-50 hover:bg-red-100 rounded transition-colors"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && forms.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">등록된 서식이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
