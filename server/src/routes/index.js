const router = require('express').Router();
const formBuilderRoutes = require('./formBuilder.routes');
const tenantRoutes = require('./tenant.routes');

router.use('/form-builder', formBuilderRoutes);
router.use('/tenants', tenantRoutes);

module.exports = router;
