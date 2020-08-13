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
var et = require('elementtree');
var shell = require('shelljs');
var strings = require('ibm-strings');
var log = require('npmlog');

// MFP modules
var externalizedStrings = require('./../externalizedStrings');
var hookConsts = require('./../utils/hook-consts');
var Hook = require('./../utils/hook');

/*
This class provides the Browser hook script functionality for before plugin
install for Broswer.

projectDirectory - Path to the project

After the hook is executed, after-plugin-install hook will run.
 */
function BrowserBeforePluginInstall(projectDirectory) {
    var projDir;		// Path to project
    var platformDir;	// Path to platforms
    var that;			// References this

    Hook.apply(this);

    that = this;
    projDir = projectDirectory;
    platformDir = path.join(projectDirectory, 'platforms', hookConsts.BROWSER);

    logSilly('Project directory: ' + projDir);
    logSilly('Platform directory: ' + platformDir);

    /*
    Displays a log silly message. The log level must be set to silly.

    message - The message to log
     */
    function logSilly(message) {
        log.silly(hookConsts.BROWSER_BEFORE_PLUGIN_INSTALL, message);
    }

    /*
    Displays a log verbose message. The log level must be set to verbose.

    message - The message to log
     */
    function logVerbose(message) {
        log.verbose(hookConsts.BROWSER_BEFORE_PLUGIN_INSTALL, message);
    }

    /*
    Replaces lib/messages with messages in ibmmfpf.js.
    This changes the location that messages is found.

    An error will be thrown if file cannot be found or replacing fails.
    */
    function modifyMfpfJs() {
        var ibmmfpf_path = path.join(hookConsts.MFP_PLUGIN_DIR, 'src', hookConsts.BROWSER, hookConsts.IBMMFPF_JS_FILENAME);
        var replace;

        try {
            if (that.exists(ibmmfpf_path)) {
                replace = shell.grep('lib/messages', ibmmfpf_path);
                if (replace) {
                    logVerbose('Replacing path to messages directory in ' + ibmmfpf_path);
                    shell.sed('-i', /lib\/messages/g, 'messages', ibmmfpf_path);
                }
            }
        } catch (err) {
            logVerbose(err);
            throw externalizedStrings.unexpectedErr;
        }
    }

    /*
     Modifies ibmmfpf.js

     An error will be thrown if the hook fails.
     */
    this.invokeHook = function() {
        logVerbose('Performing before plugin install hook.');

        try {
            modifyMfpfJs();
        } catch (err) {
            throw strings.format(externalizedStrings.failedPluginInstall,
                hookConsts.BROWSER, err);
        }
    };
}

BrowserBeforePluginInstall.prototype = new Hook();
module.exports = BrowserBeforePluginInstall;
