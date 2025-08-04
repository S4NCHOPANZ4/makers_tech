const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const catchAsyncErrors = require("../../middleware/catchAsyncErrors.js");

router.get("/admin", catchAsyncErrors(async (req, res) => {
  const dataPath = path.join(__dirname, "../../db/db_admin.json");
  const jsonData = fs.readFileSync(dataPath, "utf-8");
  res.status(200).json(JSON.parse(jsonData));
}));

router.get("/items", catchAsyncErrors(async (req, res) => {
  const dataPath = path.join(__dirname, "../../db/db_items.json");
  const jsonData = fs.readFileSync(dataPath, "utf-8");
  res.status(200).json(JSON.parse(jsonData));
}));

router.get("/user", catchAsyncErrors(async (req, res) => {
  const dataPath = path.join(__dirname, "../../db/db_user.json");
  const jsonData = fs.readFileSync(dataPath, "utf-8");
  res.status(200).json(JSON.parse(jsonData));
}));

module.exports = router;
