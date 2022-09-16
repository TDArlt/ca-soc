<template>
  <div class="q-pa-sm">
    <q-card>
      <q-card-section class="bg-secondary text-primary">
        <q-item dense>
          <q-item-section avatar v-if="icon != ''">
            <q-icon color="primary" size="md" :name="icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-h6">{{title}}</q-item-label>
          </q-item-section>

          <q-item-section>
            <q-item-label>
              <q-input
                class="q-pr-md col-6"
                label-color="primary"
                dense v-model="tableFilterStr"
                type="text" label="Search"
                clearable
                >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </q-item-label>
          </q-item-section>

          <q-item-section v-if="acknowledeable" side>
            <q-btn
              color="primary" outline no-caps
              :label="showAcknowledged ? 'Hide acknowledged' : 'Show acknowleged'"
              @click="showAcknowledged = !showAcknowledged"
              />
          </q-item-section>

          <q-item-section side v-if="actions.length > 0">
            <q-item-label>
              <q-btn-dropdown
                color="primary" flat dense no-caps
                :label="actionbtnLbl" :disable="selectedRows.length == 0"
                >
                      
                  <q-list separator  style="min-width: 100px">
                    <template v-for="action in actions" :key="action.label">
                      <q-item clickable @click="action.method(selectedRows)" v-close-popup>
                        <q-item-section avatar>
                          <q-icon :name="action.icon" />
                        </q-item-section>
                        <q-item-section>
                          {{action.label}}
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-list>
              </q-btn-dropdown>
            </q-item-label>

          </q-item-section>
        </q-item>
          
      </q-card-section>

      <q-card-section>
        <q-table
          dense flat
          :rows="data"
          :columns="columns"
          :pagination="pagination"
          :filter="tableFilter"
          :filter-method="filterTable"
          :row-key="rowKey"
          binary-state-sort

          :selection="selectable ? 'multiple' : undefined"
          v-model:selected="selectedRows"
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

          <template v-else-if="props.col.name == 'subject'">
            <q-td :props="props" style="cursor: pointer;">
              {{props.value}}
              <q-tooltip>
                <q-item>
                    <q-item-section>
                      <q-item-label class="text-overline">
                        {{props.row.subject}}
                      </q-item-label>
                      <q-item-label class="text-caption">
                        {{props.row.extrainfo}}
                      </q-item-label>
                      
                    </q-item-section>

                  </q-item>
              </q-tooltip>
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
                  header-style="padding-left: 0px;"
                  :label="'Show ' + props.row.affected.length + ' affected products'"
                >
                  <q-card>
                    <q-card-section style="white-space: unset; max-width: 280px;">
                      <ul>
                        <template v-for="aff in props.row.affected" :key="props.row.id + aff.cpe32Uri">
                          <li>
                            <template v-if="aff.vendor != ''">
                              {{aff.vendor}}:
                            </template>
                             {{aff.product}} {{aff.version}}
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
                <template v-if="props.row.affected[0].vendor != ''">
                  {{props.row.affected[0].vendor}}:
                </template>
                {{props.row.affected[0].product}} {{props.row.affected[0].version}}
              </template>

            </q-td>
          </template>
          <template v-else-if="props.col.name == 'reference'">
            <q-td :props="props" style="white-space: unset; max-width: 400px;">
              <template v-if="props.value != undefined">
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
              </template>
            </q-td>
          </template>
          <template v-else-if="props.col.name == 'linkedCVEs'">
            <q-td :props="props" style="white-space: unset; max-width: 400px;">
              <template v-if="props.row.linkedCVEs.length > 1">
                
                <q-expansion-item
                  dense
                  style="width: 300px;"
                  header-style="padding-left: 0px;"
                  :label="'Show ' + props.row.linkedCVEs.length + ' linked CVEs'"
                >
                  <q-card>
                    <q-card-section style="white-space: unset; max-width: 280px;">
                      <ul>
                        <template v-for="aff in props.row.linkedCVEs" :key="props.row.id + aff">
                          <li>
                            <q-icon
                              name="open_in_new" size="xxs"
                              @click="openWindow('https://nvd.nist.gov/vuln/detail/' + aff)"
                              style="cursor: pointer;"
                              >
                              <q-tooltip>
                                https://nvd.nist.gov/vuln/detail/{{aff}}
                              </q-tooltip>
                            </q-icon>
                            {{aff}}
                          </li>
                        </template>
                      </ul>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </template>
              <template v-else-if="props.row.linkedCVEs.length == 0">
                -
              </template>
              <template v-else>
                <q-icon
                  name="open_in_new" size="xxs"
                  @click="openWindow('https://nvd.nist.gov/vuln/detail/' + props.row.linkedCVEs[0])"
                  style="cursor: pointer;"
                  >
                  <q-tooltip>
                    https://nvd.nist.gov/vuln/detail/{{props.row.linkedCVEs[0]}}
                  </q-tooltip>
                </q-icon>
                {{props.row.linkedCVEs[0]}}
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
              <template v-else-if="props.row.impactSeverity == 'LOW'|| props.row.impactSeverity == 'niedrig'">
                <q-chip color="indigo" text-color="white" size="sm">
                  <q-avatar color="indigo-10" text-color="white">{{props.row.impactScore}}</q-avatar>
                  LOW
                </q-chip>
              </template>
              <template v-else-if="props.row.impactSeverity == 'MEDIUM' || props.row.impactSeverity == 'mittel'">
                <q-chip color="yellow" text-color="black" size="sm">
                  <q-avatar color="yellow-10" text-color="white">{{props.row.impactScore}}</q-avatar>
                  MEDIUM
                </q-chip>
              </template>
              <template v-else-if="props.row.impactSeverity == 'HIGH' || props.row.impactSeverity == 'hoch'">
                <q-chip color="orange" text-color="white" size="sm">
                  <q-avatar color="orange-10" text-color="white">{{props.row.impactScore}}</q-avatar>
                  HIGH
                </q-chip>
              </template>
              <template v-else-if="props.row.impactSeverity == 'CRITICAL' || props.row.impactSeverity == 'kritisch'">
                <q-chip color="red" text-color="white" size="sm">
                  <q-avatar color="red-10" text-color="white">{{props.row.impactScore}}</q-avatar>
                  CRITICAL
                </q-chip>
              </template>
              <template v-else>
                <q-chip color="grey" text-color="white" size="sm">
                  (Loading...)
                </q-chip>
              </template>
            </q-td>
          </template>
          <template v-else-if="props.col.name == 'severity'">
            <q-td :props="props" style="white-space: unset; max-width: 400px;">
              <template v-if="props.value == 'low'">
                <q-chip color="indigo" text-color="white" size="sm">
                  LOW
                </q-chip>
              </template>
              <template v-else-if="props.value == 'medium'">
                <q-chip color="yellow" text-color="black" size="sm">
                  MEDIUM
                </q-chip>
              </template>
              <template v-else-if="props.value == 'high'">
                <q-chip color="orange" text-color="white" size="sm">
                  HIGH
                </q-chip>
              </template>
              <template v-else-if="props.value == 'critical'">
                <q-chip color="red" text-color="white" size="sm">
                  CRITICAL
                </q-chip>
              </template>
              <template v-else>
                <q-chip color="grey" text-color="white" size="sm">
                  {{props.value}}
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
      <q-card-section class="text-right" v-if="link != ''">
        <q-icon
          name="open_in_new" size="xxs"
          @click="openWindow(link)"
          style="cursor: pointer;"
          >
          <q-tooltip>
            Show in new window
          </q-tooltip>
        </q-icon>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useListsStore } from "stores/listsstore";

