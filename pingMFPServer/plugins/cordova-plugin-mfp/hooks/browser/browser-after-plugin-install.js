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
This class provides the hook script functionality for after install for
Browser.
projectDirectory - Path to the project
After the hook is executed, the MFP plugin will have been uninstalled.
 */
function BrowserAfterPluginInstall(projectDirectory) {
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
        log.silly(hookConsts.BROWSER_AFTER_PLUGIN_INSTALL, message);
    }

    /*
    Displays a log verbose message. The log level must be set to verbose.
    message - The message to log
     */
    function logVerbose(message) {
        log.verbose(hookConsts.BROWSER_AFTER_PLUGIN_INSTALL, message);
    }

   /*			
   Replaces  run script with new file that suppresses the original cordova browser from launching.			
   */			
   function modifyRunExe()	{			
	logVerbose('Modifying run.exe to suppress cordova\'s proxy server\'s browser to launch.');			
				
	//Make a backup of original run script.			
	var wlRunScript = path.join(projDir, hookConsts.MFP_PLUGIN_DIR, 'src', 'browser','run');			
	var originalRunScript = path.join(platformDir,'cordova','run')			
	var runBackup = originalRunScript + hookConsts.BAK;
	that.copyFile(originalRunScript,runBackup);			
	   
	// Replace run.exe to avoid launch of browser running on cordova's proxy server			
	that.copyFile(wlRunScript,originalRunScript);   
	console.log('***The run script is being replaced to suppress cordova\'s default browser.***');			
	console.log('If you made changes to your run script(in cordova folder), manually merge run.bak with the run script that is provided with IBM MobileFirst Platform Foundation');			
    }

    /*
    Run script is replaced with its original.
	 */
	  this.invokeHook = function() {
		  log.verbose(hookConsts.BROWSER_AFTER_PLUGIN_INSTALL,
			'Performing after plugin install hook.');

		  try {
              modifyRunExe();
		  } catch (err) {
			  throw strings.format(externalizedStrings.failedPluginInstall,
				  hookConsts.BROWSER, err);
		  }
	};
}

BrowserAfterPluginInstall.prototype = new Hook();
module.exports = BrowserAfterPluginInstall;
