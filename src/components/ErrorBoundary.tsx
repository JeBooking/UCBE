import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary details:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="uc-error-boundary" style={{
          padding: '20px',
          background: '#f8d7da',
          color: '#721c24',
          borderRadius: '8px',
          margin: '16px',
          border: '1px solid #f5c6cb'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
            😵 评论组件出错了
          </h3>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
            {this.state.error?.message || '未知错误'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
            style={{
              padding: '8px 16px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            刷新页面重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
