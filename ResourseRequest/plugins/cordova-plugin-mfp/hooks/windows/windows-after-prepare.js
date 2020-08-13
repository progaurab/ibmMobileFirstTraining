/*
   Licensed Material - Property of IBM

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
Windows.

projDirectory - Path to the project

After the hook is executed, the MFP project will have been prepared.
 */
function WindowsAfterPrepare(projectDirectory) {
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
    platformDir = path.join(projDir, 'platforms', hookConsts.WINDOWS);
    propertiesPath = path.join(platformDir, hookConsts.PROPS_PATH_WINDOWS);
    pluginDir = path.join(projDir, hookConsts.WORKLIGHT_DIR_WINDOWS);
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
        log.silly(hookConsts.WINDOWS_AFTER_PREPARE, message);
    }

    /*
    Displays a log verbose message. The log level must be set to verbose.

    message - The message to log
    */
    function logVerbose(message) {
        log.verbose(hookConsts.WINDOWS_AFTER_PREPARE, message);
    }

    /*
    Restores the filelist file to its original location. The filelist file must
    exist in the backup location.

    An error will occur if if the filelist cannot be restored.
    */
    function restoreFileList() {
        var fileListPath;   // Path of filelist
        var backupPath;     // Path of backup filelist

        logVerbose('Restoring file list.');

        fileListPath = path.join(platformDir,
            hookConsts.FILE_LIST_PATH_WINDOWS);
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
        var serverInfo;             // Server information
        var serverURL;              // Server path
        var serverRuntime;          // Server runtime
        var properties;             // Android properties
        var win10testWebResources;  // Windows 10 web resources
        var win8testWebResources;   // Windows 8 web resources
        var wp8testWebResources;    // Windows Phone 8 web resources

        logVerbose('Updating ' + propertiesPath + ' with properties.');

        win10testWebResources =
            mfpConfig.getMFPTestWebResources(hookConsts.WINDOWS_10);
        win10testWebResources =
            that.normalizeTestWebResources(win10testWebResources);
        win8testWebResources =
            mfpConfig.getMFPTestWebResources(hookConsts.WINDOWS_8);
        win8testWebResources =
            that.normalizeTestWebResources(win8testWebResources);
        wp8testWebResources =
            mfpConfig.getMFPTestWebResources(hookConsts.WINDOWS_PHONE_8);
        wp8testWebResources =
            that.normalizeTestWebResources(wp8testWebResources);
        serverURL = mfpConfig.getMFPServerURL();
        serverRuntime = mfpConfig.getMFPServerRuntime();
        serverInfo = that.parseServerInfo(serverURL, serverRuntime);

        logSilly('Server info: ' + util.inspect(serverInfo));

        properties = strings.format(hookConsts.MFP_PROPERTIES_WINDOWS,
            serverInfo.protocol,
            serverInfo.host,
            serverInfo.port,
            '/' + serverInfo.context + '/',
            mfpConfig.getWidgetId(),
            mfpConfig.getMFPPlatformVersion(),
            mfpConfig.getMainFile(),
            mfpConfig.getMFPLanguagePrefs() ? mfpConfig.getMFPLanguagePrefs().trim() : "",
            mfpConfig.getWidgetVersion(),
            win8testWebResources,
            mfpConfig.getMFPIgnoreFileExtensions(hookConsts.WINDOWS_8),
            mfpConfig.getWidgetVersion(),
            wp8testWebResources,
            mfpConfig.getMFPIgnoreFileExtensions(hookConsts.WINDOWS_PHONE_8),
            win10testWebResources,
            mfpConfig.getMFPIgnoreFileExtensions(hookConsts.WINDOWS_10),
            mfpConfig.getMFPDirectUpdateAuthKey());

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
        appProps.APP_VERSION_WP8 = mfpConfig.getWidgetVersion();
        appProps.APP_VERSION_WIN = mfpConfig.getWidgetVersion();
        appProps.WORKLIGHT_PLATFORM_VERSION =
            getWindowsProperty('wlPlatformVersion', propertiesPath);
        appProps.WORKLIGHT_NATIVE_VERSION =
            mfpConfig.getMFPSDKChecksum(hookConsts.WINDOWS_8);
        appProps.LANGUAGE_PREFERENCES =
            mfpConfig.getMFPLanguagePrefs() ? mfpConfig.getMFPLanguagePrefs().trim() : "";

        if (preview)
            appProps = buildPreviewStaticAppProps(appProps);
        else {
            appProps.ENVIRONMENT = hookConsts.WINDOWS_8;
            appProps.ENVIRONMENT_WP8 = hookConsts.WINDOWS_PHONE_8;
            appProps.ENVIRONMENT_WIN = hookConsts.WINDOWS;
            appProps.WORKLIGHT_ROOT_URL =
                strings.format(hookConsts.WORKLIGHT_ROOT,
                    hookConsts.APP_SERVICES, appProps.APP_ID,
                    hookConsts.WINDOWS_8);
            appProps.WORKLIGHT_ROOT_URL_WP8 =
                strings.format(hookConsts.WORKLIGHT_ROOT,
                    hookConsts.APP_SERVICES, appProps.APP_ID,
                    hookConsts.WINDOWS_PHONE_8);
            appProps.WORKLIGHT_ROOT_URL_WIN =
                strings.format(hookConsts.WORKLIGHT_ROOT,
                    hookConsts.APP_SERVICES, appProps.APP_ID,
                    hookConsts.WINDOWS);
            appProps.APP_SERVICES_URL = hookConsts.APP_SERVICES;
        }

        logSilly('Platform specific static app properties: ' + appProps);

        that.buildStaticAppProps(appProps, path.resolve(projDir,
            hookConsts.WWW_DIR_WINDOWS, hookConsts.STATIC_APP_PROPS_PATH),
            mfpConfig, hookConsts.WINDOWS_8);
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
        appProps.PREVIEW_ENVIRONMENT = hookConsts.WINDOWS_8;
        appProps.PREVIEW_ROOT_URL = previewRootURL;
        appProps.APP_SERVICES_URL =
            strings.format(hookConsts.PREVIEW_APP_SERVICES, runtime);
        appProps.POSTFIX_APP_SERVICES_URL = appProps.APP_SERVICES_URL;
        appProps.WORKLIGHT_ROOT_URL =
            strings.format(hookConsts.PREVIEW_WORKLIGHT_ROOT, runtime,
                hookConsts.APP_SERVICES, appName, hookConsts.WINDOWS_8);
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

        buf = that.readFile(path.join(projDir,
                hookConsts.CORDOVA_PATH_WINDOWS));
        buf = buf.replace(hookConsts.PREVIEW_FACTORY_ORIG,
            hookConsts.PREVIEW_FACTORY);
        buf = buf.replace(hookConsts.PREVIEW_WINDOWS_LISTENER_ORIG,
            hookConsts.PREVIEW_WINDOWS_LISTENER);
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
                hookConsts.PREVIEW_CORDOVA_PATH_WINDOWS));

        that.writeFile(path.join(projDir, hookConsts.CORDOVA_PATH_WINDOWS),
            buf);

        logSilly('Preview cordova.js: ' + buf);
    }

    /*
    Replaces worklight.js with one that will work in a browser.

    An error is thrown if worklight.js cannot be copied.
     */
    function modifyWorklightJS() {
        logVerbose('Modifying worklight.js for preview.');

         // Replace worklight.js with the one for preview

         that.copyFile(path.join(projDir,
            hookConsts.PREVIEW_WORKLIGHT_PATH_WINDOWS), path.join(projDir,
            hookConsts.WORKLIGHT_PATH_WINDOWS));
    }

   
    /*
    Get Android property from mfpclient.properties The specified property will
    be returned. If the property was not found, a empty string will be returned.

    property - Property to read
    propFile - Properties path

    An error will be thrown if the property cannot be read.
     */
    function getWindowsProperty(property, propFile) {
        var value;  // Resultant property

        value = shell.grep(property, propFile);

        // The property was not found, return an empty string
        if (!value)
            return '';

        value = value.split('=');

        return value[1].trim();
    }

    /*
     Reads the SDK checksum for Windows from mfpprefs.json, and writes that
     value to MFP config.

     An error will be thrown if mfppres.json cannot be read.
     */
    function addSDKChecksumToConfig(){
        var jsonFile;           // JSON file path
        var parsedJSON;         // Parsed JSON file
        var windowsChecksum;    // Windows checksum
        var content;            // JSON file content

        logVerbose('Writing Windows checksum to config.xml');

        jsonFile = path.join(projDir, 'plugins', 'cordova-plugin-mfp', 'hooks',
            'mfpprefs.json');
        content = that.readFile(jsonFile);
        parsedJSON = JSON.parse(content);
        windowsChecksum = parsedJSON["base.windowsphone8"];

        logSilly('Writing Windows SDK checksum: ' + windowsChecksum);
        mfpConfig.setMFPSDKChecksum(windowsChecksum, hookConsts.WINDOWS_8);
        mfpConfig.setMFPSDKChecksum(windowsChecksum, hookConsts.WINDOWS_PHONE_8);
        mfpConfig.setMFPSDKChecksum(windowsChecksum, hookConsts.WINDOWS_10);
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

        logVerbose('Performing Windows after prepare hook.');
        logSilly('Preview: ' + preview);

        // Skip the hook if this is a platform install
        if (!this.exists(pluginDir)) {
            logVerbose(pluginDir + ' does not exist. Skipping hook.');
            return;
        }

        checksum = mfpConfig.getMFPAppChecksum(hookConsts.WINDOWS);
        checksumPath = path.join(platformDir, hookConsts.CHECKSUM_PATH_WINDOWS);

        try {
            addSDKChecksumToConfig();
            this.parseUpdates(projDir, platformDir, hookConsts.WINDOWS);
            this.createChecksumFile(checksum, checksumPath);
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
                hookConsts.WINDOWS , err);
        }
    };
}

WindowsAfterPrepare.prototype = new AfterPrepare();
module.exports = WindowsAfterPrepare;
