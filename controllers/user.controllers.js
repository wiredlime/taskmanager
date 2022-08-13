const { sendResponse, AppError, validator } = require("../helpers/utils.js");
const ObjectId = require("mongoose").Types.ObjectId;
const User = require("../models/User.js");

const userController = {};

//Create a User-----
userController.createUser = async (req, res, next) => {
  let info = req.body;

  try {
    //Validate inputs
    if (!info) throw new AppError(400, "Missing information", "Bad Request");
    const created = await User.create(info);

    //Send response
    sendResponse(res, 200, true, { created }, null, "Create User Success");
  } catch (err) {
    next(err);
  }
};

//Get all users ------
userController.getAllUsers = async (req, res, next) => {
  //in real project you will getting condition from from req then construct the filter object for query
  // empty filter mean get all
  const { name, role, ...filterQuery } = req.query;
  try {
    //Validate inputs
    const filterKeys = Object.keys(filterQuery);
    if (filterKeys.length)
      throw new AppError(400, "Not accepted query", "Bad Request");

    //Get users
    let users;
    if (!name && !role) {
      users = await User.find();
    }
    if (!name && role) {
      users = await User.find({ role });
    }
    if (!role && name) {
      users = await User.find({ name });
    }
    if (role && name) {
      users = await User.find({ name, role });
    }

    const totalUsers = await User.find().count();
    const count = users.length;
    const userData = { totalUsers, count, users };

    sendResponse(
      res,
      200,
      true,
      { userData },
      null,
      "Found list of users success"
    );
  } catch (err) {
    next(err);
  }
};

userController.getUserById = async (req, res, next) => {
  //in real project you will getting id from req. For updating and deleting, it is recommended for you to use unique identifier such as _id to avoid duplication
  //you will also get updateInfo from req
  // empty target and info mean update nothing
  const { targetId } = req.params;

  //options allow you to modify query. e.g new true return lastest update of data
  const options = { new: true };
  try {
    //--Validate inputs
    //check if id from route is a mongo ObjectId
    ObjectId.isValid(targetId);

    //--Query
    const singleUser = await User.findById(targetId);

    sendResponse(res, 200, true, { singleUser }, null, "Get one user success");
  } catch (err) {
    next(err);
  }
};

//Update a user------
userController.updateUserById = async (req, res, next) => {
  //in real project you will getting id from req. For updating and deleting, it is recommended for you to use unique identifier such as _id to avoid duplication
  //you will also get updateInfo from req
  // empty target and info mean update nothing
  const { targetId } = req.params;

  const { ...updateInfo } = req.body;
  //options allow you to modify query. e.g new true return lastest update of data
  const options = { new: true };

  const allowedFields = ["name", "role", "idDeleted"];
  try {
    //--Validate inputs
    //check if id from route is a mongo ObjectId
    ObjectId.isValid(targetId);
    //check valid field
    const updateFields = Object.keys(updateInfo);
    updateFields.forEach((field) => {
      if (!allowedFields.includes(field))
        throw new AppError(400, "Update with invalid field", "Bad request");
    });
    //--Query
    const updated = await User.findByIdAndUpdate(targetId, updateInfo, options);

    sendResponse(res, 200, true, { updated }, null, "Update user success");
  } catch (err) {
    next(err);
  }
};
//Delete a user ------
userController.deleteUserById = async (req, res, next) => {
  //in real project you will getting id from req. For updating and deleting, it is recommended for you to use unique identifier such as _id to avoid duplication
  // empty target mean delete nothing
  const targetId = req.paramss;
  //options allow you to modify query. e.g new true return lastest update of data
  const options = { new: true };
  try {
    //--Validate inputs
    validator(targetId);
    //--Query
    const updated = await Foo.findByIdAndDelete(targetId, options);

    sendResponse(res, 200, true, { updated }, null, "Delete user success");
  } catch (err) {
    next(err);
  }
};
//export
module.exports = userController;
