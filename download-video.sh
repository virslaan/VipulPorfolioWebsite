#!/bin/bash
# Script to download hero video for portfolio

mkdir -p assets/video
cd assets/video

echo "Downloading hero video..."
curl -L "https://videos.pexels.com/video-files/2491284/2491284-hd_1920_1080_25fps.mp4" -o hero-video.mp4

if [ -f hero-video.mp4 ]; then
    echo "Video downloaded successfully!"
    ls -lh hero-video.mp4
else
    echo "Download failed. Trying alternative source..."
    curl -L "https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4" -o hero-video.mp4
    if [ -f hero-video.mp4 ]; then
        echo "Alternative video downloaded successfully!"
        ls -lh hero-video.mp4
    fi
fi

