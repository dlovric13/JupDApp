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
      <v-snackbar v-model="snackbarVisible" :timeout="6000" color="success" top>
        Access request sent successfully
      </v-snackbar>
      <h2 class="content-header text-white font-weight-bold py-2">
        <span @click="navigateToLanding">Jupyter Notebook Repository</span>
      </h2>
      <div class="search-welcome-container mt-4 mb-4 d-flex align-items-center">
        <div class="search-container mt-4 mb-4 d-flex align-items-center">
          <i class="mdi mdi-magnify mr-2"></i>
          <input
            type="text"
            class="form-control"
            v-model="searchTerm"
            placeholder="Search for a name..."
          />
        </div>
        <v-card class="welcome-card ml-auto d-flex align-items-center">
          <v-icon class="user-icon white--text mr-2">mdi-account</v-icon>
          <v-card-title class="welcome-card-title"
            >Welcome, {{ username }}</v-card-title
          >
        </v-card>
      </div>

      <table class="data-table table mt-4">
        <tr>
          <th
            class="data-table-header font-weight-bold"
            v-for="header in headers"
            :key="header.id"
          >
            {{ header.label }}
          </th>
        </tr>
        <tr
          v-for="row in paginatedRows"
          :key="row.id"
          :class="{ highlight: row.highlight }"
          @click="showPopUp(row)"
          v-bind:ref="`row_${row.id}`"
        >
          <td v-for="cell in row.cells" :key="cell.id">
            {{ cell.value }}
          </td>
        </tr>
      </table>
      <nav aria-label="Data table pagination" class="mt-4">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: !canGoBack }">
            <a
              class="page-link"
              href="#"
              aria-label="Previous"
              @click.prevent="goBack"
            >
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
          <li
            class="page-item"
            v-for="page in pages"
            :key="page.number"
            :class="{ active: page.isCurrent }"
          >
            <a
              class="page-link"
              href="#"
              @click.prevent="setCurrentPage(page.number)"
              >{{ page.number }}</a
            >
          </li>
          <li class="page-item" :class="{ disabled: !canGoForward }">
            <a
              class="page-link"
              href="#"
              aria-label="Next"
              @click.prevent="goForward"
            >
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
        <v-alert
          v-for="notification in notifications"
          :key="notification.id"
          :type="
            notification.status === 'approved'
              ? 'success'
              : notification.status === 'removed'
              ? 'error'
              : 'warning'
          "
          closable
          dense
        >
          Your request for notebook "{{ notification.notebookName }}" has been
          {{
            notification.status === "removed" ? "removed" : notification.status
          }}.
        </v-alert>
      </nav>
    </div>
    <div v-if="showDetails" class="pop-up-overlay">
      <div class="pop-up-window">
        <v-btn class="close-button" @click="showDetails = false">
          &times;
        </v-btn>
        <div class="popup-content">
          <div v-html="selectedRowDetails"></div>
        </div>
        <v-btn
          class="request-access-button"
          @click="handleButtonClick"
          :disabled="isRequestPending"
        >
          {{ getButtonLabel }}
        </v-btn>
      </div>
    </div>
  </div>
</template>




