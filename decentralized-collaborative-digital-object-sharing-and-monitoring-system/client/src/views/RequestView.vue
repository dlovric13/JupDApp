<template>
  <div class="container p-4">
    <SidebarVue
      :collapsed="sidebarCollapsed"
      :options="options"
      @toggleCollapsed="sidebarCollapsed = !sidebarCollapsed"
      @logout="logout"
    />
    <div
      class="content"
      :style="{ marginLeft: sidebarCollapsed ? '0' : '200px' }"
    >
      <h2 class="content-header text-white font-weight-bold py-2">
        <span @click="navigateToLanding">Admin dashboard</span>
      </h2>
      <v-container fluid>
        <v-row>
          <v-col cols="12">
             <v-snackbar v-model="snackbarVisible" :timeout="6000" color="success" top>
                   {{ snackbarMessage }}
      </v-snackbar>
            <h3>Requests</h3>
            <v-table class="data-table">
              <thead>
                <tr>
                  <th class="text-left">Request ID</th>
                  <th class="text-left">User</th>
                  <th class="text-left">Status</th>
                  <th class="text-left">Timestamp</th>
                  <th class="text-left">Notebook name</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="request in requests"
                  :key="request.id"
                  @click="showRequestDetails(request)"
                >
                  <td>{{ request.id }}</td>
                  <td>{{ request.user }}</td>
                  <td>{{ request.status }}</td>
                  <td>{{ request.timestamp }}</td>
                  <td>{{ request.notebookName }}</td>
                </tr>
              </tbody>
            </v-table>
            <!-- Add Pagination -->
            <v-pagination
              v-model="pagination.page"
              :length="Math.ceil(requests.length / pagination.rowsPerPage)"
            ></v-pagination>
          </v-col>
        </v-row>
        <v-row class="mt-5">
          <v-col cols="12">
            <h3>Notebook authorized users</h3>
            <v-table class="data-table">
              <thead>
                <tr>
                  <th class="text-left">Notebook</th>
                  <th class="text-left">User</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(notebook, index) in notebooks" :key="index">
                  <td>{{ notebook.name }}</td>
                  <td>{{ notebook.users.join(", ") }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-col>
        </v-row>
        <v-dialog v-model="dialog" max-width="800px">
          <v-card>
            <v-card-title> Request Details </v-card-title>
            <v-card-text>
              <p>
                <strong>Notebook Name:</strong>
                {{ selectedRequest.notebookName }}
              </p>
              <p><strong>User ID:</strong> {{ selectedRequest.userId }}</p>
              <p><strong>Username:</strong> {{ selectedRequest.username }}</p>
              <p><strong>User Type:</strong> {{ selectedRequest.userType }}</p>
              <p>
                <strong>Affiliation:</strong> {{ selectedRequest.affiliation }}
              </p>
            </v-card-text>
            <v-card-actions class="action-buttons">
              <v-btn color="green" text @click="approveRequest(selectedRequest)"
                >Approve</v-btn
              >
              <v-btn color="red" text @click="rejectRequest(selectedRequest)"
                >Reject</v-btn
              >
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="dialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </div>
  </div>
</template>

<script>
import SidebarVue from "../components/SidebarVue.vue";
import axios from "axios";
import Cookies from "js-cookie";
export default {
  components: {
    SidebarVue,
  },
  data() {
    return {
      sidebarCollapsed: true,
      dialog: false,
      selectedRequest: null,
      snackbarVisible: false,
      snackbarMessage: "",
      pagination: {
        page: 1,
        rowsPerPage: 5,
      },
      headers: [
        { text: "Request ID", value: "id" },
        { text: "User", value: "user" },
        { text: "Status", value: "status" },
        { text: "Timestamp", value: "timestamp" },
      ],
      requests: [],
      notebooks: [
      ],
    };
  },
  computed: {
    paginatedRequests() {
      const start = (this.pagination.page - 1) * this.pagination.rowsPerPage;
      const end = start + this.pagination.rowsPerPage;
      return this.requests.slice(start, end);
    },
  },
  created() {
    this.fetchRequests();
    this.fetchApprovedUsers();
  },
  methods: {
    navigateToLanding() {
      // Add navigation logic here
    },
    logout() {
      Cookies.remove("token");
      this.$router.push({ path: "/login" });
    },
    showRequestDetails(request) {
      this.selectedRequest = request;
      this.dialog = true;
    },
    async approveRequest(request) {
      try {
        const response = await axios.post(
          `http://localhost:3000/access/${request.id}/manage-access/${request.userId}/approve`
        );
        if (response.status === 200) {
          this.dialog = false;
           request.status = "approved";
          this.fetchRequests();
          this.snackbarMessage = "Access successfully granted";
          this.snackbarVisible = true;
          this.fetchApprovedUsers();
        }
      } catch (error) {
        console.error("Error approving request:", error);
      }
    },
    async rejectRequest(request) {
      try {
        const response = await axios.post(
          `http://localhost:3000/access/${request.id}/manage-access/${request.userId}/reject`
        );
        if (response.status === 200) {
          this.dialog = false;
          this.fetchRequests();
            localStorage.removeItem(`requestedAccess_${request.userId}`);
             this.snackbarMessage = "Access successfully denied";
          this.snackbarVisible = true;
        }
      } catch (error) {
        console.error("Error rejecting request:", error);
      }
    },

    async fetchRequests() {
      try {
        const response = await axios.get(
          "http://localhost:3000/access/requests"
        );
        this.requests = response.data
          .map((notebook) => {
            return notebook.requests.map((request) => {
              return {
                id: notebook.notebookId,
                user: request.username,
                status: request.status,
                timestamp: request.timestamp,
                notebookName: notebook.notebookName,
                userId: request.userId,
                username: request.username,
                userType: request.userType,
                affiliation: request.affiliation,
              };
            });
          })
          .flat();
        console.log("Fetched and formatted requests", this.requests);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    },
  async fetchApprovedUsers() {
  try {
    const response = await axios.get(
      "http://localhost:3000/access/approved-users"
    );
    this.notebooks = response.data.map((notebook) => {
      // Extract the ACL accessList
      const accessList = notebook.Record.ACL.accessList;

      // Filter the list to only include approved users
      const approvedUsers = accessList.filter(user => user.status === "approved");

      // Return an object containing the notebook name and the usernames of the approved users
      return {
        name: notebook.Record.name,
        users: approvedUsers.map(user => user.username),
      };
    });
    console.log("Fetched and formatted approved users", this.notebooks);
  } catch (error) {
    console.error("Error fetching approved users:", error);
  }
},
  },
  name: "RequestView",
};
</script>

<style scoped>
.container {
  display: flex;
  height: 100%;
}

.content {
  flex: 1;
  background-color: white;
  overflow-y: auto;
}

.content-header {
  background-color: #f27727;
  color: white;
  padding: 8px;
  border-radius: 4px 4px 0 0;
}

.content-header span {
  cursor: pointer;
  transition: color 0.3s ease-in-out, text-decoration 0.3s ease-in-out;
}

.content-header span:hover {
  color: #27a2f2;
  text-decoration: none;
  font-weight: bold;
}
.content h2.content-header {
  padding: 100px;
}

.sidebar.collapsed .content h2.content-header {
  text-indent: 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
}

.data-table {
  border-collapse: collapse;
  width: 100%;
}

.data-table thead th {
  background-color: #f2f2f2;
  padding: 8px;
  text-align: left;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
}

.data-table tbody tr {
  border-bottom: 1px solid #ddd;
}

.data-table tbody tr:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}

.data-table tbody td {
  padding: 8px;
}
</style>
