const express = require("express");
const app = express();
var cookieParser = require("cookie-parser");
const feedbackRouter = require("./feedback.route");
const jwtRouter = require("./jwt.route");

app.use(express.json());
app.use(cookieParser());

app.use("/feedback", feedbackRouter);
app.use("/jwt", jwtRouter);

//returns Hello World
app.get("/", (req, res, next) => {
  res
    .status(200)
    .send("Hello World")
    .catch(err => {
      //   err.status = 400;
      err.message = `Could not return hello world`;
      next(err);
    });
});

// //returns a list of all users of the app
// app.get('/user', async (req, res, next) => {
//     const foundUser = await UserModel.find().catch(err => {
//     err.status = 400;
//     err.message = `Could not return all users`;
//     next(err);
//   });
//   res.status(200).send(foundUser);
// })

// //updates an existing feedback item in db
// app.put("/user/:userId/feedback/:feedbackId", async (req, res, next) => {
//   try {
//     const updatedFeedback = await findOneAndUpdate(req.params.id, req.body);
//     res.status(200).send(updatedFeedback);
//   } catch (err) {
//     err.status = 500;
//     err.message = `Could not update feedback item with id ${req.params.id}`;
//     next(err);
//   }
// });

//Error handler
//use try-catch if error handler is not last function that is executed
app.use((err, req, res, next) => {
  if (!err.message) {
    return res
      .status(500)
      .send("Error: something unexpected has happened. Error has no handler.");
  }
  return res.status(400).send({ message: err.message });
});

module.exports = app;
