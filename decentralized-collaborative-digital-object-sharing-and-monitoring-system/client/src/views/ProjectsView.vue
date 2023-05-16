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
        <span @click="navigateToLanding">Projects dashboard</span>
      </h2>
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <v-table class="data-table">
              <thead>
                <tr>
                  <th class="text-left">ID</th>
                  <th class="text-left">Notebook Name</th>
                  <th class="text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="notebook in sharedNotebooks"
                  :key="notebook.id"
                  @click="handleNotebookSelection(notebook.id)"
                >
                  <td>{{ notebook.id }}</td>
                  <td>{{ notebook.notebookName }}</td>
                  <td>{{ notebook.status }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-col>
        </v-row>
        <v-col cols="12" class="mt-10">
          <div class="timeline-container">
            <h3 class="container-title">
              Transaction history {{ selectedNotebook?.id }}
            </h3>
            <v-timeline
              align="start"
              direction="vertical"
              class="custom-timeline"
            >
              <v-timeline-item
                v-for="(item, i) in notebookHistory"
                :key="i"
                dot-color="#1a77d2"
                fill-dot
                size="small"
                :icon="item.icon"
                class="custom-timeline-item expanded-content"
              >
                <v-card>
                  <v-card-title class="text-h6" >
                    {{ convertTimestamp(item.Timestamp) }}
                    <v-btn text icon @click="item.expanded = !item.expanded">
                      <v-icon>{{
                        item.expanded ? "mdi-chevron-up" : "mdi-chevron-down"
                      }}</v-icon>
                    </v-btn>
                  </v-card-title>
                  <v-card-text
                    v-show="item.expanded"
                    class="bg-white text--primary"
                  >
                    <p>Transaction ID: {{ item.TxId }}</p>
                    <div>
                      <div class="json-content">
                        <p>Value:</p>
                        <pre>{{ prettifyJSON(item.Value) }}</pre>
                      </div>

                      <h3>Notebook Content:</h3>
                       <div v-html="notebookContent"></div>
                    </div>
                    <p>Deleted: {{ item.IsDelete }}</p>
                    <v-btn color="blue-grey" variant="outlined"> Button </v-btn>
                  </v-card-text>
                </v-card>
              </v-timeline-item>
            </v-timeline>
          </div>
        </v-col>
      </v-container>
    </div>
  </div>
</template>
<script>
import SidebarVue from "../components/SidebarVue.vue";
import axios from "axios";
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";
export default {
  components: {
    SidebarVue,
  },
  data() {
    return {
      sidebarCollapsed: true,
      sharedNotebooks: [],
      selectedNotebook: null,
      userId: null,
      notebookContent: "Notebook content goes here",
      notebookHistory: [],
    };
  },
  computed: {},
  created() {
    const token = Cookies.get("token");
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded && decoded.userID) {
        this.userId = decoded.userID;
      }
    }
    this.fetchSharedNotebooks();
  },
  methods: {
    navigateToLanding() {
      // Add navigation logic here
    },
    logout() {
      Cookies.remove("token");
      this.$router.push({ path: "/login" });
    },
    async fetchSharedNotebooks() {
      try {
        const response = await axios.get("http://localhost:3000/notebook");

        const notebooks = response.data;

        notebooks.forEach((notebook) => {
          if (
            notebook.Record &&
            notebook.Record.ACL &&
            notebook.Record.ACL.accessList
          ) {
            const userRequest = notebook.Record.ACL.accessList.find(
              (access) => access.userId === this.userId
            );
            console.log("User requests", userRequest);
            if (notebook.Record.ACL.owner === this.userId) {
              this.sharedNotebooks.push({
                id: notebook.Key,
                notebookName: notebook.Record.name,
                status: "owner",
              });
            } else if (userRequest && userRequest.status === "approved") {
              this.sharedNotebooks.push({
                id: notebook.Key,
                notebookName: notebook.Record.name,
                status: userRequest.status,
              });
            }
            console.log("shared notebooks", this.sharedNotebooks);
          }
        });
      } catch (error) {
        console.error("Error fetching shared notebooks:", error);
      }
    },
    async fetchNotebookHistory(notebookId) {
      try {
        console.log("Notebook id", notebookId);
        const response = await axios.get(
          `http://localhost:3000/notebook/${notebookId}/history`
        );
        this.notebookHistory = response.data
          .map((item) => ({
            ...item,
            expanded: false,
          }))
          .sort((a, b) => a.Timestamp.seconds - b.Timestamp.seconds);
          const notebookContent = this.notebookHistory[this.notebookHistory.length - 1].Value;
           const notebookFormattedContent = notebookContent.content; // Extracting the content field
          console.log("Notebook content to be sent to the flask server:", notebookFormattedContent);
        const htmlResponse = await axios.post('http://127.0.0.1:8000/convert', notebookFormattedContent);
        this.notebookContent = htmlResponse.data.html;
        console.log("Server Response:", response.data);
        console.log("Notebook content from flask server", htmlResponse);
      } catch (error) {
        console.error("Error fetching notebook history:", error);
      }
    },
    handleNotebookSelection(notebookId) {
      this.selectedNotebook = this.sharedNotebooks.find(
        (notebook) => notebook.id === notebookId
      );
      this.fetchNotebookHistory(notebookId);
    },
    convertTimestamp(timestamp) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    },

    prettifyJSON(jsonData) {
      return JSON.stringify(jsonData, null, 2);
    },

    prettifyNotebookContent(notebookContent) {
      let prettyContent = "";
      notebookContent.cells.forEach((cell) => {
        prettyContent += "Cell Type: " + cell.cell_type + "\n";
        prettyContent += "Source Code: \n" + cell.source + "\n";
        if (cell.execution_count) {
          prettyContent += "Execution Count: " + cell.execution_count + "\n";
        }
        if (cell.outputs && cell.outputs.length > 0) {
          prettyContent += "Outputs: \n";
          cell.outputs.forEach((output) => {
            prettyContent += output.name + ": " + output.text + "\n";
          });
        }
        prettyContent += "\n----------------------------------------\n";
      });
      return prettyContent;
    },
  },
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

.data-table thead th {
  background-color: #f2f2f2;
  padding: 10px;
  border: 1px solid #ddd;
}

.data-table tbody td {
  padding: 10px;
  border: 1px solid #ddd;
}

.data-table tbody tr:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}

.custom-timeline .v-timeline-item__dot {
  width: 12px;
  height: 12px;
}

.custom-timeline-item {
  padding: 15px 0;
  /* background: #1a78d2; */
}

.expanded-content {
  max-height: 250px;
  overflow-y: auto;
}

.timeline-container {
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  padding: 20px;
  max-width: 100%;
  overflow-x: auto;
}

.container-title {
  margin-bottom: 10px;
  font-weight: 600;
}

.json-content {
  max-height: 200px;  
  overflow-y: auto;
}


.v-card-title {
  background-color: #1a77d2; /* this will change the v-card-title background color */
  color: white; /* this will change the v-card-title text color */
}

.v-card {
  color: white; /* this will change the v-card text color */
}

</style>
