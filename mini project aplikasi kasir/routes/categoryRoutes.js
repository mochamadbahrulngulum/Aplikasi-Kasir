const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory
} = require('../app/controller/categoryController');

router.use(authMiddleware);
router.get('/', getCategories);
router.post('/', addCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
