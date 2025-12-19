const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const auth = require('../middleware/auth');

router.get('/', auth, favoritesController.getFavorites);
router.post('/', auth, favoritesController.addFavorite);
router.delete('/:foodId', auth, favoritesController.removeFavorite);

module.exports = router;



