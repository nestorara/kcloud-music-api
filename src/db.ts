import { connect } from "mongoose";

import { DB_HOST, DB_DATABASE, DB_USER, DB_PASSWORD, DB_PORT } from "./config";

(async () => {
  let mongodbURI = "";
  if (DB_USER && DB_PASSWORD) {
    mongodbURI = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
  } else {
    mongodbURI = `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
  }

  try {
    const db = await connect(mongodbURI);
    console.log("Connect to DB:", db.connection.host);
  } catch (error) {
    console.error(error);
  }
})();
