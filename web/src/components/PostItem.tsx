import React from "react";
import { PostItemProps } from "../types";
import { MdDelete } from "react-icons/md";

const PostItem: React.FC<PostItemProps> = React.memo(({ post, index, deletePostHandler }) => {
  return (
    <li className="post-item" data-index={index}>
      <div className="post-header">
        <strong>{post.author}</strong>
        <span className="post-date">
         {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="post-content-wrapper">
        <p className="post-content">{post.content}</p>
        <span className="delete-btn" onClick={() => deletePostHandler(post.id)}>
          <MdDelete />
        </span>
      </div>
    </li>
  );
});

export default PostItem;