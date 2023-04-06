<template>
  <v-app>
    <v-container>
      <div class="back-arrow-container" style="order: -1; padding: 8px 0px">
        <a href="#" @click.prevent="goBack" class="back-arrow">
          <i class="mdi mdi-arrow-left icon"></i>
        </a>
      </div>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="10">
          <v-card elevation="6" class="elevation-6 mt-10">
            <v-window v-model="step">
              <v-window-item :value="1">
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-card-text class="mt-12">
                      <h4 class="text-center">Login to Your Account</h4>
                      <h6 class="text-center text-grey">
                        Log in to your account so you can continue
                      </h6>

                      <v-row align="center" justify="center">
                        <v-col cols="12" sm="8">
                          <v-form @submit.prevent="login">
                            
                            <v-text-field
                              label="Username"
                              v-model="username"
                              :rules="usernameRules"
                              required
                              autocomplete="username"
                            ></v-text-field>

                            <v-text-field
                              label="Password"
                              outlined
                              dense
                              color="#27A2F2"
                              autocomplete="false"
                              type="password"
                              v-model="password"
                            ></v-text-field>
                            <div v-if="errorMessage" class="error-message">
                              {{ errorMessage }}
                            </div>
                            <v-row>
                              <v-col cols="12" sm="7">
                                <v-checkbox
                                  label="Remember me"
                                  class="mt-n1"
                                  color="#27A2F2"
                                ></v-checkbox>
                              </v-col>
                            </v-row>
                            <v-btn
                              type="submit"
                              class="text-white"
                              color="#f27727"
                              dark
                              block
                              title
                              rounded
                              >Login</v-btn
                            >
                          </v-form>
                          <h5 class="text-center text-grey mt-4 mb-3">
                            Or login using
                          </h5>
                          <div
                            class="d-flex justify-space-between align-center mx-10 mb-16"
                          >
                            <v-btn depressed elevation="5" outlined>
                              <v-icon color="red">mdi-google</v-icon>
                            </v-btn>
                            <v-btn depressed elevation="5" outlined>
                              <v-icon color="blue">mdi-facebook</v-icon>
                            </v-btn>
                            <v-btn depressed elevation="5" outlined>
                              <v-icon color="light-blue lighten-3"
                                >mdi-twitter</v-icon
                              >
                            </v-btn>
                          </div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-col>
                  <v-col cols="12" sm="6" class="rounded-bl-xl">
                    <div style="text-align: center; padding: 180px 0">
                      <v-img
                        :aspect-ratio="20 / 9"
                        :width="width"
                        lazy-src="../assets/secure_login.svg"
                        src="../assets/secure_login.svg"
                      ></v-img>
                      <v-card-text class="text-white">
                        <h3 class="text-center">Don't have an account yet?</h3>
                        <h6 class="text-center">Let's get you all setup</h6>
                      </v-card-text>
                      <div class="text-center text-white">
                        <v-btn
                          color="#27A2F2"
                          title
                          outlined
                          dark
                          @click="step++"
                          >SIGN UP</v-btn
                        >
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </v-window-item>
              <v-window-item :value="2">
                <v-row>
                  <v-col cols="12" sm="6" class="rounded-br-xl">
                    <div style="text-align: center; padding: 180px 0">
                      <v-img
                        :aspect-ratio="22 / 9"
                        :width="width"
                        lazy-src="../assets/engineering_team.svg"
                        src="../assets/engineering_team.svg"
                      ></v-img>
                      <v-card-text class="text-white">
                        <h3 class="text-center">Already have an account?</h3>
                        <h6 class="text-center">Login to your account</h6>
                      </v-card-text>
                      <div class="text-center text-white">
                        <v-btn
                          color="#27A2F2"
                          title
                          outlined
                          dark
                          @click="step--"
                          >Login</v-btn
                        >
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-card-text class="mt-12">
                      <h4 class="text-center">
                        Fill out the form to create an account
                      </h4>
                      <h6 class="text-center text-grey">
                        Let's get you all set up
                      </h6>

                      <v-row align="center" justify="center">
                        <v-col cols="12" sm="8">
                          <div v-if="errorMessage" class="error-message">
                            {{ errorMessage }}
                          </div>
                          <v-form @submit.prevent="submitForm">
                            <v-row>
                              <v-col>
                                <v-text-field
                                  label="Username"
                                  outlined
                                  dense
                                  color="#27A2F2"
                                  autocomplete="false"
                                  class="mt-4"
                                  v-model="username"
                                  name="username"
                                ></v-text-field>
                              </v-col>
                            </v-row>
                            <v-text-field
                              label="Email"
                              outlined
                              dense
                              color="#27A2F2"
                              autocomplete="false"
                              v-model="email"
                              name="email"
                              type="email"
                            ></v-text-field>
                            <v-text-field
                              label="Password"
                              outlined
                              dense
                              color="#27A2F2"
                              type="password"
                              v-model="password"
                              name="password"
                            ></v-text-field>
                            <v-select
                              label="Organization"
                              outlined
                              dense
                              color="#27A2F2"
                              :items="organizations"
                              v-model="selectedOrg"
                              name="organization"
                              return-object
                            >
                            </v-select>

                            <v-select
                              label="User type"
                              outlined
                              dense
                              color="#27A2F2"
                              :items="userTypes"
                              v-model="selectedUser"
                              name="user"
                              return-object
                            >
                            </v-select>

                            <v-btn
                              type="submit"
                              class="text-white"
                              color="#f27727"
                              rounded
                              dark
                              block
                              title
                            >
                              Sign up
                            </v-btn>
                          </v-form>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-col>
                </v-row>
              </v-window-item>
            </v-window>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import axios from "axios";
