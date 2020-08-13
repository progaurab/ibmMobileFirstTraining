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
var fs = require('fs');
var log = require('npmlog');
var util = require('util');

// MFP modules
var hookConsts = require('./../utils/hook-consts');
var externalizedStrings = require('./../externalizedStrings');
var MFPHook = require('./mfp-hook');
var AndroidAfterPluginInstall =
    require('./../android/android-after-plugin-install');
var IOSAfterPluginInstall = require('./../ios/ios-after-plugin-install');
var WindowsAfterPluginInstall =
    require('./../windows/windows-after-plugin-install');
var BrowserAfterPluginInstall =
    require('./../browser/browser-after-plugin-install');
/*
This class determines which platform specific after_plugin_install hook to
instantiate, and invoke.
 */
function MFPAfterPluginInstall(context) {
    var platformPath;       // Path to platform
    var currentPlatforms;   // Installed platforms
    var projectRoot;        // Path to project
    var args;               // User arguments
    var pluginName;         // Name of plugin

    MFPHook.apply(this);
    MFPAfterPluginInstall.prototype = MFPHook.prototype;

    currentPlatforms = context.opts.cordova.platforms;
    projectRoot = path.resolve(context.opts.projectRoot);
    args = MFPAfterPluginInstall.prototype.getArguments(context.cmdLine);
    pluginName = context.opts.plugin.id;

    // If the user did not supply any platforms, use all the installed
    // platforms
    if (currentPlatforms.length === 0) {
        currentPlatforms =
            MFPAfterPluginInstall.prototype.getInstalledPlatforms(
                path.join(projectRoot, 'platforms')
            );
    }

    MFPAfterPluginInstall.prototype.setLogLevel(args);
    logSilly('Cordova context: ' + util.inspect(context));
    logSilly('Project root: ' + projectRoot);
    logSilly('Current platforms: ' + currentPlatforms);
    logSilly('Arguments: ' + args);

    /*
    Displays a log silly message. The log level must be set to silly.

    message - The message to log
     */
    function logSilly(message) {
        log.silly(hookConsts.MFP_AFTER_PLUGIN_INSTALL, message);
    }

    /*
    Displays a log verbose message. The log level must be set to verbose.

    message - The message to log
     */
    function logVerbose(message) {
        log.verbose(hookConsts.MFP_AFTER_PLUGIN_INSTALL, message);
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
                    new IOSAfterPluginInstall(projectRoot).invokeHook();
                else if (platformId === hookConsts.ANDROID)
                    new AndroidAfterPluginInstall(projectRoot).invokeHook();
                else if (platformId === hookConsts.WINDOWS)
                    new WindowsAfterPluginInstall(projectRoot).invokeHook();
                else if (platformId === 'browser') {
                    new BrowserAfterPluginInstall(projectRoot).invokeHook();
                }
                else
                    console.warn(strings.format(externalizedStrings.hookNotImpl,
                        platformId, pluginName));
            }
        );
    }

    /*
    Determines which hook platform specific after_plugin_install hook to
    instantiate, and invoke.
     */
    this.invokeHook = function() {
        logVerbose('Performing MFP after plugin install hook.');
        invokePlatformHooks(currentPlatforms);
    };

}

module.exports = MFPAfterPluginInstall;
