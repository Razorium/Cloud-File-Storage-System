export default function FileCard({ index }) {
	return (
		<div className="p-4 bg-white border rounded-lg shadow-sm">
			<div className="w-full h-32 mb-2 bg-gray-100 rounded"></div>
			<p className="font-medium text-gray-800">Document {index + 1}</p>
			<p className="text-sm text-gray-500">
				Modified {new Date().toLocaleDateString()}
			</p>
		</div>
	);
}
