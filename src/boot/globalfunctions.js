import config from '../config';
import Http from 'axios';


export default ({ app, router, store, Vue }) => {

    // Add your global functions here

    /**
     * Perform a http get request using the pull-engine (avoiding cors-problems)
     * @param {string} url the URL for this request
     * @returns the data of the http request
     */
    app.config.globalProperties.$httpPulledGet = async function(url)
    {
        url = url.replace("https://", "");
        return (await Http.get(config.pullPath + "?url=" + encodeURI(url))).data;
    };
    

    /**
     * Perform a http post request using the pull-engine (avoiding cors-problems)
     * @param {string} url the URL for this request
     * @param {object} postVar the data for this post request
     * @returns the data of the http request
     */
    app.config.globalProperties.$httpPulledPost = async function(url, postVar)
    {
        url = url.replace("https://", "");
        return (await Http.post(config.pullPath + "?url=" + encodeURI(url), postVar)).data;
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