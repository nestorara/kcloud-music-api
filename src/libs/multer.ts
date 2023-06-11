import multer from "multer";

import { MAXFILESIZE } from "../config";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAXFILESIZE,
  },
});

export default upload;
