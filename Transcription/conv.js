// const ffmpeg = require('fluent-ffmpeg');
// const ffmpegPath = require('ffmpeg-static');

// // Set path for ffmpeg binary (from ffmpeg-static)
// ffmpeg.setFfmpegPath(ffmpegPath);

// // Input video file path - put your video here or change the path
// const inputVideo = 'input.mp4';

// // Output audio file name
// const outputAudio = 'output_audio.mp3';

// ffmpeg(inputVideo)
//   .noVideo()           // remove video stream
//   .format('mp3')       // output format (mp3)
//   .on('start', (cmd) => {
//     console.log('Started ffmpeg with command:', cmd);
//   })
//   .on('progress', (progress) => {
//     //console.log(Processing: ${progress.percent ? progress.percent.toFixed(2) : 0}% done);
//   })
//   .on('end', () => {
//     console.log('Conversion completed!');
//   })
//   .on('error', (err) => {
//     console.error('Error:', err.message);
//   })
//   .save(outputAudio);

const { execFile } = require("child_process");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegPath);

const inputVideo = "inputt.mp4";
const outputAudio = "output_audio.mp3";

ffmpeg(inputVideo)
  .noVideo()
  .format("mp3")
  .on("end", () => {
    console.log("Conversion completed!");

    // Run Python transcription
    execFile("python", ["./transcribe.py", outputAudio], (error, stdout, stderr) => {
      if (error) {
        console.error("Transcription failed:", error.message);
        return;
      }

      console.log("\n--- Transcription Output ---");
      console.log(stdout);
    });
  })
  .on("error", (err) => {
    console.error("FFmpeg Error:", err.message);
  })
  .save(outputAudio);
