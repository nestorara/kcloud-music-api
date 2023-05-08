import multer from "multer"

const storage = multer.memoryStorage()

const upload = multer({
    storage,
    limits: {
        fileSize: 2147483648 // 2 GiB in bytes
    }
})

export default upload