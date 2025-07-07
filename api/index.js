// Vercel 入口文件
module.exports = (req, res) => {
  try {
    // 动态导入应用
    const appModule = require('../server/dist/index.js');
    const app = appModule.default || appModule;

    if (typeof app === 'function') {
      return app(req, res);
    } else {
      console.error('App is not a function:', typeof app);
      return res.status(500).json({
        success: false,
        error: 'App is not a function',
        type: typeof app
      });
    }
  } catch (error) {
    console.error('Failed to load app:', error);
    return res.status(500).json({
      success: false,
      error: 'Server initialization failed',
      details: error.message,
      stack: error.stack
    });
  }
};