<script>
import axios from "axios";
import jwtDecode from "jwt-decode";
import Cookies from "js-cookie";
const socket = new WebSocket("ws://localhost:3000/ws");
import SidebarVue from "../components/SidebarVue.vue";
export default {
  components: {
    SidebarVue,
  },
  data() {
    return {
      sidebarCollapsed: true,
      showDetails: false,
      selectedRow: null,
      latestTimestamp: null,
      snackbarVisible: false,
      userId: null,
      username: null,
      requestedAccess: {},
      notifications: [],
      searchTerm: "",
      headers: [
        { id: 1, label: "Name" },
        { id: 2, label: "Last modified" },
        { id: 3, label: "Created" },
      ],
      rows: [],
      currentPage: 1,
      rowsPerPage: 10,
    };
  },

  created() {
    const token = Cookies.get("token");
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded && decoded.userID) {
        this.userId = decoded.userID;
        this.username = decoded.username;
        const savedRequestedAccess = localStorage.getItem(
          `requestedAccess_${this.userId}`
        );
        if (savedRequestedAccess) {
          this.requestedAccess = JSON.parse(savedRequestedAccess);
        }
      } else {
        console.error("Error decoding token, userId not found:", decoded);
      }
    } else {
      console.error("No token found");
    }
    this.getNotebookData();
    socket.addEventListener("message", () => {
      this.getNotebookData();
    });
    this.fetchUserRequests();
    console.log("On created", this.newRowKey);
  },
  computed: {
    filteredRows() {
      return this.rows.filter((row) => {
        return (
          row.cells[0].value &&
          row.cells[0].value
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
        );
      });
    },
    paginatedRows() {
      let startIndex = (this.currentPage - 1) * this.rowsPerPage;
      let slicedRows = this.filteredRows.slice(
        startIndex,
        startIndex + this.rowsPerPage
      );
      return slicedRows.map((row) => {
        return {
          ...row,
          highlight:
            Date.parse(row.cells[1].timestamp) === this.latestTimestamp,
        };
      });
    },
    pageCount() {
      return Math.ceil(this.filteredRows.length / this.rowsPerPage);
    },
    canGoBack() {
      return this.currentPage > 1;
    },
    canGoForward() {
      return this.currentPage < this.pageCount;
    },
    pages() {
      let pages = [];
      for (let i = 1; i <= this.pageCount; i++) {
        pages.push({ number: i, isCurrent: i === this.currentPage });
      }
      return pages;
    },
    selectedRowDetails() {
      // Return the details of the selected row in HTML format
      return `
        <h3>${this.selectedRow.cells[0].value}</h3>
        <p>Last modified: ${this.selectedRow.cells[1].value}</p>
        <p>Type: ${this.selectedRow.type}</p>
        <p>Size: ${this.selectedRow.size}</p>
        <p>Path: ${this.selectedRow.path}</p>
        <p>Format: ${this.selectedRow.format}</p>
      `;
    },

    isRequestPending() {
      if (this.selectedRow && this.selectedRow.ACL) {
        const accessObj = this.selectedRow.ACL.accessList.find(
          (access) => access.userId === this.userId
        );
        return (
          accessObj &&
          accessObj.status !== "approved" &&
          this.requestedAccess[this.selectedRow.id]
        );
      }
      return false;
    },

    getButtonLabel() {
      if (this.selectedRow) {
        if (this.selectedRow.owner === this.userId) {
          return "View notebook details";
        } else if (this.selectedRow.ACL) {
          const accessObj = this.selectedRow.ACL.accessList.find(
            (access) => access.userId === this.userId
          );
          if (accessObj && accessObj.status === "approved") {
            return "View notebook details";
          } else if (this.isRequestPending) {
            return "Access requested";
          }
        }
      }
      return "Request Access";
    },
  },
  methods: {
    goBack() {
      if (this.canGoBack) {
        this.currentPage--;
      }
      window.history.back();
    },
    goForward() {
      if (this.canGoForward) {
        this.currentPage++;
      }
    },
    setCurrentPage(page) {
      this.currentPage = page;
    },
    showPopUp(row) {
      this.selectedRow = row;
      this.showDetails = true;
    },
    navigateToLanding() {
      this.$router.push({ path: "/" });
    },

    logout() {
      Cookies.remove("token");
      Cookies.remove("username");
      Cookies.remove("userType");
      this.$router.push({ path: "/login" });
    },
    async requestAccess() {
      const token = Cookies.get("token");
      if (token) {
        const decoded = jwtDecode(token);
        const username = decoded.username;
        const notebookId = this.selectedRow.id;

        this.requestedAccess[this.selectedRow.id] = true;

        localStorage.setItem(
          `requestedAccess_${this.userId}`,
          JSON.stringify(this.requestedAccess)
        );

        try {
          const response = await axios.post(
            `http://localhost:3000/access/request-access`,
            {
              username,
              notebookId,
            }
          );
          if (response.status === 201) {
            this.snackbarVisible = true;
            this.selectedRow.ACL.accessList.push({
              userId: this.userId,
              status: "pending",
            });
          } else {
            // Handle other status codes or show an error message
          }
        } catch (error) {
          console.error("Error requesting access:", error);
        }
      } else {
        console.error("No token found");
      }
    },

    async fetchUserRequests() {
      try {
        const response = await axios.get("http://localhost:3000/notebook");

        // Extract the notebooks
        const notebooks = response.data;

        // Loop over all notebooks
        notebooks.forEach((notebook) => {
          // Check if the notebook has an ACL
          if (
            notebook.Record &&
            notebook.Record.ACL &&
            notebook.Record.ACL.accessList
          ) {
            // Find the user's request in the ACL
            const userRequest = notebook.Record.ACL.accessList.find(
              (access) => access.userId === this.userId
            );

            // If a request is found, create a notification
            if (userRequest && userRequest.status !== "pending") {
              this.notifications.push({
                id: notebook.Key,
                notebookName: notebook.Record.name,
                status: userRequest.status,
              });
            }
          }
        });
      } catch (error) {
        console.error("Error fetching user requests:", error);
      }
    },

    handleButtonClick() {
      if (this.getButtonLabel === "Request Access") {
        this.requestAccess();
      } else if (this.getButtonLabel === "View notebook details") {
        this.$router.push({ path: "/projects" });
      }
    },

    getNotebookData() {
      axios
        .get("http://localhost:3000/notebook")
        .then((response) => {
          console.log("Raw response data:", response.data);

          const lastModifiedTimestamps = response.data.map((notebook) =>
            Date.parse(notebook.Record.last_modified)
          );
          console.log("Last modified timestamps:", lastModifiedTimestamps);

          if (response.data.length > 0) {
            this.latestTimestamp = Math.max(...lastModifiedTimestamps);
            console.log("Latest timestamp:", this.latestTimestamp);
          }

          this.rows = response.data.map((notebook) => {
            return {
              id: notebook.Key,
              name: notebook.Record.name,
              type: notebook.Record.type,
              size: notebook.Record.size,
              path: notebook.Record.path,
              format: notebook.Record.format,
              owner: notebook.Record.owner,
              ACL: notebook.Record.ACL,
              cells: [
                { id: 1, value: notebook.Record.name },
                {
                  id: 2,
                  value: new Date(
                    notebook.Record.last_modified
                  ).toLocaleString(),
                  timestamp: notebook.Record.last_modified,
                },
                {
                  id: 3,
                  value: new Date(notebook.Record.created).toLocaleString(),
                },
              ],
            };
          });

          console.log(response.data);
        })
        .catch((error) => {
          // Handle errors here
          console.error(error);
        });
    },
  },
};
</script>

