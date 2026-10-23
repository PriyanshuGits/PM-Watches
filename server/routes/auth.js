import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";

const router = express.Router();

/* =========================
   CREATE JWT
========================= */

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


/* =========================
   SET AUTH COOKIE
========================= */

const setAuthCookie = (res, token) => {
  res.cookie("pm_auth", token, {
    httpOnly: true,
    sameSite: "lax",
    secure:
      process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};


/* =========================
   REQUIRE ADMIN
========================= */

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
      "Admin authentication error:",
      error
    );

    return res.status(401).json({
      message:
        "Session expired or invalid.",
    });
  }
};


/* =========================
   AUTH ME
========================= */

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.pm_auth;

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated.",
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

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Auth check error:",
      error
    );

    return res.status(401).json({
      message:
        "Session expired or invalid.",
    });
  }
});


/* =========================
   ADMIN CHECK
========================= */

router.get(
  "/admin/check",
  requireAdmin,
  (req, res) => {
    return res.json({
      message: "Admin access confirmed.",
      admin: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  }
);


/* =========================
   SIGN UP
========================= */

router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Please fill in all fields.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          "An account with this email already exists.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
    });

    const token = createToken(user);

    setAuthCookie(res, token);

    return res.status(201).json({
      message:
        "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Signup error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while creating your account.",
    });
  }
});


/* =========================
   LOGIN
========================= */

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Please enter your email and password.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Incorrect email or password.",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        message:
          "Incorrect email or password.",
      });
    }

    const token = createToken(user);

    setAuthCookie(res, token);

    return res.json({
      message:
        "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while logging in.",
    });
  }
});


/* =========================
   FORGOT PASSWORD
========================= */

router.post(
  "/forgot-password",
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email?.trim()) {
        return res.status(400).json({
          message:
            "Please enter your email.",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const user =
        await User.findOne({
          email: normalizedEmail,
        });

      if (!user) {
        return res.json({
          message:
            "If an account exists with this email, a reset link has been created.",
        });
      }

      const resetToken =
        crypto.randomBytes(32).toString("hex");

      const resetTokenHash =
        crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex");

      user.resetTokenHash =
        resetTokenHash;

      user.resetTokenExpires =
        new Date(
          Date.now() +
            15 * 60 * 1000
        );

      await user.save();

      const resetUrl =
        `http://localhost:5173/?resetToken=${resetToken}`;

      console.log("");
      console.log(
        "======================================"
      );
      console.log(
        "PM WATCHES PASSWORD RESET"
      );
      console.log(
        "======================================"
      );
      console.log(
        `Email: ${user.email}`
      );
      console.log(
        `Reset URL: ${resetUrl}`
      );
      console.log(
        "Expires in: 15 minutes"
      );
      console.log(
        "======================================"
      );
      console.log("");

      return res.json({
        message:
          "If an account exists with this email, a reset link has been created.",
      });
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      return res.status(500).json({
        message:
          "Something went wrong while creating the reset link.",
      });
    }
  }
);


/* =========================
   RESET PASSWORD
========================= */

router.post(
  "/reset-password",
  async (req, res) => {
    try {
      const {
        token,
        newPassword,
      } = req.body;

      if (
        !token ||
        !newPassword
      ) {
        return res.status(400).json({
          message:
            "Invalid password reset request.",
        });
      }

      if (
        newPassword.length < 6
      ) {
        return res.status(400).json({
          message:
            "New password must be at least 6 characters.",
        });
      }

      const resetTokenHash =
        crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");

      const user =
        await User.findOne({
          resetTokenHash,
          resetTokenExpires: {
            $gt: new Date(),
          },
        });

      if (!user) {
        return res.status(400).json({
          message:
            "This reset link is invalid or has expired.",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          12
        );

      user.password =
        hashedPassword;

      user.resetTokenHash = null;
      user.resetTokenExpires = null;

      await user.save();

      return res.json({
        message:
          "Password reset successfully. You can now login.",
      });
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      return res.status(500).json({
        message:
          "Something went wrong while resetting your password.",
      });
    }
  }
);


/* =========================
   LOGOUT
========================= */

router.post(
  "/logout",
  (req, res) => {
    res.clearCookie(
      "pm_auth",
      {
        httpOnly: true,
        sameSite: "lax",
        secure:
          process.env.NODE_ENV ===
          "production",
      }
    );

    return res.json({
      message:
        "Logged out successfully.",
    });
  }
);


export default router;