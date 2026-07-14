const express = require("express")
const connectDB = require("./config/database.js")
const app = express()


connectDB()
    .then(() => {
        console.log("Database Connection Successfully Established");
        app.listen(7777, () => {
            console.log("Server is Successfully running on Port 7777")
        })
    })
    .catch((err) => {
        console.error("Database is not Successfully Connected");

    });

