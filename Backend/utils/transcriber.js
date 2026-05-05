// // utils/transcriber.js
// import { execFile } from "child_process";
// import ffmpeg from "fluent-ffmpeg";
// import ffmpegPath from "ffmpeg-static";
// import { tmpdir } from "os";
// import { v4 as uuid } from "uuid";
// import path from "path";
// import fs from "fs";
// console.log("transcribeAudioFromVideo() is being called...");


// ffmpeg.setFfmpegPath(ffmpegPath);

// export async function transcribeAudioFromVideo(videoUrl) {
//   return new Promise((resolve, reject) => {
//     const audioOutput = path.join(tmpdir(), `${uuid()}.mp3`);

//     ffmpeg(videoUrl)
//       .noVideo()
//       .format("mp3")
//       .on("end", () => {
//         execFile("python", ["./transcribe.py", audioOutput], (err, stdout, stderr) => {
//           fs.unlinkSync(audioOutput); // clean up temp file
//           if (err) return reject(err);
//           resolve(stdout.trim());
//         });
//       })
//       .on("error", (err) => {
//         reject(err);
//       })
//       .save(audioOutput);
//   });
// }
import { execFile } from "child_process";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { tmpdir } from "os";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";
import axios from "axios";

ffmpeg.setFfmpegPath(ffmpegPath);

export async function transcribeAudioFromVideo(videoUrl) {
  return new Promise(async (resolve, reject) => {
    const tempVideo = path.join(tmpdir(), `${uuid()}.mp4`);
    const tempAudio = path.join(tmpdir(), `${uuid()}.mp3`);

    try {
      // Download remote video to temp file
      const response = await axios({ url: videoUrl, responseType: "stream" });
      const writer = fs.createWriteStream(tempVideo);
      response.data.pipe(writer);
      await new Promise((res, rej) => {
        writer.on("finish", res);
        writer.on("error", rej);
      });

      // Convert to audio
      ffmpeg(tempVideo)
        .noVideo()
        .format("mp3")
        .on("end", () => {
          // Run Python transcription
          execFile("python", ["./transcribe.py", tempAudio], (err, stdout, stderr) => {
            fs.unlinkSync(tempVideo);
            fs.unlinkSync(tempAudio);
            if (err) return reject(err);
            resolve(stdout.trim());
          });
        })
        .on("error", (err) => {
          fs.unlinkSync(tempVideo);
          reject(err);
        })
        .save(tempAudio);

    } catch (err) {
      if (fs.existsSync(tempVideo)) fs.unlinkSync(tempVideo);
      reject(err);
    }
  });
}
