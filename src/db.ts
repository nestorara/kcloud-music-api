import { connect } from "mongoose";
import { DB_HOST, DB_DATABASE, DB_USER, DB_PASSWORD } from "./config";


(async () => {
    try {
        const db = await connect(`mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_DATABASE}`)
        console.log("Connect to DB:", db.connection.host)
    }
    catch (e) {
        console.error(e)
    }
})()