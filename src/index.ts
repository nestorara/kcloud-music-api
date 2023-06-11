import app from "./app";
import { PORT } from "./config";
import "./db";
import { checkRequiredEnvVariables } from "./utils";

checkRequiredEnvVariables()

app.set("port", PORT);

app.listen(app.get("port"), () => {
  console.log("Running app on port", app.get("port"));
});
