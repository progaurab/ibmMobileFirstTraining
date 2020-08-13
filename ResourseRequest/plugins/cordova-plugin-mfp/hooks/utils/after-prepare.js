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
var shell = require('shelljs');
var path = require('path');
var et = require('elementtree');
var url = require('url');
var os = require('os');
var strings = require('ibm-strings');
var log = require('npmlog');
var util = require('util');

// Private modules
var Hook = require('./hook');
var externalizedStrings = require('./../externalizedStrings');
var hookConsts = require('./hook-consts');

/*
 This class serves as an abstract class for a hook script for after prepare.
 */
function AfterPrepare() {

    // Enforce abstraction
    if (this.constructor === AfterPrepare)
        throw new TypeError('Cannot instantiate an abstract class.');

    Hook.apply(this);
}

AfterPrepare.prototype = Hook.prototype;

/*
 Generates checksum.js.

 checksum - Checksum value
 checksumPath - Path to checksum.js

 The checksum value will be written to checksum.js

 Returns true if checksum was written
 */
AfterPrepare.prototype.createChecksumFile = function(checksum, checksumPath) {
    var content;            // Contents of checksum.js

    log.verbose(hookConsts.AFTER_PREPARE_HOOK, 'Creating checksum file.');

    // Write the checksum if it exists
    log.silly(hookConsts.AFTER_PREPARE_HOOK, 'Checksum: ' + checksum);
    log.silly(hookConsts.AFTER_PREPARE_HOOK,
    		'Checksum path: ' + checksumPath);

    content = strings.format(hookConsts.CHECKSUM, checksum,
        new Date().getTime(), os.hostname());

    log.silly(hookConsts.AFTER_PREPARE_HOOK, 'Contents of checksum.js: ' +
        content);

    try {
    	fs.writeFileSync(checksumPath, content);
    } catch (err) {
    	log.verbose(hookConsts.AFTER_PREPARE_HOOK, err);
        throw externalizedStrings.unexpectedErr;
    }
};

/*
 Handles the update tag in the config.xml.

 projectRoot - Path to project
 platformPath - Path to platform
 platformID - Platform type

 Determines if is an update in config.xml, and performs that update.
 */
AfterPrepare.prototype.parseUpdates = function(projectRoot, platformPath,
                                               platformID) {
    var configPath;         // Path to config file
    var configString;       // Content of config file
    var configEtree;        // Config element tree
    var platforms;          // Platforms

    log.verbose(hookConsts.AFTER_PREPARE_HOOK,
        'Parsing config.xml for update tags.');

    configPath = path.resolve(projectRoot, hookConsts.CONFIG_XML);
    configString = AfterPrepare.prototype.readFile(configPath).toString();
    configEtree = et.parse(configString);
    platforms = configEtree.findall(hookConsts.PLATFORM);

    // Check if platform specific
    if (platforms !== null) {
        platforms.forEach(function(platform) {
            if (platform.attrib.name === platformID)
                AfterPrepare.prototype.updateFile(projectRoot, platformPath,
                    platform);
        });
    } else {
        AfterPrepare.prototype.updateFile(projectRoot, platformPath,
            configEtree.getroot());
    }
};

/*
 Update the file of the destination with the source.

 projectRoot - Path to project
 platformPath - Path to platform
 element - Element to update

 Updates files based on the update tag in config.xml
 */
AfterPrepare.prototype.updateFile = function(projectRoot, platformPath,
                                             element) {
    var files;  // Files to update
    var srcFile;    // Source path
    var destFile;   // Destination path

    log.verbose(hookConsts.AFTER_PREPARE_HOOK,
        'Updating files based on config.xml update tags.');

    files = element.findall(hookConsts.UPDATE);

    // If files exists, update them
    if (files !== null) {

        // Update each file
        files.forEach(function(file) {
            srcFile = path.join(projectRoot, file.get(hookConsts.SRC));
            destFile = path.join(platformPath, file.get(hookConsts.TARGET));

            log.silly(hookConsts.AFTER_PREPARE_HOOK,
                'Updating file: ' + destFile);

            try {
            	shell.cp('-f', srcFile, destFile);
            } catch (err) {
                log.verbose(hookConsts.AFTER_PREPARE, err);
                throw externalizedStrings.unexpectedErr;
            }
        });
    }
};

/*
 Parses MobileFirst server information.

 serverURL - Path to server
 serverRuntime - Project runtime on server

 Returns a object that contains the server protocol, port, hostname, and
 runtime.
 */
