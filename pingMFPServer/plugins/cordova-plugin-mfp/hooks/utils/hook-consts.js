/*
   Licensed Materials - Property of IBM
   (C) Copyright 2015, 2016 IBM Corp.
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

/*jslint node:true */
/*jshint node:true */

'use strict';

var path = require('path');

define('path', require('path'));





function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });

}


// Platforms
define('ANDROID', 'android');
define('ANDROID_GT_EQ_7',path.join('android','app','src','main'));
define('SRC_DIR',path.join('platforms',this.ANDROID_GT_EQ_7,'src','com','ibm','MFPApplication.java'));
define('SRC_LIB',path.join('platforms',this.ANDROID_GT_EQ_7));
define('PLATFORM_ANDROID',path.join('platforms','android'));
define('JAVA_LIB',path.join(this.PLATFORM_ANDROID,'java','com','ibm','MFPApplication.java'));
define('HOOK_CONS',path.join('plugins', 'cordova-plugin-mfp', 'hooks','utils','hook-consts.js'));
define('IOS', 'ios');
define('WINDOWS', 'windows');
define('WINDOWS_8', 'windows8');
define('WINDOWS_PHONE_8', 'windowsphone8');
define('WINDOWS_10', 'windows10');
define('PREVIEW', 'preview');
define('IPHONE', 'iphone');
define('BROWSER', 'browser');
define('WEB', 'web');

// Logging
define('SILLY', 'silly');
define('VERBOSE', 'verbose');

// Hooks
define('ANDROID_BEFORE_PLUGIN_INSTALL', 'android-before-plugin-install');
define('ANDROID_BEFORE_RUN', 'android-before-run');
define('ANDROID_AFTER_PLUGIN_INSTALL', 'android-after-plugin-install');
define('ANDROID_AFTER_PREPARE', 'android-after-prepare');
define('ANDROID_BEFORE_PLUGIN_UNINSTALL', 'android-before-plugin-uninstall');
define('ANDROID_BEFORE_PREPARE', 'android-before-prepare');
define('IOS_AFTER_PLUGIN_INSTALL', 'ios-after-plugin-install');
define('IOS_AFTER_PREPARE', 'ios-after-prepare');
define('IOS_BEFORE_PLUGIN_UNINSTALL', 'ios-before-plugin-uninstall');
define('WINDOWS_AFTER_PLUGIN_INSTALL', 'windows-after-plugin-install');
define('WINDOWS_AFTER_PREPARE', 'windows-after-prepare');
define('WINDOWS_BEFORE_PLUGIN_UNINSTALL', 'windows-before-plugin-uninstall');
define('WINDOWS_BEFORE_PREPARE', 'windows-before-prepare');
define('BROWSER_BEFORE_PLUGIN_INSTALL', 'browser-before-plugin-install');
define('BROWSER_AFTER_PLUGIN_INSTALL', 'browser-after-plugin-install');
define('BROWSER_AFTER_PREPARE', 'browser-after-prepare');
define('BROWSER_BEFORE_RUN', 'browser-before-run');
define('BROWSER_BEFORE_EMULATE', 'browser-before-emulate');
define('BROWSER_BEFORE_PLUGIN_UNINSTALL','browser-before-plugin-uninstall');
define('AFTER_PREPARE_HOOK', 'after-prepare');
define('HOOK', 'hook');
define('MFP_BEFORE_PLUGIN_INSTALL', 'mfp-before-plugin-install');
define('MFP_AFTER_PLUGIN_INSTALL', 'mfp-after-plugin-install');
define('MFP_AFTER_PREPARE', 'mfp-after-prepare');
define('MFP_BEFORE_PLUGIN_UNINSTALL', 'mfp-before-plugin-uninstall');
define('MFP_BEFORE_PREPARE', 'mfp-before-prepare');
define('MFP_BEFORE_RUN', 'mfp-before-run');
define('MFP_BEFORE_EMULATE', 'mfp-before-emulate');
define('MFP_HOOK', 'mfp-hook');

