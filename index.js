const express = require("express");
const cors = require("cors");
// const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const { register, login, deleteUser, allUsers } = require("./apis/auth");

// const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Auth Api started");
});

app.post("/auth/register", register);
app.post("/auth/login", login);
app.delete("/auth/user/:id", deleteUser);
app.get("/auth/users", allUsers);

app.listen(4000, () => {
	console.log("Server started on port 4000");
});

module.exports = app;
