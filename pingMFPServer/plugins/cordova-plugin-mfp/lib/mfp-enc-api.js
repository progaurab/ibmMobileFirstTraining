/*
   Licensed Material - Property of IBM

   (C) Copyright 2016 IBM Corp.

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
'use strict';

// Public modules
var fs = require('fs');
var path = require('path');
var log = require('npmlog');
var Q = require('q');
var archiver = require('archiver');
var rimraf = require('rimraf');

// Private modules
var encConsts = require('./mfp-enc-consts');
var utils = require('../hooks/utils/hook');

var ModuleName = 'mfp-enc-api';


// Zip up entire folder contents into single .zip file with the supplied name
// The .zip file is placed in the folder's parent folder (as a peer to the folder)
// The contents of the folder remain untouched
function zipFolderContents(folder, zipFileName) {
  var defer = Q.defer();

    // Create the .zip in the folder above the target; otherwise it will
    // be included in the .zip file, causing a potentially infinite loop
  var zipFilePath  = path.normalize(path.join(folder, '..', zipFileName));

    log.verbose(ModuleName, 'zipFolderContents: zipping folder: '+folder+' into '+zipFilePath);

  // Create a writeable stream that will write out the .zip file
  var zipTempFileWriteStream = fs.createWriteStream(zipFilePath, {'flags': 'w'})   // Overwrite existing
    .addListener('finish', function() {
        log.silly(ModuleName, 'zipFolderContents: temp zip complete');
        defer.resolve();
    })
    .addListener('error', function(err) {
    log.verbose(ModuleName, 'zipFolderContents: temp zip write stream failure: '+err+' '+JSON.stringify(err));
    defer.reject(err);
    });

    // Create and configure a .zip archiver transform stream
  var archive = archiver('zip')
    .addListener('error', function(err) {
    log.verbose(ModuleName, 'zipFolderContents: Failure creating zip file: '+err+' '+JSON.stringify(err));
    defer.reject(err);
  });

    // This does the work
    archive.pipe(zipTempFileWriteStream);
    archive.directory(folder, '').finalize();

  return defer.promise;
}

// Encrypt the specified file into another file using the supplied file name
// The encrypted file is placed into the same folder as the unencrypted file
// The unencrypted file remains untouched
function encryptFile(unencryptedFilePath, encryptedFilePath) {
     var crypto = require('crypto');
     var defer = Q.defer();
     var assetsFolderPath=path.join(unencryptedFilePath,'..','..');//path to assets folder
     var group = assetsFolderPath.split(path.sep);
     var folderAssets = group.pop();//assets folder
     
    log.verbose(ModuleName, 'encryptFile: encrypting: '+unencryptedFilePath+' into '+encryptedFilePath);

    // Define the cipher transform stream that reads unencrypted data and writes encrypted data
    // NOTE: iOS : node.js crypte createCipher used here will generate the key material from the password
    //       by calling the openSSL EVP_BytesToKey function with MD5 digest, no salt, one iteration.
    //       The equivalent Java key generation only needs to run the password through the MD5 digest
    //           byte[] keyb = password.getBytes("UTF-8");
    //           java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
    //           byte[] thedigest = md.digest(keyb);// returns 16 byte (128-bit) value

    // Auto created key material; password is code snippet for decompilation obfuscation

    //Android : node.js crypte createCipheriv with key  and iv parameters are used.
    

    if(folderAssets=='assets'){//assets folder exists indicates that encryption is for Android done using AES-256-CBC algo in js and equivalent AES/CBC/PKCS5Padding  in java are used.
        
      var iv = new Buffer([0x6D,0x4C,0x63,0x6B,0x32,0x46,0x38,0x59,0x49,0x73,0x74,0x6F,0x72,0x61,0x65,0x50]);//iv parameter
       
      var encodeKey = crypto.createHash('sha256').update('x+=x;', 'utf-8').digest();//Generater Key parameter
      var cipher =crypto.createCipheriv('AES-256-CBC', encodeKey, iv)
        .addListener('error', function(err) {
            log.verbose(ModuleName, 'encryptFile: Cipher error! '+err);
            defer.reject(err);
           })
        .addListener('end', function() {
            log.silly(ModuleName, 'encryptFile: end of encryption stream');
        });
     }else{
    var cipher = crypto.createCipher('aes-128-ecb', 'x+=x;')
      .addListener('error', function(err) {
          log.verbose(ModuleName, 'encryptFile: Cipher error! '+err);
          defer.reject(err);
        })
      .addListener('end', function() {
        log.silly(ModuleName, 'encryptFile: end of encryption stream');
      });
    }
    

    // Define the readable stream that reads in the unencrypted file
    var unencryptedFileReadStream = fs.createReadStream(unencryptedFilePath, {'flags' : 'r', 'encoding' : null, 'bufferSize' : 4*1024})
    .addListener('error', function(err) {
        log.verbose(ModuleName, 'encryptFile: Read error! '+err);
        defer.reject(err);
    })
    .addListener('end', function() {
        log.silly(ModuleName, 'encryptFile: end of reading unencrypted file');
    });

    // Define the writeaable stream that writes out the encrypted file
    var encryptedFileWriteStream = fs.createWriteStream(encryptedFilePath, {'flags' : 'w', 'encoding': null})
    .addListener('error', function(err) {
        log.verbose(ModuleName, 'encryptFile: Write error! '+err);
        defer.reject(err);
    })
    .addListener('finish', function() {
        log.silly(ModuleName, 'encryptFile: end of writing encrypted file');
        defer.resolve();
    });

    // This does it all.  Read unencrypted file -> cipher -> write encrypted file
    unencryptedFileReadStream.pipe(cipher).pipe(encryptedFileWriteStream);

  return defer.promise;
}

// Split up the specified file into one or more files each having a size equal to
// or less than the specified chunksize.
// The split file names have the format : source file name + "." + NNN (001-999)
// Example.  Input file name = MyFile.txt.   Split files = MyFile.txt.001, .... 
function splitFileIntoChunks(filePath, chunkSize) {
    var folder = path.dirname(filePath);
    var filename = path.basename(filePath);
    var sequenceNum = 0;
    var keepReading = true;
    var readBuf = new Buffer(1024);

    log.verbose(ModuleName, 'splitFileIntoChunks: splitting file '+filePath+' into '+chunkSize+'KB sized files');
    try {
        var fdSrcFile = fs.openSync(filePath, 'r');
        while (keepReading) { 
            var NNNstr = '00'+(++sequenceNum);
            var NNN = NNNstr.slice(-3);  // zero pad NNN
            var targetFileName = filename+'.'+NNN;
            var targetFilePath = path.join(folder, targetFileName)
            log.silly(ModuleName, 'splitFileIntoChunks: opening file '+targetFilePath);
            var fdTargetFile = fs.openSync(targetFilePath, 'w');

            var totalBytesRead = 0;
            while (keepReading && totalBytesRead < chunkSize) {
                var bytesRead = fs.readSync(fdSrcFile, readBuf, 0, readBuf.length, null);
                totalBytesRead += bytesRead;
                log.silly(ModuleName, 'splitFileIntoChunks: read '+bytesRead+' bytes (total '+totalBytesRead+') from file '+filePath);
                if (bytesRead === 0) {
                    keepReading = false;
                }
                else {
                    fs.writeSync(fdTargetFile, readBuf, 0, bytesRead);
                    log.silly(ModuleName, 'splitFileIntoChunks: wrote '+bytesRead+' bytes to file '+targetFilePath);
                }
            }
            log.silly(ModuleName, 'splitFileIntoChunks: closing file '+targetFilePath);
            fs.close(fdTargetFile);        
        }

        fs.close(fdSrcFile);
    }
    catch (err) {
        log.verbose(ModuleName, 'splitFileIntoChunks: exception: '+err);
    }

}

// Delete the entire folder contents minus the folder itself
function deleteFolderContents(folder) {
    log.verbose(ModuleName, 'deleteFolderContents: folder: '+folder);
    var filesArr = fs.readdirSync(folder);
    log.silly(ModuleName, 'deleteFolderContents: folder readdir: '+filesArr);
    for (var i=0; i < filesArr.length; i++) {
        log.silly(ModuleName, 'deleteFolderContents: rm -f '+filesArr[i]);
        try {
            rimraf.sync(path.join(folder, filesArr[i]));
        }
        catch(err) {
            log.verbose(ModuleName, 'deleteFolderContents: rimraf exception: '+err);
        }
    }
}

/*
 Encrypts the contents of the specified web resources www/ folder.
 The contents are zipped up into a single file and then encrypted.
 If the platform is Android, then the encrypted file is split into multiple
 files each having a size of <= 768KB
 The original contents are deleted, leaving only the encrypted file(s) in the www/ folder

 args:
   wwwFolderPath - path of platform www/ folder to encrypt
   options - object of the format
      {
         splitFile : true | false;  // When true, encrypted file will
                                    // be split into files <= splitSize each
         splitSize : <integer in KB (1024 bytes)>
      }

 returns:
   promise
*/
function encryptWebResources (wwwFolderPath, options) {
    var defer = Q.defer();
    var splitFile = options && options.splitFile || false;
    var splitSizeKb = (options && options.splitSize) || encConsts.WEB_RESOURCES_ENCRYPT_DEFAULT_SPLIT_FILE_SIZE;

    log.verbose(ModuleName, 'encryptWebResources: wwwFolderPath = '+wwwFolderPath+' splitFile = '+splitFile+' splitSize = '+splitSizeKb);
    
    var unencryptedZipFilePath = path.join(wwwFolderPath, encConsts.WEB_RESOURCES_UNENCRYPTED_ZIPFILE_NAME);
    var encryptedZipFilePath = path.join(wwwFolderPath, encConsts.WEB_RESOURCES_ENCRYPTED_ZIPFILE_NAME);
    var tempUnencryptedZipFilePath = path.join(wwwFolderPath, '..', encConsts.WEB_RESOURCES_UNENCRYPTED_ZIPFILE_NAME);

    // Zip up the contents of the entire www/ folder; temp zip file is created as peer to www/ folder (not in the www/ folder)
    zipFolderContents(wwwFolderPath, encConsts.WEB_RESOURCES_UNENCRYPTED_ZIPFILE_NAME)
    .then( function() {
               log.verbose(ModuleName, 'encryptWebResources: Successful zip file creation '+encConsts.WEB_RESOURCES_UNENCRYPTED_ZIPFILE_NAME);

               // Remove contents of www/ folder (zip file is a peer to the www/ folder)
               deleteFolderContents(wwwFolderPath);

               // Move the unencrypted .zip file under the target www/ folder
               log.silly(ModuleName, 'encryptWebResources: moving file '+tempUnencryptedZipFilePath+' to '+unencryptedZipFilePath);
               utils.prototype.moveFile(tempUnencryptedZipFilePath, unencryptedZipFilePath);

               // Encrypt the zip file
               return encryptFile(unencryptedZipFilePath, encryptedZipFilePath);
           },
           function(err) {
               log.verbose(ModuleName, 'encryptWebResources: zip file '+tempUnencryptedZipFilePath+' creation failure  '+err);
                defer.reject(err);
           }
    )
    .then( function() {
               log.verbose(ModuleName, 'encryptWebResources: Successfully encrypted the zip file '+encryptedZipFilePath);

               // zip file is encrypted; now delete unencrypted zip file
               fs.unlinkSync(unencryptedZipFilePath);

               // Android 2.2 does not support compressed assets larger than 1MB
               // If needed, split up the encrypted file into smaller files and then delete the original encrypted file
               if (splitFile) {
                   log.silly(ModuleName, 'encryptWebResources: Splitting up encrypted file: '+encryptedZipFilePath);
                   splitFileIntoChunks(encryptedZipFilePath, 1024*splitSizeKb);
                   log.silly(ModuleName, 'encryptWebResources: Deleting original/large encrypted file: '+encryptedZipFilePath);
                   fs.unlinkSync(encryptedZipFilePath);
               }
               defer.resolve();
           },
           function(err) {
                log.verbose(ModuleName, 'encryptWebResources: zip file encryption failure  '+err);
                defer.reject(err);
           }
    );

  return defer.promise;

};

module.exports = encryptWebResources;
