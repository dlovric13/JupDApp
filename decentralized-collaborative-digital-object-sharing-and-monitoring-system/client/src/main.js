import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import "vuetify/styles";
import { loadFonts } from './plugins/webfontloader'
import axios from "axios";
import Cookies from "js-cookie";
// Request interceptor to add the token to every request
// axios.interceptors.request.use(
//   (config) => {
//      const token = Cookies.get("token");
//     if (token) {
//       config.headers["x-auth-token"] = token;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

axios.interceptors.request.use(
  (config) => {
    if (!config.url.includes("localhost:5000")) {
      const token = Cookies.get("token");
      if (token) {
        config.headers["x-auth-token"] = token;
      }
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
      Cookies.remove("token");
      Cookies.remove("affiliation");
      router.push('/login'); 
    }
    return Promise.reject(error);
  }
);

createApp(App).use(router).use(store).use(vuetify).mount("#app");

function sendPing() {
  axios
    .get("http://localhost:3000/status/vue-ping")
    .then((response) => {
      console.log("Ping request successful:", response.data);
    })
    .catch((error) => {
      console.error("Ping request failed:", error);
    });
}

sendPing();
setInterval(sendPing, 1 * 60 * 1000);

loadFonts()


