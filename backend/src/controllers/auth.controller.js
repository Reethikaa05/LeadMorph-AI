const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { JsonStore } = require("../utils/store");

const users = new JsonStore("users", []);

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function publicUser(user) {
  const { password, ...rest } = user;
  return rest;
}

async function signup(req, res, next) {
  try {
    const { name, email, password, company } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(),
      name,
      email: email.toLowerCase(),
      password: hashed,
      company: company || "",
      createdAt: new Date().toISOString(),
    };
    users.push(user);

    const token = signToken(user);
    res.status(201).json({ success: true, token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken(user);
    res.json({ success: true, token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = users.find((u) => u.id === req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, company } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const allUsers = users.read();
    const userIndex = allUsers.findIndex((u) => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    allUsers[userIndex] = {
      ...allUsers[userIndex],
      name,
      company: company || "",
    };
    users.write(allUsers);

    res.json({ success: true, user: publicUser(allUsers[userIndex]) });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, me, updateProfile };
