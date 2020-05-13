const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const controller = require("./controller");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log(file);
    cb(null, "suppliers/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        file.originalname.split(".")[file.originalname.split(".").length - 1]
    );
  },
});

const upload = multer({ storage });

/* GET home page. */
router.get("/", function (req, res) {
  res.render("index", { title: "Express" });
});

router.post("/:supplier", upload.single("file"), (req, res) => {
  // console.log(req.file);
  const supplier = req.params.supplier;
  if (!supplier)
    return res.status(400).send({ error: "Supplier name required " });
  const supplierExists = typeof controller[supplier] !== "undefined";
  if (!supplierExists)
    return res.status(404).send({ error: "supplier not found" });
  const filePath = controller[supplier](req.file.path);
  // console.log("file", file);
  res.sendFile(path.join(__dirname, filePath));
});

module.exports = router;
