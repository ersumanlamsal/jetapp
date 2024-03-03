const jwt = require('jsonwebtoken');

async function authenticationMiddleware(req, res, next) {
  try {
    let { authorization } = req.headers;
    if (!authorization && req.query) {
      authorization = req.query.token;
    }
    console.log(req.query);
    console.log(authorization);
    const { accountId, userId, backToUrl, shortLivedToken } = jwt.verify(
      authorization,
      process.env.MONDAY_SIGNING_SECRET
    );
    req.session = { accountId, userId, backToUrl, shortLivedToken };
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'not authenticated' });
  }
}

module.exports = {
  authenticationMiddleware,
};