import jwt_decode from "jwt-decode";
import Cookies from "js-cookie";

console.log("LoginView script executed");
// Components
export default {
  name: "LoginView",
  components: {},
  methods: {
    goBack() {
      this.$router.go(-1);
    },

    async submitForm() {
      try {
        if (this.selectedOrg.value === "Org1") {
          this.affiliation = "org1.department1";
        } else if (this.selectedOrg.value === "Org2") {
          this.affiliation = "org2.department1";
        } else {
          // Handle invalid organization selection
          this.errorMessage =
            "Invalid organization selected. Please try again.";
          return;
        }

        console.log("Affiliation before axios post:", this.affiliation);

        const response = await axios.post(
          "http://localhost:3000/auth/register",
          {
            username: this.username,
            email: this.email,
            password: this.password,
            organization: this.selectedOrg,
            userType: this.selectedUser,
            affiliation: this.affiliation,
          }
        );

        console.log(response.data);

        // Redirect the user to the login page or show a success message
      } catch (error) {
        console.error(error);
        // Show an error message to the user
      }
    },

    async login() {
      try {
        const response = await axios.post("http://localhost:3000/auth/login", {
          username: this.username,
          password: this.password,
        },
      
    );
        // console.log(response.data); 
        if (response.data.token) {
          // localStorage.setItem("token", response.data.token);
          console.log('Token from response:', response.data.token);
          Cookies.set("token", response.data.token, { expires: 1, secure: false, path: '/' });
          console.log('Token set in cookie:', Cookies.get("token"));
          const decodedToken = jwt_decode(response.data.token);
          const userAffiliation = decodedToken.affiliation;
          localStorage.setItem("affiliation", userAffiliation);

          this.$router.push("/dashboard");
        } else {
          this.errorMessage = "Invalid username or password";
        }
      } catch (error) {
        console.error(error);
        this.errorMessage = "Error logging in";
      }
    },
  },
  created() {
    console.log("LoginView component created");
    console.log("Organizations:", this.organizations);
  },
  data: () => ({
    step: 1,
    username: "",
    email: "",
    password: "",
    selectedOrg: null,
    selectedUser: null,
    errorMessage: "",
    affiliation: "",
  }),
  computed: {
    organizations() {
      return [
        { title: "UvA", value: "Org1" },
        { title: "Vrije", value: "Org2" },
      ];
    },
    userTypes() {
      return [
        { title: "Data Manager", value: "admin" },
        { title: "Data User", value: "user" },
      ];
    },
  },

  watch: {
    selectedOrg(newVal) {
      console.log("Selected organization value:", newVal.value);
    },
    affiliation(newVal, oldVal) {
      console.log("Affiliation changed:", oldVal, "=>", newVal);
    },
  },

  props: {
    source: String,
  },
};
</script>
<style scoped>
.v-application .rounded-bl-xl {
  border-bottom-left-radius: 300px !important;
}

.v-menu__content .v-list-item__content {
  color: black;
}

.rounded-bl-xl {
  background-color: #f27727;
}
.v-application .rounded-br-xl {
  border-bottom-right-radius: 300px !important;
}
.rounded-br-xl {
  background-color: #f27727;
}

.icon {
  font-size: 25px;
  color: #ffffff;
}

.back-arrow-container {
  background-color: #27a2f2;
  width: 50px;
  height: 50px;
  border-radius: 25px;
}
.back-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.error-message {
  color: red;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
}
</style>
