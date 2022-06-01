<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section class="bg-primary text-white row">
        <div class="text-h6 col-11 col-xs-10 col-sm-10 col-md-11">
          <q-icon name="fact_check" />
          Events & Incidents from FortiSOC
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
          title: "Events",
          columns: [
            { name: "id", label: "ID", field: "id", align: "left", sortable: true },

            { name: "description", label: "Description", field: "description", align: "left", sortable: false },
            { name: "date", label: "Date", field: "publishedOn", align: "left", sortable: true, format: (val, row) => date.formatDate(val, "YYYY/MM/DD"), },
          ],
          dataset: [],
          lines: 10,
          class: "col-6 col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-6",
        },
        
        {
          title: "Incidents",
          columns: [
            { name: "id", label: "ID", field: "id", align: "left", sortable: true },

            { name: "description", label: "Description", field: "description", align: "left", sortable: false },
            { name: "date", label: "Date", field: "publishedOn", align: "left", sortable: true, format: (val, row) => date.formatDate(val, "YYYY/MM/DD"), },
          ],
          dataset: [],
          lines: 5,
          class: "col-6 col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-6",
        },
        
      ]
    }
  },

  computed: {
    


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
      
      //TODO

      this.loading = false;
    },
  },


})
</script>
