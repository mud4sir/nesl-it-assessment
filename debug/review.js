// postsController.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  created: { type: Date, default: Date.now },
  slug: { type: String, unique: true, required: true }
});

postSchema.index({ slug: 1 }, { unique: true });

const Posts = mongoose.model('Post', postSchema);

/**
 * Fetch and return posts sorted by creation date in descending order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function getSortedPosts(req, res) {
  try {
    const posts = await Posts.find().sort({ created: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getSortedPosts, Posts };

/**
 * EXPLANATION OF PROBLEMS AND FIXES
 *
 * Identified Problems:
 * 1. **Sorting in JavaScript Instead of Database**:
 *    - Original Issue: The code fetched all posts with `Posts.find()` and sorted them in memory using
 *      `posts.sort((a, b) => b.created - a.created)`. This is inefficient for large datasets, as it loads
 *      all documents into memory, potentially causing slowdowns or hangs.
 *    - Fix: Modified to use Mongoose's `.sort({ created: -1 })` to sort at the database level.
 *    - Why It Matters: Databases like MongoDB are optimized for sorting. Doing it in the database reduces
 *      memory usage and speeds up the query, preventing performance issues with large collections.
 *
 * 2. **Potential for Duplicates**:
 *    - Original Issue: The code doesn't prevent duplicate posts in the database, which could lead to
 *      duplicates in the response if multiple posts with identical data are stored.
 *    - Fix: Added a `slug` field with a unique constraint in the schema and ensured the index is created.
 *    - Why It Matters: A unique index prevents duplicate entries at the database level, ensuring only unique
 *      posts are returned, directly addressing the duplicate issue.
 *
 * 3. **Missing Error Handling**:
 *    - Original Issue: No try-catch block around the database query, so errors (e.g., database downtime)
 *      could cause the app to hang or crash without informing the client.
 *    - Fix: Added try-catch to handle errors, log them, and return a 500 status with a message.
 *    - Why It Matters: Error handling prevents the app from freezing and provides a clear response to the
 *      client, improving reliability and user experience.
 *
 * 4. **Inefficient Router Logic**:
 *    - Original Issue: The router wrapped `getSortedPosts` in an unnecessary async function with a
 *      `console.log('Done.')`, which could cause confusion or mask issues since the response is already sent.
 *    - Fix: Simplified the router to directly use `getSortedPosts` as the handler (see router.js below).
 *    - Why It Matters: Removes redundant code, making the application easier to maintain and reducing the
 *      chance of bugs from misplaced logic after the response.
 */

/**
 * Example Router Setup (router.js)
 * Note: This would typically be in a separate file, included here for completeness.
 */
const express = require('express');
const router = express.Router();
const { getSortedPosts } = require('./postsController');

// Simplified route handler
router.get('/posts', getSortedPosts);

module.exports = router;

/**
 * Additional Recommendations:
 * - **Pagination**: For large datasets, consider adding `.limit(10).skip(offset)` to the query to fetch
 *   posts in smaller chunks, further improving performance.
 * - **Data Validation**: Ensure the insertion logic generates unique `slug` values (e.g., using a library
 *   like `slugify` or a UUID) to prevent unique constraint violations.
 * - **Logging**: Enhance logging in production to track errors without exposing sensitive details to clients.
 *
 * Usage Notes:
 * - Ensure MongoDB is running and the Posts collection is properly set up.
 * - Test the unique constraint by attempting to insert duplicate slugs, which should throw an error.
 * - Monitor performance with large datasets and implement pagination if needed.
 */