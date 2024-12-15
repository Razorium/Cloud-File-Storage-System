from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from collections import deque
import os
import shutil
import pickle
import requests

app = Flask(__name__)
CORS(app)
directory = "/home/ubuntu/storage"
max_file_count = 10
max_file_size = 50000000 #50MB
os.makedirs(directory, exist_ok=True)
secondaryServer = ["172.31.47.176"]


##########################################################################################

@app.route('/upload', methods=['POST'])
def upload_file():
    response = 0
    print("Headers:", dict(request.headers))
    print("Files:", request.files)
    print("Form:", request.form)
    
    username = request.args.get('username')
    
    
    
    if 'file' not in request.files:
        response = jsonify({"error":"no file in request"}), 400
        return response
    
    file = request.files['file']
    
    file_path = f"/home/ubuntu/storage/{username}/{file.filename}"
    
    if file.filename == '':
        response = jsonify({"error": "no file selected"}), 400
        return response

    file.save(file_path)
    
    
    #forward request to secondary
    for server in secondaryServer:
        url = f"http://{server}:5000/upload"
        
        try:
            with open(file_path, 'rb') as f:
                files = {'file': (file.filename, f)}
                requests.post(url, files = files, params = {"username":username})
        except requests.exceptions.RequestException as e:
            print(f"File failed to upload to {server}: {e}")
        
    
    

    response = jsonify({"message": "File uploaded successfully", "filename": file.filename}), 200
    return response

##########################################################################################

@app.route('/download', methods=['GET'])
def download_file():
    filename = request.args.get('filename')
    username = request.args.get('username')
    path = f"/home/ubuntu/storage/{username}/{filename}"
    response  = 0
    
    secondaryUp = 0
    missingServer = []
    existSecondary = 0
    existPrimary = 0
    
    #check if file is present in secondary
    for server in secondaryServer:
        url = f"http://{server}:5000/check"
        params = {"username": username, "filename": filename}
        try:
            interResponse = requests.get(url, params = params).json()["message"]
            
            print(f"interResponse = {interResponse}")
            if(interResponse=="False"):
                print(f"missing in server {server}")
                missingServer.append(server)
            else:
                secondaryUp = server
                existSecondary = True   
        except:
            print("file failed to check in secondary server at {server}")
            
    #check if file is present in current
    existPrimary = os.path.exists(path)
    
    #if file doesn't exist on any server
    if(not existPrimary and not existSecondary):
        print("File not found")
        response = jsonify({"error": "File not found"}), 404
        return response
    
    
    #write to primary server if file missing
    if(not existPrimary and existSecondary):
        url = f"http://{secondaryUp}:5000/download"
        params = {'username': username, 'filename': filename}
        
        try:
            response = requests.get(url, params = params, stream=True)
            response.raise_for_status()

            with open(path, "wb") as file:
                for chunk in response.iter_content(chunk_size=8192):
                    file.write(chunk)
        except:
            print(f"file failed to get from {secondaryUp}")
    
    
    print(f"missing server: {missingServer}")
    #write to missing secondary server if file missing
    for server in missingServer:
        url = f"http://{server}:5000/upload"
        print(f"restoring in {server}")
        try:
            with open(path, 'rb') as f:
                files = {'file': (filename, f)}
                print(f"username = {username}")
                requests.post(url, files = files, params = {"username":username})
        except requests.exceptions.RequestException as e:
            print(f"File failed to upload to {server}: {e}")
    
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
    
