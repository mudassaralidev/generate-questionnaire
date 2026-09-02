const asyncHandler = require('../middleware/asyncHandler');
const tenantService = require('../services/tenant.service');

const getTenants = asyncHandler(async (req, res) => {
  const tenants = await tenantService.getTenants();
  res.json({ success: true, data: tenants });
});

module.exports = { getTenants };
