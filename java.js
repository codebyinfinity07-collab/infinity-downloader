let selectedQuality = ""; 

// 1. Analyze Link
function analyzeLink() {
    const videoLink = document.getElementById('videoLink').value.trim();
    const downloadOptions = document.getElementById('downloadOptions');

    if (!videoLink) {
        alert("⚠️ Please enter a valid link!");
        return;
    }

    // Simple URL check
    if (!videoLink.includes("http")) {
        alert("❌ Wrong Format! Please enter a full URL.");
        return;
    }

    downloadOptions.classList.remove('hidden');
    console.log("Link Analyzed: Ready for quality selection.");
}

// 2. Quality Selection Logic
document.querySelectorAll('.opt-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.opt-btn').forEach(btn => btn.style.border = "none");
        this.style.border = "2px solid #38bdf8";
        selectedQuality = this.innerText; 
    });
});

// 3. Final Download Logic
document.querySelector('.dl-main-btn').addEventListener('click', async function() {
    const videoLink = document.getElementById('videoLink').value.trim();
    const noWatermark = document.getElementById('noWatermark').checked;

    if (!selectedQuality) {
        alert("🎬 Please select video quality first!");
        return;
    }

    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    progressContainer.style.display = 'block';
    progressBar.style.width = '40%'; 
    progressText.innerText = "Downloading started...";

    // Backend URL
    const serverUrl =`https://infinity-downloader07-mu.vercel.app/download?url=${encodeURIComponent(videoLink)}&quality=${selectedQuality}&watermark=${noWatermark ? 'false' : 'true'}`;

    try {
        const response = await fetch(serverUrl);

        if (response.ok) {
            progressBar.style.width = '70%';
            progressText.innerText = "Fetching Video Data...";

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            // File extension handle karna based on quality
            a.download = selectedQuality.includes("MP3") ? "Infinity_Audio.mp3" : "Infinity_Video.mp4"; 
            document.body.appendChild(a);
            a.click();
            a.remove();

            progressBar.style.width = '100%';
            progressText.innerText = "Download Successful! ✅";
            
            setTimeout(() => { progressContainer.style.display = 'none'; }, 4000);
        } else {
            const errorData = await response.json();
            alert("❌ Server Error: " + (errorData.error || "check the internet connection"));
            progressContainer.style.display = 'none';
        }
    } catch (err) {
        alert("📡 Backend is not running! Please start backend.py in VS Code.");
        progressContainer.style.display = 'none';
    }
});

// Menu Icons
function showMenu() { document.getElementById("navLinks").style.right = "0"; }
function hideMenu() { document.getElementById("navLinks").style.right = "-200px"; }
