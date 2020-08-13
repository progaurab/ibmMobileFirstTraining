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
var Hook = require('./../utils/hook');
var hookConsts = require('./../utils/hook-consts');
var externalizedStrings = require('./../externalizedStrings');
var strings = require('ibm-strings');

/*
This class provides the hook script functionality for before prepare for
Windows.

projDirectory - Path to the project

After the hook is executed, the MFP project will have been ready for prepare.
 */
function WindowsBeforePrepare(projectDirectory) {
	var projDir;		// Path to project
	var platformDir;	// Path to platform
	var that;           // References this

	Hook.apply(this);

	that = this;
	projDir = projectDirectory;
	platformDir = path.join(projDir, 'platforms', hookConsts.WINDOWS);

	logSilly('Project directory: ' + projDir);
	logSilly('Platform directory: ' + platformDir);

	/*
	Displays a log silly message. The log level must be set to silly.

	message - The message to log
	 */
	function logSilly(message) {
		log.silly(hookConsts.WINDOWS_BEFORE_PREPARE, message);
	}

	/*
	Displays a log verbose message. The log level must be set to verbose.

	message - The message to log
	 */
	function logVerbose(message) {
		log.verbose(hookConsts.WINDOWS_BEFORE_PREAPRE, message);
	}

	/*
	Backs up the filelist.

	The filelist will be moved to the platform directory, so it can be restored
	after prepare.
	 */
	function backupFileList() {	
	    var fileListPath;			// Path to filelist
		var fileListBackupPath;		// Backup path for filelist

	    fileListPath = path.resolve(platformDir,
			hookConsts.FILE_LIST_PATH_WINDOWS);
		fileListBackupPath = path.resolve(platformDir, hookConsts.FILE_LIST);

		// Backup the filelist if it exists
	    if (that.exists(fileListPath)) {
			logSilly('Backuping up ' + fileListPath + ' to ' +
				fileListBackupPath);
			that.moveFile(fileListPath, fileListBackupPath);
		} else
			logSilly('Skip backing up: ' + fileListPath);
	}

	/*
	Backs up the filelist.

	An error will be thrown if the hook fails.
	 */
	this.invokeHook = function() {
		logVerbose('Performing before prepare hook.');

		try {
			backupFileList();
		} catch (err) {
			throw strings.format(externalizedStrings.failedPluginPrepare,
				hookConsts.WINDOWS, err);
		}
	};

}

WindowsBeforePrepare.prototype = new Hook();
module.exports = WindowsBeforePrepare;