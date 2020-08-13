/*
   Licensed Materials - Property of IBM
   (C) Copyright 2015, 2016 IBM Corp.
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

// Public modules
var path = require('path');
var shell = require('shelljs');
//var et = require('elementtree');
var log = require('npmlog');
var util = require('util');

// MFP modules
var AfterPrepare = require('./../utils/after-prepare');
var hookConsts = require('./../utils/hook-consts');
var externalizedStrings = require('./../externalizedStrings');
var MFPConfig = require('mfp-config-xml').mfpConfigXMLAPI;
var strings = require('ibm-strings');

/*
This class provides the hook script functionality for after prepare for
Android.
projDirectory - Path to the project
After the hook is executed, the MFP project will have been prepared.
 */
function AndroidAfterPrepare(projectDirectory) {
    var projName;           // Project name
    var mfpConfig;          // MFP configuration
    var projDir;            // Path to project
    var platformDir;        // Path to platform
    var propertiesPath;     // Path to properties
    var pluginDir;          // Path to platform specific plugins
    var that;               // References this
   
    AfterPrepare.apply(this);

    that = this;
    projDir = projectDirectory;
    var  isVerAndroid7=getAndroidVersion();

 
    if(isVerAndroid7){
        
         platformDir = path.join(projDir, 'platforms', hookConsts.ANDROID_GT_EQ_7);
           
      }else{
       
        platformDir = path.join(projDir, 'platforms', hookConsts.ANDROID);
         
      }

    
    propertiesPath = path.join(platformDir, hookConsts.PROPS_PATH_ANDROID);
    pluginDir = path.join(projDir, hookConsts.WORKLIGHT_DIR_ANDROID);
    
    

    mfpConfig = new MFPConfig(path.join(projDir, 'config.xml'), log.level);
 
    projName = mfpConfig.getWidgetName();

    logSilly('Project directory: ' + projDir);
    logSilly('Project name: ' + projName);
    logSilly('Properties path: ' + propertiesPath);
    logSilly('Platform directory: ' + platformDir);
    logSilly('Plugin directory: ' + pluginDir);

    /*
    Displays a log silly message. The log level must be set to silly.
    message - The message to log
     */
    function logSilly(message) {
        log.silly(hookConsts.ANDROID_AFTER_PREPARE, message);
    }

    /*
    Displays a log verbose message. The log level must be set to verbose.
    message - The message to log
     */
    function logVerbose(message) {
        log.verbose(hookConsts.ANDROID_AFTER_PREPARE, message);
    }



/*checks the  cordova-android version*/
   function getAndroidVersion(){

            var nodeModulePath;//path to node_module folder 
            var flag=false;//set to true if cordova android version >=7
            var cordovaAndroidVersion; //cordova android version
        try {
            nodeModulePath=path.join(projectDirectory,hookConsts.NODE_MODULES);
            
            if(that.exists(nodeModulePath)){
            
             cordovaAndroidVersion=that.readFile(path.join(projectDirectory,hookConsts.NODE_MODULES));
             cordovaAndroidVersion=parseInt(cordovaAndroidVersion);

            if(cordovaAndroidVersion>=7){
              flag=true; 
               }
            }
       return flag;
  
    }catch (err) {
            throw strings.format(externalizedStrings.failedPluginInstall,
                hookConsts.ANDROID, '/n error is : ' ,err.message);
        }
    }

    /*
    Restores the filelist file to its original location. The filelist file must
    exist in the backup location.
    An error will be thrown if the filelist cannot be restored.
    */
    function restoreFileList() {
        var fileListPath;   // Path of filelist
        var backupPath;     // Path of backup filelist

        fileListPath = path.join(platformDir,
            hookConsts.FILE_LIST_PATH_ANDROID);
        backupPath = path.join(platformDir, hookConsts.FILE_LIST);

        // Restore the filelist if it exists
        if (that.exists(backupPath)) {
            logSilly('Restoring ' + backupPath + ' to ' + fileListPath);
            that.moveFile(backupPath, fileListPath);
        } else
            logSilly('Skip restoring: ' + backupPath);
    }

    /*
    Updates mfpclient.properties with information about the server, and app
    settings.
    An error will be thrown if the properties cannot be written.
    */
    function updatePropertiesFile() {
        var serverInfo;         // Server information
        var serverURL;          // Server path
        var serverRuntime;      // Server runtime
        var properties;         // Android properties
        var testWebResources;   // Web resources
        var pathname;          // Server Uri for MFP Lite plan Instance

        logVerbose('Updating ' + propertiesPath + ' with properties.');

        serverURL = mfpConfig.getMFPServerURL();
        serverRuntime = mfpConfig.getMFPServerRuntime();
        serverInfo = that.parseServerInfo(serverURL, serverRuntime);
        testWebResources = mfpConfig.getMFPTestWebResources(hookConsts.ANDROID);
        testWebResources = that.normalizeTestWebResources(testWebResources);

        logSilly('Server info: ' + util.inspect(serverInfo));
        if(serverInfo.pathname.length > 1 ) {
            // Lite plan instance where an instance ID is provided
            pathname = serverURL; 
        }
        else {
            // Regular MFP server. Instance ID is not part of the URL
            pathname = ''; 
        }

        properties = strings.format(hookConsts.MFP_PROPERTIES_ANDROID,
            serverInfo.protocol,
            serverInfo.host,
            serverInfo.port,
            '/' + serverInfo.context + '/',
            testWebResources,
            mfpConfig.getMFPIgnoreFileExtensions(hookConsts.ANDROID),
            mfpConfig.getMFPPlatformVersion(),
            mfpConfig.getMFPDirectUpdateAuthKey(),
            mfpConfig.getMFPLanguagePrefs() ? mfpConfig.getMFPLanguagePrefs().trim() : "",
            mfpConfig.getMFPPlatformVersion(),
            pathname,
            mfpConfig.getMFPAPIProxyURL() ? mfpConfig.getMFPAPIProxyURL() : "/adapters/MobileAPIProxy");

        logSilly('Properties: ' + properties);
        
        that.writeFile(propertiesPath, properties);
    }

    /*
    Populates static_app_props.js  with properties that are injected into
    worklight.js when the app boots. The mfpclient.properties must be populated
    before this method is called.
    An error is thrown if static_app_props.js cannot be written.
    */
    function buildStaticAppProps(preview) {
        var appProps;   // App properties
     
        logVerbose('Building platform specfic static app properties.');

        appProps = {};
        appProps.APP_ID = mfpConfig.getWidgetId();
        appProps.APP_VERSION = mfpConfig.getWidgetVersion();
        appProps.WORKLIGHT_PLATFORM_VERSION =
            getAndroidProperty('wlPlatformVersion', propertiesPath);
        appProps.WORKLIGHT_NATIVE_VERSION =
            mfpConfig.getMFPSDKChecksum(hookConsts.ANDROID);
        appProps.LANGUAGE_PREFERENCES =
            mfpConfig.getMFPLanguagePrefs() ? mfpConfig.getMFPLanguagePrefs().trim() : "";
        appProps.API_PROXY_URL = getAndroidProperty('APIProxyURL', propertiesPath);

        if (preview)
            appProps = buildPreviewStaticAppProps(appProps);
        else {
            appProps.ENVIRONMENT = hookConsts.ANDROID;
            appProps.WORKLIGHT_ROOT_URL =
                strings.format(hookConsts.WORKLIGHT_ROOT,
                    hookConsts.APP_SERVICES, appProps.APP_ID,
                    hookConsts.ANDROID);
            appProps.APP_SERVICES_URL = hookConsts.APP_SERVICES;
        }

        logSilly('Platform specific static app properties: ' + appProps);
        
        
        
            that.buildStaticAppProps(appProps, path.resolve(projDir,
            hookConsts.WWW_DIR_ANDROID, hookConsts.STATIC_APP_PROPS_PATH),
            mfpConfig);

            that.buildStaticAppProps(appProps, path.resolve(projDir,
                hookConsts.PLATFORM_WWW_DIR_ANDROID, hookConsts.STATIC_APP_PROPS_PATH),
                mfpConfig);
    }

    /*
    Builds Preview specific static app properties. An initialized app properties
    object must be passed. The preview app properties are returned.
     */
    function buildPreviewStaticAppProps(appProps) {
        var serverURL;          // Server URL
        var serverRuntime;      // Server runtime
        var serverInfo;         // Server info object
        var appName;            // Application name
        var runtime;            // Server runtime
        var previewRootURL;     // Root URL for preview

        logVerbose('Building Preview platform specific static app properties');

        serverURL = mfpConfig.getMFPServerURL();
        serverRuntime = mfpConfig.getMFPServerRuntime();
        serverInfo = that.parseServerInfo(serverURL, serverRuntime);
        runtime = mfpConfig.getMFPServerRuntime();
        appName = mfpConfig.getWidgetName();
        previewRootURL = serverURL + '/' + runtime + '/';

        logSilly('Server info: ' + util.inspect(serverInfo));
        logSilly('Runtime: ' + runtime);
        logSilly('App name: ' + appName);
        logSilly('Preview root URL: ' + previewRootURL);

        appProps.ENVIRONMENT = hookConsts.PREVIEW;
        appProps.PREVIEW_ENVIRONMENT = hookConsts.ANDROID;
        appProps.PREVIEW_ROOT_URL = previewRootURL;
        appProps.APP_SERVICES_URL =
            strings.format(hookConsts.PREVIEW_APP_SERVICES, runtime);
        appProps.POSTFIX_APP_SERVICES_URL = appProps.APP_SERVICES_URL;
        appProps.WORKLIGHT_ROOT_URL =
            strings.format(hookConsts.PREVIEW_WORKLIGHT_ROOT, runtime,
                hookConsts.APP_SERVICES, appName, hookConsts.ANDROID);
        appProps.POSTFIX_WORKLIGHT_ROOT_URL = appProps.WORKLIGHT_ROOT_URL;

        logSilly('Preview app props: ' + util.inspect(appProps));

        return appProps;
    }

    /*
    Modifies cordova.js so that Cordova will work in a browser. Throws
    exceptions if the cordova.js files cannot be read, or written to.
    An error is thrown if cordova.js cannot be read, or written.
     */
    function modifyCordovaJS() {
        var buf;        // File buffer
      
        logVerbose('Modifying cordova.js for Preview.');

        buf = hookConsts.ANDROID_POLYFILL;

        buf = buf + that.readFile(path.join(projDir,
                hookConsts.CORDOVA_PATH_ANDROID)); 
        buf = buf.replace(hookConsts.PREVIEW_TIMEOUT_ORIG,
            hookConsts.PREVIEW_TIMEOUT);
        buf = buf.replace(hookConsts.PREVIEW_DEVICE_READY_ORIG,
            hookConsts.PREVIEW_DEVICE_READY);
        buf = buf.replace(hookConsts.PREVIEW_WINDOW_TIMEOUT_ORIG,
            hookConsts.PREVIEW_WINDOW_TIMEOUT);
        var addEntryFunction = buf.match(hookConsts.PREVIEW_ADD_ENTRY_ORIG);
        buf = buf.replace(addEntryFunction, addEntryFunction + hookConsts.PREVIEW_ADD_ENTRY);
        buf = buf + '\n';
        
        buf = buf + that.readFile(path.join(projDir,
                hookConsts.PREVIEW_CORDOVA_PATH_ANDROID));

        that.writeFile(path.join(projDir, hookConsts.CORDOVA_PATH_ANDROID),
            buf); 
        

        logSilly('Preview cordova.js: ' + buf);
    }

    /*
    Replaces worklight.js with one that will work in a browser.
    An error is thrown if worklight.js cannot be copied.
     */
    function modifyWorklightJS() {
        logVerbose('Modifying worklight.js for preview.');
       
        logSilly('Adding ibmmfpf-preview.js');
        
      
               that.copyFile(path.join(projDir,
              hookConsts.PREVIEW_WORKLIGHT_PATH_ANDROID), path.join(projDir,
            hookConsts.WORKLIGHT_PATH_ANDROID));
    }


    /*
    Get Android property from mfpclient.properties The specified property will
    be returned. If the property was not found, a empty string will be returned.
    property - Property to read
    propFile - Properties path
    An error will be thrown if the property cannot be read.
     */
    function getAndroidProperty(property, propFile) {
        var value;  // Resultant property

        try {
            value = shell.grep(property, propFile);
        } catch (err) {
            logVerbose(err);
            throw externalizedStrings.unexpectedErr;
        }

        // The property was not found, return an empty string
        if (!value)
            return '';

        value = value.split('=');

        return value[1].trim();
    }

    /*
     Reads the SDK checksum for Android from mfpprefs.json, and writes that
     value to MFP config.
     An error is thrown if mfpprefs.json cannot be read.
     */
    function addSDKChecksumToConfig(){
        var jsonFile;           // JSON file path
        var parsedJSON;         // Parsed JSON file
        var androidChecksum;    // Android checksum
        var content;            // JSON file content

        logVerbose('Writing Android checksum to config.xml');

        jsonFile = path.join(projDir, 'plugins', 'cordova-plugin-mfp', 'hooks',
            'mfpprefs.json');
        content = that.readFile(jsonFile);
        parsedJSON = JSON.parse(content);
        androidChecksum = parsedJSON["base.android"];
     
        logSilly('Writing Android SDK checksum: ' + androidChecksum);
        mfpConfig.setMFPSDKChecksum(androidChecksum, hookConsts.ANDROID);
        mfpConfig.writeToFile();
    }

    /*
    Processes config.xml update tags, creates checksum.js, updates
    mfpclient.properties file, builds static_app_props.js, updates templated
    files, and updates worklight.js and cordova.js for Preview.
    An error is thrown if the hook fails.
    */
    this.invokeHook = function (preview) {
        var checksum;       // Checksum value
        var checksumPath;   // Path to checksum
        var platformChecksumPath;   // Path to checksum

        logVerbose('Performing Android after prepare hook.');
        logSilly('Preview: ' + preview);

        // Skip the hook if this is a platform install
        if (!this.exists(pluginDir)) {
            logVerbose(pluginDir + ' does not exist. Skipping hook.');
            return;
        }

        checksum = mfpConfig.getMFPAppChecksum(hookConsts.ANDROID);
 
        checksumPath = path.join(platformDir, hookConsts.CHECKSUM_PATH_ANDROID);
        platformChecksumPath = path.resolve(projDir, hookConsts.PLATFORM_CHECKSUM_PATH_ANDROID);
       
        try {
            addSDKChecksumToConfig();
         
            this.parseUpdates(projDir, platformDir, hookConsts.ANDROID);
            
            this.createChecksumFile(checksum, checksumPath);
            this.createChecksumFile(checksum, platformChecksumPath);
       
            restoreFileList();
            updatePropertiesFile();
            
            buildStaticAppProps(preview);
          

            // Perform Preview modifications
            if (preview) {
                modifyWorklightJS();
               
                modifyCordovaJS();
               
            }
        } catch (err) {
            throw strings.format(externalizedStrings.failedPluginPrepare,
                hookConsts.ANDROID, err);
        }
    };
}

AndroidAfterPrepare.prototype = new AfterPrepare();
module.exports = AndroidAfterPrepare;