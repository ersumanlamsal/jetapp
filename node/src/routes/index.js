const router = require('express').Router();
const mondayRoutes = require('./monday');

router.use(mondayRoutes);

router.get('/', function (req, res) {
  res.json(getHealth());
});

function getHealth() {
  return {
    ok: true,
    message: 'Server is working',
  };
}

module.exports = router;
