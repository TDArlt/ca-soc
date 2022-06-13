import { Notify, date, Dialog } from 'quasar';
import config from '../config';
import Http from 'axios';
import { useListsStore } from "stores/listsstore";


export default ({ app, router, store, Vue }) => {

    // Add your global functions here

    /**
     * Perform a http get request using the pull-engine (avoiding cors-problems)
     * @param {string} url the URL for this request
     * @param {boolean} gzipped set to true, if you expect a gzipped response
     * @returns the data of the http request
     */
    app.config.globalProperties.$httpPulledGet = async function(url, gzipped = false)
    {
        url = url.replace("https://", "");
        let zip = '';
        if (gzipped)
        {
            zip = "&gzip=1"
        }
        return (await Http.get(config.pullPath + "?url=" + encodeURI(url) + zip)).data;
    };
    

    /**
     * Perform a http post request using the pull-engine (avoiding cors-problems)
     * @param {string} url the URL for this request
     * @param {object} postVar the data for this post request
     * @param {boolean} gzipped set to true, if you expect a gzipped response
     * @returns the data of the http request
     */
    app.config.globalProperties.$httpPulledPost = async function(url, postVar, gzipped = false)
    {
        url = url.replace("https://", "");
        let zip = '';
        if (gzipped)
        {
            zip = "&gzip=1"
        }
        return (await Http.post(config.pullPath + "?url=" + encodeURI(url) + zip, postVar)).data;
    };

     
    /**
     * Perform a regular http get request
     * @param {string} url the URL for this request
     * @returns the data of the http request
     */
    app.config.globalProperties.$httpGet = async function(url)
    {
        return (await Http.get(url)).data;
    };
    

    /**
     * Perform a regular http post request
     * @param {string} url the URL for this request
     * @param {object} postVar the data for this post request
     * @returns the promise of the http request
     */
    app.config.globalProperties.$httpPost = async function(url, postVar)
    {
        return (await Http.post(url, postVar)).data;
    };




    /**
     * Updates the current caches for CVEs etc. Might take some time and should not run too frequent
     * @returns nothing
     */
    app.config.globalProperties.$updateCaches = async function(force = false)
    {
        const lStore = useListsStore();

        if (force || lStore.needsRefresh)
        {

            let dl = await app.config.globalProperties.$httpPulledGet("https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-recent.json.gz?apiKey=" + config.nvdAPIKey, true);
            
            lStore.setRecentCVEs(dl);


            dl = await app.config.globalProperties.$httpPulledGet("https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-modified.json.gz?apiKey=" + config.nvdAPIKey, true);
            lStore.setModifiedCVEs(dl);


            dl = await app.config.globalProperties.$httpPulledGet("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json");
            
        
            for (let index = 0; index < dl.vulnerabilities.length; index++)
            {
                
                dl.vulnerabilities[index].cveInfo = {
                    reference: "",
                    impactScore: -1,
                    impactSeverity: "loading",
                };

                // Search, if we already have cached information
                for (let eI = 0; eI < lStore.knownExploitedVulns.length; eI++)
                {
                    if (lStore.knownExploitedVulns[eI].id == dl.vulnerabilities[index].cveID &&
                        lStore.knownExploitedVulns[eI].impactScore > 0)
                    {
                        dl.vulnerabilities[index].cveInfo = {
                            reference: lStore.knownExploitedVulns[eI].reference,
                            impactScore: lStore.knownExploitedVulns[eI].impactScore,
                            impactSeverity: lStore.knownExploitedVulns[eI].impactSeverity,
                        };

                        break;
                    }
                }
            }
            lStore.setKnownExploitedVulns(dl);
            enrichKnownExploited(dl);

            lStore.cacheUpdated();

            
      
            Notify.create({
                message: 'Reloaded CVE lists.',
                color: 'positive',
                icon: 'done'
            });
        }
    };


    async function enrichKnownExploited(dl)
    {
        const lStore = useListsStore();
        let updateCount = 0;
        
        for (let index = 0; index < dl.vulnerabilities.length; index++)
        {
            // Search, if we already have cached information
            let found = false;
            for (let eI = 0; eI < lStore.knownExploitedVulns.length; eI++)
            {
                if (lStore.knownExploitedVulns[eI].id == dl.vulnerabilities[index].cveID &&
                    lStore.knownExploitedVulns[eI].impactScore > 0)
                {
                    dl.vulnerabilities[index].cveInfo = {
                        reference: lStore.knownExploitedVulns[eI].reference,
                        impactScore: lStore.knownExploitedVulns[eI].impactScore,
                        impactSeverity: lStore.knownExploitedVulns[eI].impactSeverity,
                    };
                    found = true;
                    break;
                }
                
            }



            // if no cached information exists, we need to download it
            if (!found)
            {
                try {

                    let sCVE = await app.config.globalProperties.$httpPulledGet("https://services.nvd.nist.gov/rest/json/cve/1.0/" + dl.vulnerabilities[index].cveID + "?apiKey=" + config.nvdAPIKey);
                    
                    let element = {
                        reference: "",
                        impactScore: 0,
                        impactSeverity: "loading",
                    };

                    if (sCVE.result.CVE_Items[0].cve.references.reference_data.length > 0)
                    {
                        for (let rIndex = 0; rIndex < sCVE.result.CVE_Items[0].cve.references.reference_data.length; rIndex++)
                        {
                            element.reference = sCVE.result.CVE_Items[0].cve.references.reference_data[rIndex].url + "\n";
                        }
                    }

                    if (sCVE.result.CVE_Items[0].impact.baseMetricV3 != undefined)
                    {
                        element.impactScore = sCVE.result.CVE_Items[0].impact.baseMetricV3.cvssV3.baseScore;
                        element.impactSeverity = sCVE.result.CVE_Items[0].impact.baseMetricV3.cvssV3.baseSeverity;
                    }


                    dl.vulnerabilities[index].cveInfo = element;
                    
                    lStore.setKnownExploitedVulns(dl);
                    updateCount++;
                } catch (error) {
                    
                }
            }
        }
        lStore.setKnownExploitedVulns(dl);

        
        if (updateCount > 0)
        {
            Notify.create({
                message: 'Enriched the list of known exploited vulnerabilities. Refresh the page (F5) to update tables.',
                color: 'positive',
                icon: 'done'
            });
        }
    }
}