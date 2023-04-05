<template>
  <v-container>
    <v-app-bar
      style="padding: 0px 90px"
      app
      color="#f27727"
      light
      elevation="6"
      rounded
      elevate-on-srcoll
    >
      <v-toolbar-title class="text-white" dark block title
        >Digital object sharing system</v-toolbar-title
      >
      <v-list style="background:#f27727; margin-right: 50px;" class="d-flex align-center text-white">
          <v-list-item 
            link
            v-for="(menu, index) in menus"
            :key="index"
            :to="menu.route"
          >
            <v-list-item-title>{{ menu.title }}</v-list-item-title>
          </v-list-item>
      </v-list>
      <v-btn @click="navigateToDashboard" elevation="6" class="btn-background">Get Started</v-btn>
    </v-app-bar>
  </v-container>
</template>

<script>
export default {
  name: "HeaderVue",

  data: () => {
    return {
      menus: [
        { title: "Home", route: "dashboard" },
        { title: "Login", route: "login" },
      ],
    };
  },

  methods: {
    navigateToDashboard() {
      this.$router.push({ path: '/dashboard' });
    }
  }
};
</script>

<style scoped>
.btn-background {
  background: #27a2f2;
  color: white;
}

.v-toolbar-title{
    font-size: x-large;
    font-weight: 700;
}

</style>
