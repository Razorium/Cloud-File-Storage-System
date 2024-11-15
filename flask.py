from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Directory to save uploaded files
UPLOAD_DIRECTORY = "/home/ubuntu/storage"

# Ensure the upload directory exists
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    
    print(request.files)
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # Save the file to the uploads directory
    file_path = os.path.join(UPLOAD_DIRECTORY, file.filename)
    file.save(file_path)

    return jsonify({"message": "File uploaded successfully", "filename": file.filename}), 200


@app.route('/download', methods=['GET'])
def download_file():
    file_name = request.args.get('file_name')
    if not file_name:
        return jsonify({"error": "No file name specified"}), 400

    try:
        # Send the file from the specified directory
        return send_from_directory(UPLOAD_DIRECTORY, file_name, as_attachment=True)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    
    
    

if __name__ == '__main__':
    # Run the app on all available IPs on port 5000
    app.run(host='0.0.0.0', port=5000)

