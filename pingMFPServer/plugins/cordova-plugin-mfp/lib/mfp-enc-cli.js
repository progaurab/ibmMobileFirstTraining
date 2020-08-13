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
var nopt = require('nopt');
var log = require('npmlog');
var Q = require('q');

// Private modules
var encApi = require('./mfp-enc-api');  // function encryptWebResources (wwwFolderPath, options)
var encConsts = require('./mfp-enc-consts');

var ModuleName = 'mfp-enc-cli';
var exitCode = 0;

// Parse the CLI arguments
var encCliOpts = nopt({
  path: String,
  chunk: Boolean,
  size: Number,
  debug: Boolean,
  ddebug: Boolean
}, {
  p: '--path',
  c: '--chunk',
  s:'--size',
  d:'--debug',
  dd:'--ddebug',
});

if (encCliOpts.debug) {
    log.level = 'verbose';
}
if (encCliOpts.ddebug) {
    log.level = 'silly';
}

var path = encCliOpts.path;
var chunk = encCliOpts.chunk || false;
var chunksize = encCliOpts.size || encConsts.WEB_RESOURCES_ENCRYPT_DEFAULT_SPLIT_FILE_SIZE;
var encApiOpts = {
    'splitFile' : chunk,
    'splitSize' : chunksize
};

log.silly(ModuleName, 'opts = '+JSON.stringify(encCliOpts));
log.silly(ModuleName, 'path = '+path);
log.silly(ModuleName, 'chunk = '+chunk);
log.silly(ModuleName, 'chunksize = '+chunksize);

try {
    fs.accessSync(path);  // Throws err if path is undefined or does not exist
    var promise = encApi(path, encApiOpts).then(
        function() {
            exitCode = 0;
        },
        function(err) {
            log.verbose(ModuleName, 'encApi failure: '+err);
            exitCode = 1;
        }
    );
    promise.finally(
        function() {
            log.silly(ModuleName, 'Exiting: '+exitCode);
            process.exit(exitCode);
        }
    );
}
catch(err) {
    log.verbose(ModuleName, 'Exception caught: '+err);
    exitCode = 1;
    process.exit(exitCode);
}

