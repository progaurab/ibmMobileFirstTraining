/*
   Licensed Materials - Property of IBM

   (C) Copyright 2015, 2016 IBM Corp.

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

// Private modules
var hookConsts = require('./utils/hook-consts');

/*
Instantiates, and invokes a hook script that corresponds to the context hook
passed. Supported hooks consist of before_prepare, after_prepare,
after_plugin_install, before_plugin_uninstall, before_emulate and before_run.

context - Cordova context

An MFP hook will be instantiated, and invoked.
 */
module.exports = function(context) {
    var MFPBeforePrepare;           // MFP before prepare hook
    var MFPAfterPrepare;            // MFP after prepare hook
    var MFPBeforePluginInstall;     // MFP before plugin install hook
    var MFPAfterPluginInstall;      // MFP after plugin install hook
    var MFPBeforePluginUninstall;   // MFP before plugin uninstall hook
    var MFPBeforeCompile;           // MFP before compile hook
    var MFPBeforeEmulate;           // MFP before emulate hook
    var MFPBeforeRun;               // MFP before run hook
    var promise;

    // Uncomment the following line to get a breakpoint since it gets loaded dynamically
    // debugger;

    // Determine which hook to invoke
    if (context.hook === hookConsts.BEFORE_PREPARE) {
        MFPBeforePrepare = require('./mfp/mfp-before-prepare');
        new MFPBeforePrepare(context).invokeHook();
    } else if (context.hook === hookConsts.AFTER_PREPARE) {
        MFPAfterPrepare = require('./mfp/mfp-after-prepare');
        promise = new MFPAfterPrepare(context).invokeHook();
    } else if (context.hook === hookConsts.BEFORE_COMPILE) {
        MFPBeforeCompile = require('./mfp/mfp-before-compile');
        promise = new MFPBeforeCompile(context).invokeHook();
    } else if (context.hook === hookConsts.BEFORE_PLUGIN_INSTALL) {
        MFPBeforePluginInstall = require('./mfp/mfp-before-plugin-install');
        new MFPBeforePluginInstall(context).invokeHook();
    } else if (context.hook === hookConsts.AFTER_PLUGIN_INSTALL) {
        MFPAfterPluginInstall = require('./mfp/mfp-after-plugin-install');
        new MFPAfterPluginInstall(context).invokeHook();
    } else if (context.hook === hookConsts.BEFORE_PLUGIN_UNINSTALL) {
        MFPBeforePluginUninstall = require('./mfp/mfp-before-plugin-uninstall');
        new MFPBeforePluginUninstall(context).invokeHook();
    } else if (context.hook === hookConsts.BEFORE_EMULATE) {
        MFPBeforeEmulate = require('./mfp/mfp-before-emulate');
        new MFPBeforeEmulate(context).invokeHook();
    } else if (context.hook === hookConsts.BEFORE_RUN) {
        MFPBeforeRun = require('./mfp/mfp-before-run');
        new MFPBeforeRun(context).invokeHook();
    }

    return promise;
};
