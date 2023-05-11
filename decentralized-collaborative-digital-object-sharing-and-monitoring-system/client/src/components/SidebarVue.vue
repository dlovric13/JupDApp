<template>
  <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
    <div class="header d-flex align-items-center">
      <div class="back-arrow-container" style="order: -1; padding: 8px 0px">
        <a href="#" @click.prevent="goBack" class="back-arrow">
          <i class="mdi mdi-arrow-left icon"></i>
        </a>
      </div>
      <div class="menu-icon-container">
        <h2
          class="sidebar-header text-white font-weight-bold py-2"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <i
            :class="
              sidebarCollapsed ? 'mdi mdi-menu icon' : 'mdi mdi-close icon'
            "
          ></i>
        </h2>
      </div>
    </div>
    <ul class="sidebar-options list-unstyled mt-4">
      <li
        class="sidebar-option py-2"
        v-for="option in filteredOptions"
        :key="option.id"
        @click="handleClick(option)"
      >
         <i :class="['mdi', option.icon, 'mr-2']"></i>
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<script>
import jwtDecode from "jwt-decode";
import Cookies from "js-cookie";
export default {
  props: {},
  data() {
    return {
      sidebarCollapsed: true,
      options: [
        { id: 1, label: "Shared projects", icon: "mdi-folder-multiple" },
        { id: 2, label: "Admin dashboard", icon: "mdi-view-dashboard" },
        { id: 3, label: "Data repository", icon: "mdi-database" },
        { id: 4, label: "Log out", icon: "mdi-logout" },
      ],
    };
  },
  created() {
    const token = Cookies.get("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      this.userType = decodedToken.userType;
      console.log("Decoded token from SidebarVue", this.userType);
    }
  },
  computed: {
    filteredOptions() {
      if (this.userType === "admin") {
        return this.options;
      } else {
        return this.options.filter(
          (option) => option.label !== "Admin dashboard"
        );
      }
    },
  },
  methods: {
    handleClick(option) {
      if (option.label === "Log out") {
        this.logout();
      } else if (option.label === "Data repository") {
        this.$router.push("/dashboard");
      } else if (option.label == "Admin dashboard") {
        this.$router.push("/requests");
      }
    },

    goBack() {
      this.$emit("go-back");
    },
    logout() {
      this.$emit("logout");
    },
  },
};
</script>

<style scoped>
.icon {
  margin: 0;
  padding: 0;
}

.menu-icon,
.close-icon {
  cursor: pointer;
  font-size: 18px;
  margin: 8px;
  position: absolute;
  top: 0;
  left: 0;
}
.sidebar {
  width: 200px;
  background-color: #1a77d2;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
}
.sidebar.collapsed {
  width: 0;
}

.sidebar-header {
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
  border-radius: 4px 4px 0 0;
}

.sidebar-options {
  list-style: none;
  margin: 0;
  padding-top: 50px;
  overflow: hidden;
}

.sidebar-option {
  cursor: pointer;
  padding: 8px;
  white-space: nowrap;
}

.sidebar-option:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.back-arrow-container {
  position: relative;
  margin-right: 10px;
}

.back-arrow {
  color: #fff;
  border-radius: 50%;
  font-size: 1.5em;
  transition: background-color 0.2s ease-in-out;
}

.back-arrow:hover {
  background-color: rgba(242, 119, 39, 0.8);
  color: #fff;
}
</style>
