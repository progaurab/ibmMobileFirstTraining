// Licensed Materials - Property of IBM
// 5725-I43 (C) Copyright IBM Corp. 2015,2016. All Rights Reserved.
// US Government Users Restricted Rights - Use, duplication or
// disclosure restricted by GSA ADP Schedule Contract with IBM Corp.

'use strict';
var fs = require('fs'),
    path = require('path'),
    crc = require('crc'),
    log = require('npmlog');

var CR = '\r'.charCodeAt(0);    // numeric representation of \r character
var excludelist = ['skinLoader.js', 'checksum.js', '.DS_Store', '.jazzignore', '.gitignore', '.gitattributes', 'Thumbs.db'];

// Mimics the MFP EOLConvertingInputStream.java method which
// strips out all '/r' characters from the buffer.
function _eolConverter(inBuf) {
    var j = 0;
    for (var i = 0; i < inBuf.length; i++) {
            if (inBuf[i] === CR) { // '\r' == 13
                continue;
            }

            inBuf[j] = inBuf[i];
            j++;
    }
    return inBuf.slice(0, j);
}

// Returns an array containing all of the files under the specified directory.
// Each file is represented by its relative path name (relative to specified directory)
function _getAllFiles(dir) {
    var filelist = [];
    var files = fs.readdirSync(dir); // Returns array of filenames excluding '.' and '..'

    for (var i = 0; i < files.length; i++) {
        var filefullpath = path.join(dir,files[i]);

        // Add each file under the current dir (don't include dir in path) to the list
        if (fs.statSync(filefullpath).isFile()) {
            filelist.push(files[i]);
        }
        // Add files under a subdir to the list, but include the subdir name
        else if (fs.statSync(filefullpath).isDirectory()) {
            var dirnameArr = filefullpath.split(path.sep); // Split full dir path into folder names
            var dirname = dirnameArr[dirnameArr.length-1]; // Only need last folder name

            // Append all subdir's files to the list, adding the subdir to the relative path
            var concat_filelist = filelist.concat(_getAllFiles(filefullpath).map(
                /*jshint loopfunc:true*/   // Callback function is needed inside loop
                function(filerelpath) {
                    return path.join(dirname, filerelpath);
                }
            ));
            filelist = concat_filelist;
        }
    }

    return filelist;
}

// Takes a directory path, and returns both a running CRC32 checksum
// and a size (in bytes) of all files under the specified directory.
// One side effect is the creation of a 'filelist' file containing
// the relative path+name of each file under the specified directory
// (minus the set of excluded files). The is file is created in the
// top of the specified directory.
//
// Mimics the MFP Java checksum code (below) currently in use by both the
// Java Ant task builds and MFP Server.
//
// BuilderChecksumUtils.java:
//	public static FolderData calculateChecksumAndSize(List<FileData> files)
//			throws IOException, UnsupportedEncodingException {
//		long size=0;
//		Checksum checksum = new CRC32();
//		for (FileData file : files) {
//			checksum = checksum(file.getFile(), checksum);
//			byte[] b = file.getRelativePath().getBytes("UTF-8");
//			checksum.update(b, 0, b.length);
//			size += file.getFile().length();
//		}
//		return new FolderData(checksum, size);
//	}
//
// parameters:
//   dir    - absoute path to directory
// returns  - null if error; otherwise an object in the following format
//            {
//              checksum : <crc32cksum>,
//              size: <totalsizebytes>
//            }
module.exports = function checksumDir(dir) {

    // Validate that the dir path is absolute
    if (path.resolve(dir) !== path.normalize(dir)) {
        log.verbose('checksumDir', 'dir path is NOT absolute!');
        return null;
    }

    // Create a file called 'filelist' at top of the directory
    var filelist = path.join(dir, 'filelist');
    log.silly('checksumDir', 'filelist path = '+filelist);
    var fd = fs.openSync(filelist, 'w');

    // Obtain a sorted list of all file names, including relative paths to specified dir
    var sortedfiles = _getAllFiles(dir).sort();
    log.silly('checksumDir', 'sorted files: ', sortedfiles);

    // Filter out files not to be included in the checksum or size calculation
    var filteredfiles = sortedfiles.filter( function(file) {
        var filename = file.split(path.sep).pop();  // remove the path to get the file name
        return (excludelist.indexOf(filename) === -1);
    });
    log.silly('checksumDir', 'sorted filtered files: ', filteredfiles);

    // Write out sorted, filtered file names to filelist file. Each file name
    // is a relative path in the existing MFP format: 1) Use UNIX path separators
    // 2) prefix the UNIX path separator to each path
    var filelistFilenames = filteredfiles.map( function(fname) {
        return (path.sep + fname).replace(/\\/g, '/');
    });
    log.silly('checksumDir', 'filelist input:\n'+filelistFilenames.join('\n'));
    fs.writeSync(fd, filelistFilenames.join('\n'));
    fs.closeSync(fd);

    // For each file, calculate a running checksum and size
    // NOTE: If the checksum value is 0, DO NOT pass the checksum into the crc32 method;
    //       this results in a running checksum that differs from MFP Java checksum
    var crcTotalChecksum = 0;
    var singleFileChecksum = 0;
    var singlePathChecksum = 0;
    var totalsize = 0;
    for (var i = 0; i < filteredfiles.length; i++) {
        singleFileChecksum = crc.crc32(_eolConverter(fs.readFileSync(path.join(dir,filteredfiles[i]))));
        if (crcTotalChecksum === 0) {
            crcTotalChecksum = crc.crc32(_eolConverter(fs.readFileSync(path.join(dir,filteredfiles[i]))));  // initial checksum.  Don't specify encoding option to obtain raw buffer.  Using a previous chksum val of 0, is not the same
        }
        else {
            crcTotalChecksum = crc.crc32(_eolConverter(fs.readFileSync(path.join(dir,filteredfiles[i]))), crcTotalChecksum); // incremental checksum. Don't specify encoding option to obtain raw buffer.
        }

        // Also include the checksum of each file's relative path string.
        // The worklight Java code check summed the path string using UTF8 encoding
        // Since JavaScript strings are UTF16 (2 octets per char), convert to the
        // file path to UTF8 before encoding it.
        //log.silly('checksumDir', 'cksum of file path utf16 string '+filteredfiles[i]+' = '+crc.crc32(filteredfiles[i]));
        var utf8buf = new Buffer(filelistFilenames[i], 'utf8');
        singlePathChecksum = crc.crc32(utf8buf);
        //log.silly('checksumDir', 'file path utf8 buffer: ',utf8buf);  // utf8buf Prints as <Buffer 2f 66 69 6c 65 42 2e 74 78 74>
        if (crcTotalChecksum === 0) {
            crcTotalChecksum = crc.crc32(utf8buf);
        }
        else {
            crcTotalChecksum = crc.crc32(utf8buf, crcTotalChecksum);
        }

        var filesize = fs.statSync(path.join(dir,filteredfiles[i])).size;
        totalsize += filesize;

        log.silly('checksumDir', 'File: '+filteredfiles[i]+'  cksum = '+singleFileChecksum +
                            '  size = '+filesize +
                            '  filepath = '+ utf8buf +
                            '  pathcksum = '+singlePathChecksum +
                            '  filepath buffer = ',utf8buf);
    }

    log.verbose('checksumDir', 'Total checksum = '+crcTotalChecksum+';  Total size = '+totalsize);
    return { 'checksum' : crcTotalChecksum, 'size' : totalsize };
};
