const express = require('express');
const { createUser, loginUserCtrl, getallUser, getaUser, deleteUser, updateUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword,forgotPasswordToken, resetPassword, loginAdmin, getWishList, saveAddress, userCart, getUserCart, emptyCart, applyCoupon, createOrder, getOrders, updateOrderStatus } = require("../controller/userCtrl");
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');

const router = express.Router();


router.post("/register",createUser);
router.post("/forgot-password-token", forgotPasswordToken)
router.put("/reset-password/:token", resetPassword)
router.put("/password", authMiddleware, updatePassword);
router.put("/save-address", authMiddleware, saveAddress);
router.post("/login",loginUserCtrl);
router.post("/login-admin",loginAdmin);
router.post("/cart",authMiddleware, userCart);
router.post("/cart/applycoupon",authMiddleware, applyCoupon);
router.post("/cart/cash-order",authMiddleware, createOrder);
router.get("/cart",authMiddleware, getUserCart);
router.get("/all-users", getallUser);
router.get("/get-orders", authMiddleware ,getOrders);
router.get("/id/:id", authMiddleware, isAdmin, getaUser);
router.delete("/empty-cart", authMiddleware, emptyCart);
router.delete("/:id", deleteUser);
router.put("/:id", updateUser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/order/update-order/:id", authMiddleware, isAdmin, updateOrderStatus);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/wishlist", authMiddleware, getWishList);




module.exports = router;