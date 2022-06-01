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
          <template v-for="table in informationTables" :key="table.title">
            <InformationTable
              :class="table.class"
              :title="table.title"
              :columns="table.columns"
              :data="table.dataset"
              :defaultLines="table.lines"
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
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import { Notify, date, useQuasar } from 'quasar';
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
            { name: "description", label: "Description", field: "description", align: "left", sortable: false },
            { name: "affected", label: "Affected", field: "affectedAsString", align: "left", sortable: true },
            { name: "publishedOn", label: "Published", field: "publishedOn", align: "left", sortable: true, format: (val, row) => date.formatDate(val, "YYYY/MM/DD"), },
            
          ],
          dataset: [],
          lines: 10,
          class: "col-12 col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-4",
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
          class: "col-12 col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-4",
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
          class: "col-12 col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-4",
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
  },


})
</script>