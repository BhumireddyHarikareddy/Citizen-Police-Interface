const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 1200, quality: "auto" }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG, JPEG, and PNG files are allowed"));
    }

    cb(null, true);
  },
});

const uploadImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) return next(err);
    if (req.file) return next();
    // fallback for older forms that use `photo` as the field name
    upload.single("photo")(req, res, next);
  });
};

module.exports = { upload, uploadImage };
