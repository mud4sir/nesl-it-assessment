import { Request, Response, NextFunction } from "express";
import { ApiSuccess } from "@/utils/ApiSucess";
import { asyncHandler } from "@/middleware/async-middleware";
import { Post } from "@/types/interfaces/interfaces.common";
import { ApiError } from "@/utils/ApiError";
import { posts } from "@/config/db";
import { Roles } from "@/types/enums/enums.common";


export const getPosts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalPosts = posts.length;
    const paginatedPosts = posts.slice(skip, skip + limit);
    const totalPages = Math.ceil(totalPosts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.set({
      'X-Current-Page': page.toString(),
      'X-Total-Pages': totalPages.toString(),
      'X-Total-Count': totalPosts.toString(),
      'X-Per-Page': limit.toString(),
      'X-Has-Next-Page': hasNextPage.toString(),
      'X-Has-Prev-Page': hasPrevPage.toString(),
    });

    console.log("🚀 ~ Pagination info:", {
      currentPage: page,
      totalPages,
      totalPosts,
      hasNextPage,
      hasPrevPage
    });

    res.status(200).json(new ApiSuccess<Post[]>(paginatedPosts, "Success!"));
  }
);

export const deletePostById = (req: Request, res: Response) => {
  const postId = req.params.id;
  const userRole = req.user?.role;

  if (userRole !== Roles.ADMIN) {
    return res.status(403).json(new ApiError({}, 404, "Only admins can delete posts"));
  }

  const index = posts.findIndex(post => post.id === parseInt(postId));
  if (index === -1) {
    return res.status(404).json(new ApiError({}, 404, "No Post Found for id" + postId));
  }

  posts.splice(index, 1),

  res.status(200).json(new ApiSuccess<number>(index, "Post Deleted Successfully!"));
}
