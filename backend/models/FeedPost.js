import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  author: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    position: { type: String, default: '' },
    role: { type: String, default: 'staff' }
  },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

const feedPostSchema = new mongoose.Schema(
  {
    author: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      position: { type: String, required: true },
      role: { type: String, required: true },
      avatarColor: { type: String, default: 'navy-900' }
    },
    category: {
      type: String,
      enum: ['safety', 'announcement', 'milestone', 'technical'],
      default: 'announcement'
    },
    title: {
      type: String,
      required: [true, 'Judul pengumuman wajib diisi']
    },
    content: {
      type: String,
      required: [true, 'Isi pengumuman wajib diisi']
    },
    taggedUsers: {
      type: [String],
      default: []
    },
    projectName: {
      type: String,
      default: 'Seluruh Proyek Lapangan'
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [commentSchema]
  },
  {
    timestamps: true
  }
)

const FeedPost = mongoose.model('FeedPost', feedPostSchema)
export default FeedPost
