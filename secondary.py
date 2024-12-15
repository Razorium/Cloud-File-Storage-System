from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from collections import deque
import os


app = Flask(__name__)
CORS(app)
#directory = "/home/ubuntu/storage/user1"
max_file_count = 10
max_file_size = 50000000 #50MB


##########################################################################################

@app.route('/upload', methods=['POST'])
def upload_file():
    response = 0
    print("Headers:", dict(request.headers))
    print("Files:", request.files)
    print("Form:", request.form)
    
    username = request.args.get('username')
    
    if 'file' not in request.files:
        print("no file selected")
        response = jsonify({"error":"no file in request"}), 400
        return response
    
    file = request.files['file']
    
    if file.filename == '':
        print("no file selected")
        response = jsonify({"error": "no file selected"}), 400
        return response

    print(f"saving file {file.filename}")
    file_path = f"/home/ubuntu/storage/{username}/{file.filename}"
    file.save(file_path)

    response = jsonify({"message": "File uploaded successfully", "filename": file.filename}), 200
    return response

##########################################################################################

@app.route('/download', methods=['GET'])
def download_file():
    filename = request.args.get('filename')
    username = request.args.get('username')
    
    response  = 0
    
    
    try:
        return send_from_directory(f"/home/ubuntu/storage/{username}", filename, as_attachment=True)
    except FileNotFoundError:
        response = jsonify({"error": "File not found"}), 404
        return response
    
##########################################################################################    
    
@app.route('/list', methods=['GET'])
def list_file():
    username = request.args.get('username')
    file_dir = "/home/ubuntu/storage/" + username
    
    response  = 0
    dir_list = os.listdir(file_dir)
    
    filtered = [file for file in dir_list if os.path.isfile(os.path.join(file_dir, file))]
    
    
    
    try:
        return filtered
    except:
        response = jsonify({"error": "File not found"}), 404
        return response

##########################################################################################    

@app.route('/remove', methods=['GET'])
def remove_file():
    username = request.args.get('username')
    filename = request.args.get('filename')
    file_path = "/home/ubuntu/storage/" + username + "/" + filename
    
    response  = 0
    
    

    #move to trash
    try:
        os.remove(file_path)
    except:
        response = jsonify({"error": "File not found"}), 404
        return response    
        
    response = jsonify({"message": "Delete Success"})
    return response

##########################################################################################

@app.route('/rename', methods=['GET'])
def rename_file():
    username = request.args.get('username')
    filename = request.args.get('filename')
    newname = request.args.get('newname')
    file_path = "/home/ubuntu/storage/" + username + "/" + filename
    new_path = "/home/ubuntu/storage/" + username + "/" + newname
    
    response  = 0

    try:
        os.rename(file_path, new_path)
    except:
        response = jsonify({"error": "File not found"}), 404
        return response
    
    response = jsonify({"message": "Rename Success"})
    return response


##########################################################################################

@app.route('/signup', methods=['GET'])
def signup_user():
    username = request.args.get('username')
    print(username)
    
    
    try:
        os.mkdir("/home/ubuntu/storage/" + username)
        
    except:
        print("Failed to make dir")
    
    response = jsonify({"message": "Signup Success"})
    return response

##########################################################################################

@app.route('/check', methods=['GET'])
def check_file():
    username = request.args.get('username')
    filename = request.args.get('filename')
    path = "/home/ubuntu/storage/" + username  + "/" + filename
    response = 0
    
    if(os.path.exists(path)):
        response = jsonify({"message":"True"})
        return response
    else:
        response = jsonify({"message":"False"})
        return response

##########################################################################################


app.run(host='0.0.0.0', port=5000)

