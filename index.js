const express = require("express");
const cors = require("cors");
const posts = require("./routes/posts");
const PORT = 5000;

const server = express();
server.use(cors());
server.use(express.json());

server.use("/api/posts", posts);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