export default defineComponent({
  name: 'InformationTable',
  props: {
    title: {
      type: String,
      default: "A table",
    },
    icon: {
      type: String,
      default: "",
    },

    data: {
      type: Array,
      default: [],
    },
    columns: {
      type: Array,
      default: [],
    },
    rowKey: {
      type: String,
      required: true,
    },
    defaultLines: {
      default: 20,
    },
    defaultSort: {
    },
    sortDescending: {
      default: true,
    },

    acknowledeable: {
      default: false,
    },

    link: {
      default: '',
    },

    selectable: {
      default: false,
    },

    actions: {
      default: [],
    },
  },

  data() {
    return {
      pagination: {
        rowsPerPage: this.defaultLines,
        sortBy: this.defaultSort,
        descending: this.sortDescending,
      },

      tableFilterStr: '',

      selectedRows: [],

      showAcknowledged: false,
    }
  },


  computed: {

    actionbtnLbl()
    {
      if (this.selectedRows.length == 0)
      {
        return "No record selected";
      } else if (this.selectedRows.length == 1)
      {
        return "Perform action";
      } else
      {
        return "Perform action on " + this.selectedRows.length + " records"
      }
    },


    tableFilter()
    {
      if (this.tableFilterStr == '')
      {
        return ' ';
      }

      return this.tableFilterStr;
    },

  },



  methods: {


    unsetSelection()
    {
      this.selectedRows = [];
    },
    

    filterTable (rows, terms, cols = this.computedCols, cellValue = this.getCellValue)
    {
      if ((this.unassigned || terms.trim() == '') && (!this.acknowledeable || this.showAcknowledged))
      {
        return rows;
      }

      const unfiltered = (this.unassigned || terms.trim() == '');
      if (unfiltered)
      {
        terms = '';
      }

      const lowerTerms = terms ? terms.toLowerCase() : '';
      const lookFor = lowerTerms.trim().split(' ');
      const lStore = useListsStore();

      return rows.filter(
        row => {

          if (this.acknowledeable && !this.showAcknowledged)
          {
            if (lStore.cveIsAcknowledged(row.id, row.publishedOn, row.modifiedOn))
            {
              return false;
            }
          }

          if (!unfiltered)
          {
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
