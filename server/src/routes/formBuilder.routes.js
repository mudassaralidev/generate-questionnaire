const router = require('express').Router();
const ctrl = require('../controllers/formBuilder.controller');
const validate = require('../middleware/validate');
const { createFormSchema, updateFormSchema } = require('../validations/formConfig.validation');

router.get('/resolve', ctrl.resolve);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', validate(createFormSchema), ctrl.create);
router.put('/:id', validate(updateFormSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