// Path data
define('MFP_PLUGIN_DIR', path.join('plugins', 'cordova-plugin-mfp'));
define('WWW_DIR_ANDROID', path.join('platforms', 'android','app','src','main','assets', 'www'));
define('PLATFORM_WWW_DIR_ANDROID', path.join('platforms', 'android','platform_www'));
//define('WWW_DIR_ANDROID_NEW', path.join('platforms', 'android','app','src','main','assets', 'www'));
define('WWW_DIR_IOS', path.join('platforms', 'ios', 'www'));
define('WWW_DIR_WINDOWS', path.join('platforms', 'windows', 'www'));
define('WWW_DIR_BROWSER', path.join('platforms', 'browser', 'www'));

define('BOOTSTRAP_FILENAME', 'bootstrap.js');
define('BOOTSTRAP_PATH_ANDROID', path.join(this.WWW_DIR_ANDROID, this.MFP_PLUGIN_DIR, this.BOOTSTRAP_FILENAME));

define('BOOTSTRAP_PATH_IOS', path.join(this.WWW_DIR_IOS, this.MFP_PLUGIN_DIR, this.BOOTSTRAP_FILENAME));
define('PLATFORM_WWW_DIR_IOS', path.join('platforms', 'ios','platform_www'));
define('BOOTSTRAP_PATH_WINDOWS', path.join(this.WWW_DIR_WINDOWS, this.MFP_PLUGIN_DIR, this.BOOTSTRAP_FILENAME));
define('BOOTSTRAP_PATH_BROWSER', path.join(this.WWW_DIR_BROWSER, this.MFP_PLUGIN_DIR, 'src', 'browser', this.BOOTSTRAP_FILENAME));

//{platform}/{wwwDir}/plugins/cordova-plugin-mfp/worklight
define('WORKLIGHT_DIR', path.join('plugins', 'cordova-plugin-mfp', 'worklight'));

define('WORKLIGHT_DIR_ANDROID', path.join(this.WWW_DIR_ANDROID, this.WORKLIGHT_DIR));

define('WORKLIGHT_DIR_IOS', path.join(this.WWW_DIR_IOS, this.WORKLIGHT_DIR));
define('WORKLIGHT_DIR_WINDOWS', path.join(this.WWW_DIR_WINDOWS, this.WORKLIGHT_DIR));
define('WORKLIGHT_DIR_BROWSER', path.join(this.WWW_DIR_BROWSER, this.WORKLIGHT_DIR));

// {platform}/assets/www/plugins/cordova-plugin-mfp/worklight/checksum.js
define('CHECKSUM_PATH_ANDROID', path.join('assets', 'www', this.WORKLIGHT_DIR, 'checksum.js'));
define('PLATFORM_CHECKSUM_PATH_ANDROID', path.join('platforms', 'android', 'platform_www', this.WORKLIGHT_DIR, 'checksum.js'));

// {platform}/www/plugins/cordova-plugin-mfp/worklight/checksum.js
define('CHECKSUM_PATH_IOS', path.join('www', this.WORKLIGHT_DIR, 'checksum.js'));
define('PLATFORM_CHECKSUM_PATH_IOS', path.join('platforms', 'ios', 'platform_www', this.WORKLIGHT_DIR, 'checksum.js'));

define('CHECKSUM_PATH_WINDOWS', path.join('www', this.WORKLIGHT_DIR, 'checksum.js'));

define('WORKLIGHT_CHECKSUM_PATH', path.join(this.WORKLIGHT_DIR, 'checksum.js'));

//{platform}/{wwwDir}/plugins/cordova-plugin-mfp/static_app_props.js
define('STATIC_APP_PROPS_PATH', path.join(this.WORKLIGHT_DIR, 'static_app_props.js'));

define('WLJQ_PATH', path.join(this.WORKLIGHT_DIR, 'wljq.js'));

define('WORKLIGHT_JS_FILENAME', 'worklight.js');
define('IBMMFPF_JS_FILENAME', 'ibmmfpf.js');
define('WORKLIGHT_PATH', path.join(this.WORKLIGHT_DIR, 'worklight.js'));
define('IBMMFPF_PATH', path.join(this.WORKLIGHT_DIR, this.IBMMFPF_JS_FILENAME));

define('WORKLIGHT_PATH_ANDROID', path.join(this.WWW_DIR_ANDROID, this.WORKLIGHT_PATH));

