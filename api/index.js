// Vercel 入口文件
try {
  const app = require('../server/dist/index.js').default;
  module.exports = app;
} catch (error) {
  console.error('Failed to load app:', error);
  module.exports = (req, res) => {
    res.status(500).json({
      success: false,
      error: 'Server initialization failed',
      details: error.message
    });
  };
}
