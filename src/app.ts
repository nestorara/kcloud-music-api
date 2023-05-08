import express from "express"
import morgan from "morgan"

import songs from "./routes/songs"
import s3ServiceStatus from "./middlewares/s3ServiceStatus"

const app = express()

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan("combined"))
//app.use(s3ServiceStatus)

// routes
app.use("/songs", songs)

export default app