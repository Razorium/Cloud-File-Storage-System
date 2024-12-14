import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center">
			<div className="max-w-md w-full mx-auto">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-900">
						Welcome to FileSystem
					</h1>
					<p className="mt-4 text-lg text-gray-600">
						Store and manage your files securely
					</p>
				</div>

				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					<div className="space-y-6">
						<Link
							href="/login"
							className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Sign In
						</Link>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-300"></div>
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-white text-gray-500">
									Don't have an account?
								</span>
							</div>
						</div>

						<Link
							href="/signup"
							className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Create Account
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
