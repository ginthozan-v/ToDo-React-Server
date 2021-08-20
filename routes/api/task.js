import express from "express";
import taskModel from "../../Model/taskModel.js";

const router = express.Router();
// @route   POST api/task
// @desc    Add new task
// @access Public
router.post("/add", (req, res) => {
  const body = req.body;
  taskModel.create(body, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

// @route   POST api/task
// @desc    Update task >> complete task
// @access Public
router.put("/update/:id", (req, res) => {
  taskModel.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    (err, data) => {
      if (err) {
        res.status(500).send(err);
        console.log("err >>>", err);
      } else {
        res.status(201).send(data);
        console.log("completed success");
      }
    }
  );
});

// @route   POST api/task
// @desc    Delete task
// @access Public
router.delete("/delete/:id", (req, res) => {
  try {
    taskModel.findByIdAndDelete(req.params.id, (err, data) => {
      if (err) {
        res.status(500).send(err);
        console.log("err >>>", err);
      } else {
        res.status(201).send(data);
        console.log("deleted success");
      }
    });
  } catch (err) {
    console.log("delete err >>>", err);
  }
});

// @route   POST api/task
// @desc    Sync task
// @access Public
router.get("/sync", (req, res) => {
  const complete = req.query.complete;
  const userId = req.query.assigned;
  taskModel.find(
    { complete: { $eq: complete }, assigned: { $eq: userId } },
    (err, data) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(data);
      }
    }
  );
});

export default router;
