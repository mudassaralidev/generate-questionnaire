const router = require('express').Router();
const { getTenants } = require('../controllers/tenant.controller');

router.get('/', getTenants);

module.exports = router;
