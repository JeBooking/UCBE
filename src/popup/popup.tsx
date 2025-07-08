import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const Popup: React.FC = () => {
  useEffect(() => {
    // 直接触发评论界面并关闭popup
    showComments();
  }, []);

  const showComments = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.id) {
        alert('无法获取当前页面信息');
        return;
      }

      // 检查是否是特殊页面
      if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:'))) {
        alert('此插件无法在浏览器内置页面上使用，请在普通网页上尝试');
        return;
      }

      // 发送消息显示评论
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_COMMENTS' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError);
          alert('无法在此页面显示评论。请确保页面已完全加载。');
        } else {
          // 关闭popup
          window.close();
        }
      });
    } catch (error) {
      console.error('Failed to show comments:', error);
      alert('无法显示评论，请刷新页面后重试');
    }
  };

  // 不渲染任何UI，直接触发评论界面
  return (
    <div style={{ padding: '16px', textAlign: 'center' }}>
      <div>正在打开评论界面...</div>
    </div>
  );
};



// 渲染popup
const container = document.getElementById('popup-root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}
