const Joi = require("joi");

const objectId = Joi.string().pattern(/^[a-f\d]{24}$/i, "ObjectId");

const positiveInteger = Joi.number().integer().min(1);

const validationErrorFields = {
  required_error: Joi.string().max(500),
  min_length_error: Joi.string().max(500),
  max_length_error: Joi.string().max(500),
  pattern_error: Joi.string().max(500),
  contains_error: Joi.string().max(500),
  not_contains_error: Joi.string().max(500),
  min_error: Joi.string().max(500),
  max_error: Joi.string().max(500),
  integer_only_error: Joi.string().max(500),
  min_date_error: Joi.string().max(500),
  max_date_error: Joi.string().max(500),
  must_match_option_error: Joi.string().max(500),
  min_selections_error: Joi.string().max(500),
  max_selections_error: Joi.string().max(500),
  min_images_error: Joi.string().max(500),
  max_images_error: Joi.string().max(500),
};

const questionValidationsSchema = Joi.object({
  required: Joi.boolean(),
  min_length: positiveInteger,
  max_length: positiveInteger,
  pattern: Joi.string(),
  contains: Joi.string(),
  not_contains: Joi.string(),
  min: Joi.number(),
  max: Joi.number(),
  integer_only: Joi.boolean(),
  min_date: Joi.string(),
  max_date: Joi.string(),
  must_match_option: Joi.boolean(),
  min_selections: positiveInteger,
  max_selections: positiveInteger,
  ...validationErrorFields,
})
  .unknown(true)
  .default({ required: false });

/** Image slots on `image` questions — required only */
const imageValidationsSchema = Joi.object({
  required: Joi.boolean(),
  required_error: Joi.string().max(500),
})
  .unknown(true)
  .default({ required: false });

/** Image slots on `dynamic_images` questions */
const dynamicImageValidationsSchema = Joi.object({
  required: Joi.boolean(),
  min_images: positiveInteger,
  max_images: positiveInteger,
  required_error: Joi.string().max(500),
  min_images_error: Joi.string().max(500),
  max_images_error: Joi.string().max(500),
})
  .unknown(true)
  .default({ required: false });

const optionSchema = Joi.object({
  _id: objectId.optional(),
  label: Joi.string().required(),
  value: Joi.string().required(),
  order: Joi.number().default(1),
});

const imageSchema = Joi.object({
  _id: objectId.optional(),
  key: Joi.string().required(),
  title: Joi.string().allow("").default(""),
  image_validations: imageValidationsSchema,
  order: Joi.number().default(1),
});

const dynamicImageSchema = Joi.object({
  _id: objectId.optional(),
  key: Joi.string().required(),
  title: Joi.string().allow("").default(""),
  dynamic_image_validations: dynamicImageValidationsSchema,
  order: Joi.number().default(1),
});

const questionSchema = Joi.object({
  _id: objectId.optional(),
  description: Joi.string().allow("").default(""),
  type: Joi.string()
    .valid(
      "radio",
      "checkbox",
      "dropdown",
      "text",
      "textarea",
      "number",
      "date",
      "image",
      "dynamic_images",
    )
    .required(),
  answer_key: Joi.string().required(),
  parent_question_ids: Joi.array().items(objectId).default([]),
  parent_option_ids: Joi.array().items(objectId).default([]),
  order: Joi.number().default(1),
  validations: questionValidationsSchema,
  options: Joi.array().items(optionSchema).default([]),
  images: Joi.array().items(imageSchema).default([]),
  dynamic_images: Joi.array().items(dynamicImageSchema).default([]),
});

const createFormSchema = Joi.object({
  tenant: Joi.string().required(),
  submission_type: Joi.string().valid("FOUND", "NOT_FOUND").required(),
  form_type: Joi.string().valid("submission", "new_poi", "additional").required(),
  questions: Joi.array().items(questionSchema).min(1).required(),
});

const updateFormSchema = Joi.object({
  tenant: Joi.string(),
  submission_type: Joi.string().valid("FOUND", "NOT_FOUND"),
  form_type: Joi.string().valid("submission", "new_poi", "additional"),
  questions: Joi.array().items(questionSchema).min(1),
});

module.exports = {
  createFormSchema,
  updateFormSchema,
  questionValidationsSchema,
  imageValidationsSchema,
  dynamicImageValidationsSchema,
};
