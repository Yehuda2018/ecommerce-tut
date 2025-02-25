const express = require("express");
const { createCategory, updateCategory, deleteCategory, getCategory, getAllCategory } = require("../controller/prodcategoryCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware,isAdmin, createCategory);
router.put("/:id", authMiddleware,isAdmin, updateCategory);
router.get("/:id",  getCategory);
router.delete("/:id", authMiddleware,isAdmin, deleteCategory);
router.get("/",  getAllCategory);

module.exports = router;