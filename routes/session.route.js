const express = require("express");
const router = express.Router();
const SessionModel = require("../models/session.model");
const UserModel = require("../models/user.model");
const jwToken = require("jsonwebtoken");
const sessionMethod = require("../methods/session.methods");

const authenticate = async reqHeaderAuthorization => {
  let decodedToken;
  let result = reqHeaderAuthorization.split(" ")[1];
  if (result === "null") {
    throw new Error("Not logged in");
  }
  try {
    decodedToken = await jwToken.verify(result, "a-secret-key");
    return decodedToken;
  } catch (err) {
    throw new Error("Session expired");
  }
};

router.get("/", async (req, res, next) => {
  console.log("entered get/session");
  try {
    const decodedToken = await authenticate(req.headers.authorization);
    const foundSession = await SessionModel.find();
    const foundUser = await UserModel.findOne({ _id: foundSession[0].srcId });
    return res
      .status(200)
      .json({ session: foundSession[0].thisSession, instructor: foundUser.name });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    console.log("post session is called");
    const decodedToken = await authenticate(req.headers.authorization);
    const foundUser = await UserModel.findOne({ _id: decodedToken.sub });
    if (foundUser.role === "Instructor") {
      const sessionList = await SessionModel.find();
      if (sessionList.length > 0) {
        await SessionModel.findOneAndUpdate(
          { _id: sessionList[0]._id },
          { $set: { thisSession: req.body.session, srcId: decodedToken.sub } }
        );
        return res
          .status(200)
          .json(`Session successfully updated: ${sessionList}`);
      } else {
        await sessionMethod.createOne({
          thisSession: req.body.session,
          srcId: decodedToken.sub
        });
        return res
          .status(200)
          .json(`Session successfully added: ${sessionList}`);
      }
    } else {
      throw new Error("Only instructors are allowed to edit this field");
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;