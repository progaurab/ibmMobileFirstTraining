// Licensed Materials - Property of IBM
// 5725-I43 (C) Copyright IBM Corp. 2015, 2016. All Rights Reserved.
// US Government Users Restricted Rights - Use, duplication or
// disclosure restricted by GSA ADP Schedule Contract with IBM Corp.

var fs = require('fs');
var path = require('path');
var log = require('npmlog');
var os = require('os');

// Creates a checksum.js file that will be placed in the targetdir
//
// The checksum.js file defines a single JSON variable, WL_CHECKSUM,
// with the following format:
// {
//   "checksum" : <checksum of wlapp's www folder contents>,
//   "date"     : <current time in milliseconds>,
//   "machine"  : <localhost's host name>
// }
//
// Generated checksum.js file will look like:
// var WL_CHECKSUM = {"checksum":3555316750,"date":1430744771075,"machine":"mwd-canyon"};
// /* Date: Mon May 04 09:06:11 EDT 2015 */
//
// Parameters:
//   checksum  - checksum value of the wlapp's www folder contents
//   targetdir - directory under which to place the checksum.js
//
// Returns:
//   boolean   - true when checksum.js file created successfully; false otherwise
function createChecksumJsFile(checksum, targetdir) {
    var retVal = true;
    var now = new Date();
    var checksumJson = {};

	var filepath;
	//if no path is set use cwd
	if(targetdir === undefined) {
		filepath = targetdir.resolve(process.cwd(), 'tmp');
	} else {
		filepath = targetdir;
	}
    log.silly('createChecksumJsFile', 'path to checksum.js folder = '+filepath);

    // build JSON checksum object
    checksumJson.checksum = checksum;   // www folder checksum value
    checksumJson.date = now.getTime();  // Time in milliseconds
    checksumJson.machine = os.hostname();

    // build the file contents
    var contents = 'var WL_CHECKSUM = '+JSON.stringify(checksumJson);
    contents += '\n/* Date: ' + now.toString() + ' */';

    // Create the checksum.js file.  Create if does not exist; overwrite if exists
    try {
        var filename = 'checksum.js';
        filepath = path.join(targetdir,filename);

        // if the file already exists, make sure it's writeable
        try {
            log.silly('createChecksumJsFile', 'chmod +w any existing checksum file '+filepath);
            fs.chmodSync(filepath, 0666);
        }
        catch(e) {
            // A non-existent checksum.js file is possible; chmod failure in this case is OK
            if (e.code !== 'ENOENT') {
                log.verbose('createChecksumJsFile', 'chmod '+filepath+' failed: ', JSON.stringify(e));
            }
        }

        fs.writeFileSync(filepath, contents);
    }
    catch(err) {
		log.verbose('mfp-create-checksum', 'Root level: wlapp-builder: Exception occured during file write of checksum.js: '+err+' '+JSON.stringify(err));
        retVal = false;
    }

	return retVal;
}


module.exports = createChecksumJsFile;
