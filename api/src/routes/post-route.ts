import express from "express";

import { deletePostById, getPosts } from "@/controllers/post-controller";
import { authorize } from "@/middleware/auth-middleware";

const router = express.Router();

router.get("/", authorize, getPosts);
router.delete("/:id", authorize, deletePostById);

// Export router; should always export as default
export default router;
