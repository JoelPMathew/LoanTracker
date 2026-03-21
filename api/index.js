const app = require('../server/server');

// Export as Vercel serverless handler
module.exports = (req, res) => {
  return app(req, res);
};
