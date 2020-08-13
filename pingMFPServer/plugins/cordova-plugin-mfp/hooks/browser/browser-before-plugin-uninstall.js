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
var log = require('npmlog');
var util = require('util');

// MFP modules
var Hook = require('./../utils/hook');
var hookConsts = require('./../utils/hook-consts');
var externalizedStrings = require('./../externalizedStrings');
var MFPConfig = require('mfp-config-xml').mfpConfigXMLAPI;
var strings = require('ibm-strings');

/*
This class provides the hook script functionality for abefore uninstall for
Browser.
projectDirectory - Path to the project
After the hook is executed, the MFP plugin will have been uninstalled.
 */
function BrowserBeforePluginUninstall(projectDirectory) {
    var projName;           // Project name
    var mfpConfig;          // MFP configuration
    var projDir;            // Path to project
    var platformDir;        // Path to platform
    var pluginDir;          // Path to platform specific plugins
    var that;               // References this

    Hook.apply(this);

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
        log.silly(hookConsts.BROWSER_BEFORE_PLUGIN_UNINSTALL, message);
    }

    /*
    Displays a log verbose message. The log level must be set to verbose.
    message - The message to log
     */
    function logVerbose(message) {
        log.verbose(hookConsts.BROWSER_BEFORE_PLUGIN_UNINSTALL, message);
    }

    //Restore original run script
    /*
	  The MFP specific run script will be removed, and replaced with the original.
  	An error will be thrown if run script cannot be moved.
	  */
	  function restoreRunScript() {
		  var runFile;			// Path to run
		  var runFileBackup;		// Path to backup run

		  log.verbose(hookConsts.BROWSER_BEFORE_PLUGIN_UNINSTALL,
			'Restoring Original run script.');

		  runFile = path.resolve(platformDir, 'cordova','run');
		  runFileBackup = runFile + hookConsts.BAK;

		  logSilly('Original run path: ' + runFileBackup);
		  
		  // Restore run.js to original from backup
		  if (that.exists(runFileBackup)) {
			    that.moveFile(runFileBackup, runFile);
          that.deleteFile(runFileBackup);
          
			console.log(
				  strings.format('Original run script {0} is restored.',
					runFileBackup)
			);      
  		}else
			  logVerbose('File not found: ' + runFileBackup);
    }

    /*
    Run script is replaced with its original.
	 */
	  this.invokeHook = function() {
		  log.verbose(hookConsts.BROWSER_BEFORE_PLUGIN_UNINSTALL,
			'Performing before plugin uninstall hook.');

		  try {
			  restoreRunScript();
		  } catch (err) {
			  throw strings.format(externalizedStrings.failedPluginUninstall,
				  hookConsts.BROWSER, err);
		  }
	};
}

BrowserBeforePluginUninstall.prototype = new Hook();
module.exports = BrowserBeforePluginUninstall;
