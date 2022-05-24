<template>
  <q-page class="flex flex-center">
    <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    >
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import Http from 'axios';

export default defineComponent({
  name: 'IndexPage',

  mounted() {
    this.syncInformation();
  },

  methods: {

    async syncInformation()
    {
      // Note: As all of these websites seem to use combinations of CORS-restrictions,
      // we will need to build a simple php middleware for pulling the requests without browser
      // interaction


      //https://www.cve-search.org/api/
      let cveList = await Http.get("https://cve.circl.lu/api/last");

      console.log(cveList);

      let knownExploitedCVECat = await Http.get("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json");

      console.log(knownExploitedCVECat);
    },

  },


})
</script>
