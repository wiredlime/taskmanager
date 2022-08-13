const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controllers.js");
const { createTask, getAllTasks, getTaskById, updateTask, deleteTaskById } =
  taskController;

/**
 * @route GET api/foo
 * @description get list of foos
 * @access public
 */
router.post("/", createTask);
router.get("/", getAllTasks);
router.get("/:taskId", getTaskById);
router.put("/:taskId", updateTask);
router.put("/:taskId", deleteTaskById);

module.exports = router;
