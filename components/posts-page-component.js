import { POSTS_PAGE, USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage } from "../index.js";
import { getToken } from "../index.js";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale"
import { toggleLike,dislikeLike } from "../api.js";

export function renderPostsPageComponent({ appEl, userView }) {
 
  let postsHTML = posts
  .map((post) => {
    return `<li class="post">
                  <div class="post-header" data-user-id=${post.user.id}>
                      <img src=${
                        post.user.imageUrl
                      } class="post-header__user-image">
                      <p class="post-header__user-name">${post.user.name}</p>
                  </div>
                  <div class="post-image-container">
                    <img class="post-image" src=${post.imageUrl}>
                  </div>
                  <div class="post-likes">
                  <button data-id=${post.id} data-liked="${
      post.isLiked
    }" class="like-button">   
                      ${
                        post.isLiked
                          ? `<img src="./assets/images/like-active.svg"></img>`
                          : `<img src="./assets/images/like-not-active.svg"></img>`
                      }
                  </button>
              
                  <p class="post-likes-text">
                      Нравится: <strong>
                          ${
                            post.likes.length === 0
                              ? 0
                              : post.likes.length === 1
                              ? post.likes[0].name
                              : post.likes[post.likes.length - 1].name +
                                " и еще " +
                                (post.likes.length - 1)
                          }
                      </strong>
                  </p>
              </div>
              <button data-id=${post.id} class="delete-button"> 
              <p class="delete">Удалить пост</p>
              </button>
                  <p class="post-text">
                    <span class="user-name">${post.user.name}</span>
                    ${post.description}
                  </p>
                  <p class="post-date">
                  ${formatDistanceToNow(new Date(post.createdAt), {
                    locale: ru,
                  })} назад
                  </p>
                </li>`;
  })
  .join("");

const appHtml = `
                      <div class="page-container">
                        <div class="header-container"></div>
                        <ul class="posts">
                        ${postsHTML}
                        </ul>
                      </div>`;

appEl.innerHTML = appHtml;


  // Delete 
  const deleteButtons = document.querySelectorAll('.delete-button');

for (const deleteButton of deleteButtons) {
    deleteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        const id = deleteButton.dataset.id;
        deletePost(id);
    });
}
  

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }

//likes counter
function getLikePost() {
  const likesButtons = document.querySelectorAll(".like-button");

  likesButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const id = button.dataset.id;

      const isLiked = button.dataset.liked;

      const index = posts.findIndex((post) => post.id === id);

      if (index === -1) {
        console.error("Ошибка: пост не найден");
        return;
      }

      if (isLiked === "false") {
        toggleLike(id, { token: getToken() })
          .then(() => {
            //posts[index].likes = updatedPost.post.likes;
            /* 💡 Для удобства создадим переменную отдельно */
            const newPage = userView ? USER_POSTS_PAGE : POSTS_PAGE;
            /* 💡 Здесь иначе берем id - из первого поста. Также используем переменную */
            goToPage(newPage, { userId: posts[0].user.id });
          })
          .catch((error) => {
            console.error("Ошибка при добавлении лайка:", error);
          });
      } else {
        dislikeLike(id, { token: getToken() })
          .then(() => {
            //posts[index].likes = updatedPost.post.likes;
            /* 💡 Для удобства создадим переменную отдельно */
            const newPage = userView ? USER_POSTS_PAGE : POSTS_PAGE;
            /* 💡 Здесь иначе берем id - из первого поста. Также используем переменную */
            goToPage(newPage, { userId: posts[0].user.id });
          })
          .catch((error) => {
            console.error("Ошибка при удалении лайка:", error);
          });
      }
    });
  });
}
getLikePost();
}