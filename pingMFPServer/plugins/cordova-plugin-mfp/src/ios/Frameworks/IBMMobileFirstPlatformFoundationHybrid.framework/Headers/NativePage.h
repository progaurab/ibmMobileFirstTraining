/**
	Licensed Materials - Property of IBM

	(C) Copyright 2015 IBM Corp.

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

//
//  NativePage.h
//

#import <Foundation/Foundation.h>
#import <Cordova/CDVPlugin.h>

@interface NativePage : CDVPlugin
{
	@private
    NSMutableDictionary* controllerObjects;
    @private
    id showWebViewObserver;
}

@property (nonatomic, strong) NSMutableDictionary *controllerObjects;

/**
 Returning control to the web view from an Objective-C page
 
 To switch back to the web view, follow these instructions.
 
 Before you begin
 The native page must be implemented as an Objective-C class that inherits from UIViewController. This UIViewController class must be able to initialize through the init method alone. The initWithNibName:bundle: method is never called on this class instance.
 Procedure
 In the native page, call the [NativePage showWebView:] method and pass it an NSDictionary object (the object can be empty). This NSDictionary can be structured with any hierarchy. The IBM® Worklight® runtime framework encodes it in JSON format, and then sends it as the first argument to the JavaScript callback function.
 
 @param data The data to pass from the native page back to the web view
 */
+(void)showWebView:(NSDictionary *)data;
@end
