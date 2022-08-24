const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Get all users
const allUsers = async (req, res) => {
	const users = await prisma.user.findMany();
	users.map((user) => user.password);
	res.send(200, users);
};

// Register user
const register = async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				email: req.body.email,
			},
		});

		if (user) {
			res.send(302, { message: "User already exists" });
			return;
		}

		const hashPassword = await bcrypt.hash(req.body.password, 10);

		try {
			const user = await prisma.user.create({
				data: {
					name: req.body.name,
					email: req.body.email,
					password: hashPassword,
				},
			});

			delete user.password;

			const token = jwt.sign(user, process.env.TOKEN_SECRET, {
				expiresIn: "1h",
			});

			user.token = token;

			res.send(200, { message: "User created successfully", user: user });
		} catch (error) {
			res.send(500, error);
		}
	} catch (error) {
		res.send(500, error);
	}
};

// Login user
const login = async (req, res) => {
	const user = await prisma.user.findUnique({
		where: {
			email: req.body.email,
		},
	});

	if (!user) {
		res.send(404, { message: "User not found" });
		return;
	}

	const validPassword = await bcrypt.compare(
		req.body.password,
		user.password
	);

	if (!validPassword) {
		res.send(401, { message: "Invalid password" });
		return;
	}

	delete user.password;

	const token = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: "1h" });

	user.token = token;

	res.send(200, { message: "User logged in successfully", user: user });
};

// Delete user
const deleteUser = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await prisma.user.delete({
			where: {
				id: id,
			},
		});

		if (!user) {
			res.send(404, { mesasage: "User not found" });
		}

		res.send(200, { message: `User with id ${user.id} deleted` });
	} catch (error) {
		res.send(500, error);
	}
};

// UPDATE USER
const updateUser = async (req, res) => {
	const { id } = req.params;
	const data = req.body;
	try {
		const user = await prisma.user.update({
			where: {
				id: id,
			},
			data: data,
		});

		if (!user) {
			res.send(404, { message: "User not found" });
		}

		res.send(200, { message: `User with id ${user.id} has been updated` });
	} catch (error) {
		res.send(500, error);
	}
};

module.exports = {
	register,
	login,
	deleteUser,
	allUsers,
	updateUser,
};
