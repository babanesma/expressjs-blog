var express = require("express");
var router = express.Router();

router.get("/contact", function (req, res, next) {
  res.render("pages/contact");
});

router.get("/about", function (req, res, next) {
  res.render("pages/about");
});

module.exports = router;
