/*
   Licensed Materials - Property of IBM

   (C) Copyright 2016 IBM Corp.

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
var Q = require('q');
var util = require('util');

// MFP modules
var hookConsts = require('./../utils/hook-consts');
var externalizedStrings = require('./../externalizedStrings');
var MFPHook = require('./mfp-hook');

/*
 This class determines which platform specific before_compile hook to
 instantiate, and invoke.
 */
function MFPBeforeCompile(context) {
    var projectRoot;		// Project directory
    var currentPlatforms;	// Platforms to compile
    var args;               // User arguments
    var webResourceEncrypt;

    MFPHook.apply(this);
    MFPBeforeCompile.prototype = MFPHook.prototype;

    currentPlatforms = context.opts.cordova.platforms;
    projectRoot = path.resolve(context.opts.projectRoot);
    args = MFPBeforeCompile.prototype.getArguments(context.cmdLine);
    webResourceEncrypt = MFPBeforeCompile.prototype.isWebResourceEncrypt(args);

    // If the user did not supply any platforms, use all the installed
    // platforms
    if (currentPlatforms.length === 0) {
        currentPlatforms = MFPBeforeCompile.prototype.getInstalledPlatforms(
            path.join(projectRoot, 'platforms')
        );
    }

    MFPBeforeCompile.prototype.setLogLevel(args);
    logSilly('Cordova context: ' + util.inspect(context));
    logSilly('Project root: ' + projectRoot);
    logSilly('Current platforms: ' + currentPlatforms);
    logSilly('Arguments: ' + args);

    /*
     Displays a log silly message. The log level must be set to silly.

     message - The message to log
     */
    function logSilly(message) {
        log.silly(hookConsts.MFP_BEFORE_COMPILE, message);
    }

    /*
     Displays a log verbose message. The log level must be set to verbose.

     message - The message to log
     */
    function logVerbose(message) {
        log.verbose(hookConsts.MFP_BEFORE_COMPILE, message);
    }


    /*
     Calls the platform specific hooks bassed on the platforms based. If an
     unsupported platform is passed, a warning message is displayed.

     currentPlatforms - Platforms to invoke hooks for
     */
    function invokePlatformHooks(currentPlatforms) {
        var MFPEncr = require('../../lib/mfp-enc-api');
        var promise = [];
        logVerbose('Invoking platform specific before-compile hooks.  Platforms: '+currentPlatforms);

        // Just in case neither iOS or Android platform is present, put a resolved
        // promise in the returned promise array
        var deferred = Q.defer();
        deferred.resolve();
        promise.push(deferred.promise);

        // For each installed platform, invoke platform specific hook
        currentPlatforms.forEach(
            function (platformId) {
                // Determine which hook to invoke based on the current platform
                if (platformId === hookConsts.IOS) {
                    console.log(strings.format(externalizedStrings.encryptingWebRes, platformId));
                    promise.push(MFPEncr(path.join(projectRoot, hookConsts.WWW_DIR_IOS)));
                } else if (platformId === hookConsts.ANDROID) {
                    console.log(strings.format(externalizedStrings.encryptingWebRes, platformId));
                    promise.push(MFPEncr(path.join(projectRoot, hookConsts.WWW_DIR_ANDROID), {splitFile: 'true'}));
                } else
                    console.warn(strings.format(externalizedStrings.webResEncryptionNotSupported, platformId));
            }
        );

        return promise;
    }

    /*
     Determines which hook platform specific before_plugin_uninstall hook to
     instantiate, and invoke.
     */
    this.invokeHook = function() {
        var promise = null;

        logVerbose('Performing MFP before compile hook.');
        if (webResourceEncrypt) {
            promise = invokePlatformHooks(currentPlatforms);
        }
        else {
            logVerbose('No web resource encryption requested');
        }

        return promise;
    };

}

module.exports = MFPBeforeCompile;
