from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import yt_dlp
import os

app = Flask(__name__)
# CORS standard routing settings ke sath allow kiya
CORS(app, resources={r"/*": {"origins": "*"}})

# 🔥 FIX: Vercel par sirf '/tmp' folder mein write karne ki permission hoti hai
DOWNLOAD_FOLDER = '/tmp'

@app.route('/')
def home():
    return "Infinity Downloader API is Running Live! 🚀"

@app.route('/download', methods=['GET'])
def infinity_engine():
    video_url = request.args.get('url')
    quality_choice = request.args.get('quality', '720p (MP4)')
    
    if not video_url:
        return jsonify({"error": "Link missing!"}), 400

    is_audio = "Audio" in quality_choice
    ext = "mp3" if is_audio else "mp4"
    
    # Unique filename taake multiple users ek sath download karein toh file mix na ho
    filename = f"infinity_download_{os.getpid()}.{ext}"
    output_filename = os.path.join(DOWNLOAD_FOLDER, filename)

    # 🔥 FIX: Vercel serverless environment ke liye optimized options (Bina FFmpeg ke)
    ydl_opts = {
        'format': 'bestaudio/best' if is_audio else 'best[ext=mp4]/best',
        'outtmpl': output_filename,
        'quiet': True,
        'no_warnings': True,
        'nocheckcertificate': True,
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    }

    try:
        # Purani temporary file saaf karna
        if os.path.exists(output_filename):
            os.remove(output_filename)

        # Core Download Process
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])
        
        # File ko user ko send karna
        response = send_file(output_filename, as_attachment=True)
        
        # Download ke baad server se file delete karna taake memory full na ho
        @response.call_on_close
        def cleanup():
            if os.path.exists(output_filename):
                os.remove(output_filename)
                
        return response

    except Exception as e:
        error_msg = str(e)
        print(f"Error: {error_msg}")
        if "blocked" in error_msg.lower():
            return jsonify({"error": "IP Blocked by Provider. Try using a VPN."}), 403
        return jsonify({"error": error_msg}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)







