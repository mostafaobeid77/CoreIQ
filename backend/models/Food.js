const mongoose = require('mongoose');

const NutrientsSchema = new mongoose.Schema({
  calories: { type: Number, default: 0, required: true },
  protein: { type: Number, default: 0, required: true },
  fat: { type: Number, default: 0, required: true },
  carbs: { type: Number, default: 0, required: true },
}, { _id: false });

const ServingSchema = new mongoose.Schema({
  size: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  fat: { type: Number, required: true },
  carbs: { type: Number, required: true },
  grams: { type: Number },
}, { _id: false });

const BaseQuantitySchema = new mongoose.Schema({
  amount: { type: Number, default: 100 },
  unit: { type: String, default: 'g' },
  basis: { type: String, enum: ['per100g', 'perServing'], default: 'per100g' },
}, { _id: false });

const FoodSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  nutrients: { type: NutrientsSchema, required: true },
  servings: { type: [ServingSchema], default: [] },
  baseQuantity: { type: BaseQuantitySchema, default: () => ({}) },
  mealTypes: { type: [String], default: [], index: true }, // breakfast, lunch, dinner, snack, drink, dessert, any
}, { timestamps: true });

FoodSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Food', FoodSchema);