define('WORKLIGHT_PATH_IOS', path.join(this.WWW_DIR_IOS, this.WORKLIGHT_PATH));
define('WORKLIGHT_PATH_WINDOWS', path.join(this.WWW_DIR_WINDOWS, this.WORKLIGHT_PATH));
define('WORKLIGHT_PATH_BROWSER', path.join(this.WWW_DIR_BROWSER, this.IBMMFPF_PATH));

define('IBMMFPF_ANALYTICS_FILENAME', 'ibmmfpfanalytics.js')
define('IBMMFPF_ANALYTICS_PATH', path.join(this.WORKLIGHT_DIR, 'analytics', this.IBMMFPF_ANALYTICS_FILENAME));

define('CORDOVA_PATH_ANDROID', path.join(this.WWW_DIR_ANDROID, 'cordova.js'));

define('CORDOVA_PATH_IOS', path.join(this.WWW_DIR_IOS, 'cordova.js'));
define('CORDOVA_PATH_WINDOWS', path.join(this.WWW_DIR_WINDOWS, 'cordova.js'));
define('CORDOVA_PATH_BROWSER', path.join(this.WWW_DIR_BROWSER, 'cordova.js'));
define('NODE_MODULES',path.join('node_modules', 'cordova-android','VERSION'));
define('PROPS_PATH_ANDROID', path.join('assets', 'mfpclient.properties'));
define('PROPS_PATH_IOS', path.join('Resources', 'mfpclient.plist'));
define('PROPS_PATH_WINDOWS', path.join('mfpclient.properties'));

//{platform}/{wwwDir}/plugins/cordova-plugin-mfp/worklight/messages
define('MESSAGES_PATH', path.join(this.WORKLIGHT_DIR, 'messages'));

define('FILE_LIST', 'filelist');
define('FILE_LIST_PATH_ANDROID', path.join('assets', 'www', this.FILE_LIST));
define('FILE_LIST_PATH_WINDOWS', path.join('www', this.FILE_LIST));

define('SLN_FILE', 'CordovaApp.sln');

define('PROXY_FILE', 'proxy.js');
define('PROXY_PATH', path.join(this.WORKLIGHT_DIR_BROWSER, this.PROXY_FILE));
define('PROXY_PORT', 9081);

define('XML_STRINGS',
    [path.join('res', 'values', 'mfp-strings.xml'),
    path.join('res', 'values-de', 'mfp-strings.xml'),
    path.join('res', 'values-es', 'mfp-strings.xml'),
    path.join('res', 'values-fr', 'mfp-strings.xml'),
    path.join('res', 'values-he', 'mfp-strings.xml'),
    path.join('res', 'values-it', 'mfp-strings.xml'),
    path.join('res', 'values-iw', 'mfp-strings.xml'),
    path.join('res', 'values-ja', 'mfp-strings.xml'),
    path.join('res', 'values-ko', 'mfp-strings.xml'),
    path.join('res', 'values-pt-rBR', 'mfp-strings.xml'),
    path.join('res', 'values-ru', 'mfp-strings.xml'),
    path.join('res', 'values-zh', 'mfp-strings.xml'),
    path.join('res', 'values-zh-rTW', 'mfp-strings.xml')]
);

define('XML_STRINGS_REMOVED_VALUES',
    ['launcher_name',
    'activity_name']
);

define('BEFORE_PREPARE', 'before_prepare');
define('AFTER_PREPARE', 'after_prepare');
define('BEFORE_PLUGIN_INSTALL', 'before_plugin_install');

define('AFTER_PLUGIN_INSTALL', 'after_plugin_install');
define('BEFORE_PLUGIN_UNINSTALL', 'before_plugin_uninstall');
define('BEFORE_COMPILE', 'before_compile');
define('BEFORE_RUN', 'before_run');
define('BEFORE_EMULATE', 'before_emulate');

define('CHECKSUM', 'var WL_CHECKSUM = {"checksum":{0},"date":{1},"machine":"{2}"}');

define('CONFIG_XML', 'config.xml');


define('PLATFORM', 'platform');
define('NAME', 'name');
define('UPDATE', 'update');
define('SRC', 'src');
define('TARGET', 'target');

define('HTTPS', 'https');
define('EMBEDDED', 'embedded');
define('TRUE', 'true');

