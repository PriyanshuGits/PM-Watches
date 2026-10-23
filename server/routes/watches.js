import express from "express";
import Watch from "../models/Watch.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.pm_auth;

    if (!token) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      decoded.userId
    ).select("_id name email role");

    if (!user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(
      "Watch admin authentication error:",
      error
    );

    return res.status(401).json({
      message: "Session expired or invalid.",
    });
  }
};

/*
  GET ALL WATCHES
  Public — logged-in users can see watches
*/
router.get("/", async (req, res) => {
  try {
    const watches = await Watch.find()
      .sort({ createdAt: -1 });

    return res.json({
      watches,
    });
  } catch (error) {
    console.error(
      "Get watches error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while loading watches.",
    });
  }
});

/*
  ADD WATCH
  Admin only
*/
router.post(
  "/",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        name,
        color,
        price,
        image,
      } = req.body;

      if (
        !name?.trim() ||
        !color?.trim() ||
        !price?.trim()
      ) {
        return res.status(400).json({
          message:
            "Name, color and price are required.",
        });
      }

      const watch = await Watch.create({
        name: name.trim(),
        color: color.trim(),
        price: price.trim(),
        image: image || "",
      });

      return res.status(201).json({
        message:
          "Watch added successfully.",
        watch,
      });
    } catch (error) {
      console.error(
        "Add watch error:",
        error
      );

      return res.status(500).json({
        message:
          "Something went wrong while adding the watch.",
      });
    }
  }
);

/*
  UPDATE WATCH
  Admin only
*/
router.put(
  "/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        name,
        color,
        price,
        image,
      } = req.body;

      if (
        !name?.trim() ||
        !color?.trim() ||
        !price?.trim()
      ) {
        return res.status(400).json({
          message:
            "Name, color and price are required.",
        });
      }

      const watch =
        await Watch.findByIdAndUpdate(
          req.params.id,
          {
            name: name.trim(),
            color: color.trim(),
            price: price.trim(),
            image: image || "",
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!watch) {
        return res.status(404).json({
          message: "Watch not found.",
        });
      }

      return res.json({
        message:
          "Watch updated successfully.",
        watch,
      });
    } catch (error) {
      console.error(
        "Update watch error:",
        error
      );

      return res.status(500).json({
        message:
          "Something went wrong while updating the watch.",
      });
    }
  }
);

/*
  DELETE WATCH
  Admin only
*/
router.delete(
  "/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const watch =
        await Watch.findByIdAndDelete(
          req.params.id
        );

      if (!watch) {
        return res.status(404).json({
          message: "Watch not found.",
        });
      }

      return res.json({
        message:
          "Watch deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete watch error:",
        error
      );

      return res.status(500).json({
        message:
          "Something went wrong while deleting the watch.",
      });
    }
  }
);

export default router;