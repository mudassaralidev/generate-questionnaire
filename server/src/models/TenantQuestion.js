const { Schema, model } = require('mongoose');

const TenantQuestionSchema = new Schema(
  {},
  {
    collection: 'tenant_questions',
    strict: false,
  }
);

module.exports = model('TenantQuestion', TenantQuestionSchema);
