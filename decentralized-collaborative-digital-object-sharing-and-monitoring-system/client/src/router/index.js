import { createRouter, createWebHistory } from 'vue-router'
import jwt_decode from "jwt-decode";
import Cookies from "js-cookie";
// import store from "../store";
// import LandingView from '../views/LandingView.vue'
// import LoginView from '../views/LoginView.vue'
// import DashboardView from '../views/DashboardView.vue'

const routes = [
  {
    path: "/",
    name: "landing",
    component: () =>
      import(/* webpackChunkName: "landing" */ "../views/LandingView.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/LoginView.vue"),
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/DashboardView.vue"),
  },
  {
    path: "/requests",
    name: "requests",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/RequestView.vue"),
  },
  {
    path: "/projects",
    name: "projects",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/ProjectsView.vue"),
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,

  

})

router.beforeEach((to, from, next) => {
  if (to.path === "/requests") {
    const token = Cookies.get("token");

    if (token) {
      const decoded = jwt_decode(token);
      if (decoded.userType === "admin") {
        next();
      } else {
        next("/dashboard");
      }
    } else {
      next("/login"); 
    }
  } else {
    next();
  }
});

export default router;