define('X_CODE_PROJ', '.xcodeproj');
define('APPDELEGATE_M', 'AppDelegate.m');
define('BAK', '.bak');
define('MFP_JAVA_SRC', ['CordovaApp.java']);
define('UPDATE_JAVA_SRC', ['MainActivity.original']);
define('CORDOVA_APP_JAVA', 'CordovaApp.java');
define('MAIN_ACTIVITY_ORIG', 'MainActivity.original');
define('MFP_APPLICATION_JAVA', 'MFPApplication.java');
define('DOT_JAVA', '.java');
define('PUBLIC_CLASS', 'public class ');
define('ANDROID_MANIFEST_XML', 'AndroidManifest.xml');

define('ANDROID_NAME_ATTRIBUTE', 'android:name');
define('ANDROID_NAME_ATTRIBUTE_VALUE', 'com.ibm.MFPApplication');
define('ANDROID_BACKUP_ATTRIBUTE','android:fullBackupContent');
define('ANDROID_BACKUP_ATTRIBUTE_VALUE','@xml/mfp_backup_rules');
define('COM_IBM_PATH', path.join('src', 'com', 'ibm'));

// Static app props
define('APP_SERVICES', '/apps/services/');
define('WORKLIGHT_ROOT', '{0}api/{1}/{2}/');
define('STATIC_APP_PROPS',
    '// This is a generated file. Do not edit. See application-descriptor.xml.' + '\n' +
    '// WLClient configuration variables.' + '\n' +
    'console.log("{0}");' + '\n' +
    'var WL = WL ? WL : {};' + '\n' +
    'WL.StaticAppProps = {1};');

// Preview Android modificiations for cordova.js
define('ANDROID_POLYFILL', '\r\n' +
    'var realPrompt = window.prompt;' + '\r\n' +
    'window.prompt = function\(text, defaultText, thirdParam\) {\r\n' +
    '\tif\(defaultText !== undefined && (defaultText.indexOf(\'gap_init:\'\) > -1 || defaultText.indexOf(\'gap:\') > -1 || ' +
    'defaultText.indexOf(\'gap_bridge_mode:\') > -1 || defaultText.indexOf(\'gap_poll:\') > -1 ) \)\r\n' +
    '\t\treturn 0;\r\n' +
    '\telse\r\n' +
    '\t\treturn realPrompt\(text,defaultText\);\r\n' +
    '};\n');

// node modules to copy over for ibmmfpf-preview.js
define('IBMMFPF_NODE_MODULES',
    [path.join('node_modules', 'jssha'),
    path.join('node_modules', 'promiz'),
    path.join('node_modules', 'sjcl')]
);

