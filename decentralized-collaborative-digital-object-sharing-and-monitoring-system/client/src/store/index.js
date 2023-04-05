import { createStore } from "vuex";
// import router from "../router";
// import axios from "axios";

export default createStore({
  state: {
    // accessToken: null,
    // loggingIn: false,
    // loginError: null,
  },
  getters: {},
  mutations: {
    // loginStart: (state) => (state.loggingIn = true),
    // loginStop: (state, errorMessage) => {
    //   state.loggingIn = false;
    //   state.loginError = errorMessage;
    // },
    // updateAccessToken: (state, accessToken) => {
    //   state.accessToken = accessToken;
    // },
    // logout: (state) => {
    //   state.accessToken = null;
    // },
  },
  actions: {
    // doLogin({ commit }, loginData) {
    //   commit("loginStart");

    //   axios.post("https://reqres.in/api/login", {
    //       loginData
    //     })
    //     .then((response) => {
    //       localStorage.setItem("accessToken", response.data.token);
    //       commit("loginStop", null);
    //       commit("updateAccessToken", response.data.token);
    //       router.push("/dashboard");
    //     })
    //     .catch((error) => {
    //       commit("loginStop", error.response.data.error);
    //       commit("updateAccessToken", null);
    //     });
    // },
    // fetchAccessToken({ commit }) {
    //   commit("updateAccessToken", localStorage.getItem("accessToken"));
    // },
    // logout({ commit }) {
    //   localStorage.removeItem("accessToken");
    //   commit("logout");
    //   router.push("/login");
    // },
  },
  modules: {},
});