<style>
.icon {
  margin: 0;
  padding: 0;
}

.container {
  display: flex;
  height: 100%;
}

.mdi-magnify {
  padding-left: 10px;
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
  color: #1a77d2;
  text-decoration: none;
  font-weight: bold;
}

.search-container {
  display: flex;
  align-items: center;
  border: 1px solid #f27727;
  border-radius: 4px;
  width: 20%;
  margin-left: 2%;
}

.search-container input {
  appearance: none;
  background: transparent;
  border: 0;
  color: #333;
  font-size: 14px;
  font-weight: 400;
  padding: 8px 16px;
  width: 100%;
  box-sizing: border-box;
}

.search-container input:focus {
  border-color: #1a77d2;
}

.data-table {
  border-collapse: collapse;
  width: 100%;
}

.data-table-header {
  border: 1px solid #ddd;
  padding: 8px;
}

.data-table td,
.data-table th {
  border: 1px solid #ddd;
  padding: 8px;
}

.data-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

.data-table tr:hover {
  background-color: #ddd;
}

.data-table .pagination {
  display: inline-block;
  margin: 0 auto;
}

.data-table .highlight {
  background-color: #ffffaa;
  animation: remove-background 2s ease 2s forwards;
}

@keyframes remove-background {
  from {
    background-color: #ffffaa;
  }
  to {
    background-color: transparent;
  }
}

.pagination {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  margin-bottom: 5%;
}

.pagination li {
  list-style: none;
  margin: 0 8px;
}

.pagination a {
  appearance: none;
  background: transparent;
  border: 0;
  color: #1a77d2;
  font-size: 14px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  outline: none;
}

.pagination a:hover,
.pagination a:focus {
  background-color: #eee;
}

.pagination .active a {
  background-color: #1a77d2;
  color: white;
}

.pagination .disabled a {
  color: #ccc;
  cursor: not-allowed;
}

.pop-up-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pop-up-window {
  position: relative;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 80%;
  max-width: 600px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  padding: 20px;
}

.pop-up-window .close-button {
  appearance: none;
  background: transparent;
  border: 0;
  color: #999;
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
  outline: none;
  position: absolute;
  top: 10px;
  right: 10px;
}

.pop-up-window .request-access-button {
  background-color: #1a77d2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: bold;
  margin-left: auto;
  margin-right: auto;
  display: block;
  width: fit-content;
}

.pop-up-window .request-access-button:hover {
  background-color: #1e8fce;
}

.content h2.content-header {
  padding: 100px;
}

.sidebar.collapsed .content h2.content-header {
  text-indent: 0;
}

.welcome-card {
  background-color: #44547d;
  color: white;
  border-radius: 8px;
  padding: 8px 16px;
  margin-right: 2%;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.welcome-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
}

.user-icon {
  font-size: 24px;
}

.search-welcome-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.welcome-card-title {
  font-weight: bold;
  font-size: 20px;
}
</style>
