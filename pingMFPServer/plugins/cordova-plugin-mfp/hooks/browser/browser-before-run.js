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
var strings = require('ibm-strings');
var log = require('npmlog');
var childProcess = require('child_process');
var nopt  = require('nopt');
var cordovaServe = require('cordova-serve');

// MFP modules
var MFPConfig = require('mfp-config-xml').mfpConfigXMLAPI;
var externalizedStrings = require('./../externalizedStrings');
var hookConsts = require('./../utils/hook-consts');
var Hook = require('./../utils/hook');

/*
This class provides the Browser hook script functionality for before run for Browser.

projectDirectory - Path to the project
 */
function BrowserBeforeRun(projectDirectory) {
    var projDir;		// Path to project
    var platformDir;	// Path to platforms
    var mfpConfig;      // MFP configuration
    var that;			// References this

    Hook.apply(this);

    that = this;
    projDir = projectDirectory;
    platformDir = path.join(projectDirectory, 'platforms', hookConsts.BROWSER);
    mfpConfig = new MFPConfig(path.join(projDir, 'config.xml'), log.level);

    logSilly('Project directory: ' + projDir);
    logSilly('Platform directory: ' + platformDir);

    /*
    Displays a log silly message. The log level must be set to silly.

    message - The message to log
     */
    function logSilly(message) {
        log.silly(hookConsts.BROWSER_BEFORE_RUN, message);
    }

    /*
    Displays a log verbose message. The log level must be set to verbose.

    message - The message to log
     */
    function logVerbose(message) {
        log.verbose(hookConsts.BROWSER_BEFORE_RUN, message);
    }

    /*
    Start the proxy server.

    An error will be thrown if file cannot be found or replacing fails.
    */
    function runProxy(callback) {
        logSilly('Starting child process for proxy server...');

        var invoked = false;
        var process = childProcess.fork(hookConsts.PROXY_PATH);

        // listen for errors as they may prevent the exit event from firing
        process.on('error', function (err) {
            if (invoked) return;
            invoked = true;
            callback(err);
        });

        // execute the callback once the process has finished running
        process.on('exit', function (code) {
            if (invoked) return;
            invoked = true;
            var err = code === 0 ? null : new Error('exit code ' + code);
            callback(err);
        });
    }

    /*
    Launch a browser. Can specify target browser with --target flag.

    ex. cordova run --target=Firefox

    An error will be thrown if file cannot be found or replacing fails.
    */
    function launchBrowser() {
        var args = process.argv;
        args = nopt({'target': String}, args);
        args.target = args.target || "chrome";

        logVerbose('Target browser: ', args.target);

        var appName = mfpConfig.getWidgetName();
        var url = 'http://localhost:' + hookConsts.PROXY_PORT + '/' + appName + '/';

        logVerbose('Launching browser at: ', url);

        cordovaServe.launchBrowser({target: args.target, url: url});
    }

    /*
     Starts proxy server and launches browser.

     An error will be thrown if the hook fails.
     */
    this.invokeHook = function() {
        logVerbose('Performing before run hook.');
        try {
            runProxy(function(err){
                if (err) throw err;
            });
            launchBrowser();
        } catch (err) {
            throw strings.format(externalizedStrings.failedPluginInstall,
                hookConsts.BROWSER, err);
        }
    };
}

BrowserBeforeRun.prototype = new Hook();
module.exports = BrowserBeforeRun;
