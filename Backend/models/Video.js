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
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const videoSchema = new mongoose.Schema({
  url: String,
  title: String,
  transcription: String,
  thumbnailUrl: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  uploader: { type: String, default: "Unknown" },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [commentSchema],
  uploadedAt: { type: Date, default: Date.now },
});

videoSchema.virtual("likes").get(function() {
  return this.likedBy ? this.likedBy.length : 0;
});

videoSchema.virtual("dislikes").get(function() {
  return this.dislikedBy ? this.dislikedBy.length : 0;
});

videoSchema.set("toJSON", { virtuals: true });


const Video = mongoose.model("Video", videoSchema);
export default Video;
