from flask import Flask, request, jsonify, send_file, url_for
from flask_cors import CORS
import yt_dlp
import os
import threading
import time

app = Flask(__name__)
CORS(app)  # Allow all origins

DOWNLOAD_FOLDER = "downloads"
COOKIES_FILE = "cookies.txt"  # Cookies file ka path
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.youtube.com/",
}

def delete_after_delay(file_path, delay=300):
    """5 minute ke baad file delete karne ka function"""
    time.sleep(delay)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Deleted: {file_path}")
    except Exception as e:
        print(f"Error deleting file: {e}")

@app.route("/")
def home():
    return "YouTube Downloader is Running!"

@app.route("/download", methods=["GET"])
def download_video():
    url = request.args.get("url")
    if not url:
        return jsonify({"error": "URL required"}), 400

    try:
        ydl_opts = {
            "format": "bestvideo+bestaudio/best",
            "outtmpl": f"{DOWNLOAD_FOLDER}/%(title)s.%(ext)s",
            "merge_output_format": "mp4",  # Ensure MP4 output
            "cookiefile": COOKIES_FILE,  # Cookies use kare
            "http_headers": HEADERS,  # Headers add kare
            "noprogress": True,  # Hide progress output
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            file_path = ydl.prepare_filename(info)

            # Ensure correct file extension
            if not file_path.endswith(".mp4"):
                file_path += ".mp4"

        # ✅ File delete hone ka system (5 min)
        threading.Thread(target=delete_after_delay, args=(file_path, 300)).start()

        # ✅ Blogger frontend ke liye full URL return karo
        download_url = request.host_url + url_for("serve_file", filename=os.path.basename(file_path))

        return jsonify({
            "title": info["title"],
            "download_link": download_url
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/file/<filename>")
def serve_file(filename):
    file_path = os.path.join(DOWNLOAD_FOLDER, filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    return jsonify({"error": "File not found"}), 404

if __name__ == "__main__":
    app.run(debug=True)
