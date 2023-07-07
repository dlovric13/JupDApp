<template>
  <v-container class="pt-15">
    <v-row>
      <v-col cols="12" lg="6">
        <div class="text-center">
          <h2 class="intro-text">
            Welcome to our Decentralized Collaborative Digital Object Sharing and Monitoring System
          </h2>
          <p class="description">
           designed to revolutionize the way researchers and data scientists collaborate and share their work. 
          Our system allows secure and decentralized sharing, editing, and tracking of Jupyter notebooks, 
           backed by the robustness of Hyperledger Fabric.
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
           This system enables multiple users to work simultaneously on shared Jupyter notebooks. It offers real-time tracking of changes, facilitating effective communication and collaboration in research projects.
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
           The system prioritizes data security, using the robustness of Hyperledger Fabric. It ensures that digital research objects are secure and tamper-resistant when shared.
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
            Adopting a decentralized structure, the system eliminates single points of failure and encourages shared data ownership. It guarantees resilience and reliability, crucial for collaborative research work
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- <v-row class="my-5">
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
    </v-row> -->
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

