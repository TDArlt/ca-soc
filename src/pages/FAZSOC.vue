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

      <q-card-section class="row">
        <div class="text-caption col-10">
          Connected to {{this.$fazStore.getUrl}}
        </div>
        <q-btn
          class="col-2"
          color="grey" outline no-caps label="Reset Connection" @click="resetConnection()"
          />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import { useQuasar, date } from 'quasar';
import InformationTable from 'components/InformationTable.vue'
import { useFAZStore } from "stores/fazstore";

export default defineComponent({
  name: 'IndexPage',

  setup () {
    const $q = useQuasar();

  },

  
  data() {
    return {
      loading: true,

      informationTables: [
        {
          title: "Events",
          columns: [
            { name: "severity", label: "Severity", field: "severity", align: "center", sortable: true },
            { name: "subject", label: "Subject", field: "subject", align: "left", sortable: true },
            { name: "alerttime", label: "Alert Time", field: "alerttime", align: "left", sortable: true, format: (val, row) => date.formatDate(new Date(val*1000), "YYYY/MM/DD"), },
            
            { name: "epip", label: "Endpoint", field: "epip", align: "left", sortable: true, format: (val, row) => row.epip + ' ' + row.epname, }, 
            { name: "groupby1", label: "Connected to (1)", field: "groupby1", align: "left", sortable: true },
            { name: "groupby2", label: "Connected to (2)", field: "groupby2", align: "left", sortable: true },

          ],
          dataset: [],
          lines: 10,
          class: "col-6 col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-6",
        },
        
        {
          title: "Incidents",
          columns: [
            { name: "incid", label: "ID", field: "incid", align: "center", sortable: true },
            { name: "severity", label: "Severity", field: "severity", align: "center", sortable: true },
            { name: "category", label: "Category", field: "category", align: "left", sortable: false },
            { name: "incidentDescription", label: "Description", field: "description", align: "left", sortable: false },
            { name: "createtime", label: "Created", field: "createtime", align: "left", sortable: true, format: (val, row) => date.formatDate(new Date(val*1000), "YYYY/MM/DD"), },
            
            { name: "endpoint", label: "Endpoint", field: "endpoint", align: "left", sortable: true, }, 
          ],
          dataset: [],
          lines: 5,
          class: "col-6 col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-6",
        },
        
      ],


      fazSessionKey: '',
      fazLastConnect: null,

      eventList: [],
      incidentList: [],
    }
  },

  computed: {
    
    fazNeedsReconnect()
    {
      return (this.fazSessionKey == "" || date.getDateDiff(new Date(), this.fazLastConnect, "minutes") > 5);
    },

    $fazStore()
    {
      return useFAZStore();
    }


  },

  components: {
    InformationTable
  },

  mounted() {
    this.loadTables(false);
  },

  methods: {


    resetConnection()
    {
      this.$fazStore.storeUser('');
      this.$fazStore.storeURL('');
      this.fazSessionKey = '';
      fazLastConnect = null;

      this.loadTables();
    },


    async connectToFAZ(triggerReloadAfterwards = false)
    {
      if (this.fazNeedsReconnect)
      {
        if (this.$fazStore.getUrl == "")
        {
          this.$q.dialog({
            title: 'FortiAnalyzer URL',
            message: 'Please enter the base URL of the FortiAnalyzer that should be queried (like: https://sample-url.com)',
            prompt: {
              model: '',
              type: 'text',
              isValid: val => val.indexOf("https://") !== -1,
            },
            cancel: true,
            persistent: true
          }).onOk(data => {
            
            this.$fazStore.storeURL(data);

            if (triggerReloadAfterwards)
            {
              this.loadTables();
            }
          });
        } else if (this.$fazStore.getUser == "")
        {
          this.$q.dialog({
            title: 'FortiAnalyzer API User',
            message: 'Please enter the username of the API user that should connect to the JSON-API',
            prompt: {
              model: '',
              type: 'text',
            },
            cancel: true,
            persistent: true
          }).onOk(data => {
            
            this.$fazStore.storeUser(data);

            if (triggerReloadAfterwards)
            {
              this.loadTables();
            }
          });
        } else
        {
          this.$q.dialog({
            title: 'FortiAnalyzer API Password',
            message: 'Please enter the password for the API user ' + this.$fazStore.getUser + ' on ' + this.$fazStore.getUrl,
            prompt: {
              model: '',
              type: 'password',
            },
            cancel: true,
            persistent: true
          }).onOk(data => {

            this.recreateSession(data, triggerReloadAfterwards);
          });
        }

      }
      
    },


    async recreateSession(pwd, triggerReloadAfterwards = false)
    {
      try {
        const session = await this.$httpPulledPost(this.$fazStore.getUrl + '/jsonrpc', {
          "method": "exec",
          "params": [
            {
              "data": {
                "passwd": pwd,
                "user": this.$fazStore.getUser,
              },
              "url": "/sys/login/user",
            }
          ],
          "session": "1",
          "id": "1"
        });

        if (session.result[0].status.code == 0)
        {
          // success
          this.fazSessionKey = session.session;
          this.fazLastConnect = new Date();
          
          this.$q.notify(({
                message: 'Connected to ' + this.$fazStore.getUrl,
                color: 'positive',
                icon: 'cloud_sync'
            }));



          if (triggerReloadAfterwards)
          {
            this.loadTables();
          }
          
        } else
        {
          this.$q.notify(({
                message: 'Connection to ' + this.$fazStore.getUrl + ' as ' + ' ' + this.$fazStore.getUser + ' failed!',
                color: 'negative',
                icon: 'sync_problem'
            }));
        }

        
      } catch (error) {
        this.$q.notify(({
                message: 'Connection to ' + this.$fazStore.getUrl + ' as ' + ' ' + this.$fazStore.getUser + ' failed!',
                color: 'negative',
                icon: 'sync_problem'
            }));
      }

    },




    async loadTables(force = false)
    {
      this.loading = true;
      if (this.fazNeedsReconnect)
      {
        this.connectToFAZ(true);
        return;
      }

      this.eventList = (await this.$httpPulledPost(this.$fazStore.getUrl + '/jsonrpc', {
        "id": 1,
        "jsonrpc": "2.0",
        "method": "get",
        "params": [
          {
            "apiver": 3,
            "filter": "ackflag != yes",
            "time-range": {
              "end": date.addToDate(new Date(), {hours: 12}),
              "start": date.subtractFromDate(new Date(), {months: 3})
            },
            "url": "/eventmgmt/adom/root/alerts",
          }
        ],
        "session": this.fazSessionKey,
      })).result.data;

      this.incidentList = (await this.$httpPulledPost(this.$fazStore.getUrl + '/jsonrpc', {
        "id": 1,
        "jsonrpc": "2.0",
        "method": "get",
        "params": [
          {
            "apiver": 3,
            "filter": "status != closed",
            "url": "/incidentmgmt/adom/root/incidents"
          }
        ],
        "session": this.fazSessionKey,
      })).result.data;

      this.fazLastConnect = new Date();

      this.informationTables[0].dataset = this.eventList;
      this.informationTables[1].dataset = this.incidentList;


      this.loading = false;
      
      
    },




  },


})
</script>
