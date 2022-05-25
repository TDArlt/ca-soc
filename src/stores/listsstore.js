import { defineStore } from 'pinia';
import { date, LocalStorage } from 'quasar'

export const useListsStore = defineStore(
  'listsStore',
  {
    state: () => ({

      acknowledgedCVEIDs: (LocalStorage.getItem('acknowledgedCVEs') || []),

      lastCacheUpdate: (LocalStorage.getItem('lastCacheUpdate') || null),


      
      // https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-recent.json.gz
      recentCVEs: (LocalStorage.getItem('recentCVEs') || []),

      // https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-modified.json.gz
      modifiedCVEs: (LocalStorage.getItem('modifiedCVEs') || []),

      // https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json
      knownExploitedVulns: (LocalStorage.getItem('knownExploitedVulns') || []),

    }),
    
    getters: {

      needsRefresh()
      {
        return (this.lastCacheUpdate == null ||
            date.getDateDiff(new Date(), this.lastCacheUpdate, "minutes") > 30 ||
            this.recentCVEs.length == 0 || this.modifiedCVEs.length == 0 || this.knownExploitedVulns.length == 0)
      },

    },

    actions: {

      cacheUpdated()
      {
        const copyOfData = new Date();
  
        LocalStorage.set('lastCacheUpdate', copyOfData);
        this.lastCacheUpdate = copyOfData;
      },


      setRecentCVEs(newList)
      {
        let storeFormat = this.formatNISTToInternal(newList);
  
        try { LocalStorage.set('recentCVEs', storeFormat); } catch (error) { console.log("Could not store recent CVEs locally (not enough memory)"); }
        this.recentCVEs = storeFormat;
      },

      setModifiedCVEs(newList)
      {
        let storeFormat = this.formatNISTToInternal(newList);
  
        try { LocalStorage.set('modifiedCVEs', storeFormat); } catch (error) { console.log("Could not store modified CVEs locally (not enough memory)"); }
        this.modifiedCVEs = storeFormat;
      },

      setKnownExploitedVulns(newList)
      {
        const copyOfData = newList;
  
        try { LocalStorage.set('knownExploitedVulns', copyOfData); } catch (error)  { console.log("Could not store known exploited vulnerabilities locally (not enough memory)"); }
        this.knownExploitedVulns = copyOfData;
      },







      formatNISTToInternal(nistList)
      {

        let storeFormat = [];
        for (let index = 0; index < nistList.CVE_Items.length; index++)
        {
          let element = {
            id: nistList.CVE_Items[index].cve.CVE_data_meta.ID,
            description: "(no description provided)",
            reference: "",
            impactScore: 0,
            impactSeverity: "UNKNOWN",
            publishedOn: new Date(nistList.CVE_Items[index].publishedDate),
            modifiedOn: new Date(nistList.CVE_Items[index].lastModifiedDate),
            affected: [],
          };

          for (let descIndex = 0; descIndex < nistList.CVE_Items[index].cve.description.description_data.length; descIndex++)
          {
            if (nistList.CVE_Items[index].cve.description.description_data[descIndex].lang == "en")
            {
              element.description = nistList.CVE_Items[index].cve.description.description_data[descIndex].value;
            }
          }

          if (nistList.CVE_Items[index].cve.references.reference_data.length > 0)
          {
            for (let rIndex = 0; rIndex < nistList.CVE_Items[index].cve.references.reference_data.length; rIndex++)
            {
              element.reference = nistList.CVE_Items[index].cve.references.reference_data[rIndex].url + "\n";
            }
          }

          if (nistList.CVE_Items[index].impact.baseMetricV3 != undefined)
          {
            element.impactScore = nistList.CVE_Items[index].impact.baseMetricV3.cvssV3.baseScore;
            element.impactSeverity = nistList.CVE_Items[index].impact.baseMetricV3.cvssV3.baseSeverity;
          }

          if (nistList.CVE_Items[index].configurations.nodes.length > 0)
          {
            for (let cNIndex = 0; cNIndex < nistList.CVE_Items[index].configurations.nodes.length; cNIndex++)
            {
              const sub = this.collectCVESubNodes(nistList.CVE_Items[index].configurations.nodes[cNIndex]);
  
              for (let sIndex = 0; sIndex < sub.length; sIndex++)
              {
                element.affected.push(sub[sIndex]);
              }
            }
          }

          

          storeFormat.push(element);
        }


        return storeFormat;
      },

      collectCVESubNodes(root)
      {
        let output = [];

        if (root.children.length > 0)
        {
          for (let index = 0; index < root.children.length; index++)
          {
            const sub = this.collectCVESubNodes(root.children[index]);

            for (let sIndex = 0; sIndex < sub.length; sIndex++)
            {
              output.push(sub[sIndex]);
            }
          }
        }



        if (root.cpe_match != undefined)
        {
          for (let index = 0; index < root.cpe_match.length; index++)
          {
            const cpeProp = root.cpe_match[index].cpe23Uri.split(':');

            output.push( {
              cpe32Uri: root.cpe_match[index].cpe32Uri,
              vendor: cpeProp[3],
              product: cpeProp[4],
              version: cpeProp[5],
            });
          }
        }


        return output;
      }

    },
  }
);
