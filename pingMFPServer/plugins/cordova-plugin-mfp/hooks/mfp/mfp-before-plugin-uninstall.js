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
var AndroidBeforePluginUninstall =
    require('./../android/android-before-plugin-uninstall');
var IOSBeforePluginUninstall = require('./../ios/ios-before-plugin-uninstall');
var WindowsBeforePluginUninstall =
    require('./../windows/windows-before-plugin-uninstall');
var BrowserBeforePluginUninstall =	
    require('./../browser/browser-before-plugin-uninstall');

/*
 This class determines which platform specific before_plugin_uninstall hook to
 instantiate, and invoke.
 */
function MFPBeforePluginUninstall(context) {
    var currentPlatforms;   // Install platforms
    var platformPath;       // Path to platforms
    var projectRoot;        // Path to project
    var args;               // User arguments
    var pluginName;         // Name of plugin

    MFPHook.apply(this);
    MFPBeforePluginUninstall.prototype = MFPHook.prototype;

    currentPlatforms = context.opts.cordova.platforms;
    projectRoot = path.resolve(context.opts.projectRoot);
    args = MFPBeforePluginUninstall.prototype.getArguments(context.cmdLine);
    pluginName = context.opts.plugin.id;

    // If the user did not supply any platforms, use all the installed
    // platforms
    if (currentPlatforms.length === 0) {
        currentPlatforms =
            MFPBeforePluginUninstall.prototype.getInstalledPlatforms(
                path.join(projectRoot, 'platforms')
            );
    }

    MFPBeforePluginUninstall.prototype.setLogLevel(args);
    logSilly('Cordova context: ' + util.inspect(context));
    logSilly('Project root: ' + projectRoot);
    logSilly('Current platforms: ' + currentPlatforms);
    logSilly('Arguments: ' + args);

    /*
     Displays a log silly message. The log level must be set to silly.
     message - The message to log
     */
    function logSilly(message) {
        log.silly(hookConsts.MFP_BEFORE_PLUGIN_UNINSTALL, message);
    }

    /*
     Displays a log verbose message. The log level must be set to verbose.
     message - The message to log
     */
    function logVerbose(message) {
        log.verbose(hookConsts.MFP_BEFORE_PLUGIN_UNINSTALL, message);
    }

    /*
    Removes the Perview Serve time file from the platform directory if it
    exists.
     */
    function removePreviewServeTime() {
        var serveTimePath;      // Path to Preview Serve time file

        serveTimePath = path.join(projectRoot, hookConsts.SERVE_TIME_PATH);

        try {
            // Remove the Preview Serve time file if it exists
            if (fs.existsSync(serveTimePath)) {
                logVerbose('Removing Preview Serve time file.');
                logSilly('Removing: ' + serveTimePath);
                fs.unlinkSync(serveTimePath);
            }
        } catch (err) {
            logVerbose('Preview Serve time file could not be removed.');
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
            function(platformId) {
                platformPath = path.join(projectRoot, 'platforms', platformId);

                // Determine which hook to invoke based on the current platform
                if (platformId === hookConsts.IOS)
                    new IOSBeforePluginUninstall(projectRoot).invokeHook();
                else if (platformId === hookConsts.ANDROID)
                    new AndroidBeforePluginUninstall(projectRoot).invokeHook();
                else if (platformId === hookConsts.WINDOWS)
                    new WindowsBeforePluginUninstall(projectRoot).invokeHook();
                else if (platformId === 'browser') {
                    new BrowserBeforePluginUninstall(projectRoot).invokeHook();
                }
                else
                    console.warn(strings.format(externalizedStrings.hookNotImpl,
                        platformId, pluginName));
            }
        );

        removePreviewServeTime();
    }

    /*
     Determines which hook platform specific before_plugin_uninstall hook to
     instantiate, and invoke.
     */
    this.invokeHook = function() {
        logVerbose('Performing MFP before plugin uninstall hook.');
        invokePlatformHooks(currentPlatforms);
    };

}

module.exports = MFPBeforePluginUninstall;
