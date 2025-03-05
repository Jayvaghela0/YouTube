from flask import Flask, request, jsonify, send_file, url_for
from flask_cors import CORS
import yt_dlp
import os
import threading
import time

app = Flask(__name__)
CORS(app)

DOWNLOAD_FOLDER = "downloads"
FFMPEG_PATH = "/usr/bin/ffmpeg"  # ✅ Render par FFmpeg path
COOKIES_FILE = "cookies.txt"
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.youtube.com/",
}

download_tasks = {}

def delete_after_delay(file_path, delay=300):
    """5 minute ke baad file delete karne ka function"""
    time.sleep(delay)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Deleted: {file_path}")
    except Exception as e:
        print(f"Error deleting file: {e}")

def download_video_task(video_url, video_id):
    """Background me video download karega"""
    try:
        ydl_opts = {
            "format": "bestvideo+bestaudio/best",
            "outtmpl": f"{DOWNLOAD_FOLDER}/%(title)s.%(ext)s",
            "merge_output_format": "mp4",  # ✅ MP4 format force merge
            "cookiefile": COOKIES_FILE,
            "http_headers": HEADERS,
            "noprogress": True,
            "ffmpeg_location": FFMPEG_PATH,  # ✅ FFmpeg ka path set kiya
            "postprocessors": [{
                "key": "FFmpegVideoConvertor",
                "preferedformat": "mp4",  # ✅ MP4 me convert karega
            }]
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=True)
            file_path = ydl.prepare_filename(info)

            if not file_path.endswith(".mp4"):
                file_path += ".mp4"

        threading.Thread(target=delete_after_delay, args=(file_path, 300)).start()
        
        # ✅ Update task status
        download_tasks[video_id] = {
            "status": "completed",
            "title": info["title"],
            "download_link": request.host_url + url_for("serve_file", filename=os.path.basename(file_path))
        }

    except Exception as e:
        download_tasks[video_id] = {"status": "failed", "error": str(e)}

@app.route("/")
def home():
    return "YouTube Downloader is Running!"

@app.route("/download", methods=["GET"])
def start_download():
    url = request.args.get("url")
    if not url:
        return jsonify({"error": "URL required"}), 400

    video_id = str(int(time.time()))  
    download_tasks[video_id] = {"status": "processing"}

    threading.Thread(target=download_video_task, args=(url, video_id)).start()

    return jsonify({"task_id": video_id, "status": "started"})

@app.route("/status/<task_id>")
def check_status(task_id):
    if task_id in download_tasks:
        return jsonify(download_tasks[task_id])
    return jsonify({"error": "Task not found"}), 404

@app.route("/file/<filename>")
def serve_file(filename):
    file_path = os.path.join(DOWNLOAD_FOLDER, filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    return jsonify({"error": "File not found"}), 404

if __name__ == "__main__":
    app.run(debug=True)
