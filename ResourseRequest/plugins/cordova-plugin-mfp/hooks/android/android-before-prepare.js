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
var et = require('elementtree');
var shell = require('shelljs');
var util = require('util');

// MFP modules
var Hook = require('./../utils/hook');
var hookConsts = require('./../utils/hook-consts');
var externalizedStrings = require('./../externalizedStrings');
var MFPConfig = require('mfp-config-xml').mfpConfigXMLAPI;
var strings = require('ibm-strings');

/*
This class provides the hook script functionality for before prepare for
Android.
projDirectory - Path to the project
After the hook is executed, the MFP project will have been ready for prepare.
 */
function AndroidBeforePrepare(projectDirectory) {
    var projDir;        // Path to project
    var platformDir;    // Path to platform
  var mfpConfig;      // MFP configuration
    var that;           // References this

    Hook.apply(this);

    that = this;
    projDir = projectDirectory;
  var  isVerAndroid7=getAndroidVersion();

      if (isVerAndroid7){
    
         platformDir = path.join(projDir, 'platforms', hookConsts.ANDROID_GT_EQ_7);
      }else{
    
        platformDir = path.join(projDir, 'platforms', hookConsts.ANDROID);
      }
   
    mfpConfig = new MFPConfig(path.join(projDir, 'config.xml'), log.level);
   
       logSilly('Project directory: ' + projDir);
       logSilly('Platform directory: ' + platformDir);

    /*
    Displays a log silly message. The log level must be set to silly.
    message - The message to log
     */
    function logSilly(message) {
        log.silly(hookConsts.ANDROID_BEFORE_PREPARE, message);
    }

    /*
    Displays a log verbose message. The log level must be set to verbose.
    message - The message to log
     */
    function logVerbose(message) {
        log.verbose(hookConsts.ANDROID_BEFORE_PREPARE, message);
    }

    /*
    Backs up the filelist.
    The filelist will be moved to the platform directory, so it can be restored
    after prepare.
     */
    function backupFileList() {
        var fileListPath;           // Path to filelist
        var fileListBackupPath;     // Backup path for filelist

        fileListPath = path.resolve(platformDir,
            hookConsts.FILE_LIST_PATH_ANDROID);
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
    Makes a data object of the Android package IDs and AndroidManifest.
    Returns an object with the Android data.
    An error is thrown if AndroidManifest.xml cannot be read.
     */
    function getAndroidData() {
        var manifestContent;        // AndroidManifest.xml content
        var manifest;               // XML parsed AndroidManifest.xml
        var data;                   // Resultant Android data

        logVerbose('Getting Android data.');

        data = {};
        manifestContent = that.readFile(path.join(platformDir,
            hookConsts.ANDROID_MANIFEST_XML)).toString();
        
       
       
        manifest = et.parse(manifestContent);
    
        data.manifest = manifest;
        data.oldPackageName = manifest.getroot().attrib.package;
        data.newPackageName = mfpConfig.getWidgetId();
        data.oldPackageDir = path.join(platformDir, 'src',
            path.join.apply(null, data.oldPackageName.split('.')));
        data.newPackageDir = path.join(platformDir, 'src',
            path.join.apply(null, data.newPackageName.split('.')));

        logSilly('Manifest file: ' + manifestContent);
        logSilly('Manifest: ' + util.inspect(manifest));
        logSilly('Package data: ' + util.inspect(data));

        return data;
    }


     /*check the  cordova-android version*/
   function getAndroidVersion(){
 
            var nodeModulePath;//path to node_module folder
            var flag=false;//set to true if cordova android version is >=7
            var cordovaAndroidVersion;
        try {
            nodeModulePath=path.join(projectDirectory,hookConsts.NODE_MODULES);
           
            if(that.exists(nodeModulePath)){
            
            cordovaAndroidVersion=that.readFile(path.join(projectDirectory,hookConsts.NODE_MODULES));
            cordovaAndroidVersion=parseInt(cordovaAndroidVersion);

            if(cordovaAndroidVersion>=7){
              flag=true;
            }
        }
          return flag;

          }catch (err) {
              throw strings.format(externalizedStrings.failedPluginInstall,
                    hookConsts.ANDROID, '/n error is : ' ,err.message);
        }
    }

    /*
    Updates the Java src files if the package ID was modified in the
    config.xml. Will update the package ID in each Java file and move
    the file to its new src directory.
    data - data object containing information about the package IDs
    Throws an error if getting list of src files fails or moving the
    Java files fails.
     */
    function updatePackageId(data) {
        var oldFilePath;                // Path of src file in the old directory
        var newFilePath;                // Path of src file in the new directory
        var mainActivity;               // Denotes MainActivity
        var oldPackageDirectoryFiles;   // Files in package directory

        logVerbose('Determining if package ID has changed.');

        // If the package ID has changed, update Java src files
        if (data.oldPackageName !== data.newPackageName) {
            logVerbose('Updating package ID.');

            // Only update a specific set of files
            oldPackageDirectoryFiles = hookConsts.UPDATE_JAVA_SRC;

            logSilly('Old package directory files: ' +
                oldPackageDirectoryFiles);

            oldPackageDirectoryFiles.forEach(
                function(file) {
                    // Update the package ID
                    oldFilePath = path.resolve(data.oldPackageDir, file);
                    newFilePath = path.resolve(data.newPackageDir, file);

                    // Checks that the file exists before updating
                    if (that.exists(oldFilePath)) {
                        logSilly('Old file path: ' + oldFilePath);
                        logSilly('New file path: ' + newFilePath);

                        shell.sed('-i', /package.*;/, 'package ' +
                            data.newPackageName + ';', oldFilePath);

                        that.moveFile(oldFilePath, newFilePath);
                    }
                }
            );
        }
    }

    /*
    Backs up the filelist.
    Updates Java src files if package ID was modified in the config.xml.
    An error will be thrown if the hook fails.
     */
    this.invokeHook = function() {
        var androidData;        // AndroidMainifest.xml data

        logVerbose('Performing before prepare hook.');

        try {
            backupFileList();
            androidData = getAndroidData();
            updatePackageId(androidData);
            
        }catch (err) {
            throw strings.format(externalizedStrings.failedPluginPrepare,
                hookConsts.ANDROID, err);
        }
    };

}

AndroidBeforePrepare.prototype = new Hook();
module.exports = AndroidBeforePrepare;