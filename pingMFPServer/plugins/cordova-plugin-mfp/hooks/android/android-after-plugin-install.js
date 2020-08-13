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
var shell = require('shelljs');
var path = require('path');
var et = require('elementtree');
var strings = require('ibm-strings');
var log = require('npmlog');
var util = require('util');

// MFP modules
var externalizedStrings = require('./../externalizedStrings');
var hookConsts = require('./../utils/hook-consts');
var Hook = require('./../utils/hook');
var MFPConfig = require('mfp-config-xml').mfpConfigXMLAPI;

/*
This class provides the Android hook script functionality for after plugin
install for Android.
projectDirectory - Path to the project
After the hook is executed, the MFP plugin will have been installed.
 */
function AndroidAfterPluginInstall(projectDirectory) {
	var projDir;		// Path to project
	var platformDir;	// Path to platforms
	var mfpConfig;      // Config Xml API
	var that;			// References this
   
	Hook.apply(this);
   
	that = this;
  	projDir = projectDirectory;
	var  isVerAndroid7=getAndroidVersion();//checks if cordova-android version is >=7
   if(isVerAndroid7){
	  platformDir = path.join(projectDirectory, 'platforms', hookConsts.ANDROID_GT_EQ_7);
	}else{
		 platformDir = path.join(projectDirectory, 'platforms', hookConsts.ANDROID);
		 
	}
	mfpConfig = new MFPConfig(path.join(projDir, hookConsts.CONFIG_XML),log.level);

	logSilly('Project directory: ' + projDir);
	logSilly('Platform directory: ' + platformDir);

	/*
	Displays a log silly message. The log level must be set to silly.
	message - The message to log
	 */
	function logSilly(message) {
		log.silly(hookConsts.ANDROID_AFTER_PLUGIN_INSTALL, message);
	}

	/*
	Displays a log verbose message. The log level must be set to verbose.
	message - The message to log
	 */
	function logVerbose(message) {
		log.verbose(hookConsts.ANDROID_AFTER_PLUGIN_INSTALL, message);
	}

	/*
	 Makes a data object of the Android package IDs and AndroidManifest.
	 Returns an object with the Android data.
	 An error is thrown if AndroidManifest.xml cannot be read.
	 */
	function getAndroidData() {
		var manifestContent;		// AndroidManifest.xml content
		var manifest;				// XML parsed AndroidManifest.xml
		var data;			        // Resultant Android data

		logVerbose('Getting Android data.');

		data = {};
		manifestContent = that.readFile(path.join(platformDir,
			hookConsts.ANDROID_MANIFEST_XML)).toString();
		manifest = et.parse(manifestContent);
	    data.manifest = manifest;
		data.packageName = manifest.getroot().attrib.package;
	
		if(isVerAndroid7){
	
		data.packageDir = path.join(platformDir,'java',
			path.join.apply(null, data.packageName.split('.')));
          }else{
        
		data.packageDir = path.join(platformDir, 'src',
			path.join.apply(null, data.packageName.split('.')));
	      }
		

		logSilly('Manifest file: ' + manifestContent);
		logSilly('Manifest: ' + util.inspect(manifest));
		logSilly('Package data: ' + util.inspect(data));

		return data;
	}
   /*checks the  cordova-android version*/
   function getAndroidVersion(){

            var nodeModulePath;//path to node_modules folder
            var flag=false; //set to true if cordova android version >=7
            var cordovaAndroidVersion; //cordova android version 
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
     Finds, and returns the name of the MainActivity file. A package directory
     must be passed. If the MainActivity file is not found an empty string is
     returned.
     An error will be thrown if the package directory cannot be read, or if Java
     files cannot be read.
	 */
	function getMainActivityName(packageDirectory) {
		var packageDirectoryFiles;	// Files in package directory
		var javaFiles;				// Java files that may be MainActivity.java
		var mainActivityFile;		// MainActivity file
		var content;				// MainActivity content

		logVerbose('Getting MainActivity.');

		mainActivityFile = '';
		packageDirectoryFiles = that.readDir(packageDirectory);

		logSilly('Files in package directory: ' + packageDirectoryFiles);
        
		// Finds java files that could be the CordovaActivity
		packageDirectoryFiles = packageDirectoryFiles.filter(
			function(fileName) {
				try {
					content = that.readFile(path.join(packageDirectory,
						fileName));

					return fileName.indexOf('.svn') === -1 &&
							fileName.indexOf('.java') >= 0 &&
							content.match(/extends\s+CordovaActivity/);
				} catch (err) {
					logVerbose(err);
					throw externalizedStrings.unexpectedErr;
				}
			}
		);

		javaFiles = [];
		javaFiles = javaFiles.concat(packageDirectoryFiles);

		logSilly('Possible MainActivity files: ' + javaFiles);

		// Picks the first file found as the main the MainActivity
		if (javaFiles.length > 1) {
			mainActivityFile = javaFiles[0];

			console.log(strings.format(externalizedStrings.multipleMainAct,
				mainActivityFile));
		} else if (javaFiles.length === 1)
			mainActivityFile = javaFiles[0];
		else
			console.log(externalizedStrings.noMainAct);

		logSilly('MainActivity: ' + mainActivityFile);

		return mainActivityFile;
	}

	/*
	Copies MFP specific Java files into the app.
	An error will be thrown if a file cannot be copied, or read.
	 */
	function setupMFPJavaFiles(packageDirectory, packageName) {
		var srcDir;					// Path to MFP plugin source
		var origSrcPath;			// Path to original Java source file
		var destSrcPath;			// Path to destination Java source file

		logVerbose('Setting up MFP Java files.');

		srcDir = path.join(projDir, 'plugins', 'cordova-plugin-mfp',
			'src', 'android');

		logSilly('Source directory: ' + srcDir);

		// Copy MFP src files to Android src package directory, and replace
		// package name in src files
		for (var i = 0; i < hookConsts.MFP_JAVA_SRC.length; i++) {
			origSrcPath = path.join(srcDir, hookConsts.MFP_JAVA_SRC[i]);
			destSrcPath = path.resolve(packageDirectory,
				hookConsts.MFP_JAVA_SRC[i]);
         
			logSilly('Original source path: ' + origSrcPath);
			logSilly('Destination source path: ' + destSrcPath);

			that.copyFile(origSrcPath, destSrcPath);

			try {
				shell.sed('-i', 'package ${packageName}', 'package ' +
					packageName, destSrcPath);
			} catch (err) {
				logVerbose(err);
				throw externalizedStrings.unexpectedErr;
			}

			logSilly('Java source file path: ' + destSrcPath);
			logSilly('Original Java source: ' + that.readFile(origSrcPath));
			logSilly('Modified Java source' + that.readFile(destSrcPath));
		}
	}

	/*
	Backs up the original MainActivity.java as MainActivity.original, and
	replaces the original with one that enables the MFP functionality.
	An error will be thrown of MainActivity.java cannot be renamed, or updated.
	 */
	function updateMainActivity(packageDirectory, mainActivityFile) {
		var mainActivityPath;		// Path to MainActivity.java

		logVerbose('Updating MainActivity');

		mainActivityPath = path.resolve(packageDirectory, mainActivityFile);

		that.rename(mainActivityPath, path.resolve(packageDirectory,
				hookConsts.MAIN_ACTIVITY_ORIG));
		that.rename(path.join(packageDirectory, hookConsts.CORDOVA_APP_JAVA),
			mainActivityPath);

		try {
			shell.sed('-i', 'public class CordovaApp',
				hookConsts.PUBLIC_CLASS + mainActivityFile.slice(0, -5),
				mainActivityPath);
		} catch (err){
			logVerbose(err);
			throw externalizedStrings.unexpectedErr;
		}

		logSilly('Modified MainActivity: ' + that.readFile(mainActivityPath));
		console.log(strings.format(externalizedStrings.manuallyMergeMainAct,
			mainActivityFile, packageDirectory));
	}

	/*
	Removes app_name, launcher_name, and activity_name strings from the
	mfp-strings.xml files.
	An error will be thrown if the XML cannot be updated.
	 */
	function removeConflictXML() {
		var filePath;		// XML file path
		var srcTree;		// Source XML tree
		var elem;			// XML element

		logVerbose('Removing conflicting XML.');

		// Iterate over the files and remove app_name, launcher_name,
		// and activity_name strings.
		for (var i = 0; i < hookConsts.XML_STRINGS.length; i++) {
			filePath = path.resolve(platformDir, hookConsts.XML_STRINGS[i]);
			srcTree = that.parseXML(filePath);
             
			// Remove the string elements with names from the array if they
			// exist.
			for (var j = 0; j < hookConsts.XML_STRINGS_REMOVED_VALUES.length;
				 j++) {
				elem = srcTree.find('.//string[@name=\'' +
				hookConsts.XML_STRINGS_REMOVED_VALUES[j] + '\']');

				// Remove the element if it exists
				if (elem != null) {
					logSilly('Removing ' + elem + ' from ' + filePath);
					srcTree.getroot().remove(elem);
				}
			}

			that.writeXML(srcTree, filePath);
		}
	}

	/*
	The MainActivity.java will be updated to enable MFP, conflicting
	strings in mfp-strings will be removed, SDK checksum will be set, and MFP
	Java file wills be setup.
	An error will be thrown if the hook fails.
	 */
	this.invokeHook = function() {
		var androidData;			// AndroidManifest.xml data
		var mainActivityFile;		// Name of MainActivity

		logVerbose('Performing after plugin install hook.');

		try {
			androidData = getAndroidData();
			mainActivityFile = getMainActivityName(androidData.packageDir);

			// Throw an error if MainActivity wasn't found
			if (!mainActivityFile) {
				logVerbose('Cound not get MainActivity');
				throw externalizedStrings.unexpectedErr;
			}

			setupMFPJavaFiles(androidData.packageDir,
				androidData.packageName);

			updateMainActivity(androidData.packageDir, mainActivityFile);
			removeConflictXML();
		} catch (err) {
        	throw strings.format(externalizedStrings.failedPluginInstall,
				hookConsts.ANDROID, err);
		}
	};
}

AndroidAfterPluginInstall.prototype = new Hook();
module.exports = AndroidAfterPluginInstall;