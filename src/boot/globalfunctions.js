import config from '../config';
import Http from 'axios';


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
        console.log(config.pullPath + "?url=" + encodeURI(url));
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
}