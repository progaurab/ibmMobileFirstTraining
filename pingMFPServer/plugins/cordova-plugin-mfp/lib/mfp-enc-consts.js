/*
   Licensed Material - Property of IBM

   (C) Copyright 2016 IBM Corp.

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

/*jslint node:true */
/*jshint node:true */

'use strict';

function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });
}

// Web resource encryption constants
define('WEB_RESOURCES_UNENCRYPTED_ZIPFILE_NAME', 'resources.zip.unencrypted');
define('WEB_RESOURCES_ENCRYPTED_ZIPFILE_NAME', 'resources.zip');
define('WEB_RESOURCES_ENCRYPT_DEFAULT_SPLIT_FILE_SIZE', 768);
define('WEB_RESOURCES_ENCRYPT_ANDROID_SPLIT_FILE_SIZE', 768);

