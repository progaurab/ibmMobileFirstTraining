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
var et = require('elementtree');
var shell = require('shelljs');
var path = require('path');
var log = require('npmlog');

// Private modules
var strings = require('ibm-strings');
var hookConsts = require('./hook-consts');
var externalizedStrings = require('./../externalizedStrings');

/*
 This class serves as an abstract class for a hook script.
 */
function Hook() {

}

/*
Parses XML.

file - XML file to parse

An elementtree object containing the parsed XML from the file will be returned.
 */
Hook.prototype.parseXML = function(file) {
    var xmlRaw;     // Read XML

    log.silly(hookConsts.HOOK, 'Parsing XML for ' + file);

    try {
    	xmlRaw = fs.readFileSync(file).toString();
    } catch (err) {
        log.verbose(hookConsts.HOOK, err);
        throw externalizedStrings.unexpectedErr;
    }

    return et.parse(xmlRaw);
};

/*
Writes XML.

tree - Tree to write to
file - XMl file to write to

The XML tree will be written to the XML file.
 */
Hook.prototype.writeXML = function(tree, file) {
    var xmlString;      // XML string to write

    xmlString = tree.write({method:'xml', xml_declaration:true, indent:4});

    log.silly(hookConsts.HOOK, 'Writing XML to ' + file + ': ' + xmlString);

    try {
        fs.writeFileSync(file, xmlString);
    } catch (err) {
        log.verbose(hookConsts.HOOK, err);
        throw externalizedStrings.unexpectedErr;
    }
};

/*
Moves a file.

srcFile - Original location
destFile - New location

Moves a file from its original location, to the new location.
 */
Hook.prototype.moveFile = function(srcFile, destFile) {
    log.silly(hookConsts.HOOK, 'Moving file ' + srcFile + ' to ' + destFile);

    try {
    	shell.mkdir('-p', path.dirname(destFile));
    	shell.mv('-f', srcFile, destFile);
    } catch (err) {
    	log.verbose(hookConsts.HOOK, err);
        throw externalizedStrings.unexpectedErr;
    }
};


/*
Copies a file from one location to another.

wlFile - File to copy
cdvFile - File destination

A file will be copied from the source path, to the destination path.
 */
Hook.prototype.copyFile = function (origPath, newPath) {
    log.silly(hookConsts.HOOK, 'Copying file ' + origPath + ' to ' + newPath);

    try{
        shell.mkdir('-p', path.dirname(newPath));

        // Dest file may already exist as read-only
        if (shell.test('-f', newPath))
        	shell.chmod('u+w', newPath);

        shell.cp('-f', origPath, newPath);
    } catch (err) {
    	log.verbose(hookConsts.HOOK, err);
        throw externalizedStrings.unexpectedErr;
    }
};

/*
Copies a directory from one location to another.

srcDir - dir to copy
destDir - dir destination

A directory will be copied from the source path, to the destination path.
 */
Hook.prototype.copyDir = function (srcDir, destDir) {
    log.silly(hookConsts.HOOK, 'Copying file ' + srcDir + ' to ' + destDir);

    try{
        shell.mkdir('-p', path.dirname(destDir));

        // Dest file may already exist as read-only
        if (shell.test('-f', destDir))
        	shell.chmod('u+w', destDir);

        shell.cp('-Rf', srcDir, destDir);
    } catch (err) {
    	log.verbose(hookConsts.HOOK, err);
        throw externalizedStrings.unexpectedErr;
    }
};

Hook.prototype.readFile = function (filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (err) {
    	log.verbose(hookConsts.HOOK, err);
        throw externalizedStrings.unexpectedErr;
    }
};

Hook.prototype.writeFile = function (filePath, buffer) {
    try {
        fs.writeFileSync(filePath, buffer);
    } catch (err) {
    	log.verbose(hookConsts.HOOK, err);
        throw externalizedStrings.unexpectedErr;
    }
};

Hook.prototype.deleteFile = function (filePath) {
    try {
        if (Hook.prototype.exists(filePath))
            fs.unlinkSync(filePath);
    } catch (err) {
    	log.verbose(hookConsts.HOOK, err);
        throw externalizedStrings.unexpectedErr;
    }
};

Hook.prototype.exists = function (filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (err) {
        return false;
    }
};

Hook.prototype.readDir = function (directory) {
    try {
        return fs.readdirSync(directory);
    } catch (err) {
        log.verbose(hookConsts.HOOK, err);
        throw externalizedStrings.unexpectedErr;
    }
};

Hook.prototype.rename = function (origName, newName) {
    try {
        fs.renameSync(origName, newName);
    } catch (err) {
        log.verbose(hookConsts.HOOK, err);
        throw externalizedStrings.unexpectedErr;
    }
};

module.exports = Hook;
