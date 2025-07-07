import React from 'react';
import { createRoot } from 'react-dom/client';
import CommentsContainer from '../components/CommentsContainer';
import ErrorBoundary from '../components/ErrorBoundary';

class UniversalComments {
  private container: HTMLDivElement | null = null;
  private root: any = null;
  private isVisible: boolean = false;

  constructor() {
    console.log('Universal Comments content script initializing...');
    this.init();
    this.setupMessageListener();
    console.log('Universal Comments content script initialized successfully');
  }

  private init() {
    // 创建评论容器
    this.container = document.createElement('div');
    this.container.id = 'universal-comments-root';
    
    // 确保容器不会被网站的CSS影响
    this.container.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      pointer-events: none !important;
      z-index: 2147483647 !important;
    `;
    
    document.body.appendChild(this.container);
    
    // 创建React根节点
    this.root = createRoot(this.container);
  }

  private setupMessageListener() {
    // 监听来自popup的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('Content script received message:', message);

      switch (message.type) {
        case 'TOGGLE_COMMENTS':
          console.log('Toggling comments...');
          this.toggleComments();
          sendResponse({ success: true });
          break;
        case 'USERNAME_UPDATED':
          console.log('Username updated:', message.username);
          // 用户名更新时可以刷新评论显示
          if (this.isVisible) {
            this.renderComments();
          }
          sendResponse({ success: true });
          break;
        default:
          console.log('Unknown message type:', message.type);
      }

      return true; // 保持消息通道开放
    });
  }

  private toggleComments() {
    console.log('Toggle comments called, current visibility:', this.isVisible);
    this.isVisible = !this.isVisible;

    if (this.isVisible) {
      console.log('Showing comments...');
      this.renderComments();
    } else {
      console.log('Hiding comments...');
      this.hideComments();
    }
  }

  private renderComments() {
    console.log('Render comments called');
    console.log('Root exists:', !!this.root);
    console.log('Container exists:', !!this.container);

    if (!this.root || !this.container) {
      console.error('Root or container missing!');
      return;
    }

    // 启用指针事件以便用户交互
    this.container.style.pointerEvents = 'auto';

    const currentUrl = window.location.href;
    console.log('Current URL:', currentUrl);

    try {
      this.root.render(
        <ErrorBoundary>
          <CommentsContainer
            url={currentUrl}
            onClose={() => this.hideComments()}
          />
        </ErrorBoundary>
      );
      console.log('Comments rendered successfully');
    } catch (error) {
      console.error('Error rendering comments:', error);
      // 显示简单的错误信息
      this.container.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #f8d7da; color: #721c24; padding: 16px; border-radius: 8px; border: 1px solid #f5c6cb; z-index: 2147483647; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 8px 0;">评论加载失败</h3>
          <p style="margin: 0; font-size: 14px;">${error instanceof Error ? error.message : '未知错误'}</p>
          <button onclick="this.parentElement.remove()" style="margin-top: 8px; padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">关闭</button>
        </div>
      `;
    }
  }

  private hideComments() {
    if (!this.root || !this.container) return;
    
    this.isVisible = false;
    
    // 禁用指针事件
    this.container.style.pointerEvents = 'none';
    
    // 清空内容
    this.root.render(null);
  }

  // 清理资源
  public destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.root = null;
  }
}

// 确保页面加载完成后再初始化
function initializeUniversalComments() {
  console.log('Initializing Universal Comments...');
  console.log('Document ready state:', document.readyState);

  try {
    new UniversalComments();
  } catch (error) {
    console.error('Failed to initialize Universal Comments:', error);
  }
}

if (document.readyState === 'loading') {
  console.log('Document still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', initializeUniversalComments);
} else {
  console.log('Document already loaded, initializing immediately...');
  initializeUniversalComments();
}

// 处理页面导航（SPA应用）
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // URL变化时，如果评论面板是打开的，需要重新加载评论
    // 这里可以发送消息给评论组件来更新URL
  }
}).observe(document, { subtree: true, childList: true });

// 导出类型以便其他文件使用
export default UniversalComments;
