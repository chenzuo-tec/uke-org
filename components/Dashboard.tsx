import React, { useState, useMemo, useRef } from 'react';
import { Tab } from '../types';
import { Button } from './Button';

interface DashboardProps {
  tabs: Tab[];
  onDelete: (id: string) => void;
  onEdit: (tab: Tab) => void;
  onCreateNew: () => void;
  onImportImage: (file: File, title: string, artist: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ tabs, onDelete, onEdit, onCreateNew, onImportImage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'image' | 'editor'>('image');
  
  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadArtist, setUploadArtist] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTabs = useMemo(() => {
    return tabs.filter(t => 
      t.type === activeTab &&
      (t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       t.artist.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [tabs, searchTerm, activeTab]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setUploadTitle(file.name.split('.')[0]);
      setUploadArtist('');
      setShowUploadModal(true);
    }
    // Reset input so same file can be selected again if cancelled
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const confirmUpload = () => {
    if (selectedFile && uploadTitle) {
        onImportImage(selectedFile, uploadTitle, uploadArtist || '未知艺术家');
        cancelUpload();
        setActiveTab('image'); // Switch to image view to show result
    } else {
        alert("请输入歌曲名称");
    }
  };

  const cancelUpload = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadTitle('');
    setUploadArtist('');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent card click
    onDelete(id);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-orange-600 flex items-center gap-2">
                <span>🍊</span> 乐谱库
            </h2>
            <p className="text-orange-800 opacity-70 mt-1">这里存放着你所有的旋律</p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-full shadow-md border border-orange-100 flex">
              <button 
                onClick={() => setActiveTab('image')}
                className={`px-8 py-2 rounded-full font-bold transition-all ${activeTab === 'image' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:text-orange-500'}`}
              >
                🖼 图片谱
              </button>
              <button 
                onClick={() => setActiveTab('editor')}
                className={`px-8 py-2 rounded-full font-bold transition-all ${activeTab === 'editor' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:text-orange-500'}`}
              >
                🎼 原创谱
              </button>
          </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-center bg-orange-100 p-4 rounded-2xl border border-orange-200">
        <div className="w-full sm:w-auto flex-1">
             <input
                type="text"
                placeholder={`🔍 搜索${activeTab === 'image' ? '图片' : '原创'}谱...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-2 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            />
        </div>
        
        {activeTab === 'image' ? (
             <label className="cursor-pointer bg-white text-orange-600 border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 px-6 py-2 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 whitespace-nowrap">
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    ref={fileInputRef}
                />
                <span>📷 上传新图片</span>
            </label>
        ) : (
            <Button onClick={onCreateNew} className="whitespace-nowrap px-6 rounded-xl">
                + 新建四线谱
            </Button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTabs.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-400 bg-white rounded-3xl border-2 border-dashed border-orange-100 flex flex-col items-center">
                <span className="text-4xl mb-4 opacity-30">🍊</span>
                <p>这里还没有乐谱哦。</p>
                <p className="text-sm mt-2">{activeTab === 'image' ? '点击右上角上传一张吧！' : '点击右上角开始创作吧！'}</p>
            </div>
        ) : (
            filteredTabs.map(tab => (
                <div 
                    key={tab.id} 
                    onClick={() => onEdit(tab)}
                    className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-orange-50 hover:border-orange-200 flex flex-col h-full cursor-pointer relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-orange-100 rounded-full -mr-10 -mt-10 opacity-20 group-hover:scale-150 transition-transform"></div>

                    <div className="flex-1 z-10">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-gray-800 truncate pr-4">{tab.title}</h3>
                        </div>
                        <p className="text-sm text-orange-600 font-medium mb-4 bg-orange-50 inline-block px-2 py-1 rounded-md">
                            {tab.artist || '未知艺术家'}
                        </p>
                        
                        {tab.type === 'image' && tab.imageUrl && (
                            <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4 relative border border-gray-100">
                                <img src={tab.imageUrl} alt={tab.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                        )}
                        
                        {tab.type === 'editor' && (
                             <div className="aspect-video bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden border border-orange-100">
                                <div className="space-y-3 w-3/4 opacity-30">
                                    <div className="h-px bg-orange-800 w-full"></div>
                                    <div className="h-px bg-orange-800 w-full"></div>
                                    <div className="h-px bg-orange-800 w-full"></div>
                                    <div className="h-px bg-orange-800 w-full"></div>
                                </div>
                                <span className="absolute text-4xl transform group-hover:rotate-12 transition-transform">🎵</span>
                             </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-4 border-t border-orange-50 z-10">
                        <span className="text-xs text-gray-400">
                            {new Date(tab.createdAt).toLocaleDateString()}
                        </span>
                        <button 
                            onClick={(e) => handleDelete(e, tab.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="删除"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">保存图片谱</h3>
                
                {previewUrl && (
                    <div className="w-full h-40 bg-gray-100 rounded-xl overflow-hidden mb-4">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">歌曲名称</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                            placeholder="例如：晴天"
                            value={uploadTitle}
                            onChange={(e) => setUploadTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">演唱者/艺术家</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                            placeholder="例如：周杰伦"
                            value={uploadArtist}
                            onChange={(e) => setUploadArtist(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button 
                        onClick={cancelUpload}
                        className="flex-1 py-2 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors"
                    >
                        取消
                    </button>
                    <button 
                        onClick={confirmUpload}
                        className="flex-1 py-2 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 shadow-md hover:shadow-lg transition-all"
                    >
                        确认保存
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};