<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section class="bg-primary text-white row">
        <div class="text-h6 col-11 col-xs-10 col-sm-10 col-md-11">
          <q-icon name="crisis_alert" />
          Vulnerability Dashboard
        </div>
        <q-btn class="col-1 col-xs-2 col-sm-2 col-md-1" n-caps color="white" outline icon="refresh" label="Reload" @click="loadTables(true)" />
      </q-card-section>
      <q-card-section class="q-pa-xs row">

        <template v-if="!loading">
          <template v-for="(table, index) in informationTables" :key="table.title">
            <InformationTable
              :ref="'table' + index"
              :class="table.class"
              :title="table.title"
              :columns="table.columns"
              :data="table.dataset"
              :rowKey="table.rowKey"
              :defaultLines="table.lines"
              :defaultSort="table.sort"
              :sortDescending="table.sortDescending"
              :selectable="table.selectable"
              :actions="table.actions"
              :icon="table.icon"
              :acknowledeable="table.acknowledeable"
            />
          </template>
        </template>
        <template v-else>
          <div class="text-center full-width">
            <q-spinner
              color="primary"
              size="6em"
            />
          </div>
        </template>

      </q-card-section>

      <q-card-section class="text-caption text-grey">
        <q-icon name="info" />
        The acknowledment is stored locally on your device, but preserved in the browser data (so it behaves like a cookie).
        <q-btn color="grey" no-caps flat label="Click to clear all acknowledgments" class="text-caption" size="sm" dense @click="clearAcks()" />
        <br />
        This product uses the NVD API but is not endorsed or certified by the NVD.
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import { date, useQuasar } from 'quasar';
import InformationTable from 'components/InformationTable.vue'
import { useListsStore } from "stores/listsstore";

export default defineComponent({
  name: 'IndexPage',

  
  data() {
    return {
      loading: true,

      informationTables: [
        {
          title: "Known exploited vulnerabilites",
          columns: [
            { name: "cveid", label: "CVE Number", field: "id", align: "left", sortable: true },
            { name: "score", label: "Severity", field: "impactScore", align: "left", sortable: true, format: (val, row) => (row.impactScore + " [" + row.impactSeverity + "]") },
            { name: "description", label: "Description", field: "description", align: "left", sortable: false },
            { name: "affected", label: "Affected", field: "affectedAsString", align: "left", sortable: true },
            { name: "reference", label: "Reference", field: "reference", align: "left", sortable: false },
            { name: "publishedOn", label: "Published", field: "publishedOn", align: "left", sortable: true, format: (val, row) => date.formatDate(val, "YYYY/MM/DD"), },
            
          ],
          dataset: [],
          lines: 10,
          sort: 'publishedOn',
          sortDescending: true,
          rowKey: "id",
          icon: "warning",
          class: "col-12 col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-4",
          acknowledeable: true,
          
          selectable: true,
          actions: [
            { icon: 'task_alt', label: "Acknowledge selected vulnearbilites", method: this.acknowledge, },
          ]
        },
        
        {
          title: "Updated CVEs",
          columns: [
            { name: "cveid", label: "CVE Number", field: "id", align: "left", sortable: true },
            { name: "score", label: "Severity", field: "impactScore", align: "left", sortable: true, format: (val, row) => (row.impactScore + " [" + row.impactSeverity + "]") },
            { name: "description", label: "Description", field: "description", align: "left", sortable: false },
            { name: "reference", label: "Reference", field: "reference", align: "left", sortable: false },
            { name: "affected", label: "Affected", field: "affectedAsString", align: "left", sortable: true },
            { name: "modifiedOn", label: "Modified", field: "modifiedOn", align: "left", sortable: true, format: (val, row) => date.formatDate(val, "YYYY/MM/DD"), },
            { name: "publishedOn", label: "Published", field: "publishedOn", align: "left", sortable: true, format: (val, row) => date.formatDate(val, "YYYY/MM/DD"), },
            
          ],
          dataset: [],
          lines: 5,
          sort: 'modifiedOn',
          sortDescending: true,
          rowKey: "id",
          icon: "sync_problem",
          class: "col-12 col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-4",
          acknowledeable: true,
          
          selectable: true,
          actions: [
            { icon: 'task_alt', label: "Acknowledge selected vulnearbilites", method: this.acknowledge, },
          ]
        },
        
        {
          title: "Recent CVEs",
          columns: [
            { name: "cveid", label: "CVE Number", field: "id", align: "left", sortable: true },
            { name: "score", label: "Severity", field: "impactScore", align: "left", sortable: true, format: (val, row) => (row.impactScore + " [" + row.impactSeverity + "]") },
            { name: "description", label: "Description", field: "description", align: "left", sortable: false },
            { name: "reference", label: "Reference", field: "reference", align: "left", sortable: false },
            { name: "affected", label: "Affected", field: "affectedAsString", align: "left", sortable: true },
            { name: "modifiedOn", label: "Modified", field: "modifiedOn", align: "left", sortable: true, format: (val, row) => date.formatDate(val, "YYYY/MM/DD"), },
            { name: "publishedOn", label: "Published", field: "publishedOn", align: "left", sortable: true, format: (val, row) => date.formatDate(val, "YYYY/MM/DD"), },
            
          ],
          dataset: [],
          lines: 5,
          sort: 'modifiedOn',
          sortDescending: true,
          rowKey: "id",
          icon: "running_with_errors",
          class: "col-12 col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-4",
          acknowledeable: true,
          
          selectable: true,
          actions: [
            { icon: 'task_alt', label: "Acknowledge selected vulnearbilites", method: this.acknowledge, },
          ]
        },
      ]
    }
  },

  computed: {
    recentCVEs()
    {
      const lStore = useListsStore();
      return lStore.recentCVEs;
    },

    updatedCVEs()
    {
      const lStore = useListsStore();
      return lStore.modifiedCVEs;
    },

    knownExploitedVulns()
    {
      const lStore = useListsStore();
      return lStore.knownExploitedVulns;
    },


  },

  components: {
    InformationTable
  },

  mounted() {
    this.loadTables(false);
  },

  methods: {
    async loadTables(force = false)
    {
      this.loading = true;
      await this.$updateCaches(force);

      this.informationTables[0].dataset = this.knownExploitedVulns;
      this.informationTables[1].dataset = this.updatedCVEs;
      this.informationTables[2].dataset = this.recentCVEs;
      

      this.loading = false;
    },



    acknowledge(cveEntry)
    {
      const lStore = useListsStore();

      for (let index = 0; index < cveEntry.length; index++)
      {
        lStore.addAcknowledgedCVE({
          id: cveEntry[index].id,
          modifiedOn: cveEntry[index].modifiedOn,
          publishedOn: cveEntry[index].publishedOn,
        });
      }

      
      for (let index = 0; index < this.informationTables.length; index++)
      {
        this.$refs['table' + index][0].unsetSelection();
      }
    },

    

    clearAcks()
    {
      const lStore = useListsStore();
      lStore.clearAcknowledged();
    },

  },


})
</script>
