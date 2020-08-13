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
Browser.
projDirectory - Path to the project
After the hook is executed, the MFP project will have been prepared.
 */
function BrowserAfterPrepare(projectDirectory) {
    var projName;           // Project name
    var mfpConfig;          // MFP configuration
    var projDir;            // Path to project
    var platformDir;        // Path to platform
    var pluginDir;          // Path to platform specific plugins
    var that;               // References this

    AfterPrepare.apply(this);

    that = this;
    projDir = projectDirectory;
    platformDir = path.join(projDir, 'platforms', hookConsts.BROWSER);
    pluginDir = path.join(projDir, hookConsts.WORKLIGHT_DIR_BROWSER);
    mfpConfig = new MFPConfig(path.join(projDir, 'config.xml'), log.level);
    projName = mfpConfig.getWidgetName();

    logSilly('Project directory: ' + projDir);
    logSilly('Project name: ' + projName);
    logSilly('Platform directory: ' + platformDir);
    logSilly('Plugin directory: ' + pluginDir);

    /*
    Displays a log silly message. The log level must be set to silly.
    message - The message to log
     */
    function logSilly(message) {
        log.silly(hookConsts.BROWSER_AFTER_PREPARE, message);
    }

    /*
    Displays a log verbose message. The log level must be set to verbose.
    message - The message to log
     */
    function logVerbose(message) {
        log.verbose(hookConsts.BROWSER_AFTER_PREPARE, message);
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
        appProps.LANGUAGE_PREFERENCES =
            mfpConfig.getMFPLanguagePrefs() ? mfpConfig.getMFPLanguagePrefs().trim() : "";

        if (preview)
            appProps = buildPreviewStaticAppProps(appProps);
        else {
            appProps.ENVIRONMENT = hookConsts.WEB;
            appProps.WORKLIGHT_ROOT_URL =
                strings.format(hookConsts.WORKLIGHT_ROOT,
                    hookConsts.APP_SERVICES, appProps.APP_ID,
                    hookConsts.WEB);
            appProps.APP_SERVICES_URL = hookConsts.APP_SERVICES;
        }


        logSilly('Platform specific static app properties: ' + appProps);
        that.buildStaticAppProps(appProps, path.resolve(projDir,
            hookConsts.WWW_DIR_BROWSER, hookConsts.STATIC_APP_PROPS_PATH),
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
        appProps.PREVIEW_ENVIRONMENT = hookConsts.WEB;
        appProps.PREVIEW_ROOT_URL = previewRootURL;
        appProps.APP_SERVICES_URL =
            strings.format(hookConsts.PREVIEW_APP_SERVICES, runtime);
        appProps.POSTFIX_APP_SERVICES_URL = appProps.APP_SERVICES_URL;
        appProps.WORKLIGHT_ROOT_URL =
            strings.format(hookConsts.PREVIEW_WORKLIGHT_ROOT, runtime,
                hookConsts.APP_SERVICES, appName, hookConsts.WEB);
        appProps.POSTFIX_WORKLIGHT_ROOT_URL = appProps.WORKLIGHT_ROOT_URL;

        logSilly('Preview app props: ' + util.inspect(appProps));

        return appProps;
    }

    /*
    Builds Preview specific static app properties. An initialized app properties
    object must be passed. The preview app properties are returned.
     */
    function modifyProxyJS() {
        logVerbose('Modifying proxy.js.');

        var serverURL = mfpConfig.getMFPServerURL();
        var serverRuntime = mfpConfig.getMFPServerRuntime();
        var appName = mfpConfig.getWidgetName();

        logSilly('Server URL: ' + serverURL);
        logSilly('Server Runtime: ' + serverRuntime);
        logSilly('App Name: ' + appName);
        logSilly('Proxy Port: ' + hookConsts.PROXY_PORT);

        shell.sed('-i', /var mfpServer.*;/, 'var mfpServer = \"' + serverURL + '\";', path.join(projDir, hookConsts.PROXY_PATH));
        shell.sed('-i', /var mfpServerRuntime.*;/, 'var mfpServerRuntime = \"' + serverRuntime + '\";', path.join(projDir, hookConsts.PROXY_PATH));
        shell.sed('-i', /var appName.*;/, 'var appName = \"' + appName + '\";', path.join(projDir, hookConsts.PROXY_PATH));
        shell.sed('-i', /var port.*;/, 'var port = ' + hookConsts.PROXY_PORT + ';', path.join(projDir, hookConsts.PROXY_PATH));
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
            hookConsts.CORDOVA_PATH_BROWSER));
        buf = buf.replace(hookConsts.PREVIEW_FACTORY_ORIG,
            hookConsts.PREVIEW_FACTORY);
        buf = buf.replace(hookConsts.PREVIEW_TIMEOUT_ORIG,
            hookConsts.PREVIEW_TIMEOUT);
        buf = buf.replace(hookConsts.PREVIEW_DEVICE_READY_ORIG,
            hookConsts.PREVIEW_DEVICE_READY);
        buf = buf.replace(hookConsts.PREVIEW_WINDOW_TIMEOUT_ORIG,
            hookConsts.PREVIEW_WINDOW_TIMEOUT_BROWSER);
        var addEntryFunction = buf.match(hookConsts.PREVIEW_ADD_ENTRY_ORIG);
        buf = buf.replace(addEntryFunction, addEntryFunction + hookConsts.PREVIEW_ADD_ENTRY);

        that.writeFile(path.join(projDir, hookConsts.CORDOVA_PATH_BROWSER), buf);

        logSilly('Preview cordova.js: ' + buf);
    }

	/*
    Overwrites ibmmfpf.js with Preview specific ibmmfpf.js.
     */
    function modifyMFPFJS() {
        logVerbose('Modifying ibmmfpf.js for preview.');

        logSilly('Deleting ibmmfpf.js');
        that.deleteFile(hookConsts.WORKLIGHT_PATH_BROWSER);
        logSilly('Adding ibmmfpf-preview.js');
        // Replace ibmmfpf.js with the one for preview
        that.copyFile(path.join(projDir,
            hookConsts.PREVIEW_IBMMFPF_SRC_PATH), path.join(projDir,
            hookConsts.PREVIEW_IBMMFPF_PATH_BROWSER));
    }


    /*
    Replaces bootstrap.js with one that will load preview files in the correct
    order.
    An error is thrown if bootstrap.js cannot be copied.
     */
    function modifyBootstrapJS() {
        logVerbose('Modifying bootstrap.js for preview.');

        // Replace bootstrap.js with the one for preview
        that.copyFile(path.join(projDir,
            hookConsts.PREVIEW_BOOTSTRAP_PATH), path.join(projDir,
            hookConsts.BOOTSTRAP_PATH_BROWSER));
    }

    /*
    Builds static_app_props.js, and updates worklight.js for Preview.
    An error is thrown if the hook fails.
    */
    this.invokeHook = function (preview) {
        logVerbose('Performing Browser after prepare hook.');
        logSilly('Preview: ' + preview);

        // Skip the hook if this is a platform install
        if (!this.exists(pluginDir)) {
            logVerbose(pluginDir + ' does not exist. Skipping hook.');
            return;
        }

        try {
            buildStaticAppProps(preview);
            modifyProxyJS();
            if (preview) {
                modifyMFPFJS();
                modifyBootstrapJS();
                modifyCordovaJS();
            }
        } catch (err) {
            throw strings.format(externalizedStrings.failedPluginPrepare,
                hookConsts.BROWSER, err);
        }
    };
}

BrowserAfterPrepare.prototype = new AfterPrepare();
module.exports = BrowserAfterPrepare;
