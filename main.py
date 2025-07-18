import webview
import os
import threading
import base64
import json
import time
import sys
import numpy as np
import pandas as pd
import subprocess
import asyncio
import websockets
import chardet
import requests
import io

from webview.dom import DOMEventHandler
from PyQt5.QtCore import QFileSystemWatcher, QCoreApplication
from watchdog.events import FileSystemEvent, FileSystemEventHandler, FileMovedEvent
from watchdog.observers import Observer
from google import generativeai as genai
from google import genai

from models.linear_regression import AutoLinearRegression
from models.logistic_regression import AutoLogisticRegression
from models.decision_tree import train_decision_tree, save_decision_tree_model
from models.random_forest import train_random_forest, save_random_forest_model
from models.knn import train_knn, save_knn_model
from models.kmeans import train_kmeans, save_kmeans_model

autolinear = AutoLinearRegression()
autologistic = AutoLogisticRegression()

client = genai.Client(api_key="AIzaSyAGmGlCZm8QQQe9jdOxpjBlnrCmeqJJ7NM")

CONFIG_FILE = "config.json"

process = None
reader_task = None

async def read_output(process, websocket, path):
    try:
        while True:
            line = await asyncio.get_event_loop().run_in_executor(None, process.stdout.readline)
            if not line:
                break
            await websocket.send(json.dumps({"response": f"{line.rstrip()}\n"}))
    except Exception as e:
        await websocket.send(json.dumps({"response": f"Read error: {str(e)}"}))

async def websocket_handler(websocket):
    global process, reader_task
    path = api.get_directory()

    async for message in websocket:
        command = message.strip()

        try:
            if command.lower().startswith('cd '):
                new_dir = command[3:].strip()
                new_path = os.path.abspath(os.path.join(path, new_dir))

                if os.path.exists(new_path) and os.path.isdir(new_path):
                    path = new_path
                    result_output = f"{path}\\"
                else:
                    result_output = f"Error: The directory {new_path} does not exist.\n{path}\\"

                await websocket.send(json.dumps({"response": result_output}))

            elif command.lower() == 'terminate':
                if process and process.poll() is None:
                    process.kill()
                    await websocket.send(json.dumps({"response": "Process terminated."}))
                else:
                    await websocket.send(json.dumps({"response": "No running process to terminate."}))

            else:
                env = os.environ.copy()
                env["PYTHONUNBUFFERED"] = "1" 

                process = subprocess.Popen(
                    command,
                    shell=True,
                    cwd=path,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    env=env
                )

                reader_task = asyncio.create_task(read_output(process, websocket, path))

                await asyncio.get_event_loop().run_in_executor(None, process.wait)
                await reader_task
                await websocket.send(json.dumps({"response": f"\n{path}\\"}))

        except Exception as e:
            await websocket.send(json.dumps({"response": f"Error: {str(e)}"}))

def start_server():
    async def server_main():
        global server
        print("WebSocket server started on ws://localhost:8765")
        server = await websockets.serve(websocket_handler, "localhost", 8765)
        await asyncio.Future()

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(server_main())


def stop_server():
    if server:
        print("Stopping server...")
        server.close()
        asyncio.run(server.wait_closed())


def on_drag(e):
    pass

def on_drop(e):
    files = e['dataTransfer']['files']
    if len(files) != 0:
        dropped_files = []
        dropped_folders = []

        for file in files:
            full_path = file.get('pywebviewFullPath')
            if os.path.isfile(full_path):
                file_name = file.get('name')
                dropped_files.append({
                    'name': file_name,
                    'directory': full_path
                })
            else:
                dropped_folders.append(full_path)   

    webview.windows[0].evaluate_js(f"openDroppedItems({dropped_folders}, {dropped_files})")

def bind(window):
    for window in webview.windows:
        elements = window.dom.get_elements('.content')
        if elements:
            elements[0].events.dragenter += DOMEventHandler(on_drag, True, True)
            elements[0].events.dragstart += DOMEventHandler(on_drag, True, True)
            elements[0].events.dragover += DOMEventHandler(on_drag, True, True, debounce=500)
            elements[0].events.drop += DOMEventHandler(on_drop, True, True)

#Directory Observer
directoryObserver = None

