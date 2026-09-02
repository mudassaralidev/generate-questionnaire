const TenantQuestion = require('../models/TenantQuestion');

const getTenants = async () => {
  const docs = await TenantQuestion.find({ require_validation: true }, { tenant: 1, _id: 0 });
  return [...new Set(docs.map((d) => d.tenant).filter(Boolean))];
};

module.exports = { getTenants };
