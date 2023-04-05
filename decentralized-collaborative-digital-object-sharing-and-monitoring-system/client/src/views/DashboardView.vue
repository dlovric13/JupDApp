<template>
  <div class="container p-4">
    <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
       <div class="header d-flex align-items-center">
  <div class="back-arrow-container" style="order: -1; padding: 8px 0px;">
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
      <i :class="sidebarCollapsed ? 'mdi mdi-menu icon' : 'mdi mdi-close icon'"></i>
    </h2>
  </div>
</div>
      <ul class="sidebar-options list-unstyled mt-4">
        <li 
          class="sidebar-option py-2"
          v-for="option in options"
          :key="option.id"
        >
          <i @click=logout class="mdi mdi-account-outline mr-2"></i> {{ option.label }}
        </li>
      </ul>
    </div>
    <div
      class="content"
      :style="{ marginLeft: sidebarCollapsed ? '0' : '200px' }"
    >
     <h2 class="content-header text-white font-weight-bold py-2">
  <span @click="navigateToLanding">Data Table</span>
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
        <tr v-for="row in paginatedRows" :key="row.id" @click="showPopUp(row)">
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
        <button class="close-button" @click="showDetails = false">
          &times;
        </button>
        <div v-html="selectedRowDetails"></div>
      </div>
    </div>
  </div>
</template>



<style>

.icon {
    margin:0;
    padding:0;
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
  /* background-color: #f5f5f5; */
  /* font-size: 1.2rem; */
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
  /* other styles */
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

.pop-up-window {
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
}

.content h2.content-header {
  padding: 200px; /* same as .sidebar width */
}

.sidebar.collapsed .content h2.content-header {
  text-indent: 0; /* reset text indent when sidebar is collapsed */
}

/* .back-arrow {
    position: absolute;
    top: 0;
    left: 0;
} */

.back-arrow-container {
    position: relative;
    margin-right: 10px;
}

.back-arrow {
    /* padding: 10px; */
    /* background-color: #f27727; */
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
import axios from 'axios';
export default {
  data() {
    return {
      sidebarCollapsed: true,
      showDetails: false,
      selectedRow: null,
      options: [
        { id: 1, label: "Option 1" },
        { id: 2, label: "Option 2" },
        { id: 3, label: "Log out"},
      ],
      searchTerm: "",
      headers: [
        { id: 1, label: "Name" },
        { id: 2, label: "Email" },
        { id: 3, label: "Phone" },
      ],
      rows: [
        {
          id: 1,
          cells: [
            { id: 1, value: "John Smith" },
            { id: 2, value: "john@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 2,
          cells: [
            { id: 1, value: "Jane Smith" },
            { id: 2, value: "jane@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 3,
          cells: [
            { id: 1, value: "Bob Smith" },
            { id: 2, value: "bob@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 4,
          cells: [
            { id: 1, value: "Alice Smith" },
            { id: 2, value: "alice@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 5,
          cells: [
            { id: 1, value: "Eve Smith" },
            { id: 2, value: "eve@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 6,
          cells: [
            { id: 1, value: "Mallory Smith" },
            { id: 2, value: "mallory@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 7,
          cells: [
            { id: 1, value: "Oscar Smith" },
            { id: 2, value: "oscar@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 8,
          cells: [
            { id: 1, value: "Ralph Smith" },
            { id: 2, value: "ralph@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 9,
          cells: [
            { id: 1, value: "Tom Smith" },
            { id: 2, value: "tom@example.com" },
            { id: 3, value: "123" },
          ],
        },
        {
          id: 10,
          cells: [
            { id: 1, value: "Jerry Smith" },
            { id: 2, value: "jerry@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 11,
          cells: [
            { id: 1, value: "Mark Smith" },
            { id: 2, value: "mark@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 12,
          cells: [
            { id: 1, value: "Philip Smith" },
            { id: 2, value: "philip@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 13,
          cells: [
            { id: 1, value: "Beth Smith" },
            { id: 2, value: "beth@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 14,
          cells: [
            { id: 1, value: "Sue Smith" },
            { id: 2, value: "sue@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 15,
          cells: [
            { id: 1, value: "Liz Smith" },
            { id: 2, value: "liz@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 16,
          cells: [
            { id: 1, value: "Sam Smith" },
            { id: 2, value: "sam@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 17,
          cells: [
            { id: 1, value: "Wanda Smith" },
            { id: 2, value: "wanda@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 18,
          cells: [
            { id: 1, value: "Alex Smith" },
            { id: 2, value: "alex@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 19,
          cells: [
            { id: 1, value: "Katie Smith" },
            { id: 2, value: "katie@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 20,
          cells: [
            { id: 1, value: "Mike Smith" },
            { id: 2, value: "mike@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 21,
          cells: [
            { id: 1, value: "Nancy Smith" },
            { id: 2, value: "nancy@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 22,
          cells: [
            { id: 1, value: "Toby Smith" },
            { id: 2, value: "toby@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 23,
          cells: [
            { id: 1, value: "Zoe Smith" },
            { id: 2, value: "zoe@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 24,
          cells: [
            { id: 1, value: "Violet Smith" },
            { id: 2, value: "violet@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
        {
          id: 25,
          cells: [
            { id: 1, value: "Ben Smith" },
            { id: 2, value: "ben@example.com" },
            { id: 3, value: "123-456-7890" },
          ],
        },
      ],
      currentPage: 1,
      rowsPerPage: 10,
    };
  },
   created() {
    this.getNotebookData();
  },
  computed: {
    filteredRows() {
      return this.rows.filter((row) => {
        return row.cells[0].value
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());
      });
    },
    paginatedRows() {
      let startIndex = (this.currentPage - 1) * this.rowsPerPage;
      return this.filteredRows.slice(startIndex, startIndex + this.rowsPerPage);
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
      return `<h3>${this.selectedRow.cells[0].value}</h3><p>${this.selectedRow.cells[1].value}</p>`;
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
     getNotebookData() {
    axios.get('http://localhost:3000/notebook')
      .then(response => {
        // Handle the response data here
        console.log(response.data);
      })
      .catch(error => {
        // Handle errors here
        console.error(error);
      });
  }
  },
};
</script>