class DirectoryWatcher(FileSystemEventHandler):
    def on_created(self, event):
        webview.windows[0].evaluate_js("loadExplorer()")

    def on_deleted(self, event):
        webview.windows[0].evaluate_js("loadExplorer()")

    def on_moved(self, event):
        webview.windows[0].evaluate_js("loadExplorer()")

def watch_directory(path):
    global directoryObserver

    if directoryObserver and directoryObserver.is_alive():
        directoryObserver.stop()
        directoryObserver.join()

    event_handler = DirectoryWatcher()
    directoryObserver = Observer()
    directoryObserver.schedule(event_handler, path, recursive=True)
    directoryObserver.daemon = True
    directoryObserver.start()


#File Observer
fileObserver = Observer()
fileObserver.daemon = True
fileObserver.start()

class FileWatcher(FileSystemEventHandler):
    def __init__(self, file_path):
        self.file_path = os.path.abspath(file_path)

    def on_modified(self, event):
        if os.path.abspath(event.src_path) == self.file_path:
            path = os.path.normpath(self.file_path)
            path = path.replace("\\", "\\\\")
            webview.windows[0].evaluate_js(f"compareContent('{path}')")

def watch_file(file_path):
    folder = os.path.dirname(file_path)
    handler = FileWatcher(file_path)
    fileObserver.schedule(handler, path=folder, recursive=False)


