<template>
  <v-container fluid class="bg-color mt-16">
    <v-row align="center" justify="center">
      <v-col cols="12" lg="6">
        <v-img
          :aspect-ratio="16 / 9"
          :width="width"
          lazy-src="../assets/live_collaboration.svg"
          src="../assets/live_collaboration.svg"
          class="about-us-image"
        ></v-img>
      </v-col>
      <v-col cols="12" lg="6">
       
        <v-card elevation="10" tile>
             <h2 class="text-center mt-6">About Us</h2>
          <p class="aboutus text-center">
            Our decentralized digital object sharing and monitoring system allows users to securely share and track digital objects. We strive to provide a seamless and user-friendly experience for our users.
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "AboutUsComponent",
  data: () => {
    return {
      width: '100%'
    }
  },
};
</script>
<style scoped>
.aboutus {
  margin: 35px 0;
  font-size: larger;
}

.about-us-image {
  max-width: 100%;
}

.bg-color {
  background: #eaeaea;
}
</style>
