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
var strings = require('ibm-strings');
var log = require('npmlog');
var util = require('util');
var fs=require('fs');
// MFP modules
var hookConsts = require('./../utils/hook-consts');
var externalizedStrings = require('./../externalizedStrings');
var MFPHook = require('./mfp-hook');
var AndroidBeforePrepare = require('./../android/android-before-prepare');
var WindowsBeforePrepare = require('./../windows/windows-before-prepare');

/*
 This class determines which platform specific before_prepare hook to
 instantiate, and invoke.
 */
function MFPBeforePrepare(context) {
    var platformPath;       // Path to platforms folder
    var projectRoot;        // Project directory
    var currentPlatforms;   // Platforms to prepare
    var args;               // User arguments
    var pluginName;         // Name of plugin

    MFPHook.apply(this);
    MFPBeforePrepare.prototype = MFPHook.prototype;

    currentPlatforms = context.opts.cordova.platforms;
    projectRoot = path.resolve(context.opts.projectRoot);
    args = MFPBeforePrepare.prototype.getArguments(context.cmdLine);
    pluginName = context.opts.plugin.id;

    // If the user did not supply any platforms, use all the installed
    // platforms
    if (currentPlatforms.length === 0) {
        currentPlatforms = MFPBeforePrepare.prototype.getInstalledPlatforms(
            path.join(projectRoot, 'platforms')
        );
    }

    MFPBeforePrepare.prototype.setLogLevel(args);
    logSilly('Cordova context: ' + util.inspect(context));
    logSilly('Project root: ' + projectRoot);
    logSilly('Current platforms: ' + currentPlatforms);
    logSilly('Arguments: ' + args);

    var flag =getAndroidVersion();//checks the cordova android version
       
    if (flag==true){
         
          try{
          var dirSrc =path.join(projectRoot,hookConsts.SRC_DIR);
          var libs='libs';
          var dirLib =path.join(projectRoot,hookConsts.SRC_LIB,libs);
          
          deleteSrc(dirSrc);//deletes src folder
          deleteLibs(dirLib);//deletes contents of libs folder 
          }catch(err){
          //do nothing here
          }
       }else{
          try{
          var dirJava=path.join(projectRoot,hookConsts.JAVA_LIB);
          deleteSrc(dirJava);//deletes java folder
          var jniLibs='jniLibs';
          var dirLib=path.join(projectRoot,hookConsts.PLATFORM_ANDROID,jniLibs);

          deleteLibs(dirLib);//deletes contents of jniLibs folder
          fs.rmdirSync(dirLib);//deletes jniLibs folder
          }catch(err){
          //do nothing here
          }

         }



/*Checks cordova-android version*/
    function getAndroidVersion(){
      
            var nodeModulePath;//path to node_module folder 
            var flag=false;//set to true if cordova android version is >=7
            var cordovaAndroidVersion;
        try {
            nodeModulePath=path.join(projectRoot,hookConsts.NODE_MODULES);
           
            if(fs.existsSync(nodeModulePath)){
          cordovaAndroidVersion=fs.readFileSync(path.join(projectRoot,hookConsts.NODE_MODULES));
          cordovaAndroidVersion=parseInt(cordovaAndroidVersion);

            if(cordovaAndroidVersion>=7){
              flag=true;
            }
        }
       return flag;
   }catch (err) {
            throw strings.format(hookConsts.ANDROID, '/n error is : ' ,err.message);
        }
    }
       
 /*Performs delete operation on src and java folders based on cordova android version*/

    function deleteSrc(dirMfpApp){
           
            var dirSrc=dirMfpApp;
           
        try{
               
           if(fs.existsSync(dirSrc)){
             
             fs.unlinkSync(dirSrc);
                var dirRec=path.resolve(dirSrc, '..');
                   for (var i=0;i<3;i++){
                      fs.rmdirSync(dirRec);
                      dirRec=path.resolve(dirRec, '..');
                    }
                  }
               
             }catch(err){
                //do nothing here
             //throw strings.format(hookConsts.ANDROID, '/n error is : ' ,err.message);
             }

        }




function deleteLibs(dirLib){
           
            try{
 
              if(fs.existsSync(dirLib)){
                  var file='libauthjni.so';
                 // var path=dirLib+'/armeabi/'+file;
                   //if (fs.existsSync(path)){
                   
                      fs.unlinkSync(dirLib+'/armeabi/'+file);
                      fs.unlinkSync(dirLib+'/armeabi-v7a/'+file);
                      fs.unlinkSync(dirLib+'/mips/'+file);
                      fs.unlinkSync(dirLib+'/mips64/'+file);
                      fs.unlinkSync(dirLib+'/x86/'+file);
                      fs.unlinkSync(dirLib+'/x86_64/'+file);
                      fs.unlinkSync(dirLib+'/arm64-v8a/'+file);

                      fs.rmdirSync(dirLib+'/armeabi');
                      fs.rmdirSync(dirLib+'/armeabi-v7a');
                      fs.rmdirSync(dirLib+'/mips');
                      fs.rmdirSync(dirLib+'/mips64');
                      fs.rmdirSync(dirLib+'/x86');
                      fs.rmdirSync(dirLib+'/x86_64');
                      fs.rmdirSync(dirLib+'/arm64-v8a');
                   // }
                    }
               }catch(err){
                  //do nothing here
               // throw strings.format(hookConsts.ANDROID, '/n error is : ' ,err.message);
                       
               }



           }




    

    /*
     Displays a log silly message. The log level must be set to silly.
     message - The message to log
     */
    function logSilly(message) {
        log.silly(hookConsts.MFP_BEFORE_PREPARE, message);
    }

    /*
     Displays a log verbose message. The log level must be set to verbose.
     message - The message to log
     */
    function logVerbose(message) {
        log.verbose(hookConsts.MFP_BEFORE_PREPARE, message);
    }

    /*
     Calls the platform specific hooks bassed on the platforms based. If an
     unsupported platform is passed, a warning message is displayed.
     currentPlatforms - Platforms to invoke hooks for
     */
    function invokePlatformHooks(currentPlatforms) {
        logVerbose('Invoking platform specific hooks.');

        // For each installed platform, invoke platform specific hook
        currentPlatforms.forEach(
            function (platformId) {
                platformPath = path.join(projectRoot, 'platforms',
                    platformId);

                // Determine which hook to invoke based on the current platform
                if (platformId === hookConsts.IOS) {
                    // Do nothing
                } else if (platformId === hookConsts.ANDROID)
                    new AndroidBeforePrepare(projectRoot,
                        platformPath).invokeHook();
                else if (platformId === hookConsts.WINDOWS)
                    new WindowsBeforePrepare(projectRoot,
                        platformPath).invokeHook();
                else if (platformId === 'browser') {
                    // do nothing
                }
                else
                    console.warn(strings.format(externalizedStrings.hookNotImpl,
                        platformId, pluginName));
            }
        );
    }

    /*
     Determines which hook platform specific before_plugin_uninstall hook to
     instantiate, and invoke.
     */
    this.invokeHook = function() {
        logVerbose('Performing MFP before prepare hook.');
        invokePlatformHooks(currentPlatforms);
    };

}

module.exports = MFPBeforePrepare;