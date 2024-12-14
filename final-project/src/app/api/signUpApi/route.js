import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
	try {
		const body = await request.json();

		const { username, password } = body;

		// Create a new user in the database
		const newUser = await prisma.user.create({
			data: {
				username,
				password,
			},
		});

		return new Response(JSON.stringify(newUser), { status: 201 });
	} catch (error) {
		console.error("Failed to register user:", error);
		return new Response(JSON.stringify({ error: "Unable to register user" }), {
			status: 500,
		});
	}
}
