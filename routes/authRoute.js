const express = require('express');
const { createUser, loginUserCtrl, getallUser, getaUser, deleteUser, updateUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword,forgotPasswordToken, resetPassword } = require("../controller/userCtrl");
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');

const router = express.Router();


router.post("/register",createUser);
router.post("/forgot-password-token", forgotPasswordToken)
router.put("/reset-password/:token", resetPassword)
router.put("/password", authMiddleware, updatePassword);
router.post("/login",loginUserCtrl);
router.get("/all-users", getallUser);
router.get("/id/:id", authMiddleware, isAdmin, getaUser);
router.delete("/:id", deleteUser);
router.put("/:id", updateUser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);




module.exports = router;