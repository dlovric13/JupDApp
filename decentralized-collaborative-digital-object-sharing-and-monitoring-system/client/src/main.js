import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import "vuetify/styles";
import { loadFonts } from './plugins/webfontloader'
import axios from "axios";

// Request interceptor to add the token to every request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle token expiration, for example, by redirecting to the login page
      localStorage.removeItem('token');
      localStorage.removeItem('affiliation');
      router.push('/login'); // or the route name of your login page
    }
    return Promise.reject(error);
  }
);



loadFonts()

createApp(App)
  .use(router)
  .use(store)
  .use(vuetify)
  .mount('#app')
