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
var fs = require('fs');
var path = require('path');
var log = require('npmlog');

// MFP modules
var externalizedStrings = require('../externalizedStrings');
var hookConsts = require('../utils/hook-consts');

/*
This class serves as an abstract class for an MFP hook script.
 */
function MFPHook() {

}

/*
Determines the installed platforms.

platformDir - Path to the platform directory

An array of platforms is returned returned. If no platforms are installed, an
empty array is returned.
 */
MFPHook.prototype.getInstalledPlatforms = function(platformDir) {
    var installedPlatforms; // Platforms array

    installedPlatforms = [];

    // Attempt to get all of the installed platforms
    try {
        installedPlatforms = fs.readdirSync(platformDir);

        // Filter files from the platform array
        installedPlatforms = installedPlatforms.filter(function (value) {
            return fs.lstatSync(path.join(platformDir, value)).isDirectory();
        });

        log.silly(hookConsts.MFP_HOOK, 'Platforms: ' + installedPlatforms);
    } catch (err) {
        log.verbose(hookConsts.MFP_HOOK, err);
    }

    return installedPlatforms;
};

/*
Determines if the --preview argument is present. If it is, true is returned.
Otherwise, false is returned. Also, args must be passed to the method.

args - User arguments
 */
MFPHook.prototype.isPreview = function(args) {
    var preview;    // Resultant preview flag

    preview = false;

    // Determine if preview is present
    if (args.indexOf('--preview') > -1)
        preview = true;

    return preview;
};


/*
Determines if the --mfpwebencrypt argument is present. If it is, true is returned.
Otherwise, false is returned. Also, args must be passed to the method.

args - User arguments
 */
MFPHook.prototype.isWebResourceEncrypt = function(args) {
    var webResourceEncrypt;    // Resultant web resource encryption flag

    webResourceEncrypt = false;

    // Determine if mfpwebencrypt option is present
    if (args.indexOf('--mfpwebencrypt') > -1)
        webResourceEncrypt = true;

    return webResourceEncrypt;
};

/*
Set the npmlog level from arguments. If a -d is present, verbose logging is
enabled. If a -dd is present, silly logging is enabled. Arguments must be
passed to the method.
 */
MFPHook.prototype.setLogLevel = function (args) {

    // Determine if verbose logging should be enabled
    if (args.indexOf('-d') > -1)
        log.level = hookConsts.VERBOSE;

    // Determine if silly logging should be enabled
    if (args.indexOf('-dd') > -1)
        log.level = hookConsts.SILLY;
};

/*
Returns the arguments from the Cordova cmdLine variable. The cmdLine must be
passed to the method.
 */
MFPHook.prototype.getArguments = function (cmdLine) {
    var args;       // User arguments

    args = cmdLine.split(path.sep).pop();

    return args;
};

module.exports = MFPHook;
