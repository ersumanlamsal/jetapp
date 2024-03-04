const jwt = require('jsonwebtoken');
const logService = require('../services/log-services');
async function authenticationMiddleware(req, res, next) {
  try {
    let { authorization } = req.headers;
    if (!authorization && req.query) {
      authorization = req.query.token;
    }
    const { accountId, userId, backToUrl, shortLivedToken } = jwt.verify(
      authorization,
      process.env.MONDAY_SIGNING_SECRET
    );
    req.session = { accountId, userId, backToUrl, shortLivedToken };
    next();
  } catch (err) {
    logService.error(err);
    res.status(401).json({ error: 'not authenticated' });
  }
}

module.exports = {
  authenticationMiddleware,
};
