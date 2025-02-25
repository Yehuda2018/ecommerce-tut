const express = require("express");
const { createBrand, updateBrand, deleteBrand, getBrand, getAllBrand } = require("../controller/brandCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware,isAdmin, createBrand);
router.put("/:id", authMiddleware,isAdmin, updateBrand);
router.get("/:id",  getBrand);
router.delete("/:id", authMiddleware,isAdmin, deleteBrand);
router.get("/",  getAllBrand);

module.exports = router;