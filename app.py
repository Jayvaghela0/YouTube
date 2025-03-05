from flask import Flask, request, jsonify, send_file
import os
import threading
import time
import yt_dlp

app = Flask(__name__)

# Ensure downloads folder exists
DOWNLOAD_FOLDER = "downloads"
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

# Auto-delete function
def auto_delete(file_path, delay=120):
    time.sleep(delay)
    if os.path.exists(file_path):
        os.remove(file_path)

# YouTube video download route
@app.route('/download', methods=['GET'])
def download_video():
    url = request.args.get('url')
    if not url:
        return jsonify({"error": "URL is required"}), 400
    
    ydl_opts = {
        'outtmpl': os.path.join(DOWNLOAD_FOLDER, '%(title)s.%(ext)s'),
        'format': '399+251',
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info_dict)
            filename = filename.replace(".webm", ".mp4").replace(".mkv", ".mp4")  # Normalize format
            
        # Start auto-delete thread
        threading.Thread(target=auto_delete, args=(filename,)).start()
        
        # Generate public download link
        return jsonify({"download_url": f"/serve/{os.path.basename(filename)}"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to serve the downloaded file
@app.route('/serve/<filename>')
def serve_file(filename):
    file_path = os.path.join(DOWNLOAD_FOLDER, filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    return jsonify({"error": "File not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