class API:
    def __init__(self):
        self.config = self.load_config()

    def minimize(self):
        webview.windows[0].minimize()

    def maximize(self):
        webview.windows[0].toggle_fullscreen()

    def close(self):
        webview.windows[0].destroy()

    def move(self, x, y):
        webview.windows[0].move(x, y)

    def get_window_info(self):
        win = webview.windows[0]
        return {'x': win.x, 'y': win.y, 'width': win.width, 'height': win.height}

    def resize_and_move(self, x, y, width, height):
        win = webview.windows[0]
        win.move(x, y)
        win.resize(width, height)
    
    def get_files(self, directory):
        try:
            files = os.listdir(directory)
            return files
        except FileNotFoundError:
            return []
        
    def is_file(self, path):
        return os.path.isfile(path)

    def reload(self):
        window = webview.windows[0]
        threading.Thread(target=start, daemon=True).start()
        window.destroy()

    def read_file(self, path):
        if not os.path.exists(path):
            print('not exist')
            return False
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                if not content:
                    return 'void'
                return content
        except UnicodeDecodeError:
            return 'unsupport'
        
    def send_image(self, path):
        with open(path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
        
    def load_config(self):
        if os.path.exists(CONFIG_FILE):
            with open('config.json', 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}

    def save_config(self):
        with open(CONFIG_FILE, 'w') as f:
            json.dump(self.config, f, indent=4)

    def save_workspace(self, directory):
        if "workspaces" not in self.config:
            self.config["workspaces"] = []

        for ws in self.config["workspaces"]:
            if ws.get("directory") == directory:
                return

        new_workspace = {
            "directory": directory,
            "bottom_files": [],
            "current_file": None,
            "anchor_file": None,
            "editors": []
        }

        self.config["workspaces"].append(new_workspace)
        self.save_config()

    def get_workspace(self):
        if "workspaces" in self.config:
            return self.config["workspace"]   

    def get_directory(self):
        if "directory" in self.config:
            watch_directory(self.config["directory"])
            self.save_workspace(self.config["directory"])
            return self.config["directory"]
        else:
            desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")
            self.config["directory"] = desktop_path
            self.save_workspace(self.config[desktop_path])
            self.save_config()
            watch_directory(desktop_path)
            return desktop_path
        
    def set_directory(self, directory):
        self.config["directory"] = directory
        self.save_config()
        self.save_workspace(directory)
        watch_directory(directory)

    def get_active_workspace(self):
        workspace_dir = self.get_directory()
        for ws in self.config.get("workspaces", []):
            if ws.get("directory") == workspace_dir:
                return ws
        return None

    def save_explorer(self, display):
        if display == "flex":
            self.config["explorer"] = True
        else:
            self.config["explorer"] = False
        self.save_config()
    
    def get_explorer(self):
        if "explorer" in self.config:
            return self.config["explorer"]      
    
    def save_bottom_files(self, files):
        ws = self.get_active_workspace()
        if ws:
            ws["bottom_files"] = files
            self.save_config()

    def get_bottom_files(self):
        ws = self.get_active_workspace()
        return ws.get("bottom_files", []) if ws else []

    def save_editors(self, editors):
        ws = self.get_active_workspace()
        if ws:
            ws["editors"] = editors
            self.save_config()

    def get_editors(self):
        ws = self.get_active_workspace()
        return ws.get("editors", []) if ws else []

    def set_current_file(self, name, directory):
        ws = self.get_active_workspace()
        if ws:
            ws["current_file"] = {"name": name, "directory": directory}
            self.save_config()

    def get_current_file(self):
        ws = self.get_active_workspace()
        return ws.get("current_file", None) if ws else None

    def set_anchor_file(self, anchor):
        ws = self.get_active_workspace()
        if ws:
            ws["anchor_file"] = anchor
            self.save_config()

    def get_anchor_file(self):
        ws = self.get_active_workspace()
        return ws.get("anchor_file", None) if ws else None


    def save_file(self, directory, content):
        if not os.path.exists(directory):
            os.makedirs(os.path.dirname(directory), exist_ok=True)
        with open(directory, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    
    def start_server(self):
        threading.Thread(target=start_server, daemon=True).start()

    def stop_server(self):
        stop_server()

    def watch_file(self, path):
        watch_file(path)
        
    def set_ai_api_key(self, key):
        self.config["ai_api_key"] = key
        self.save_config()

    def get_ai_api_key(self):
        if "ai_api_key" in self.config:
            return self.config["ai_api_key"]
        
    def set_ai_chat(self, history):
        self.config["ai_chat"] = history
        self.save_config()

    def get_ai_chat(self):
        if "ai_chat" in self.config:
            return self.config["ai_chat"]
        
    def complete_code(self, prompt):
        response = client.models.generate_content(
            model="gemini-1.5-flash-8b", contents=f"Just write the rest of your code without any comment as text not code block: {prompt}"
        )
        return response.text
    
    def answer_prompt(self, history):
        response = client.models.generate_content(
            model="gemini-1.5-flash-8b",
            contents=history
        )
        return response.text
    
    def train_model(self, model_name, payload):
        try:
            b64 = payload['base64_csv']
            decoded = base64.b64decode(b64).decode('utf-8')
            df = pd.read_csv(io.StringIO(decoded))

            features = payload.get('features', [])
            target = payload.get('target', '')

            if (target not in df.columns or any(col not in df.columns for col in features)) and model_name != 'kmeans':
                return {'error': 'CSV Error: Feature or target column not found in the uploaded CSV.'}

            X = df[features]
            y = df[target] if target else None

            if model_name == 'linear-regression':
                return autolinear.fit(X, y)
            elif model_name == 'logistic-regression':
                return autologistic.fit(X, y)
            elif model_name == 'decision-tree':
                return train_decision_tree(X, y)
            elif model_name == 'random-forest':
                return train_random_forest(X, y)
            elif model_name == 'knn':
                return train_knn(X, y)
            elif model_name == 'kmeans':
                return train_kmeans(X)

            return {'error': 'Model not found.'}

        except Exception as e:
            return {'error': str(e)}
        
    def save_linear_regression(self, path):
        return autolinear.save(path)
    
    def save_logistic_regression(self, path):
        return autologistic.save(path)
    
    def save_decision_tree(self, path):
        return save_decision_tree_model(path)
        
    def save_random_forest(self, path):
        return save_random_forest_model(path)
    
    def save_knn(self, path):
        return save_knn_model(path)
    
    def save_kmeans(self, path):
        return save_kmeans_model(path)
        
    def select_folder(self):
        folder_path = webview.windows[0].create_file_dialog(dialog_type=webview.FOLDER_DIALOG)
        if folder_path:
            return folder_path[0]
        return None
    
    def send_path_from_project(self, file):
        main_dir = os.path.dirname(os.path.abspath(__file__))
        return os.path.join(main_dir, file)

api = API()

def start():
    window = webview.create_window(
        'AI-Powered Code Editor',
        'index.html',
        frameless=True,
        width=1280,
        height=720,
        min_size=(1280, 720),
        resizable=True,
        easy_drag=True,
        js_api=api
    )

    webview.start(bind, window, debug=True)

if __name__ == '__main__':
    start()


