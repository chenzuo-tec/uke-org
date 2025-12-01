import React, { useState } from 'react';
import { Button } from './Button';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-200 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border-4 border-orange-200">
        <div className="flex justify-center mb-6">
            {/* Orange Icon */}
            <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center shadow-lg relative">
                <span className="text-5xl z-10">🍊</span>
                <div className="absolute top-0 right-2 w-6 h-6 bg-green-500 rounded-full rounded-bl-none transform -rotate-45"></div>
            </div>
        </div>
        <h1 className="text-3xl font-bold text-center text-orange-600 mb-2">橙c的尤克里里</h1>
        <p className="text-center text-gray-500 mb-8">记录你的每一个音乐瞬间</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 outline-none transition-colors"
              placeholder="你的名字"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full mt-4">
            开始弹奏
          </Button>
        </form>
      </div>
    </div>
  );
};