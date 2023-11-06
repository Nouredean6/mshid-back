const express = require('express');
const { registerUser, loginUser, loginStatus, logout, getUser, updateUser,showAdmin, getUsers, deleteUser } = require('../controllers/authControllers');
const { protect, verifyIsAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get('/loggedin', loginStatus);
router.get("/logout", logout);
router.get("/getuser",protect, getUser);
// router.get("/getusers",protect,getUsers);
// router.delete("/delete-user/:id", protect, deleteUser);
router.patch("/update-user",protect, updateUser);
router.get('/admin-only', protect, verifyIsAdmin, showAdmin);



module.exports = router;