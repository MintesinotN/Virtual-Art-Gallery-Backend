import multer from "multer";

const storage = multer.memoryStorage(); // Store file in memory (no local storage)
const upload = multer({ storage });

module.exports = upload;
