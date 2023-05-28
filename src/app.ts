import express from "express"
import morgan from "morgan"

import songs from "./routes/songs"

const app = express()

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan("combined"))

// routes
app.use("/songs", songs)

export default app