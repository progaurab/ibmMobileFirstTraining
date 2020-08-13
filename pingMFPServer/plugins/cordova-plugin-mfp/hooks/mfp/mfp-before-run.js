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

// MFP modules
var hookConsts = require('./../utils/hook-consts');
var externalizedStrings = require('./../externalizedStrings');
var MFPHook = require('./mfp-hook');
var BrowserBeforeRun = require('./../browser/browser-before-run');

/*
This class determines which platform specific before-run hook to
instantiate, and invoke.
 */
function MFPBeforeRun(context) {
    var platformPath;       // Path to platform
    var currentPlatforms;   // Installed platforms
    var projectRoot;        // Path to project
    var args;               // User arguments
    var pluginName;         // Name of plugin

    MFPHook.apply(this);
    MFPBeforeRun.prototype = MFPHook.prototype;

    currentPlatforms = context.opts.cordova.platforms;
    projectRoot = path.resolve(context.opts.projectRoot);
    args = MFPBeforeRun.prototype.getArguments(context.cmdLine);
    pluginName = context.opts.plugin.id;

    // If the user did not supply any platforms, use all the installed
    // platforms
    if (currentPlatforms.length === 0) {
        currentPlatforms =
            MFPBeforeRun.prototype.getInstalledPlatforms(
                path.join(projectRoot, 'platforms')
            );
    }

    MFPBeforeRun.prototype.setLogLevel(args);
    logSilly('Cordova context: ' + JSON.stringify(context, null, 2));
    logSilly('Project root: ' + projectRoot);
    logSilly('Current platforms: ' + currentPlatforms);
    logSilly('Arguments: ' + args);

    /*
    Displays a log silly message. The log level must be set to silly.

    message - The message to log
     */
    function logSilly(message) {
        log.silly(hookConsts.MFP_BEFORE_RUN, message);
    }

    /*
    Displays a log verbose message. The log level must be set to verbose.

    message - The message to log
     */
    function logVerbose(message) {
        log.verbose(hookConsts.MFP_BEFORE_RUN, message);
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

                if (platformId === hookConsts.BROWSER)
					new BrowserBeforeRun(projectRoot).invokeHook();
            }
        );
    }

    /*
    Determines which hook platform specific before_run hook to
    instantiate, and invoke.
     */
    this.invokeHook = function() {
        logVerbose('Performing MFP before run hook.');
        invokePlatformHooks(currentPlatforms);
    };

}

module.exports = MFPBeforeRun;
