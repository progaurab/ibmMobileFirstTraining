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
var strings = require('ibm-strings');

// MFP modules
var hookConsts = require('./../utils/hook-consts');
var Hook = require('./../utils/hook');
var MFPConfig = require('mfp-config-xml').mfpConfigXMLAPI;
var externalizedStrings = require('./../externalizedStrings');

/*
This class provides the Windows hook script functionality for after plugin
install for Windows.

projectDirectory - Path to the project

After the hook is executed, the MFP plugin will have been installed.
 */
function WindowsAfterPluginInstall(projectDirectory) {
	var projDir;		// Path to project
	var platformDir;	// Path to platforms
	var mfpConfig;      // Config Xml API
	var that;			// References this

	Hook.apply(this);

	that = this;
	projDir = projectDirectory;
	platformDir = path.join(projectDirectory, 'platforms', hookConsts.WINDOWS);
	mfpConfig = new MFPConfig(path.join(projDir, hookConsts.CONFIG_XML),
		log.level);

	logSilly('Project directory: ' + projDir);
	logSilly('Platform directory: ' + platformDir);

	/*
	Displays a log silly message. The log level must be set to silly.

	message - The message to log
	 */
	function logSilly(message) {
		log.silly(hookConsts.WINDOWS_AFTER_PLUGIN_INSTALL, message);
	}

	/*
	Displays a log verbose message. The log level must be set to verbose.

	message - The message to log
	 */
	function logVerbose(message) {
		log.verbose(hookConsts.WINDOWS_AFTER_PLUGIN_INSTALL, message);
	}

	/*
	Copies WunAuthRT .winmd and .dll files to the proper architecture directory
	in the platform plugins directory.

	An error will be thrown if a file cannot be copied.
	 */
	function setupAuthFiles() {
		var srcDir;			    // Path to WinAuthRT source
		var origPath;			// Path to original WinAuthRT file
		var destPath;			// Path to destination WinAuthRT file

		srcDir = path.join(projDir, 'plugins', 'cordova-plugin-mfp', 'src',
			'windows');

		// Copy WinAuthRT files to Windows platform plugin  directory
		for (var i = 0; i < hookConsts.WIN_AUTH_RT.length; i++) {
			destPath = path.resolve(platformDir,
				hookConsts.WIN_AUTH_RT[i].DEST);

			for(var j = 0; j < hookConsts.WIN_AUTH_RT[i].SRC.length; j++) {
				origPath = path.join(srcDir,
					hookConsts.WIN_AUTH_RT[i].SRC[j]);

				that.copyFile(origPath, destPath);
			}
		}
	}

	/*
	Removes the "ANY CPU" build option from the Visual Studio build options.

	A error will be thrown if a the .sln cannot be read, or written.
	 */
	function removeAnyCPUArchitecture() {
		var slnPath;		// Path to solution file
		var content;		// Solution file content

		slnPath = path.join(platformDir, hookConsts.SLN_FILE);
		content = that.readFile(slnPath);
		content = content.replace(hookConsts.ANY_CPU_DEBUG, '');
		content = content.replace(hookConsts.ANY_CPU_RELEASE, '');
		that.writeFile(slnPath, content);
	}

	/*
	Sets up auth files, SDK checksum, and removes the .sln file.

	An error will be thrown if the hook fails.
	 */
	this.invokeHook = function() {
		logVerbose('Performing after plugin install hook.');

		try {
			setupAuthFiles();
			removeAnyCPUArchitecture();
		} catch (err) {
        	throw strings.format(externalizedStrings.failedPluginInstall,
				hookConsts.WINDOWS, err);
		}
	};
}

WindowsAfterPluginInstall.prototype = new Hook();
module.exports = WindowsAfterPluginInstall;
