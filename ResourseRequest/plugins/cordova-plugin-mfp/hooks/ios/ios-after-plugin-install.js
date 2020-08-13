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
var fs = require('fs');
var os = require('os');

// MFP modules
var externalizedStrings = require('./../externalizedStrings');
var hookConsts = require('./../utils/hook-consts');
var Hook = require('./../utils/hook');
var MFPConfig = require('mfp-config-xml').mfpConfigXMLAPI;
var strings = require('ibm-strings');

/*
This class provides the Android hook script functionality for after plugin
install for iOS.

projectDirectory - Path to the project

After the hook is executed, the MFP plugin will have been installed.
 */
function IOSAfterPluginInstall(projectDirectory) {
	var projDir;		// Path to project
	var pluginDir;		// Path to MFP plugin
	var platformDir;	// Path to platform
	var projName;		// Project name
	var mfpConfig;		// MFP configuration
	var that;			// References this

	Hook.apply(this);

	that = this;
	projDir = projectDirectory;
	pluginDir = path.join(projDir, hookConsts.MFP_PLUGIN_DIR);
	platformDir = path.join(projectDirectory, 'platforms', hookConsts.IOS);
	mfpConfig = new MFPConfig(path.join(projDir, hookConsts.CONFIG_XML),
		log.level);
	projName = mfpConfig.getWidgetName();

	logSilly('Project directory: ' + projDir);
	logSilly('Plugin directory: ' + pluginDir);
	logSilly('Project name: ' + projName);
	logSilly('Platform directory: ' + platformDir);

	/*
	Displays a log silly message. The log level must be set to silly.

	message - The message to log
	 */
	function logSilly(message) {
		log.silly(hookConsts.IOS_AFTER_PLUGIN_INSTALL, message);
	}

	/*
	Displays a log verbose message. The log level must be set to verbose.

	message - The message to log
	 */
	function logVerbose(message) {
		log.verbose(hookConsts.IOS_AFTER_PLUGIN_INSTALL, message);
	}

	/*
	The project's AppDelegate.m will be overwritten with an MFP specific version. The
	old file will be backed up.

	An error will be thrown if AppDelegate.m cannot be copied.
	 */
	function updateAppDelegateActivity() {
		var wlAppDelegateFile;			// Path to MFP plugin AppDelegate.m
		var cdvAppDelegateFile;		// Path to app's AppDelegate.m
		var cdvAppDelegateFileBackup;	// Path to AppDelegate.m backup

		logVerbose('Updating AppDelegateActivity.');

        wlAppDelegateFile = path.join(pluginDir, 'src', 'ios', 'AppDelegate.m');
		cdvAppDelegateFile = path.join(platformDir, projName, 'Classes',hookConsts.APPDELEGATE_M);
        cdvAppDelegateFileBackup = cdvAppDelegateFile + hookConsts.BAK;

        // Make a backup of AppDelegate.m before replacing with Worklight's version
        if (!that.exists(cdvAppDelegateFileBackup))
			that.copyFile(cdvAppDelegateFile, cdvAppDelegateFileBackup);
        else
			logSilly('A back up of AppDelegate.m already exists.');

		that.copyFile(wlAppDelegateFile, cdvAppDelegateFile);
        console.log(strings.format(externalizedStrings.manuallyMergeAppDelegateM, 
            path.join(platformDir, projName)));
	}

    /*
    Adds a flag to platforms/ios/cordova/build.xcconfig to remove several warnings.
     */
    function editBuildXcconfig(){
        var buildConfigFile;       // build.xcconfig file

        logVerbose('Appending \'DEBUG_INFORMATION_FORMAT = dwarf\' to platforms/ios/cordova/build.xcconfig');

        buildConfigFile = path.join(projDir, 'platforms', 'ios', 'cordova',
            'build.xcconfig');
        fs.appendFileSync(buildConfigFile, os.EOL + 'DEBUG_INFORMATION_FORMAT = dwarf');
    }

    /*
    Adds any extra files to the project.

    -buildtime.sh

     */
    function addExtraFiles(){

        logVerbose('Adding buildtime.sh to project');

        var srcFile = path.join(pluginDir, 'src', 'ios', 'buildtime.sh');
        if(fs.existsSync(srcFile)) {
            that.copyFile(srcFile, platformDir);
        }
        else {
            logSilly('buildtime.sh doesn\'t exist in plugin');
        }
    }

	/*
	The AppDelegate.m file will be updated, and MFP specific plugin files will be
	setup.

	An error will be thrown if the hook fails.
	 */
	this.invokeHook = function() {
		logVerbose('Performing after plugin install hook.');

		try {
            editBuildXcconfig();
	        updateAppDelegateActivity();
            addExtraFiles();
		} catch (err){
        	throw strings.format(externalizedStrings.failedPluginInstall,
				hookConsts.IOS, err);
		}
	};

}

IOSAfterPluginInstall.prototype = new Hook();
module.exports = IOSAfterPluginInstall;
