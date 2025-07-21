import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { Post } from "../types";
import PostItem from "./PostItem";
import useApi from "../hooks/useApi";

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user, logout, token } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitialLoadRef = useRef(true);

  const { data: apiResponse, loading, error, request } = useApi();

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    if (!hasMore && !isInitialLoadRef.current) return;
    if (loading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const newPosts = await request({
        resource: `/post?page=${pageNum}&limit=10`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
      });

      if (apiResponse === null && error) {
        throw new Error(`${error}` || 'something went wrong');
      }

      if (newPosts?.data.length === 0 || newPosts?.data.length < 10) {
        setHasMore(false);
      }

      if (append) {
        setPosts(prev => {
          const filteredNewPosts = newPosts && newPosts.data.filter(
            (newPost: Post) => !prev.some(existingPost => existingPost.id === newPost.id)
          );
          return [...prev, ...filteredNewPosts];
        });
      } else {
        setPosts(newPosts?.data);
      }

      isInitialLoadRef.current = false;
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error(err.message);
      }
    }
  }, [hasMore, loading, token]);

  useEffect(() => {
    if (user && isInitialLoadRef.current) {
      fetchPosts(1, false);
    }
  }, [user, fetchPosts]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, true);
    }
  }, [loading, hasMore, page, fetchPosts]);

  const { setTargetRef, resetFetching } = useInfiniteScroll(loadMore);

  useEffect(() => {
    if (!loading) {
      resetFetching();
    }
  }, [loading, resetFetching]);

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    isInitialLoadRef.current = true;
    
  }, [user]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const deletePostHandler = async (id: string) => {
    try {
      const response = await request({
        resource: `/post/${id}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
      });

      if (response.error) {
        throw new Error(response.error || 'something went wrong when deleting post')
      }

      console.log("🚀 ~ deletePostHandler ~ response:", response)
      
      setPage(1)
      await fetchPosts(1, false);

    } catch (error) {
      console.error(error);
    }
    
  }

  if (error) {
    return <div className="error">Error loading feed: {error?.message}</div>;
  }

  return (
    <div className="feed-container">
      <header className="feed-header">
        <h1>Social Feed</h1>
        <div className="user-info">
          <span>Welcome, {user?.id} ({user?.role})</span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <ul className="posts-list">
        {posts.map((post, index) => (
          <PostItem key={post.id} post={post} index={index} deletePostHandler={deletePostHandler} />
        ))}
      </ul>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          Loading more posts...
        </div>
      )}

      {hasMore && !loading && posts.length > 0 && (
        <div
          ref={setTargetRef}
          className="load-more-trigger"
          style={{ height: '20px' }}
        />
      )}

      {!hasMore && posts.length > 0 && (
        <div className="end-message">
          You've reached the end of the feed!
        </div>
      )}

      {!hasMore && posts.length === 0 && !loading && (
        <div className="empty-feed">
          No posts to display.
        </div>
      )}
    </div>
  );
};

export default Feed;