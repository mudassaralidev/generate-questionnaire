const asyncHandler = require("../middleware/asyncHandler");
const service = require("../services/formBuilder.service");

const list = asyncHandler(async (req, res) => {
  const { tenant, submission_type, form_type, questions_type } = req.query;
  const data = await service.list({
    tenant,
    submission_type: submission_type || questions_type,
    form_type,
  });
  res.json({ success: true, data });
});

const resolve = asyncHandler(async (req, res) => {
  const { tenant, submission_type, form_type } = req.query;

  const result = await service.resolve({
    tenant,
    submission_type: submission_type,
    form_type,
  });
  res.json({ success: true, ...result });
});

const getById = asyncHandler(async (req, res) => {
  const data = await service.getById(req.params.id);
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await service.create(req.body);
  res.status(201).json({ success: true, data });
});

const update = asyncHandler(async (req, res) => {
  const data = await service.update(req.params.id, req.body);
  res.json({ success: true, data });
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  res.json({ success: true, message: "Deleted successfully" });
});

module.exports = { list, resolve, getById, create, update, remove };
