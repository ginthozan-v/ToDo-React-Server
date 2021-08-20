import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Pusher from "pusher";
import dotenv from "dotenv";
dotenv.config();

//apis
// >>>>>>>>
import userApi from "./routes/api/users.js";
import authApi from "./routes/api/auth.js";
import taskApi from "./routes/api/task.js";

// app config
// >>>>>>>>
const app = express();
const port = process.env.PORT || 8080;

const pusher = new Pusher({
  appId: "1250407",
  key: "73795cebf5c74388d2e3",
  secret: "1995de39a44fa100f2eb",
  cluster: "ap2",
  useTLS: true,
});

// middleware
// >>>>>>>>
app.use(express.json());
app.use(cors());

// DB config
// >>>>>>>>
const connection_url = process.env.MONGO_URI;
mongoose
  .connect(connection_url, {
    useFindAndModify: false,
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((err) => console.log("connection err >>>", err));

mongoose.connection.once("open", () => {
  console.log("DB connected");

  const tasksStream = mongoose.connection.collection("tasks").watch();
  tasksStream.on("change", (change) => {
    if (change.operationType === "insert") {
      const postDetails = change.fullDocument;
      pusher
        .trigger("tasks", "inserted", {
          task: postDetails.task,
          assigned: postDetails.assigned,
          complete: postDetails.complete,
        })
        .catch((err) => console.log("pusher err >>>", err));
    } else if (change.operationType === "delete") {
      pusher
        .trigger("tasks", "inserted", change.documentKey._id)
        .catch((err) => console.log("pusher err >>>", err));
    } else if (change.operationType === "update") {
      pusher
        .trigger("tasks", "updated", change.documentKey._id)
        .catch((err) => console.log("pusher err >>>", err));
    } else {
      console.log("some error on pusher");
    }
  });

  const changeStreamUser = mongoose.connection.collection("users").watch();
  changeStreamUser.on("change", (change) => {
    if (change.operationType === "insert") {
      const postDetails = change.fullDocument;
      pusher
        .trigger("users", "inserted", {
          name: postDetails.name,
          email: postDetails.email,
          role: postDetails.role,
          register_date: postDetails.register_date,
        })
        .catch((err) => console.log("pusher err >>>", err));
    } else {
      console.log("some error on pusher");
    }
  });
});

// api routes
app.get("/", (req, res) => res.status(200).send("hello world"));
app.use("/api/users", userApi);
app.use("/api/auth", authApi);
app.use("/api/task", taskApi);

// listener
app.listen(port, () => console.log(`listening on localhost:${port}`));
