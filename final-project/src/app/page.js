"use client";
import FileCard from "@/components/FileCard";
import { useState } from "react";

export default function Home() {
	const [isOpen, setIsOpen] = useState(false);
	const [uploadedFiles, setUploadedFiles] = useState(null);
	const [status, setStatus] = useState("");
	const [sentData, setSentData] = useState(new FormData());
	const URL = "http://98.83.217.172:5000/";

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		const newsentData = new FormData();
		newsentData.append("file", file);
		setSentData(newsentData);
		setUploadedFiles(file);
		setStatus("");
	};

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
				<button
					className="p-2 rounded-full hover:bg-gray-100"
					onClick={() => setIsOpen(true)}
				>
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
							d="M12 4v16m8-8H4"
						/>
					</svg>
				</button>
			</nav>

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="p-6 bg-white rounded-lg shadow-xl w-96">
						<div className="flex justify-between mb-4">
							<h2 className="text-xl font-semibold">Upload File</h2>
							<button
								onClick={() => setIsOpen(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								×
							</button>
						</div>
						<div className="space-y-4">
							<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
								<input
									type="file"
									className="hidden"
									id="fileInput"
									onChange={handleFileChange}
								/>
								<label
									htmlFor="fileInput"
									className="cursor-pointer text-gray-600"
								>
									Click to upload or drag and drop
								</label>
							</div>
							<button
								className="w-full py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
								onClick={async () => {
									if (!uploadedFiles) {
										setStatus("Please select a file first");
										return;
									}

									try {
										const response = await fetch(URL + "upload", {
											method: "POST",
											body: sentData,
										});

										console.log("Response status:", response.status);
										const responseData = await response.json();
										console.log("Response data:", responseData);
										console.log(responseData.filename);

										if (response.ok) {
											setStatus("File uploaded successfully");
											setUploadedFiles(null);
											setTimeout(() => {
												setIsOpen(false);
												setStatus("");
											}, 2000);
										} else {
											setStatus("Upload failed");
											setTimeout(() => {
												setIsOpen(false);
												setStatus("");
											}, 2000);
										}
									} catch (error) {
										console.error("Upload error:", error);
										setStatus("Upload failed");
										setTimeout(() => {
											setIsOpen(false);
											setStatus("");
										}, 2000);
									}

									setUploadedFiles(null);
								}}
							>
								Upload
							</button>
						</div>
					</div>
				</div>
			)}

			{status && (
				<div
					className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
						status.includes("success") ? "bg-green-500" : "bg-red-500"
					} text-white`}
				>
					{status}
				</div>
			)}

			<div className="flex">
				<main className="flex-1 p-6">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
						{[...Array(8)].map((_, i) => (
							<FileCard key={i} index={i} />
						))}
					</div>
				</main>
			</div>
		</main>
	);
}
