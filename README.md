# CA-SOC

## General information

This is a custom Security Operation Center website fulfilling the needs of the company I work in.

It collects data from external services and websites and visualizes it centrally. So it's meant to be a central entry point for doing quick research on different aspects.

It is not intended to fulfill a full SOC, especially concerning automation. I was just tired of logging in to a couple of devices every morning and looking through different views just to collect the current status.

Although most of the sources are accessible for everyone, there will be some connections to very specific services, like a FortiAnalyzer. If you like to use this for your own purposes, keep that in mind.

I only tested this setup in our environment, so if e.g. your internal accounts are passwords where we use MFA, it's possible I did not respect this. However, feel free to create an issue for that.
Note that this is a personal project and only features I currently use are implemented fully. You might see todos in code and some buttons will exist but only throw console output.


## Installation

This website is created with quasar, see https://quasar.dev/

Before running, you need to define the environment properties in the (to-be-created) file `src/config/index.js`. Use the sample file at this path to create your own.

After setting up a quasar dev environment and running `npm install`, you can use `quasar dev` for testing or `quasar build` for creating the final website.

For publishing, check `quasar.config.js` and set the public path accordingly:
```
    build: {
      publicPath: 'soc',
      // will result in the application running on https://yourserver.com/soc/
```

URLs and other access-relevant information is
1) Compiled in the source (URLs)
2) Requires the user to "log in"/insert when visiting this website for the first time (API-keys, credentials)

Although it feels quite comfortable, you should not modify the code for storing passwords longer than single-session-based (which will be forgotton when pressing F5 already). If you really feel to do so, do that in the php backend and not in js (and think about using tokens like oauth2 for exchange with php).

## Requirements
Due to CORS-restrictions, I needed to send most of the requests through a local php backend. So, you will always need a server that can do php and also has *cURL*  installed and enabled in the php.ini (unless you modify the `pullengine.php`-script).

Quasar/Vue.js is not meant to run in a local directoy, so you will always need to put the final output on a webserver, probably one which is running php as well.

## Security Advisory
This system is built to care about security. **Keep this in mind for your deployment!**
Especially the connection to FortiAnalyzer can easily dig a hole in your security concept e.g. when placing this server publically while having the FortiAnalyzer on a very closed segment.

The system is using javascript and local browser storage for most of its functionality. This is meant to leave a minimal data-footprint. However, browsers and especially browser plugins might be able to see the information, especially passwords. So handle sensitive information with care!

## Usage

### Vulnerability Dashboard
![Vulnearbilty Dashboard Screenshot](https://user-images.githubusercontent.com/37696083/171815272-38b038e9-c0bc-4a3f-93bc-b4c9c17331fc.jpg)

This dashboard is meant to do resarch on and have an overview about most recent CVEs. For looking into older information, feel free to use the official ressources ;-)

It includes the known exploited vulnerabilties database from CISA (the full one at the moment) and the most recent and recently updated CVE lists from the NIST API.
These entries will be saved for some time in your browser, preventing too frequent queries to the offical APIs. You may reload them manually via the reload button on the top right corner or by refreshing the page after an hour or so.

You can filter by anything you like. For filtering for a severity, I recommend using brackets around the name: `[HIGH]`
Selecting at least one entry allows you to acknowledge this particular entry. It will then vanish from the list (unless you choose to show it via button on the top) until the "Modified" date changes.

The acknowledgement information is also stored in your local browser data, so it probably won't be synced to other devices or browsers.

### Events & Incidents from FortiSOC
![Events & Incidents from FortiSOC](https://user-images.githubusercontent.com/37696083/171815278-b3276841-4795-4b16-8e19-737479bb9e15.jpg)

This overview will request you to enter url, user and password for a FortiAnalyzer when accessing the first time. The user needs to have read & write json-API-access on the FortiAnalyzer. It will store the url and user in your browser data but never the password. On the bottom of the page, you may store the (unencrypted!) password for the time of this browser window session, but this somehting you should only do in a very trusted environment.

When connected to a FortiAnalyzer, it will then show its events and incidents. Pushing reload will update both lists.

At the moment, you can only acknowledge events. Also, grouping is not implemented yet. So this dashboard is only for having a simple overview without having to login to the FAZ and stepping through all the pages to collect the information.


## Anything more?
Feel free to open up an issue and chat with me about what you experience or miss.
