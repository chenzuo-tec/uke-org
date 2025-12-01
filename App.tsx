import React, { useState, useEffect } from 'react';
import { User, Tab } from './types';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { TabEditor } from './components/TabEditor';

// Helper to encode image file to Base64 for local storage
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('ujejuice_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [tabs, setTabs] = useState<Tab[]>(() => {
    try {
      const saved = localStorage.getItem('ujejuice_tabs');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [currentView, setCurrentView] = useState<'dashboard' | 'editor' | 'imageView'>('dashboard');
  const [activeTab, setActiveTab] = useState<Tab | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem('ujejuice_tabs', JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    if (user) {
        localStorage.setItem('ujejuice_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('ujejuice_user');
    }
  }, [user]);

  const handleLogin = (username: string) => {
    setUser({ username, isAuthenticated: true });
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
  };

  const handleDeleteTab = (id: string) => {
    if (confirm('确定要删除这份乐谱吗？')) {
        setTabs(prev => prev.filter(t => t.id !== id));
        // If the deleted tab was active, go back to dashboard
        if (activeTab?.id === id) {
            setCurrentView('dashboard');
            setActiveTab(undefined);
        }
    }
  };

  const handleEditTab = (tab: Tab) => {
    setActiveTab(tab);
    if (tab.type === 'editor') {
        setCurrentView('editor');
    } else {
        setCurrentView('imageView');
    }
  };

  const handleCreateNew = () => {
    setActiveTab(undefined);
    setCurrentView('editor');
  };

  const handleSaveTab = (updatedTab: Tab) => {
    setTabs(prev => {
        const exists = prev.find(t => t.id === updatedTab.id);
        if (exists) {
            return prev.map(t => t.id === updatedTab.id ? updatedTab : t);
        } else {
            return [updatedTab, ...prev];
        }
    });
    setCurrentView('dashboard');
    setActiveTab(undefined);
  };

  const handleImportImage = async (file: File, title: string, artist: string) => {
    try {
        const base64 = await fileToBase64(file);
        const newTab: Tab = {
            id: Date.now().toString(),
            title: title || file.name.split('.')[0],
            artist: artist || '未知',
            createdAt: Date.now(),
            type: 'image',
            content: [],
            imageUrl: base64
        };
        setTabs(prev => [newTab, ...prev]);
    } catch (e) {
        console.error("Upload failed", e);
        alert("图片上传失败。");
    }
  };

  if (!user || !user.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-orange-50 text-slate-800 pb-20 font-sans">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b border-orange-100 py-3 px-6 flex justify-between items-center sticky top-0 z-50">
        <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => { setCurrentView('dashboard'); setActiveTab(undefined); }}
        >
            <div className="bg-orange-500 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold text-xl relative group-hover:scale-105 transition-transform">
                🍊
            </div>
            <span className="font-bold text-orange-600 hidden sm:block text-lg tracking-tight">橙c的尤克里里</span>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:inline">欢迎, <span className="font-bold text-orange-500">{user.username}</span></span>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-orange-500 transition-colors">退出登录</button>
        </div>
      </div>

      <div className="pt-6">
        {currentView === 'dashboard' && (
            <Dashboard 
                tabs={tabs}
                onDelete={handleDeleteTab}
                onEdit={handleEditTab}
                onCreateNew={handleCreateNew}
                onImportImage={handleImportImage}
            />
        )}

        {currentView === 'editor' && (
            <div className="max-w-4xl mx-auto px-4">
                <TabEditor 
                    initialTab={activeTab}
                    onSave={handleSaveTab}
                    onCancel={() => setCurrentView('dashboard')}
                />
            </div>
        )}

        {currentView === 'imageView' && activeTab && (
             <div className="max-w-4xl mx-auto px-4 flex flex-col gap-4 animate-in fade-in duration-300">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-orange-100">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{activeTab.title}</h2>
                        <p className="text-orange-500 font-medium">{activeTab.artist}</p>
                    </div>
                    <button 
                        onClick={() => setCurrentView('dashboard')}
                        className="text-gray-500 hover:text-orange-500 px-4 py-2 rounded-lg hover:bg-orange-50 transition-all font-bold"
                    >
                        ✕ 关闭
                    </button>
                </div>
                <div className="bg-white p-2 rounded-xl shadow-lg border-4 border-orange-100">
                    <img src={activeTab.imageUrl} alt={activeTab.title} className="w-full h-auto rounded-lg" />
                </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default App;