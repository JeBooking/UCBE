import React from 'react';
import { createRoot } from 'react-dom/client';
import CommentsContainer from '../components/CommentsContainer';
import ErrorBoundary from '../components/ErrorBoundary';

class UniversalComments {
  private container: HTMLDivElement | null = null;
  private root: any = null;
  private isVisible: boolean = false;
  private currentUrl: string = '';

  constructor() {
    console.log('Universal Comments content script initializing...');
    this.currentUrl = window.location.href;
    this.init();
    this.setupMessageListener();
    this.setupUrlChangeListener();
    console.log('Universal Comments content script initialized successfully');
  }

  private init() {
    // 创建评论容器
    this.container = document.createElement('div');
    this.container.id = 'universal-comments-root';
    
    // 确保容器不会被网站的CSS影响 - 改为浮动窗口
    this.container.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      width: 400px !important;
      max-height: 600px !important;
      pointer-events: none !important;
      z-index: 2147483647 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
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

  private setupUrlChangeListener() {
    // 监听URL变化（适用于SPA应用）
    let lastUrl = window.location.href;

    // 使用MutationObserver监听DOM变化，间接检测URL变化
    const observer = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        console.log('URL changed from', lastUrl, 'to', currentUrl);
        lastUrl = currentUrl;
        this.handleUrlChange(currentUrl);
      }
    });

    // 开始观察
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 监听popstate事件（浏览器前进后退）
    window.addEventListener('popstate', () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        console.log('URL changed via popstate from', lastUrl, 'to', currentUrl);
        lastUrl = currentUrl;
        this.handleUrlChange(currentUrl);
      }
    });

    // 监听pushstate和replacestate（SPA导航）
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const self = this;
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        console.log('URL changed via pushState from', lastUrl, 'to', currentUrl);
        lastUrl = currentUrl;
        // 延迟执行，确保页面状态已更新
        setTimeout(() => {
          self.handleUrlChange(currentUrl);
        }, 100);
      }
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        console.log('URL changed via replaceState from', lastUrl, 'to', currentUrl);
        lastUrl = currentUrl;
        // 延迟执行，确保页面状态已更新
        setTimeout(() => {
          self.handleUrlChange(currentUrl);
        }, 100);
      }
    };
  }

  private handleUrlChange(newUrl: string) {
    console.log('Handling URL change to:', newUrl);
    this.currentUrl = newUrl;

    // 如果评论面板是打开的，自动刷新评论
    if (this.isVisible && this.root) {
      console.log('Comments panel is visible, refreshing comments for new URL');
      this.renderComments();
    }
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

    // 更新当前URL
    this.currentUrl = window.location.href;
    console.log('Current URL:', this.currentUrl);

    try {
      this.root.render(
        <ErrorBoundary>
          <CommentsContainer
            key={this.currentUrl} // 使用URL作为key，确保URL变化时重新渲染
            url={this.currentUrl}
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
