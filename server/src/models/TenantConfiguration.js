const { Schema, model, Types } = require('mongoose');

const OptionSchema = new Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
  order: { type: Number, default: 1 },
});

const ImageSchema = new Schema({
  key: { type: String, required: true },
  title: { type: String, default: '' },
  image_validations: {
    type: Schema.Types.Mixed,
    default: { required: false },
  },
  order: { type: Number, default: 1 },
});

const DynamicImageSchema = new Schema({
  key: { type: String, required: true },
  title: { type: String, default: '' },
  dynamic_image_validations: {
    type: Schema.Types.Mixed,
    default: { required: false },
  },
  order: { type: Number, default: 1 },
});

const QuestionSchema = new Schema({
  description: { type: String, default: '' },
  type: {
    type: String,
    enum: [
      'radio',
      'checkbox',
      'dropdown',
      'text',
      'textarea',
      'number',
      'date',
      'image',
      'dynamic_images',
    ],
    required: true,
  },
  answer_key: { type: String, required: true, trim: true },
  parent_question_ids: [{ type: Types.ObjectId }],
  parent_option_ids: [{ type: Types.ObjectId }],
  order: { type: Number, default: 1 },
  validations: {
    type: Schema.Types.Mixed,
    default: { required: false },
  },
  options: [OptionSchema],
  images: [ImageSchema],
  dynamic_images: [DynamicImageSchema],
});

const TenantConfigurationSchema = new Schema(
  {
    tenant: { type: String, required: true, index: true },
    type: { type: String, default: 'form_questions' },
    submission_type: { type: String, default: "" },
    form_type: { type: String, required: true },
    questions: [QuestionSchema],
  },
  {
    timestamps: true,
    collection: 'validator_tenant_configurations',
  }
);

TenantConfigurationSchema.index(
  { tenant: 1, submission_type: 1, form_type: 1, type: 1 },
  { unique: true }
);

module.exports = model('TenantConfiguration', TenantConfigurationSchema);
