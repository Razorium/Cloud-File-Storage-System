import { useState } from "react";

export default function FileCardTrash({ file, onDelete, onRestore }) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<div className="relative">
			<div className="p-4 bg-white border rounded-lg shadow-sm relative">
				<div className="flex justify-between items-center">
					<div>
						<p className="font-medium text-gray-800">{file.name}</p>
					</div>
					<button
						className="p-2 hover:bg-gray-100 rounded-full relative"
						onClick={() => {
							setIsMenuOpen(!isMenuOpen);
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5 text-gray-500"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M4 12a2 2 0 114 0 2 2 0 01-4 0zm7 0a2 2 0 114 0 2 2 0 01-4 0zm7 0a2 2 0 114 0 2 2 0 01-4 0z"
							/>
						</svg>
					</button>
				</div>
			</div>

			{isMenuOpen && (
				<div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
					<div className="py-1">
						<button
							onClick={() => {
								setIsMenuOpen(false);
								onDelete();
							}}
							className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
						>
							Delete Permanently
						</button>
						<button
							onClick={() => {
								setIsMenuOpen(false);
								onRestore();
							}}
							className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
						>
							Restore
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
