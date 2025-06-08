FROM ubuntu:22.04

# Install Python, pip, ffmpeg, and yt-dlp
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg curl && \
    pip3 install yt-dlp

# Install Node.js (required to run server.js)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Set app directory
COPY . /app
WORKDIR /app

# Start the Node.js server
CMD ["node", "server.js"]

