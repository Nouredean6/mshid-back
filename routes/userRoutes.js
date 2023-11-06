const express = require('express');
const { getUser, getUsers, deleteUser, updateUser } = require('../controllers/userControllers');
const router = express.Router();

router.patch('/:id',updateUser);
router.get("/", getUsers);
router.get("/:id", getUser);
router.delete("/:id", deleteUser);

module.exports = router;