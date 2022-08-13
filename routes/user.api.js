const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controllers.js");

const { createUser, getAllUsers, getUserById, updateUserById, deleteUserById } =
  userController;
/**
 * @route GET api/foo
 * @description get list of foos
 * @access public
 */
router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:targetId", getUserById);
router.put("/:targetId", updateUserById);
router.delete("/:targetId", deleteUserById);

module.exports = router;
