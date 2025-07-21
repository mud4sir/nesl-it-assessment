const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

// 1. Collection Schema Design
/*
User:    { _id, name, joined }
Follow:  { follower: ObjectId, following: ObjectId }
Post:    { _id, author: ObjectId, content, created }
- To list followers/followings: query Follow by follower/following.
- To page posts: query Post by author, sort by created desc, use skip/limit.
*/

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  joined: { type: Date, default: Date.now },
});

const followSchema = new Schema({
  follower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  following: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});
followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ following: 1 });

const postSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  created: { type: Date, default: Date.now },
});
postSchema.index({ author: 1, created: -1 });

const User = mongoose.model('User', userSchema);
const Follow = mongoose.model('Follow', followSchema);
const Post = mongoose.model('Post', postSchema);

async function getRecentPostsFromFollowings(userId) {
  return Post.aggregate([
    {
      $match: {
        author: { $in: await Follow.distinct('following', { follower: new Types.ObjectId(userId) }) }
      }
    },
    { $sort: { created: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'authorInfo'
      }
    },
    { $unwind: '$authorInfo' },
    {
      $project: {
        _id: 0,
        content: 1,
        created: 1,
        authorName: '$authorInfo.name'
      }
    }
  ]);
}

/*
3. Indexing Strategy:
- Follow: index on { follower: 1 } and { following: 1 } for efficient follower/following lookups.
- Post: compound index { author: 1, created: -1 } for paging posts by author in reverse-chronological order.
- User: default _id index is sufficient for lookups by user ID.
*/

module.exports = {
  User,
  Follow,
  Post,
  getRecentPostsFromFollowings,
};