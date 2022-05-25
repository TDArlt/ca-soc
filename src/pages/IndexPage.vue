<template>
  <q-page class="flex flex-center row">
    <template v-if="!loading">
      <template v-for="table in informationTables" :key="table.title">
      <InformationTable
        class="col-6"
        :title="table.title"
        :columns="table.columns"
        :data="table.dataset"
      />
      </template>
    </template>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import { date } from 'quasar';
import InformationTable from 'components/InformationTable.vue'
import { useListsStore } from "stores/listsstore";

export default defineComponent({
  name: 'IndexPage',

  
  data() {
    return {
      loading: true,

      informationTables: [
        {
          title: "Recent CVEs",
          columns: [
            { name: "cveid", label: "CVE Number", field: "id", align: "left", sortable: true },
            { name: "score", label: "Severity", field: "impactScore", align: "left", sortable: true, format: (val, row) => (row.impactScore + " [" + row.impactSeverity + "]") },
            { name: "description", label: "Description", field: "description", align: "left", sortable: false },
            { name: "modifiedOn", label: "Modified", field: "modifiedOn", align: "left", sortable: true, format: (val, row) => date.formatDate(val, "YYYY/MM/DD"), },
            { name: "publishedOn", label: "Published", field: "publishedOn", align: "left", sortable: true, format: (val, row) => date.formatDate(val, "YYYY/MM/DD"), },
            { name: "reference", label: "Reference", field: "reference", align: "left", sortable: false },
            { name: "affected", label: "Affected", field: "affectedAsString", align: "left", sortable: true },
            
          ],
          dataset: [],
        },
        
        {
          title: "Updated CVEs",
          columns: [
            { name: "cveid", label: "CVE Number", field: "id", align: "left", sortable: true },
            { name: "score", label: "Severity", field: "impactScore", align: "left", sortable: true, format: (val, row) => (row.impactScore + " [" + row.impactSeverity + "]") },
            { name: "description", label: "Description", field: "description", align: "left", sortable: false },
            { name: "modifiedOn", label: "Modified", field: "modifiedOn", align: "left", sortable: true, format: (val, row) => date.formatDate(val, "YYYY/MM/DD"), },
            { name: "publishedOn", label: "Published", field: "publishedOn", align: "left", sortable: true, format: (val, row) => date.formatDate(val, "YYYY/MM/DD"), },
            { name: "reference", label: "Reference", field: "reference", align: "left", sortable: false },
            { name: "affected", label: "Affected", field: "affectedAsString", align: "left", sortable: true },
            
          ],
          dataset: [],
        }
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


  },

  components: {
    InformationTable
  },

  mounted() {
    this.loadTables();
  },

  methods: {
    async loadTables()
    {
      this.loading = true;
      await this.$updateCaches();

      this.informationTables[0].dataset = this.recentCVEs;
      this.informationTables[1].dataset = this.updatedCVEs;

      this.loading = false;
    },
  },


})
</script>
