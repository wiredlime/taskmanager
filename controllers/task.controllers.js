const { sendResponse, AppError, validator } = require("../helpers/utils.js");
const { query, body, validationResult } = require("express-validator");
const ObjectId = require("mongoose").Types.ObjectId;
const Task = require("../models/Task.js");

const taskController = {};

taskController.createTask = async (req, res, next) => {
  const info = req.body;
  const allowedFields = ["name", "description", "status", "isDeleted"];
  try {
    //--Validate inputs
    if (!info || !info.name || !info.description)
      throw new AppError(
        400,
        "Missing information: name and/or description",
        "Bad request"
      );

    const taskFields = Object.keys(info);
    taskFields.forEach((field) => {
      if (!allowedFields.includes(field)) {
        throw new AppError(400, "Invalid task field", "Bad request");
      }
    });

    //--Query

    const newTask = await Task.create(info);

    sendResponse(res, 200, true, { newTask }, null, "Create task success");
  } catch (error) {
    next(error);
  }
};
taskController.getAllTasks = async (req, res, next) => {
  const { ...filterQuery } = req.query;
  const allowedFilter = ["status", "search", "assignee"];
  try {
    //--Validate inputs
    let filterKeys = Object.keys(filterQuery);
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key))
        throw new AppError(
          400,
          "Invalid task field: only take name,status,search,assignee",
          "Bad Request"
        );
      if (key === "assignee") {
        console.log(filterQuery["assignee"]);
        ObjectId.isValid(filterQuery["assignee"]);
      }
      //remove malicious query
      if (!filterQuery[key]) {
        delete filterQuery[key];
      }
    });

    //--Query
    let tasks;
    if (!filterKeys.length) {
      tasks = await Task.find({ isDeleted: false }).populate("assignee");
    }
    const { search, status, assignee } = filterQuery;

    //single-case
    if (search) {
      tasks = await Task.find(
        {
          $or: [
            { description: { $regex: `.*${search}.*` } },
            { name: { $regex: `.*${search}.*` } },
          ],
        },
        { isDeleted: false }
      );
    }
    if (status) {
      tasks = await Task.find({ status }, { isDeleted: false });
    }
    if (assignee) {
      tasks = await Task.find({ assignee }, { isDeleted: false });
    }

    // //paring-case
    if (search && status) {
      tasks = await Task.find({
        $and: [
          {
            $or: [
              { description: { $regex: `.*${search}.*` } },
              { name: { $regex: `.*${search}.*` } },
            ],
          },
          { status },
          { isDeleted: false },
        ],
      });
    }
    if (status && assignee) {
      tasks = await Task.find({
        $and: [{ assignee }, { status }, { isDeleted: false }],
      }).populate("assignee");
    }
    if (search && assignee) {
      tasks = await Task.find({
        $and: [
          { assignee },
          {
            $or: [
              { description: { $regex: `.*${search}.*` } },
              { name: { $regex: `.*${search}.*` } },
            ],
          },
          { isDeleted: false },
        ],
      }).populate("assignee");
    }
    //all-case
    if (status && assignee && search) {
      tasks = await Task.find({
        $and: [
          {
            $or: [
              { description: { $regex: `.*${search}.*` } },
              { name: { $regex: `.*${search}.*` } },
            ],
          },
          { assignee },
          { status },
          { isDeleted: false },
        ],
      }).populate("assignee");
    }

    //--Send Response
    const totalTasks = await Task.find().count();
    const count = tasks.length;
    const taskData = { totalTasks, count, tasks };

    sendResponse(res, 200, true, { taskData }, null, "Get tasks success");
  } catch (error) {
    next(error);
  }
};
taskController.getTaskById = async (req, res, next) => {
  const { targetId } = req.param;
  try {
    //--Validate inputs
    validator(targetId);

    //--Query
    const taskById = await Task.findById(targetId).populate("assignee");

    sendResponse(res, 200, true, { taskById }, null, "Get task success");
  } catch (error) {
    next(error);
  }
};
taskController.updateTask = async (req, res, next) => {
  const { taskId } = req.params;
  const updateInfo = req.body;
  const allowedFields = ["name", "status", "description", "assignee"];

  try {
    //--Validate inputs

    //check param
    ObjectId.isValid(taskId);
    //check body inputs
    if (!updateInfo)
      throw new AppError(400, "Missing update info", "Bad request");
    const updateFields = Object.keys(updateInfo);

    updateFields.forEach((field) => {
      if (!allowedFields.includes(field)) {
        throw new AppError(400, "Invalid update field!", "Bad request");
      }
      //check if assignee is an array
      if (field === "assignee") {
        if (typeof updateInfo[field] !== "object")
          throw new AppError(400, "assignee must be an array", "Bad request");
      }
    });

    //--Query
    const targetTask = await Task.findById(taskId);
    if (!targetTask) throw new AppError(404, "Task not found", "Bad Request");
    //status
    const { status } = targetTask;
    switch (status) {
      case "done":
        if (updateInfo.status !== "archive") {
          throw new AppError(
            400,
            "Done task can only be stored as archive",
            "Bad request"
          );
        }
        break;
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateInfo, {
      new: true,
    }).populate("assignee");

    sendResponse(res, 200, true, { updatedTask }, null, "Get task success");
  } catch (error) {
    next(error);
  }
};
taskController.deleteTaskById = async (req, res, next) => {
  const { taskId } = req.param;
  try {
    //--Validate inputs
    validator(taskId);
    //--Query
    let targetTask = await Task.findById(taskId);
    if (!targetTask) throw new AppError(404, "Task not found", "Not found");

    const deletedTask = await Task.findByIdAndUpdate(
      taskId,
      { isDeleted: true },
      { new: true }
    );
    sendResponse(res, 200, true, { deletedTask }, null, "Delete task success");
  } catch (err) {
    next(err);
  }
};
//export
module.exports = taskController;
