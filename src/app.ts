import express from "express";

import songs from "./routes/songs";
import generic from "./routes/generic";
import checkDBStatus from "./middlewares/checkDBStatus";
import HandleExpressErrors from "./middlewares/HandleExpressErrors";

const app = express();

// middlewares before processing request
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(checkDBStatus);

// routes
app.use("/songs", songs);
app.use(generic);

// middlewares after processing request
app.use(HandleExpressErrors);

// Disable express internal cache
app.disable('etag')

export default app;
