// // models/Video.js
// import mongoose from 'mongoose';


// const videoSchema = new mongoose.Schema({
 
//    url: { type: String, required: true },
//     title: { type: String, default: 'Untitled' },
//   uploadedAt: { type: Date, default: Date.now },
// });


// export default mongoose.model("Video", videoSchema);

// changes
// import mongoose from "mongoose";

// const videoSchema = new mongoose.Schema({
//   url: { type: String, required: true },
//   title: { type: String, default: "Untitled" },
//   uploadedAt: { type: Date, default: Date.now },
// });

// const Video = mongoose.model("Video", videoSchema);
// export default Video;
//  changes again
// models/Video.js
// import mongoose from "mongoose";

// const commentSchema = new mongoose.Schema({
//   text: String,
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const videoSchema = new mongoose.Schema({
//   url: { type: String, required: true },
//   title: { type: String, default: "Untitled" },
//   uploadedAt: { type: Date, default: Date.now },
//   likes: { type: Number, default: 0 },            //  Likes
//   dislikes: { type: Number, default: 0 },         //  Dislikes
//   comments: [commentSchema],                      //  Comments
// });

// const Video = mongoose.model("Video", videoSchema);
// export default Video;

// changes again
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const videoSchema = new mongoose.Schema({
  url: String,
  title: String,
  transcription: String,
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  comments: [{ text: String }],
  uploadedAt: { type: Date, default: Date.now },
});


const Video = mongoose.model("Video", videoSchema);
export default Video;
