FROM ubuntu:22.04

RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg && \
    pip3 install yt-dlp

COPY requirements.txt .
RUN pip3 install -r requirements.txt

COPY . /app
WORKDIR /app

CMD ["python3", "server.js"]

