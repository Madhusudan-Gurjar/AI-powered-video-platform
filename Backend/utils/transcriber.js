// utils/transcriber.js
import { execFile } from "child_process";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { tmpdir } from "os";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";
console.log("transcribeAudioFromVideo() is being called...");


ffmpeg.setFfmpegPath(ffmpegPath);

export async function transcribeAudioFromVideo(videoUrl) {
  return new Promise((resolve, reject) => {
    const audioOutput = path.join(tmpdir(), `${uuid()}.mp3`);

    ffmpeg(videoUrl)
      .noVideo()
      .format("mp3")
      .on("end", () => {
        execFile("python", ["./transcribe.py", audioOutput], (err, stdout, stderr) => {
          fs.unlinkSync(audioOutput); // clean up temp file
          if (err) return reject(err);
          resolve(stdout.trim());
        });
      })
      .on("error", (err) => {
        reject(err);
      })
      .save(audioOutput);
  });
}
