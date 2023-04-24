<template>
  <div class="container p-4">
    <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="header d-flex align-items-center">
        <div class="back-arrow-container" style="order: -1; padding: 8px 0px">
          <a href="#" @click.prevent="goBack" class="back-arrow">
            <i class="mdi mdi-arrow-left icon"></i>
          </a>
        </div>
        <!-- <h2  @click="navigateToLanding" class="header-title text-white font-weight-bold mr-auto" style="padding: 8px 0px">Data Table</h2> -->
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
          v-for="option in options"
          :key="option.id"
          @click="option.label === 'Log out' ? logout() : null"
        >
          <i class="mdi mdi-account-outline mr-2"></i>
          {{ option.label }}
        </li>
      </ul>
    </div>
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
      <div class="search-container mt-4 mb-4 d-flex align-items-center">
        <i class="mdi mdi-magnify mr-2"></i>
        <input
          type="text"
          class="form-control"
          v-model="searchTerm"
          placeholder="Search for a name..."
        />
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
          <th class="data-table-header font-weight-bold">Download</th>
          <th class="data-table-header font-weight-bold">Edit</th>
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
          <td>
            <a href="#" @click.prevent="downloadRow(row)"
              ><i class="mdi mdi-download"></i
            ></a>
          </td>
          <td>
            <a href="#" @click.prevent="editRow(row)"
              ><i class="mdi mdi-pencil"></i
            ></a>
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
          @click="requestAccess"
          :disabled="requestedAccess[selectedRow.id]"
        >
          Request Access
        </v-btn>
      </div>
    </div>
  </div>
</template>



<style>
.icon {
  margin: 0;
  padding: 0;
}

.container {
  display: flex;
  height: 100%;
}

.sidebar {
  width: 200px;
  background-color: #27a2f2;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
}

.mdi-magnify {
  padding-left: 10px;
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

.menu-icon,
.close-icon {
  cursor: pointer;
  font-size: 18px;
  margin: 8px;
  position: absolute;
  top: 0;
  left: 0;
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
  border-color: #27a2f2;
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
}

.pagination li {
  list-style: none;
  margin: 0 8px;
}

.pagination a {
  appearance: none;
  background: transparent;
  border: 0;
  color: #27a2f2;
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
  background-color: #27a2f2;
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
  background-color: #27a2f2;
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

<script>
import axios from "axios";
import jwt_decode from "jsonwebtoken/decode";
import Cookies from "js-cookie";
const socket = new WebSocket("ws://localhost:3000/ws");
export default {
  data() {
    return {
      sidebarCollapsed: true,
      showDetails: false,
      selectedRow: null,
      latestTimestamp: null,
      snackbarVisible: false,
      requestedAccess: {},
      options: [
        { id: 1, label: "Shared projects" },
        { id: 2, label: "Requests" },
        { id: 3, label: "Log out" },
      ],
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
    const savedRequestedAccess = localStorage.getItem("requestedAccess");
    if (savedRequestedAccess) {
      this.requestedAccess = JSON.parse(savedRequestedAccess);
    }
    this.getNotebookData();
    socket.addEventListener("message", () => {
      this.getNotebookData();
    });

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
    // downloadRow(row) {
    //   // Add code to handle the download of the specified row here
    // },
    // editRow(row) {
    //   // Add code to handle the edit of the specified row here
    // },

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
        const decoded = jwt_decode(token);
        const userId = decoded.username;
        const notebookId = this.selectedRow.id;

        this.requestedAccess[this.selectedRow.id] = true;

        localStorage.setItem(
          "requestedAccess",
          JSON.stringify(this.requestedAccess)
        );

        try {
          const response = await axios.post(
            `http://localhost:3000/notebook/request-access`,
            {
              userId,
              notebookId,
            }
          );
          if (response.status === 201) {
            this.snackbarVisible = true;
            this.requestedAccess[this.selectedRow.id] = true;
          } else {
            // Handle other status codes or show an error message
          }
        } catch (error) {
          // Handle request errors, e.g., network issues or server errors
          console.error("Error requesting access:", error);
        }
      } else {
        // Handle the case when there's no token available
        console.error("No token found");
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