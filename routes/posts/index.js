const express = require("express");
const db = require("../../data/db");
const router = express.Router();

// ===============POSTS===================

// GET ALL POSTS
// GET -> /api/posts/
router.get("/", async (req, res) => {
  const posts = await db.find();

  if (!posts)
    return res
      .status(500)
      .json({ error: "The posts information could not be retrieved." });

  return res.status(200).json(posts);
});

// GET SPECIFIC POST
// GET -> /api/posts/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id)
    return res.status(400).json({ errorMessage: "Please provide a valid ID." });

  let post;
  try {
    post = await db.findById(id);
  } catch (err) {
    return res
      .status(404)
      .json({ error: "The post information could not be retrieved." });
  }

  if (post.length === 0)
    return res
      .status(404)
      .json({ message: "The post with the specified ID does not exist." });

  return res.status(200).json(post[0]);
});

// ADD NEW POST
// POST -> /api/posts/
router.post("/", async (req, res) => {
  const { title, contents } = req.body;

  if (!title || !contents)
    return res.status(400).json({
      errorMessage: "Please provide title and contents for the post.",
    });

  const post = await db.insert({ title, contents });

  if (!post)
    return res
      .status(500)
      .json({ error: "The posts information could not be retrieved." });

  // Because sqlite3 doesn't supporting returning (it only returns the id of the created resource)
  // I have to refetch the post to get all of the data. (which is dumb)

  const insertedPost = await db.findById(post.id);

  return res.status(201).json(insertedPost[0]);
});

// EDIT EXISTING POST
// PUT -> /api/posts/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, contents } = req.body;

  if (!id)
    return res.status(400).json({ errorMessage: "Please provide a valid ID." });

  if (!title || !contents)
    return res.status(400).json({
      errorMessage: "Please provide title and contents for the post.",
    });

  try {
    await db.findById(id);
  } catch (err) {
    return res
      .status(404)
      .json({ message: "The post with the specified ID does not exist." });
  }

  const newPost = { title, contents };

  try {
    await db.update(id, newPost);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "The post information could not be modified." });
  }

  // Because sqlite3 doesn't supporting returning (it only returns the id of the created resource)
  // I have to refetch the post to get all of the data. (which is dumb)
  const updatedPost = await db.findById(id);

  return res.status(200).json(updatedPost[0]);
});

// DELETE POST
// DELETE -> /api/posts/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id)
    return res.status(400).json({ errorMessage: "Please provide a valid ID." });

  const post = await db.findById(id);

  if (post.length === 0)
    return res
      .status(404)
      .json({ message: "The post with the specified ID does not exist." });

  try {
    await db.remove(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `The post with the ID of ${id} could not be removed.`,
    });
  }

  return res.status(200).json({
    message: `The post with the ID of ${id} was successfully deleted.`,
  });
});

// ===============COMMENTS===================

// SHOW ALL COMMENTS FOR A POST
// GET -> /api/posts/:id/comments
router.get("/:id/comments", async (req, res) => {
  const { id } = req.params;

  if (!id)
    return res.status(400).json({ errorMessage: "Please provide a valid ID." });

  let post;
  try {
    post = await db.findById(id);
  } catch (err) {
    return res
      .status(404)
      .json({ error: "The post information could not be retrieved." });
  }

  if (post.length === 0)
    return res
      .status(404)
      .json({ message: "The post with the specified ID does not exist." });

  let comments;
  try {
    comments = await db.findPostComments(post[0].id);
  } catch (err) {
    console.log(err);
    return res
      .status(404)
      .json({ error: "The comments information could not be retrieved." });
  }

  return res.status(200).json(comments);
});

// ADD NEW COMMENT TO A POST
// POST -> /api/posts/:id/comments
router.post("/:id/comments", async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!id)
    return res.status(400).json({ errorMessage: "Please provide a post id." });

  if (!text)
    return res
      .status(400)
      .json({ errorMessage: "Please provide text for the comment." });

  let post;
  try {
    post = await db.findById(id);
  } catch (err) {
    return res
      .status(404)
      .json({ error: "The post information could not be retrieved." });
  }

  if (post.length === 0)
    return res
      .status(404)
      .json({ message: "The post with the specified ID does not exist." });

  const comment = await db.insertComment({ text, post_id: id });

  if (!comment)
    return res
      .status(500)
      .json({ error: "The comment information could not be retreived." });

  // Because sqlite3 doesn't supporting returning (it only returns the id of the created resource)
  // I have to refetch the post to get all of the data. (which is dumb)

  const insertedComment = await db.findCommentById(comment.id);

  return res.status(201).json(insertedComment[0]);
});

module.exports = router;