AfterPrepare.prototype.parseServerInfo = function(serverURL, serverRuntime) {
    var serverInfo;     // Server information
    var parsedURL;      // Parsed server URL
    var colonIndex;     // Index of protocol

    log.verbose(hookConsts.AFTER_PREPARE_HOOK, 'Parsing server information.');

    parsedURL = url.parse(serverURL);
    serverInfo = {};
    serverInfo.protocol = parsedURL.protocol;
    serverInfo.host = parsedURL.hostname;
    serverInfo.port = parsedURL.port;
    serverInfo.pathname = parsedURL.pathname; 
    colonIndex = 0;

    // Determine port index
    if (serverInfo.protocol) {
        colonIndex = serverInfo.protocol.indexOf(':');

        // Determine the protocol
        if (colonIndex > 0)
            serverInfo.protocol = serverInfo.protocol.substring(0, colonIndex);
    }

    // Determine the port since it was not specificed
    if (!serverInfo.port) {

        // Determine port from protocol
        if (serverInfo.protocol === hookConsts.HTTPS)
            serverInfo.port = 443;
        else
            serverInfo.port = 80;
    }

    serverInfo.context = serverRuntime;

    log.silly(hookConsts.AFTER_PREPARE_HOOK, util.inspect(serverInfo));

    return serverInfo;
};

/*
 Determines the value of MFPClientCustomInit. The mfpConfig object must be
 instantiated.

 mfpConfig - MFP configuration

 Returns the value of MFPClientCustomInit.
 */
AfterPrepare.prototype.getMFPClientCustomInit = function(mfpConfig) {
    var mfpClientCustomInit;  // Resultant value

    log.verbose(hookConsts.AFTER_PREPARE_HOOK,
        'Determining MFP client custom init value.');

    mfpClientCustomInit = mfpConfig.getMFPClientCustomInit();

    // Determine the type of the read value
    if (typeof mfpClientCustomInit === 'string') {

        // Determine if mfpClientCustomInit should be enabled
        if (mfpClientCustomInit === hookConsts.TRUE)
            mfpClientCustomInit = true;
        else
            mfpClientCustomInit = false;
    } else if (typeof mfpClientCustomInit !== 'boolean')
        mfpClientCustomInit = false;

    log.silly(hookConsts.AFTER_PREPARE_HOOK,
        'MFP client custom init: ' + mfpClientCustomInit);

    return mfpClientCustomInit;
};

/*
 Builds the WL.StaticAppProps values. The staticAppPropsPath must provided, and
 mfpConfig must be instantiated.

 appProps - Platform specific app properties
 staticAppPropsPath - Path to static_app_props.js
 mfpConfig - MFP configuration

 The static_app_props.js file will be created with the app properties.
 */
AfterPrepare.prototype.buildStaticAppProps = function(appProps,
                                                      staticAppPropsPath,
                                                      mfpConfig) {
    var contents;   // File content

    appProps.APP_DISPLAY_NAME = mfpConfig.getWidgetName();
    appProps.LOGIN_DISPLAY_TYPE = hookConsts.EMBEDDED;

    appProps.mfpClientCustomInit =
        AfterPrepare.prototype.getMFPClientCustomInit(mfpConfig);
    appProps.MESSAGES_DIR = hookConsts.MESSAGES_PATH;

    contents = strings.format(hookConsts.STATIC_APP_PROPS,
        externalizedStrings.runningStaticAppProps,
        util.inspect(appProps));

    log.silly(hookConsts.AFTER_PREPARE_HOOK,
        'Static app properties: ' + contents);
    log.silly(hookConsts.AFTER_PREPARE_HOOK,
        'Static app properties path: ' + staticAppPropsPath);

    try {
    	shell.mkdir('-p', path.dirname(staticAppPropsPath));
    	fs.writeFileSync(staticAppPropsPath, contents, {encoding: 'utf8'});
    } catch (err) {
    	log.verbose(hookConsts.AFTER_PREPARE_HOOK, err);
        throw externalizedStrings.unexpectedErr;
    }
};

/*
Determines if the test web resource value is true, false, 'true', or 'false'. If
it's not either of those values, false is returned. Otherwise the value passed
is returned.

value - Test web resources value
 */
AfterPrepare.prototype.normalizeTestWebResources = function(value) {

    if (value !== true && value !== false && value !== 'true' &&
        value !== 'false')
        value = false;

    return value;
}

module.exports = AfterPrepare;
