import Image from "next/image";
import FileCard from "@/components/FileCard";

export default function Home() {
	return (
		<main className="min-h-screen bg-gray-50">
			<nav className="flex items-center justify-between px-6 py-3 bg-white border-b">
				<div className="flex-1 max-w-xl mx-4">
					<div className="flex items-center px-4 py-2 bg-gray-100 rounded-lg">
						<svg
							className="w-5 h-5 text-gray-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
						<input
							type="text"
							placeholder="Search files"
							className="w-full px-3 py-1 bg-transparent focus:outline-none"
						/>
					</div>
				</div>
				<button className="p-2 rounded-full hover:bg-gray-100">
					<svg
						className="w-6 h-6 text-gray-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
						/>
					</svg>
				</button>
			</nav>

			<div className="flex">
				<main className="flex-1 p-6">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
						{[...Array(8)].map((_, i) => (
							<FileCard index={i} />
						))}
					</div>
				</main>
			</div>
		</main>
	);
}
