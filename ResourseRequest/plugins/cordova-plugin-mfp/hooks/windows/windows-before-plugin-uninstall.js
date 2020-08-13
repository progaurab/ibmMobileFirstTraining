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
var log = require('npmlog');

// MFP modules
var hookConsts = require('./../utils/hook-consts');
var externalizedStrings = require('./../externalizedStrings');
var Hook = require('./../utils/hook');
var strings = require('ibm-strings');

/*
 This class provides the hook script functionality for before plugin uninstall
 for Windows.

 projectDirectory - Path to the project

 After the hook is executed, the MFP project will have been uninstalled.
 */
function WindowsBeforePluginUninstall(projectDirectory) {
	var projDir;        // Path to project
	var platformDir;    // Path to platform
    var that;           // References this

    Hook.apply(this);

    that = this;
	projDir = projectDirectory;
    platformDir = path.join(projectDirectory, 'platforms', hookConsts.WINDOWS);

    logSilly('Project directory: ' + projDir);
    logSilly('Platform directory: ' + platformDir);

    /*
    Displays a log silly message. The log level must be set to silly.

    message - The message to log
     */
    function logSilly(message) {
        log.silly(hookConsts.WINDOWS_BEFORE_PLUGIN_UNINSTALL, message);
    }

    /*
    Displays a log verbose message. The log level must be set to verbose.

    message - The message to log
     */
    function logVerbose(message) {
        log.verbose(hookConsts.WINDOWS_BEFORE_PLUGIN_UNINSTALL, message);
    }

    /*
    The mfpclient.properties file will be removed from the project.

    An error is thrown if the properties cannot be deleted.
     */
	function removePropertiesFile() {
        var propPath;       // Path to properties file

        logVerbose('Removing properties file.');

        propPath = path.resolve(platformDir, hookConsts.PROPS_PATH_WINDOWS);

        logSilly('Removing ' + propPath);
        that.deleteFile(propPath);
	}

    /*
    Removes mfpclient.properties will be removed.

    An error will be thrown if the hook fails.
     */
	this.invokeHook = function() {
        logVerbose('Performing before plugin uninstall hook.');

        try {
        	removePropertiesFile();
        } catch (err){
        	throw strings.format(externalizedStrings.failedPluginUninstall,
                hookConsts.WINDOWS, err);
        }
	};

}

WindowsBeforePluginUninstall.prototype = new Hook();
module.exports = WindowsBeforePluginUninstall;
