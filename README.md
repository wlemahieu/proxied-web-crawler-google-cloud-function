# Proxied Web Crawler
# Proxy + Puppeteer + Chromium + Google Cloud Function
###### Crawl any targeted URL through a rotation of proxy servers and capture any specified element(s).

### Cloud Account Prerequisites:
- [Google Cloud Console account](https://console.cloud.google.com)
- [2nd-gen Cloud Function](https://cloud.google.com/functions/docs/2nd-gen/console-quickstart)
- [Cloud Run API enabled](https://console.cloud.google.com/marketplace/product/google/run.googleapis.com)

### General Knowledge Prerequisites:
- [Google Cloud IAM privileges & roles](https://cloud.google.com/iam/docs/understanding-roles)
- [Google Cloud Service Accounts](https://cloud.google.com/run/docs/configuring/service-accounts?hl=en)
- [Google Cloud Run](https://cloud.google.com/run/docs/quickstarts/deploy-container)
- [Google Cloud Secrets](https://cloud.google.com/secret-manager/docs)
- [Node 16](https://nodejs.org/dist/latest-v16.x/docs/api/)
- [Puppeteer](https://pptr.dev/)
- [ProxyMesh](https://proxymesh.com/)
- OR [Shifter](https://shifter.io/) (or any other Proxy service...)

### Local Tool Recommendations:
- [VSCode](https://code.visualstudio.com/)
- [NPX](https://www.npmjs.com/package/npx) (npm install -g npx)
- [NVM](https://github.com/nvm-sh/nvm) (or a similar node manager)

#### To test a GCF locally:

1. **nvm use 16** - Switch to Node 16 (nvm install 16.5.1 if not installed)
2. **npm install** - Install all node_modules for the GCF
3. **PROXY_USER=<proxy username> PROXY_PASS=<proxy password> npx @google-cloud/functions-framework --target=run** - Serve the example GCF locally
4. **http://localhost:8080/** - Visit the locally served GCF

##### *A note on easily moving ready components from local to the cloud:
After cloning this repository, you can upload a zip of the example GCF directory directly to a created Cloud Function. Alternatively, you can manually create & copy GCF files and their contents into your created Cloud Function.

##### *headers.js is simply a compilation of different browser headers to rotate through.

##### *proxies.json is a JSON of proxy servers. ProxyMesh.com or Shifter.io or any other proxy servers would work. 

##### More Requirements:
Make sure your Google Cloud Function has access to a **PROXY_USER** and **PROXY_PASS** secret exposed from your secret manager. This username / password would be from whichever Proxy services you sign-up to.