const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Recipe title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Recipe description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'],
      default: 'Lunch',
    },
    ingredients: {
      type: [String],
      required: [true, 'At least one ingredient is required'],
    },
    prepTimeMinutes: {
      type: Number,
      required: true,
      min: [1, 'Prep time must be at least 1 minute'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model('Recipe', recipeSchema);