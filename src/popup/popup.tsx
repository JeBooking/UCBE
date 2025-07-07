import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { getCurrentUsername, saveCurrentUsername } from '../utils/deviceId';

const Popup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentUsername();
  }, []);

  const loadCurrentUsername = async () => {
    try {
      const currentUsername = await getCurrentUsername();
      setUsername(currentUsername);
    } catch (error) {
      console.error('Failed to load username:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUsername = async () => {
    if (username.trim()) {
      try {
        await saveCurrentUsername(username.trim());
        // 显示保存成功提示
        alert('用户名保存成功！');
        // 通知content script用户名已更新
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'USERNAME_UPDATED',
            username: username.trim()
          });
        }
      } catch (error) {
        console.error('Failed to save username:', error);
        alert('保存用户名失败，请重试');
      }
    } else {
      alert('请输入用户名');
    }
  };

  const toggleComments = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('Active tab:', tab);

      if (!tab.id) {
        alert('无法获取当前页面信息');
        return;
      }

      // 检查是否是特殊页面（chrome://, extension://, etc.）
      if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:'))) {
        alert('此插件无法在浏览器内置页面上使用，请在普通网页上尝试');
        return;
      }

      console.log('Sending TOGGLE_COMMENTS message to tab:', tab.id);

      // 使用 Promise 包装 sendMessage 以便更好地处理错误
      const sendMessagePromise = new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tab.id!, { type: 'TOGGLE_COMMENTS' }, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });

      try {
        const response = await sendMessagePromise;
        console.log('Response from content script:', response);

        if (response && (response as any).success) {
          console.log('Comments toggled successfully');
          // 关闭popup窗口
          window.close();
        } else {
          console.error('Failed to toggle comments');
          alert('显示评论失败，请重试');
        }
      } catch (error) {
        console.error('Chrome runtime error:', error);
        alert('无法连接到页面内容脚本。\n\n可能的解决方案：\n1. 刷新当前页面后重试\n2. 确保不是在浏览器内置页面\n3. 检查插件权限设置');
      }

    } catch (error) {
      console.error('Failed to toggle comments:', error);
      alert('无法显示评论，请刷新页面后重试');
    }
  };

  if (isLoading) {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Universal Comments</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
          用户名:
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="输入你的用户名"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleSaveUsername}
          style={{
            flex: 1,
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          保存
        </button>
        
        <button
          onClick={toggleComments}
          style={{
            flex: 1,
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          显示评论
        </button>
      </div>
    </div>
  );
};

// 渲染popup
const container = document.getElementById('popup-root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}
