"use client";
import { useState } from "react";

export default function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch("/api/loginApi", {
				method: "POST",
				body: JSON.stringify({ username, password }),
			});
			const data = await response.json();
			console.log(data);
			if (data.error) {
				setError("Invalid username or password");
			} else {
				window.location.href = `/mainSystem?username=${username}`;
			}
		} catch (error) {
			setError("Failed to login");
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center">
			<div className="max-w-md w-full mx-auto">
				<div className="text-center mb-8">
					<h2 className="mt-6 text-3xl font-bold text-gray-900">
						Welcome back
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						Please sign in to your account
					</p>
				</div>
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					<form className="space-y-6" onSubmit={handleSubmit}>
						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium text-gray-700"
							>
								Username
							</label>
							<div className="mt-1">
								<input
									id="username"
									name="username"
									type="text"
									required
									value={username}
									style={{ color: "black" }}
									onChange={(e) => setUsername(e.target.value)}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Password
							</label>
							<div className="mt-1">
								<input
									id="password"
									name="password"
									type="password"
									required
									value={password}
									style={{ color: "black" }}
									onChange={(e) => setPassword(e.target.value)}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
							</div>
						</div>

						{error && <div className="text-red-600 text-sm">{error}</div>}

						<div>
							<button
								type="submit"
								className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								Sign in
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
