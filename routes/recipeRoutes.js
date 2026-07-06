const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const upload = require('../middleware/upload');

/**
 * Builds a Mongoose filter object from query params.
 * Supports:
 *  - exact match: ?category=Lunch
 *  - operators: ?prepTimeMinutes[gte]=10&prepTimeMinutes[lte]=30
 *    Supported operators: gte, gt, lte, lt
 */
function buildFilter(query) {
  const excludedFields = ['page', 'limit', 'sort', 'fields'];
  const queryCopy = { ...query };
  excludedFields.forEach((field) => delete queryCopy[field]);

  let queryStr = JSON.stringify(queryCopy);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  const parsed = JSON.parse(queryStr);

  Object.keys(parsed).forEach((key) => {
    if (parsed[key] && typeof parsed[key] === 'object') {
      Object.keys(parsed[key]).forEach((op) => {
        const val = parsed[key][op];
        if (!isNaN(val)) parsed[key][op] = Number(val);
      });
    }
  });

  return parsed;
}

// POST /recipes -> Create a new recipe (supports optional image upload)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const recipeData = { ...req.body };

    if (typeof recipeData.ingredients === 'string') {
      recipeData.ingredients = recipeData.ingredients.split(',').map((i) => i.trim());
    }

    if (req.file) {
      recipeData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const recipe = await Recipe.create(recipeData);
    res.status(201).json(recipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /recipes -> Get all recipes with filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const filter = buildFilter(req.query);

    const sortBy = req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt';

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const [recipes, totalItems] = await Promise.all([
      Recipe.find(filter).sort(sortBy).skip(skip).limit(limit),
      Recipe.countDocuments(filter),
    ]);

    res.status(200).json({
      currentPage: page,
      itemsPerPage: limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      data: recipes,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /recipes/:id -> Get a single recipe by id
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(200).json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /recipes/:id -> Update a recipe (supports optional image replacement)
router.patch('/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (typeof updateData.ingredients === 'string') {
      updateData.ingredients = updateData.ingredients.split(',').map((i) => i.trim());
    }

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const recipe = await Recipe.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(200).json(recipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /recipes/:id -> Delete a recipe
router.delete('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;