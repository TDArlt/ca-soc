# CA-SoC

This project is under initial construction at the moment.


## General information

This is a custom SoC website fulfilling the needs of the company I work in.

It collects data from external services and websites and visualizes it centrally.

Although most of the sources are accessible for everyone, there will be some connections to very specific services, like a FortiAnalyzer. If you like to use this for your own purposes, keep that in mind.

I only tested this setup in our environment, so if e.g. your internal accounts are passwords where we use MFA, it's possible I did not respect this. However, feel free to create an issue for that.


## Installation

This website is created with quasar, see https://quasar.dev/
After setting up a quasar dev environment, you can use `quasar dev` for testing or `quasar build` for creating the final website.

URLs and other access-relevant information is
1) Compiled in the source (URLs)
2) Requires the user to "log in"/insert when visiting this website for the first time (API-keys, credentials)


## Usage
tbd