@app.route('/listTrash', methods=['GET'])
def list_trash():
    username = request.args.get('username')
    file_dir = "/home/ubuntu/trash/" + username
    
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
    trash_path = "/home/ubuntu/trash/" + username + "/" + filename
    queue_path = "/home/ubuntu/meta/" + username + "/queue.pkl"
    
    response  = 0
    moved_to_trash = 0
    

    #move to trash
    try:
        if (os.path.getsize(file_path) < max_file_size):
            shutil.move(file_path, trash_path)
            moved_to_trash = True
        else:
            os.remove(file_path)
    except:
        response = jsonify({"error": "File not found"}), 404
        return response
    
    if(moved_to_trash):
        #reading pickle file. Ignore if doesn't exist
        queue = deque()
        
        try:
            with open(queue_path, "rb") as file:
                queue = pickle.load(file)
        except:
            print("pickle file not found")
            
        
        
        queue.append(trash_path)
        if(len(queue) > max_file_count):
            deleteFile = queue.popleft()
            try:
                os.remove(deleteFile)
            except:
                print("failed to delete file in trash")
                response = jsonify({"message":"failed to delete file in trash"})
                return response
            
        #write result back to pickle file
        try:
            with open(queue_path, "wb") as file:
                pickle.dump(queue, file)
        except:
            print("failed to write back to pickle file")
            
    #Forward to secondary server
    for server in secondaryServer:
        url = f"http://{server}:5000/remove"
        params = {"username": username, "filename":filename}
        try:
            requests.get(url, params = params)
        except:
            print("secondary remove in {server} failed")
        
        
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
    
    
    #execute rename
    try:
        os.rename(file_path, new_path)
    except:
        response = jsonify({"error": "File not found"}), 404
        return response
    
    #forward to secondary server
    for server in secondaryServer:
        url = f"http://{server}:5000/rename"
        params = {"username": username, "filename":filename, "newname":newname}
        try:
            requests.get(url, params = params)
        except:
            print("secondary signup in {server} failed")

    
    
    response = jsonify({"message": "Rename Success"})
    return response


##########################################################################################

@app.route('/signup', methods=['GET'])
def signup_user():
    username = request.args.get('username')
    
    
    #execute signup
    try:
        os.mkdir("/home/ubuntu/storage/" + username)
        os.mkdir("/home/ubuntu/trash/" + username)
        os.mkdir("/home/ubuntu/meta/" + username)
    except:
        print("Failed to make dir")
    
    #route request to secondary server
    for server in secondaryServer:
        url = f"http://{server}:5000/signup"
        params = {"username": username}
        try:
            response = requests.get(url, params = params)
            print(response)
            
        except:
            print(f"secondary signup in {server} failed")
    
    
    response = jsonify({"message": "Signup Success"})
    return response
    
    
        
##########################################################################################        
        
@app.route('/check', methods=['GET'])
def check_file():
    username = request.args.get('username')
    filename = request.args.get('filename')
    path = "/home/ubuntu/storage/" + username  + "/" + filename
    
    
    if(os.path.exists(path)):
        return "True"
    else:
        return "False"

##########################################################################################

@app.route('/removeTrash', methods=['GET'])
def remove_trash():
    username = request.args.get('username')
    filename = request.args.get('filename')
    trash_path = "/home/ubuntu/trash/" + username + "/" + filename
    queue_path = "/home/ubuntu/meta/" + username + "/queue.pkl"
    
    response  = 0
    

    #access queue
    queue = deque()
    
    try:
        #read queue
        with open(queue_path, "rb") as file:
            queue = pickle.load(file)
    
        print("pickle file not found")
    
        queue.remove(trash_path)
        
        #writeback queue
        with open(queue_path, "wb") as file:
            pickle.dump(queue, file)
        print("failed to write back to pickle file")    
    except:
        print("failed to access queue")
        return response
    
    #remove file
    try:
        os.remove(trash_path)
    except:  
        print("delete trash failed")
        return response
        
        
    response = jsonify({"message": "Delete Success"})
    return response

##########################################################################################
@app.route('/restoreTrash', methods=['GET'])
def restore_trash():
    username = request.args.get('username')
    filename = request.args.get('filename')
    trash_path = "/home/ubuntu/trash/" + username + "/" + filename
    file_path =  "/home/ubuntu/storage/" + username + "/" + filename
    queue_path = "/home/ubuntu/meta/" + username + "/queue.pkl"
    
    response  = 0
    

    #access queue
    queue = deque()
    
    try:
        #read queue
        with open(queue_path, "rb") as file:
            queue = pickle.load(file)
    
        print("pickle file not found")
    
        queue.remove(trash_path)
        
        
        #writeback queue
        with open(queue_path, "wb") as file:
            pickle.dump(queue, file)
        print("failed to write back to pickle file")    
    except:
        print("failed to access queue")
        return response
    
    #remove file
    try:
        shutil.move(trash_path, file_path)
    except:  
        print("delete trash failed")
        return response
    
    #forward request to secondary
    for server in secondaryServer:
        url = f"http://{server}:5000/upload"
        
        try:
            with open(file_path, 'rb') as f:
                files = {'file': (filename, f)}
                requests.post(url, files = files, params = {"username":username})
        except requests.exceptions.RequestException as e:
            print(f"File failed to upload to {server}: {e}")
    
        
    response = jsonify({"message": "Delete Success"})
    return response


app.run(host='0.0.0.0', port=5000)

