import { Notify, date } from 'quasar';
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
            let dl = await app.config.globalProperties.$httpPulledGet("https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-recent.json.gz", true);
            lStore.setRecentCVEs(dl);

            dl = await app.config.globalProperties.$httpPulledGet("https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-modified.json.gz", true);
            lStore.setModifiedCVEs(dl);

            dl = await app.config.globalProperties.$httpPulledGet("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json");
            lStore.setKnownExploitedVulns(dl);

            lStore.cacheUpdated();

            
      
            Notify.create({
                message: 'Die CVE-Listen wurden neu geladen.',
                color: 'positive',
                icon: 'done'
            });
        }
    };
}