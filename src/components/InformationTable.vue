<template>
  <div class="q-pa-sm">
    <q-card>
      <q-card-section class="bg-secondary text-white row">
        <div class="text-h6 col-6">{{title}}</div>
          
        <q-input
          class="q-pr-md col-6" dark
          label-color="white"
          dense v-model="tableFilter"
          type="text" label="Search"
          clearable
          >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card-section>
      <q-card-section>
        <q-table
          dense
          :rows="data"
          :columns="columns"
          :pagination="pagination"
          :filter="tableFilter"
          :filter-method="filterTable"
          row-key="name"
          binary-state-sort
        >
        
        <template v-slot:body-cell="props">
          <template v-if="props.col.name == 'description'">
            <q-td :props="props" style="white-space: unset;">
              <q-expansion-item
                dense
                style="width: 300px;"
                label="Description"
                :caption="shortenText(props.value, 45)"
              >
                <q-card>
                  <q-card-section style="white-space: unset; max-width: 280px;">
                    {{props.value}}
                  </q-card-section>
                  <q-card-section v-if="props.row.requiredAction != undefined">
                    <strong>Required action:</strong><br />
                    {{props.row.requiredAction}}
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-td>
          </template>

          <template v-else-if="props.col.name == 'cveid'">
            <q-td :props="props" style="white-space: unset; max-width: 400px;">
                <q-icon
                  name="open_in_new" size="xxs"
                  @click="openWindow('https://nvd.nist.gov/vuln/detail/' + props.value)"
                  style="cursor: pointer;"
                  >
                  <q-tooltip>
                    https://nvd.nist.gov/vuln/detail/{{props.value}}
                  </q-tooltip>
                </q-icon>
                {{props.value}}
            </q-td>
          </template>


          <template v-else-if="props.col.name == 'affected'">
            <q-td :props="props" style="white-space: unset; max-width: 400px;">
              <template v-if="props.row.affected.length > 1">
                
                <q-expansion-item
                  dense
                  style="width: 300px;"
                  :label="'Show ' + props.row.affected.length + ' affected products'"
                >
                  <q-card>
                    <q-card-section style="white-space: unset; max-width: 280px;">
                      <ul>
                        <template v-for="aff in props.row.affected" :key="props.row.id + aff.cpe32Uri">
                          <li>
                            {{aff.vendor}}: {{aff.product}} {{aff.version}}
                          </li>
                        </template>
                      </ul>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </template>
              <template v-else-if="props.row.affected.length == 0">
                (unknown)
              </template>
              <template v-else>
                {{props.row.affected[0].vendor}}: {{props.row.affected[0].product}} {{props.row.affected[0].version}}
              </template>

            </q-td>
          </template>
          <template v-else-if="props.col.name == 'reference'">
            <q-td :props="props" style="white-space: unset; max-width: 400px;">
              <template v-for="url in props.value.split('\n')" :key="props.row.id + url">
                <q-icon
                  v-if="url.trim() != ''"
                  name="open_in_new"
                  @click="openWindow(url)"
                  style="cursor: pointer;"
                  >
                  <q-tooltip>
                    {{url}}
                  </q-tooltip>
                </q-icon>
              </template>
            </q-td>
          </template>
          <template v-else-if="props.col.name == 'score'">
            <q-td :props="props" style="white-space: unset; max-width: 400px;">
              <template v-if="props.row.impactSeverity == 'UNKNOWN'">
                <q-chip size="sm">
                  (unknown)
                </q-chip>
              </template>
              <template v-else-if="props.row.impactSeverity == 'LOW'">
                <q-chip color="indigo" text-color="white" size="sm">
                  <q-avatar color="indigo-10" text-color="white">{{props.row.impactScore}}</q-avatar>
                  LOW
                </q-chip>
              </template>
              <template v-else-if="props.row.impactSeverity == 'MEDIUM'">
                <q-chip color="yellow" text-color="black" size="sm">
                  <q-avatar color="yellow-10" text-color="white">{{props.row.impactScore}}</q-avatar>
                  MEDIUM
                </q-chip>
              </template>
              <template v-else-if="props.row.impactSeverity == 'HIGH'">
                <q-chip color="orange" text-color="white" size="sm">
                  <q-avatar color="orange-10" text-color="white">{{props.row.impactScore}}</q-avatar>
                  HIGH
                </q-chip>
              </template>
              <template v-else-if="props.row.impactSeverity == 'CRITICAL'">
                <q-chip color="red" text-color="white" size="sm">
                  <q-avatar color="red-10" text-color="white">{{props.row.impactScore}}</q-avatar>
                  CRITICAL
                </q-chip>
              </template>
              <template v-else>
                <q-chip color="grey" text-color="white" size="sm">
                  <q-avatar color="grey-10" text-color="white">{{props.row.impactScore}}</q-avatar>
                  LOW
                </q-chip>
              </template>
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
  </div>
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
    defaultLines: {
      default: 20,
    },
  },

  data() {
    return {
      pagination: {
        rowsPerPage: this.defaultLines
      },

      tableFilter: '',
    }
  },



  methods: {
    

    filterTable (rows, terms, cols = this.computedCols, cellValue = this.getCellValue)
    {
      if (this.unassigned || terms.trim() == '')
      {
        return rows;
      }

      const lowerTerms = terms ? terms.toLowerCase() : '';
      const lookFor = lowerTerms.trim().split(' ');

      return rows.filter(
        row => {

          let haystack = "";

          for (let cIndex = 0; cIndex < cols.length; cIndex++)
          {
            const val = cellValue(cols[cIndex], row) + '';
            if (val !== 'undefined' && val !== 'null')
            {
              haystack += " " + val.toLowerCase();
            }
          }

          for (let index = 0; index < lookFor.length; index++)
          {
            if (lookFor[index].trim() != '' && haystack.indexOf(lookFor[index].trim()) === -1)
            {
              return false;
            }
          }

          return true;
        }
      );
    },



    
    shortenText(text, maxCharacters)
    {
      if (text.length > maxCharacters)
      {
        let splitted = text.split(" ");
        let output = "";

        for (let index = 0; index < splitted.length; index++)
        {
          if (index > 0)
          {
            if ((output.length + splitted[index].length + 4) < maxCharacters)
            {
              output += " " + splitted[index];
            } else
            {
              output += "...";
              return output;
            }
          } else
          {
            output = splitted[index];
            if ((output.length + 3) > maxCharacters)
            {
              output = output.substr(0, maxCharacters - 3) + "...";
              return output;
            }
          }
        }

        return output;
      } else
      {
        return text;
      }

    },

    
    openWindow(url)
    {
      window.open(url);
    },


  },
})
</script>