// Preview platform unspecific modifications for cordova.js
define('PREVIEW_TIMEOUT', '1000');
define('PREVIEW_TIMEOUT_ORIG', /5000/g);
define('PREVIEW_DEVICE_READY', '//console.log\(\'deviceready has not fired after 5 seconds.\'\);');
define('PREVIEW_DEVICE_READY_ORIG', /console.log\(\'deviceready has not fired after 5 seconds.\'\);/);
define('PREVIEW_WINDOW_TIMEOUT', 'window.setTimeout\(function\(\) \{ \n require\(\'cordova\'\).fireDocumentEvent\(\'deviceready\'\); \n _mbs_cordova_sim_load_js\(\);');
define('PREVIEW_WINDOW_TIMEOUT_BROWSER', 'window.setTimeout\(function\(\) \{ \n require\(\'cordova\'\).fireDocumentEvent\(\'deviceready\'\);');
define('PREVIEW_WINDOW_TIMEOUT_ORIG', /window.setTimeout\(function\(\) \{/g);
define('PREVIEW_POKE_ORIG', /pokeNative\(\);/g);
define('PREVIEW_POKE', '//pokeNative();');
define('PREVIEW_FACTORY_ORIG', /factory\(localRequire, module.exports, module\);/);
define('PREVIEW_FACTORY', 'try {\nfactory(localRequire, module.exports, module);\n} catch (err) {}');
define('PREVIEW_WINDOWS_LISTENER_ORIG', /Windows.UI.WebUI.WebUIApplication.addEventListener\("resuming", resumingHandler, false\);/);
define('PREVIEW_WINDOWS_LISTENER', '//Windows.UI.WebUI.WebUIApplication.addEventListener("resuming", resumingHandler, false);');
// Avoid loading cordova-plugin.mfp in preview, causes not to initialize correctly.  MFP is loaded differently than the other plugins.
define('PREVIEW_ADD_ENTRY_ORIG', /function addEntry\s?\(.*\) \{/);
define('PREVIEW_ADD_ENTRY', '\r\n' +
  '\tif\(!\(moduleName in moduleMap\) && moduleName === \'cordova-plugin-mfp.mfp\'\) \{\r\n' +
  '\t\treturn;\r\n' +
  '\t}\r\n');

// Preview worklight.js files
define('PREVIEW_IBMMFPF_JS_FILENAME', 'ibmmfpf-preview.js');
define('PREVIEW_IBMMFPF_SRC_PATH', path.join(this.MFP_PLUGIN_DIR, 'src', 'preview', this.PREVIEW_IBMMFPF_JS_FILENAME));
define('PREVIEW_BOOTSTRAP_PATH', path.join(this.MFP_PLUGIN_DIR, 'src', 'preview', this.BOOTSTRAP_FILENAME));

define('PREVIEW_IBMMFPF_PATH', path.join(this.WORKLIGHT_DIR, this.PREVIEW_IBMMFPF_JS_FILENAME));

define('PREVIEW_IBMMFPF_PATH_ANDROID', path.join(this.WWW_DIR_ANDROID, this.PREVIEW_IBMMFPF_PATH));


define('PREVIEW_IBMMFPF_PATH_IOS', path.join(this.WWW_DIR_IOS, this.PREVIEW_IBMMFPF_PATH));
define('PREVIEW_IBMMFPF_PATH_WINDOWS', path.join(this.WWW_DIR_WINDOWS, this.PREVIEW_IBMMFPF_PATH));
define('PREVIEW_IBMMFPF_PATH_BROWSER', path.join(this.WWW_DIR_BROWSER, this.PREVIEW_IBMMFPF_PATH));

define('PREVIEW_WORKLIGHT_PATH_ANDROID', path.join(this.MFP_PLUGIN_DIR, 'src', 'android', 'preview', 'worklight.js'));
define('PREVIEW_WORKLIGHT_PATH_IOS', path.join(this.MFP_PLUGIN_DIR, 'src', 'ios', 'preview', 'worklight.js'));
define('PREVIEW_WORKLIGHT_PATH_WINDOWS', path.join(this.MFP_PLUGIN_DIR, 'src', 'windows', 'preview', 'worklight.js'));
define('PREVIEW_WORKLIGHT_PATH_BROWSER', path.join(this.MFP_PLUGIN_DIR, 'src', 'browser', 'preview', 'ibmmfpf.js'));

// Preview cordova.js files
define('PREVIEW_CORDOVA_PATH_ANDROID', path.join(this.MFP_PLUGIN_DIR, 'src', 'android', 'preview', 'cordova.js'));
define('PREVIEW_CORDOVA_PATH_IOS', path.join(this.MFP_PLUGIN_DIR, 'src', 'ios', 'preview', 'cordova.js'));
define('PREVIEW_CORDOVA_PATH_WINDOWS', path.join(this.MFP_PLUGIN_DIR, 'src', 'windows', 'preview', 'cordova.js'));
define('PREVIEW_CORDOVA_PATH_BROWSER', path.join(this.MFP_PLUGIN_DIR, 'src', 'browser', 'preview', 'cordova.js'));

// Preview URLs
define('PREVIEW_APP_SERVICES', '/{0}' + this.APP_SERVICES);
define('PREVIEW_POSTFIX_APP_SERVICES', this.PREVIEW_APP_SERVICES);
define('PREVIEW_WORKLIGHT_ROOT', '/{0}{1}api/{2}/{3}/');
define('PREVIEW_POSTFIX_WORKLIGHT_ROOT', this.PREVIEW_WORKLIGHT_ROOT);

define('MFP_PROPERTIES_ANDROID',
    'wlServerProtocol = {0}\n' +
    'wlServerHost = {1}\n' +
    'wlServerPort = {2}\n' +
    'wlServerContext = {3}\n' +
    'testWebResourcesChecksum = {4}\n' +
    'ignoredFileExtensions = {5}\n' +
    'wlPlatformVersion = {6}\n' +
    'wlSecureDirectUpdatePublicKey = {7}\n' +
    'languagePreferences = {8}\n' +
    'wlBuildId = {9}\n' + 
    'serverUri = {10}\n' + 
    'APIProxyURL = {11}\n' 
);

define('MFP_PROPERTIES_IOS',
    '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' +
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n' +
    '<plist version="1.0">\n' +
    '<dict>\n' +
    '\t<key>protocol</key>\n' +
    '\t<string>{0}</string>\n' +
    '\t<key>host</key>\n' +
    '\t<string>{1}</string>\n' +
    '\t<key>port</key>\n' +
    '\t<string>{2}</string>\n' +
    '\t<key>wlServerContext</key>\n' +
    '\t<string>{3}</string>\n' +
    '\t<key>platformVersion</key>\n' +
    '\t<string>{4}</string>\n' +
    '\t<key>testWebResourcesChecksum</key>\n' +
    '\t<string>{5}</string>\n' +
    '\t<key>ignoredFileExtensions</key>\n' +
    '\t<string>{6}</string>\n' +
    '\t<key>wlSecureDirectUpdatePublicKey</key>\n' +
    '\t<string>{7}</string>\n' +
    '\t<key>buildtime</key>\n' +
    '\t<string>{8}</string>\n' +
    '\t<key>languagePreferences</key>\n' +
    '\t<string>{9}</string>\n' +
    '\t<key>serverUri</key>\n' +
    '\t<string>{10}</string>\n' +
    '\t<key>APIProxyURL</key>\n' +
    '\t<string>{11}</string>\n' +
    '</dict>\n' +
    '</plist>\n'
);

define('MFP_PROPERTIES_WINDOWS',
    'wlServerProtocol = {0}\n' +
    'wlServerHost = {1}\n' +
    'wlServerPort = {2}\n' +
    'wlServerContext = {3}\n' +
    'wlAppId = {4}\n' +
    'wlPlatformVersion = {5}\n' +
    'wlMainFilePath = {6}\n' +
    'languagePreferences = {7}\n' +
    'wlAppVersion = {8}\n' +
    'wlwin8unitestWebResourcesChecksum = {9}\n' +
    'wlwin8uniignoredFileExtensions = {10}\n' +
    'wlwpunvslAppVersion = {11}\n' +
    'wlwp8unitestWebResourcesChecksum = {12}\n' +
    'wlwp8uniignoredFileExtensions = {13}\n' +
    'wlwin10unitestWebResourcesChecksum = {14}\n' +
    'wlwin10uniignoredFileExtensions = {15}\n' +
    'wlSecureDirectUpdatePublicKey = {16}\n'
);

// Windows
define('WIN_AUTH_RT',
    [
        {
            'SRC': ['buildtarget/x86/AuthWinRT.winmd',
                'buildtarget/x86/AuthWinRT.dll'],
            'DEST': 'plugins/cordova-plugin-mfp/win/x86'
        },
        {
            'SRC': ['buildtarget/x64/AuthWinRT.winmd',
                'buildtarget/x64/AuthWinRT.dll'],
            'DEST': 'plugins/cordova-plugin-mfp/win/x64'
        },
        {
            'SRC': ['buildtarget/ARM/AuthWinRT.winmd',
                'buildtarget/ARM/AuthWinRT.dll'],
            'DEST': 'plugins/cordova-plugin-mfp/win/ARM'
        },
        {
            'SRC': ['buildtarget/wp/x86/AuthWinRTwp.winmd',
                'buildtarget/wp/x86/AuthWinRTwp.dll'],
            'DEST': 'plugins/cordova-plugin-mfp/phone/x86'
        },
        {
            'SRC': ['buildtarget/wp/ARM/AuthWinRTwp.winmd',
                'buildtarget/wp/ARM/AuthWinRTwp.dll'],
            'DEST': 'plugins/cordova-plugin-mfp/phone/ARM'

        }
    ]
);

define('ANY_CPU_DEBUG', 'Debug|Any CPU = Debug|Any CPU');
define('ANY_CPU_RELEASE', 'Release|Any CPU = Release|Any CPU');

define('SERVE_TIME_PATH', path.join('platforms', 'serve-time.txt'));
