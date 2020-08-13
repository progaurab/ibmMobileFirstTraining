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
var strings = require('ibm-strings');
var log = require('npmlog');
var fs = require('fs');
var util = require('util');

// MFP modules
var strings = require('ibm-strings');
var hookConsts = require('./../utils/hook-consts');
var externalizedStrings = require('./../externalizedStrings');
var MFPHook = require('./mfp-hook');
var AndroidAfterPrepare = require('./../android/android-after-prepare');
var IOSAfterPrepare = require('./../ios/ios-after-prepare');
var WindowsAfterPrepare = require('./../windows/windows-after-prepare');
var BrowserAfterPrepare = require('./../browser/browser-after-prepare');
var MFPConfig = require('mfp-config-xml').mfpConfigXMLAPI;

/*
 This class determines which platform specific after_prepare hook to
 instantiate, and invoke.
 */
function MFPAfterPrepare(context) {
    var platformPath;           // Path to platform
    var currentPlatforms;       // Install platforms
    var projectRoot;            // Path to project
    var preview;                // Denotes preview
    var args;                   // User arguments
    var pluginName;             // Name of plugin
    var mfpConfig;              // Config object

    MFPHook.apply(this);
    MFPAfterPrepare.prototype = MFPHook.prototype;

    currentPlatforms = context.opts.cordova.platforms;
    projectRoot = path.resolve(context.opts.projectRoot);
    args = MFPAfterPrepare.prototype.getArguments(context.cmdLine);
    preview = MFPAfterPrepare.prototype.isPreview(args);
    pluginName = context.opts.plugin.id;
    mfpConfig = new MFPConfig(path.join(projectRoot, 'config.xml'));

    // If the user did not supply any platforms, use all the installed
    // platforms
    if (currentPlatforms.length === 0) {
        currentPlatforms = MFPAfterPrepare.prototype.getInstalledPlatforms(
            path.join(projectRoot, 'platforms')
        );
    }

    MFPAfterPrepare.prototype.setLogLevel(args);
    logSilly('Cordova context: ' + util.inspect(context));
    logSilly('Project root: ' + projectRoot);
    logSilly('Current platforms: ' + currentPlatforms);
    logSilly('Arguments: ' + args);
    logSilly('Preview: ' + preview);

    /*
    Displays a log silly message. The log level must be set to silly.

    message - The message to log
     */
    function logSilly(message) {
        log.silly(hookConsts.MFP_AFTER_PREPARE, message);
    }

    /*
    Displays a log verbose message. The log level must be set to verbose.

    message - The message to log
     */
    function logVerbose(message) {
        log.verbose(hookConsts.MFP_AFTER_PREPARE, message);
    }

    /*
    Creates the Preview Serve time file in the platform directory. This is
    needed for Serve mode to work in when Previewing apps.
     */
    function createPreviewServeTime() {
        var serveTimePath;  // Path to Preview Serve time file
        var content;        // Content of Preview Serve time file

        logVerbose('Creating Preview Serve time file.');

        serveTimePath = path.join(projectRoot, hookConsts.SERVE_TIME_PATH);
        content = new Date().getTime().toString();

        logSilly('Preview Serve time file: ' + serveTimePath);
        logSilly('Preview Serve time file content: ' + content);

        try {
            fs.writeFileSync(serveTimePath, content);
        } catch (err) {
            logVerbose(err);
            throw externalizedStrings.unexpectedErr;
        }
    }

    /*
     Reads the platform version from mfpprefs.json, and writes that value to
     config.xml

     projRoot - Root of project
     configFile - MFP configuration
     */
    function addPlatformVersionToConfig(projRoot, configFile){
        var jsonFile;       // JSON file path
        var parsedJSON;     // Parsed JSON file
        var platVers;       // Platform versions

        logVerbose('Adding MFP platform version to config.');

        jsonFile = path.join(projRoot, 'plugins', 'cordova-plugin-mfp', 'hooks',
            'mfpprefs.json');

        try {
            parsedJSON = JSON.parse(fs.readFileSync(jsonFile));
            platVers = parsedJSON.wl_version;

            logSilly('MFP platform version: ' + platVers);

            configFile.setMFPPlatformVersion(platVers);
            configFile.writeToFile();
        } catch (err) {
            logVerbose(err);
            throw externalizedStrings.unexpectedErr;
        }
    }

    /*
    Calls the platform specific hooks bassed on the platforms based. If an
    unsupported platform is passed, a warning message is displayed.

    currentPlatforms - Platforms to invoke hooks for
     */
    function invokePlatformHooks(currentPlatforms) {
        logVerbose('Invoking platform specific hooks.');

        // For each installed platform, invoke platform specific hook
        currentPlatforms.forEach(
            function (platformId) {
                platformPath = path.join(projectRoot, 'platforms', platformId);

                // Determine which hook to invoke based on the current platform
                if (platformId === hookConsts.IOS)
                    new IOSAfterPrepare(projectRoot).invokeHook(preview);
                else if (platformId === hookConsts.ANDROID)
                    new AndroidAfterPrepare(projectRoot).invokeHook(preview);
                else if (platformId === hookConsts.WINDOWS)
                    new WindowsAfterPrepare(projectRoot).invokeHook(preview);
                else if (platformId === hookConsts.BROWSER)
                        new BrowserAfterPrepare(projectRoot).invokeHook(preview);
                else
                    console.warn(strings.format(externalizedStrings.hookNotImpl,
                        platformId, pluginName));
            }
        );

        // Create the Preview Serve time file if Preview argument is passed
        if (preview)
            createPreviewServeTime();
    }

    /*
    Determines which hook platform specific after_prepare hook to
    instantiate, and invoke.
     */
    this.invokeHook = function() {
        logVerbose('Preforming MFP after prepare hook.');
        addPlatformVersionToConfig(projectRoot, mfpConfig);
        invokePlatformHooks(currentPlatforms);
    };
}

module.exports = MFPAfterPrepare;
