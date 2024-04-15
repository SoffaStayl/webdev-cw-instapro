import { getPosts } from "./api.js";
import { postPosts , fetchPostsUser, deletefetchPost} from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";
export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];



export const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined;
  return token;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

/**
 * Включает страницу приложения
 */
function getAPI() {
  return getPosts({ token: getToken() })
    .then((newPosts) => {
      if (newPosts && newPosts.length > 0) {
        console.log('new posts', newPosts)
      page = POSTS_PAGE;
      posts = newPosts;
      renderApp();
      } else {
        console.log("No posts available.");
        // Можно выполнить дополнительные действия в случае отсутствия постов, например, показать сообщение об отсутствии данных
      }
    })
    .catch((error) => {
      console.error(error);
      //goToPage(POSTS_PAGE);
    });
  }


export const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      // Если пользователь не авторизован, то отправляем его на авторизацию перед добавлением поста
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return renderApp();
    } else if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      //renderApp();
      getAPI();
    } else if (newPage === USER_POSTS_PAGE) {
      console.log("Открываю страницу пользователя: ", data.userId);
      page =  LOADING_PAGE;
      renderApp();
      
      return fetchPostsUser(data.userId, { token: getToken() })
        .then((newPosts) => {
          page = USER_POSTS_PAGE;
          posts = newPosts;
    
          renderApp();
        })
        .catch((error) => {
          console.error(error);
        });
    } 
      page = newPage;
      renderApp();
      return;
    }
  throw new Error("Страницы не существует");
};

export const renderApp = () => {
  const appEl = document.getElementById("app");
  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }
  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }


  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
       
        console.log("Добавляю пост...", { description, imageUrl });
       postPosts ({ token: getToken(), description, imageUrl })
       .then(() => {     
         goToPage(POSTS_PAGE);
    })
    .catch((error) => {
      // В объекте error есть ключ message, в котором лежит сообщение об ошибке
      // Если сервер сломался, то просим попробовать позже
      if (error.message === "Сервер сломался") {
        alert("Сервер сломался, попробуйте позже");
        postPosts({ token: getToken(), description, imageUrl });
      }  else {
          alert('Кажется, у вас не работает интернет, попробуйте позже');
          console.log(error);
        }
    });


  },
});
}

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl, userView: false,
    });
  }

  if (page === USER_POSTS_PAGE) {
    // TODO: реализовать страницу фотографию пользвателя
    appEl.innerHTML = "Здесь будет страница фотографий пользователя";
    return renderPostsPageComponent({
      appEl, 
      userView: true,
    });
  }
};

goToPage(POSTS_PAGE);

export function deletePost( id ) {
  if (user) {
    deletefetchPost({ token: getToken() },  id)
    .then((newPosts) => {
    posts = newPosts;
    //return renderApp();  
    });
  }
}