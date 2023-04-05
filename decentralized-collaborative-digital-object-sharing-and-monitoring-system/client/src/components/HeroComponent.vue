<template>
  <v-container class="pt-15">
    <v-row>
      <v-col cols="12" lg="6">
        <div class="text-center">
          <h2 class="intro-text">
            Welcome to our digital object sharing system
          </h2>
          <p class="description">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Necessitatibus eaque maxime debitis sequi aperiam? Aliquam laborum
            eum quisquam natus in?
          </p>

          <v-btn  @click="navigateToDashboard" elevation="6" class="text-white" color="#27a2f2" dark title
            >Get Started</v-btn
          >
        </div>
      </v-col>
      <v-col cols="12" lg="6">
        <v-img width="80%" height="80%"
          lazy-src="../assets/team_collaboration.svg"
          src="../assets/team_collaboration.svg"
        ></v-img>
      </v-col>
    </v-row>
    
    <v-row class="my-5">
      <v-col cols="12" class="text-center">
        <h3>Key Features</h3>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" lg="4" class="text-center">
        <v-card class="pa-5">
          <v-img width="50%" height="50%" style="display:block;margin:auto;"
          lazy-src="../assets/collaboration.svg"
          src="../assets/collaboration.svg"
        ></v-img>
          <v-card-title class="headline mt-3">Collaboration</v-card-title>
          <v-card-text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam viverra euismod odio, gravida pellentesque urna varius vitae.
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" lg="4" class="text-center">
        <v-card class="pa-5">
          <v-img width="50%" height="50%" style="display:block;margin:auto;"
          lazy-src="../assets/security.svg"
          src="../assets/security.svg"
        ></v-img>
          <v-card-title class="headline mt-3">Security</v-card-title>
          <v-card-text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam viverra euismod odio, gravida pellentesque urna varius vitae.
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" lg="4" class="text-center">
        <v-card class="pa-5">
            <v-img width="50%" height="50%" style="display:block;margin:auto;"
          lazy-src="../assets/decentralization.svg"
          src="../assets/decentralization.svg"
        ></v-img>
                    <v-card-title class="headline mt-3">Decentralization</v-card-title>
          <v-card-text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam viverra euismod odio, gravida pellentesque urna varius vitae.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="my-5">
      <v-col cols="12" class="text-center">
        <h3>Testimonials</h3>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" lg="4" class="text-center">
        <v-card class="pa-5">
          <v-img src="../assets/user1.png" lazy-src="../assets/user1.png" width="20%" height="20%" style="display:block;margin:auto;" alt="John Doe"></v-img>
          <v-card-title class="headline mt-3">John Doe</v-card-title>
          <v-card-subtitle>Satisfied User</v-card-subtitle>
          <v-card-text>
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam viverra euismod odio, gravida pellentesque urna varius vitae."
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" lg="4" class="text-center">
        <v-card class="pa-5">
          <v-img src="../assets/user2.png" lazy-src="../assets/user2.png" width="20%" height="20%" style="display:block;margin:auto;" alt="Jane Smith"></v-img>
          <v-card-title class="headline mt-3">Jane Smith</v-card-title>
          <v-card-subtitle>Satisfied User</v-card-subtitle>
          <v-card-text>
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam viverra euismod odio, gravida pellentesque urna varius vitae."
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" lg="4" class="text-center">
        <v-card class="pa-5">
          <v-img src="../assets/user3.png" lazy-src="../assets/user3.png" width="20%" height="20%" style="display:block;margin:auto;" alt="Bob Johnson"></v-img>
          <v-card-title class="headline mt-3">Bob Johnson</v-card-title>
          <v-card-subtitle>Satisfied User</v-card-subtitle>
          <v-card-text>
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam viverra euismod odio, gravida pellentesque urna varius vitae."
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: "HeroComponent",

  data: () => {},

   methods: {
    navigateToDashboard() {
      this.$router.push({ path: '/dashboard' });
    }
  }
};
</script>

<style scoped>
.intro-text {
  font-size: xx-large;
  font-weight: 800;
}

.description {
  margin: 35px 0;
  font-size: larger;
}

.pa-5 {
  padding: 1.5rem;
}

img {
  border-radius: 50%;
}
</style>

