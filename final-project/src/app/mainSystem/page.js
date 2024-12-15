"use client";
import FileCard from "../../components/FileCard";
import FileCardTrash from "../../components/fileCardTrash";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
	const searchParams = useSearchParams();
	const [search, setSearch] = useState("");
	const username = searchParams.get("username");
	const [isOpen, setIsOpen] = useState(false);
	const [uploadedFiles, setUploadedFiles] = useState([]);
	const [status, setStatus] = useState("");
	const [sentData, setSentData] = useState(new FormData());
	const URL = "http://3.209.51.201:5000/";
	const [files, setFiles] = useState([]);
	const [atTrash, setAtTrash] = useState(false);

	const loadData = async () => {
		const response = await fetch(`${URL}list?username=${username}`);
		const data = await response.json();
		let temp = [];
		for (let i = 0; i < data.length; i++) {
			temp.push({
				id: i,
				name: data[i],
			});
		}
		setFiles(temp);
	};

	useEffect(() => {
		loadData();
	}, []);

	const handleFileChange = (event) => {
		const files = Array.from(event.target.files);
		setUploadedFiles(files);
		setStatus("");
	};

	const handleDownload2 = async () => {
		try {
			const response = await fetch(
				`${URL}download?username=${username}&filename=${search}`
			);
			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `${search}`; // Adjust filename and extension as needed
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
				setSearch("");
			} else {
				console.error("Download failed");
			}
		} catch (error) {
			console.error("Download error:", error);
		}
	};

	const trashHandle = async () => {
		setAtTrash(true);
		const response = await fetch(`${URL}listTrash?username=${username}`);
		if (response.ok) {
			const data = await response.json();
			let temp = [];
			for (let i = 0; i < data.length; i++) {
				temp.push({
					id: i,
					name: data[i],
				});
			}
			setFiles(temp);
		} else {
			console.error("Delete failed");
		}
	};

	const handleRestore = async (fileId) => {
		const response = await fetch(
			`${URL}restoreTrash?username=${username}&filename=${files[fileId].name}`
		);
		if (response.ok) {
			trashHandle();
		} else {
			console.error("Restore failed");
		}
	};

	const handleDeleteTrash = async (fileId) => {
		const response = await fetch(
			`${URL}removeTrash?username=${username}&filename=${files[fileId].name}`
		);
		if (response.ok) {
			trashHandle();
		} else {
			console.error("Delete failed");
		}
	};

	const handleDownload = async (fileId) => {
		try {
			const response = await fetch(
				`${URL}download?username=${username}&filename=${files[fileId].name}`
			);
			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `${files[fileId].name}`; // Adjust filename and extension as needed
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
			} else {
				console.error("Download failed");
			}
		} catch (error) {
			console.error("Download error:", error);
		}
	};

	const handleDelete = async (fileId) => {
		try {
			const response = await fetch(
				`${URL}remove?username=${username}&filename=${files[fileId].name}`
			);
			if (response.ok) {
				loadData();
			} else {
				console.error("Delete failed");
			}
		} catch (error) {
			console.error("Delete error:", error);
		}
	};

	const handleViewInfo = (fileId) => {
		console.log("Viewing info for file:", fileId);
	};

	const handleRename = async (fileId) => {
		const newName = prompt("Enter new file name:", files[fileId].name);
		if (newName.includes(".")) {
			setStatus("File name cannot contain a dot");
			return;
		}
		const botak = files[fileId].name.split(".");
		const extension = botak[botak.length - 1];
		console.log(extension);
		if (!newName) return; // If user cancels or enters empty string

		try {
			const response = await fetch(
				`${URL}rename?username=${username}&filename=${files[fileId].name}&newname=${newName}.${extension}`
			);
			if (response.ok) {
				loadData();
			} else {
				console.error("Rename failed");
			}
		} catch (error) {
			console.error("Rename error:", error);
		}
	};

	const uploadFiles = async () => {
		if (uploadedFiles.length === 0) {
			setStatus("Please select files first");
			return;
		}

		try {
			const uploadPromises = uploadedFiles.map(async (file) => {
				const formData = new FormData();
				formData.append("file", file);

				const response = await fetch(URL + `upload?username=${username}`, {
					method: "POST",
					body: formData,
				});

				return response.ok;
			});

			const results = await Promise.all(uploadPromises);

			if (results.every((result) => result)) {
				setStatus("All files uploaded successfully");
				setUploadedFiles([]);
				setTimeout(() => {
					setIsOpen(false);
					setStatus("");
				}, 2000);
				loadData();
			} else {
				setStatus("Some files failed to upload");
				setTimeout(() => {
					setIsOpen(false);
					setStatus("");
				}, 2000);
			}

			setUploadedFiles([]);
		} catch (error) {
			console.error("Upload error:", error);
			setStatus("Upload failed");
			setTimeout(() => {
				setIsOpen(false);
				setStatus("");
			}, 2000);
		}
	};

	return (
		<main className="min-h-screen bg-gray-50">
			<nav className="flex items-center justify-between px-6 py-3 bg-white border-b">
				<div className="flex-1 max-w-xl mx-4">
					<div className="flex items-center px-4 py-2 bg-gray-100 rounded-lg">
						<button
							className="p-2 rounded-full hover:bg-gray-100"
							onClick={() => handleDownload2()}
						>
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
						</button>
						<input
							type="text"
							onChange={(e) => setSearch(e.target.value)}
							style={{ color: "black" }}
							placeholder="Download file"
							className="w-full px-3 py-1 bg-transparent focus:outline-none"
						/>
					</div>
				</div>
				<button
					className="p-2 rounded-full hover:bg-gray-100"
					onClick={() => {
						setAtTrash(false);
						loadData();
					}}
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
							d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
						/>
					</svg>
				</button>
				<button
					className="p-2 rounded-full hover:bg-gray-100"
					onClick={() => trashHandle()}
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
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</button>
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
								Back
							</button>
						</div>
						<div className="space-y-4">
							<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
								<input
									type="file"
									className="hidden"
									id="fileInput"
									onChange={handleFileChange}
									multiple
								/>
								<label
									htmlFor="fileInput"
									className="cursor-pointer text-gray-600"
								>
									Click to upload or drag and drop
								</label>
								{uploadedFiles.length > 0 && (
									<div className="mt-3 p-2 bg-gray-100 rounded max-h-40 overflow-y-auto">
										<p className="text-sm text-gray-700">Selected files:</p>
										{uploadedFiles.map((file, index) => (
											<div
												key={index}
												className="flex items-center justify-between mt-1"
											>
												<span className="text-sm font-medium text-blue-600">
													{file.name}
												</span>
												<span className="text-xs text-gray-500">
													{(file.size / 1024).toFixed(2)} KB
												</span>
											</div>
										))}
									</div>
								)}
							</div>
							<button
								className="w-full py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
								onClick={uploadFiles}
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

			{!atTrash && (
				<div className="flex">
					<main className="flex-1 p-6">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
							{files.map((file) => (
								<FileCard
									key={file.id}
									file={file}
									onDownload={() => handleDownload(file.id)}
									onDelete={() => handleDelete(file.id)}
									onViewInfo={() => handleViewInfo(file.id)}
									onRename={() => handleRename(file.id)}
								/>
							))}
						</div>
					</main>
				</div>
			)}

			{atTrash && (
				<div className="flex">
					<main className="flex-1 p-6">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
							{files.map((file) => (
								<FileCardTrash
									key={file.id}
									file={file}
									onDelete={() => handleDeleteTrash(file.id)}
									onRestore={() => handleRestore(file.id)}
								/>
							))}
						</div>
					</main>
				</div>
			)}
		</main>
	);
}
