<template>
  <q-card class="my-card">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">{{title}}</div>
    </q-card-section>
    <q-card-section>
      <q-table
        dense
        :rows="data"
        :columns="columns"
        :pagination="pagination"
        row-key="name"
        binary-state-sort
      >
      
      <template v-slot:body-cell="props">
        <template v-if="props.col.name == 'description'">
          <q-td :props="props" style="white-space: unset; max-width: 400px;">
            {{props.value}}
          </q-td>
        </template>
        <template v-else-if="props.col.name == 'affected'">
          <q-td :props="props" style="white-space: unset; max-width: 400px;">
            <ul>
              <template v-for="aff in props.row.affected" :key="aff.cpe32Uri">
                <li>
                  {{aff.vendor}}: {{aff.product}} {{aff.version}}
                </li>
              </template>
            </ul>
          </q-td>
        </template>
        <template v-else>
          <q-td :props="props">
            {{props.value}}
          </q-td>
        </template>
      </template>

      </q-table>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'InformationTable',
  props: {
    title: {
      type: String,
      default: "A table",
    },

    data: {
      type: Array,
      default: [],
    },
    columns: {
      type: Array,
      default: [],
    },
  },

  data() {
    return {
      pagination: {
        rowsPerPage: 20
      }
    }
  }
})
</script>
