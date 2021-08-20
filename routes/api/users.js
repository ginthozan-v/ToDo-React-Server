import express from "express";
import bcrypt from "bcryptjs";
import config from "config";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// User Model
import userModel from "../../Model/userModel.js";

// @route   POST api/users
// @desc    Register new user
// @access Public
router.post("/register", (req, res) => {
  const { name, email, password, role, parent } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  userModel.findOne({ email }).then((user) => {
    if (user) {
      return res.status(400).json({ msg: "User already exist" });
    } else {
      const newUser = new userModel({
        name,
        email,
        password,
        role,
        parent,
      });

      // Create salt & hash
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            throw err;
          } else {
            newUser.password = hash;
            newUser.save().then((user) => {
              jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                {
                  expiresIn: 3600,
                },
                (err, token) => {
                  if (err) throw err;
                  res.json({
                    token,
                    user: {
                      id: user.id,
                      name: user.name,
                      email: user.email,
                      role: user.role,
                    },
                  });
                }
              );
            });
          }
        });
      });
    }
  });
});

// @route   POST api/users
// @desc    Sync Users
// @access Public
router.get("/sync", (req, res) => {
  const role = req.query.role;
  const parent = req.query.parent;
  userModel.find(
    { role: { $eq: role }, parent: { $eq: parent } },
    (err, data) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(data);
      }
    }
  );
});

// module.exports = router;
export default router;
