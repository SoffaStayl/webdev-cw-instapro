import { likePosts, dislikePosts, getPosts, getUserPosts } from "../api";
import { POSTS_PAGE, USER_POSTS_PAGE } from "../routes.js";
import { posts, page, renderApp , setPosts } from "../index.js";

export function initLikeButtonListeners() {
    for (const likeButtonElement of document.querySelectorAll('.like-button')) {
        likeButtonElement.addEventListener('click', () => {
          const index = likeButtonElement.dataset.index;
          if (posts[index].isLiked === false) {
            return likePosts(likeButtonElement.dataset.postId)
              .then(() => {
                if (page === POSTS_PAGE) {
                  getPosts().then((data) => {
                    setPosts(data);
                    renderApp();
                  })
                } else if (page === USER_POSTS_PAGE) {
                  getUserPosts(likeButtonElement.dataset.userId).then((data) => {
                    setPosts(data.posts);
                    renderApp();
                  })
                }

              });
          } else {
            return dislikePosts(likeButtonElement.dataset.postId)
              .then(() => {
                if (page === POSTS_PAGE) {
                  getPosts().then((data) => {
                    setPosts(data);
                    renderApp();
                  })
                } else if (page === USER_POSTS_PAGE) {
                  getUserPosts(likeButtonElement.dataset.userId).then((data) => {
                    setPosts(data.posts);
                    renderApp();
                  })
                }
              });
          }
        });
      }
}