/*
   Licensed Material - Property of IBM

   (C) Copyright 2016 IBM Corp.

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
'use strict';

// Public modules
var fs = require('fs');
var path = require('path');
var nopt = require('nopt');
var log = require('npmlog');
var Q = require('q');

// Private modules
var MFPConfig = require('mfp-config-xml').mfpConfigXMLAPI
var consts = require('../hooks/utils/hook-consts');
var calcChecksum = require('./mfp-checksum'); // function checksumDir(dir)
var createChecksumJsFile = require('./mfp-create-checksumjs'); // function createChecksumJsFile(checksum, targetdir)

var ModuleName = 'mfp-checksum-cli';

// Hash map converts protocol -> relative path to the platform www/ folder
var platformToWwwFolderMapper = {};
platformToWwwFolderMapper[consts.ANDROID] = consts.WWW_DIR_ANDROID;
platformToWwwFolderMapper[consts.IOS]     = consts.WWW_DIR_IOS;
platformToWwwFolderMapper[consts.WINDOWS] = consts.WWW_DIR_WINDOWS;

// Hash map converts protocol -> relative path to the worklight/ folder under the platform www/ folder
var platformToChecksumJsFolderMapper = {};
platformToChecksumJsFolderMapper[consts.ANDROID] = consts.WORKLIGHT_DIR_ANDROID;
platformToChecksumJsFolderMapper[consts.IOS]     = consts.WORKLIGHT_DIR_IOS;
platformToChecksumJsFolderMapper[consts.WINDOWS] = consts.WORKLIGHT_DIR_WINDOWS;

// Used to indicate when the access() exception was thrown due to a missing MFP path
var mfpAccessCheck = false;

// Parse the CLI arguments
var cliOpts = nopt({
  path: String,
  platforms: String,
  debug: Boolean,
  ddebug: Boolean
}, {
  p: '--path',
  l: '--platforms',
  d: '--debug',
  dd:'--ddebug',
});

if (cliOpts.debug) {
    log.level = 'verbose';
}
if (cliOpts.ddebug) {
    log.level = 'silly';
}

var appPath = cliOpts.path;
var platforms = (cliOpts.platforms && cliOpts.platforms.trim().split(',')) || null;

log.silly(ModuleName, 'opts = '+JSON.stringify(cliOpts));
log.silly(ModuleName, 'path = '+appPath);
log.silly(ModuleName, 'platforms = '+platforms);

// Verifies the specified path exists
// Returns nothing.  Throws an error if path is not accessible
function _accessSync(path) {
    if (fs.accessSync) {
        fs.accessSync(path);  // Throws error if path does not exist
    }
    else {
        if (!fs.existsSync(path)) {
            throw new Error(path+' does not exist');
        }
    }
}

//
// Calculate the checksum for a specific platform web resources folder
// and generate the assocated checksum.js file and place in in the
// appropriate sub folder underneath the platform www/ folder.
// 
//   appPath - String. Fully qualified path to the application folder
//             Directly underneath this folder will be the platforms/ folder
//   platform - String.  One of 'android', 'ios', or 'windows'
// 
function _checksum(appPath, platform, mfpConfig) {
    // Make sure the platform is valid
    if (!platformToWwwFolderMapper[platform]) {
        throw new Error('Non existent platform \''+platform+'\'');
    }

    // Calculate the checksum
    log.verbose(ModuleName, '_checksum: Calculating checksum for platform \''+platform+'\'');
    var checksumWwwFolder = path.join(appPath, platformToWwwFolderMapper[platform]);
    _accessSync(checksumWwwFolder);  // Throws err if path is undefined or does not exist
    var checksumObj = calcChecksum(checksumWwwFolder);
    log.verbose(ModuleName, '_checksum: Platform '+platform+' checksum = '+checksumObj.checksum+' size = '+checksumObj.size);

    // Generate the checksum.js file
    log.verbose(ModuleName, '_checksum: Generating checksum.js file for platform \''+platform+'\'');
    var checksumJsFolder = path.join(appPath, platformToChecksumJsFolderMapper[platform]);
    mfpAccessCheck = true;
    _accessSync(checksumJsFolder);  // Throws err if path is undefined or does not exist
    mfpAccessCheck = false;
    var cksumFileOk = createChecksumJsFile(checksumObj.checksum, checksumJsFolder);
    if (cksumFileOk) {
        log.verbose(ModuleName, '_checksum: Platform '+platform+' checksum file created');

        // Update the config.xml with the app checksum
        log.silly(ModuleName, 'Writing SDK checksum to config.xml: ' + checksumObj.checksum);
        mfpConfig.setMFPAppChecksum(checksumObj.checksum, platform);
        mfpConfig.writeToFile();   
    }
    else {
        log.verbose(ModuleName, '_checksum: Failed to create checksum.js file in '+checksumJsFolder);
        throw new Error('Unable to create checksum.js for \''+platform+'\' in '+checksumJsFolder);
    }
}

try {
    _accessSync(appPath);  // Throws err if path is undefined or does not exist

    // Initialize the app's config object used for accessing the config.xml file
    var mfpConfig = new MFPConfig(path.join(appPath, consts.CONFIG_XML), log.level);

    // For each platform, calc the checksum, create the checksum.js file, and
    // update the config.xml with the app checksum value
    if (platforms) {
        platforms.forEach( function(platform,i,a) { _checksum(appPath, platform.trim(), mfpConfig); });
    }
    else {
        log.verbose(ModuleName, 'No platforms specified');
    }
    process.exit(0);
}
catch(err) {
    log.verbose(ModuleName, 'Exception caught: '+err);
    log.silly(ModuleName, err.stack);

    // If the perpared www/ folder does not have the expected MFP file structure,
    // exit with a different failure code to allow the caller to distinguish
    // this failure.
    var exitCode = -1;
    if (mfpAccessCheck) {
        exitCode = -2;
    }
    log.verbose(ModuleName, 'Exiting with failure exit code: '+exitCode);
    process.exit(exitCode);
}

