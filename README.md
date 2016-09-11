# MEAN stack based Corp Data Product

### Usage

1. Update your local hosts file (Mac/Linux => /etc/hosts) with your SFDC Connected App Callback URL
```sh
 127.0.0.1       console.summitsync.com
```

2. Have mongodb running locally
3. Clone, then

```sh
npm install
```
```sh
node server.js
```
Terminal should show app running on both ports - 3000 and 8000 

4. In browser...NOTE - https
```
https://console.summitsync.com:8000
```

5. Login and Register pages should appear

6. Register
```
    Query mongoDb for user shows registration info
```

7. Login

8. If you're using your own SFDC Consumer key/secret in config.json you should get re-directed to SFDC login page

9. After logging into SFDC and should get redirected to home page
```
    Query mongoDb for user shows registration + sfdc oauth tokens
```

10. In Home page, click Submit 
```
    should see data from SFDC
```

### Architecture Details
#### Folders
#### Front-end/UI:
- app: this and its sub-folders contains all UI/front-end
- app/account: has controller and view for Account functionality
- app/app-content: styles, favicon
- app/app-services: common files used by all controllers app/account, app/home
- app/home: has controller and view for Home functionality
- app/app.js: UI main file
- app/index.html: UI main view

#### Server/back-end:
- controllers: server side controllers
- https_cert: certs used to enable HTTPs
- public: will hold files that do not need authentication
- services: common files used by all controllers
- views: controllers serve these to UI 

#### Flow of request:
Both UI and server side use similar flow - request --> Controller --> Service

web request ---> Controller ---> Services ---> data source 
view/data <--- Controller <--- Services <--- data source

1. any un-authenticated web request(/) ---> routed to Controller(server side) ---> server Controller returns login view
2. register request ---> server Controller ---> Services ---> saved to data source
    login <--- server Controller <--- Services <--- saved to data source
3. login ---> server Controller ---> Services ---> data source
    redirect to SFDC login <--- server Controller <--- Services <--- data source    
    SFDC redirect ---> server Controller ---> Services ---> save SFDC OAuth info data source
    home page <--- server Controller <--- Services

### Creating a Connected App
config.json 
"sfdcConsumerKey"
"sfdcConsumerSecret"
Update to your SFDC Connected App Consumer key and Consumer secret

You can set up a [Connected
App](https://help.salesforce.com/apex/HTViewHelpDoc?id=connected_app_overview.htm)
inside of Salesforce.  See [this
article](https://help.salesforce.com/apex/HTViewHelpDoc?id=connected_app_create.htm)
for detailed and up-to-date Connected App creation instructions.

### Authors

### Legal

