const express = require("express");
const { createProduct, getaProduct, getAllProduct, updateProduct, deleteProduct, addToWishlist, rating, uploadImages } = require("../controller/productCtrl");
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');
const { uploadPhoto, productImgResize } = require("../middlewares/uploadImages");
const router = express.Router();

router.post('/', createProduct);
router.put('/upload/:id',
     authMiddleware,
     isAdmin,
     uploadPhoto.array("images",10),
     productImgResize,
     uploadImages
    );
router.get('/:id', getaProduct);
router.put('/wishlist', authMiddleware,addToWishlist);
router.put('/rating', authMiddleware, rating);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/', getAllProduct);

module.exports = router;