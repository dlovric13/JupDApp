import { createRouter, createWebHistory } from 'vue-router'
// import store from "../store";
// import LandingView from '../views/LandingView.vue'
// import LoginView from '../views/LoginView.vue'
// import DashboardView from '../views/DashboardView.vue'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: () => import(/* webpackChunkName: "landing" */ '../views/LandingView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "login" */ '../views/LoginView.vue')
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import(/* webpackChunkName: "login" */ '../views/DashboardView.vue')
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,

  

})

// router.beforeEach((to, from, next) => {
//   store.dispatch('fetchAccessToken');
//   if (to.fullPath === '/dashboard') {
//     if (!store.state.accessToken) {
//       next('/login');
//     }
//   }
//   if (to.fullPath === '/login') {
//     if (store.state.accessToken) {
//       next("/dashboard");
//     }
//   }
//   next();
// });


export default router;
