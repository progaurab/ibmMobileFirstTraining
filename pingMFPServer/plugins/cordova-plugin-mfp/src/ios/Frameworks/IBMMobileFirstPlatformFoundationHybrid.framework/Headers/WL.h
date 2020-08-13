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
//  WL.h
//  WorklightStaticLibProject
//
//

#import <Foundation/Foundation.h>
#import <Cordova/CDVWebViewEngineProtocol.h>
#import "WLWebFrameworkInitResult.h"
#import "WLActionReceiver.h"

#pragma mark -
#pragma mark - WL public API
/**
 * The WLInitWebFrameworkDelegate protocol declares the method wlInitWebFrameworkDidCompleteWithResult.
 * This method provides information about the result of the IBM MobileFirst Platform web framework initialization.
 *
 */
@protocol WLInitWebFrameworkDelegate <NSObject>
@required
/**
 *
 * This method is called after the IBM MobileFirst Platform web framework initialization is complete and web resources are ready to be used.
 *
 *@param WLWebFrameworkInitResult: result The initialization result
 */
-(void)wlInitWebFrameworkDidCompleteWithResult:(WLWebFrameworkInitResult *)result;
@end
/**
 *
 * The WL singleton class provides a centralized point of control and coordination for IBM MobileFirst Platform hybrid apps.
 * A major role of this class is to handle the initialization of a IBM MobileFirst Platform hybrid application.
 *
 */
@interface WL : NSObject
/**
 * Get the singleton instance
 */
+ (id)sharedInstance;

/** Initialize the IBM MobileFirst Platform web framework
 
 @param delegate
 */
-(void) initializeWebFrameworkWithDelegate :(id)delegate;
/**
 * This method returns the path to the application main HTML file.
 * @warning This API should be used after the successful callback of wlInitWebFrameworkDidCompleteWithResult. This is to ensure that the IBM MobileFirst Platform framework initialization is complete and the web resources are ready to be used.
 *
 * @returns the URL of the main HTML file
 */
-(NSString *) mainHtmlFilePath;

/**
 * This method will show a splash screen on-top of the current window.
 *
 * IBM MobileFirst Platform default application will show a splash screen during application start-up, and will hide it using the JavaScript API WL.App.hideSplashScreen(), once the main html page is loaded.
 * This is done to improve the user experience and allow smooth transition from the native application container to the WebView, hiding the underlying page loading activity.
 * This method will use the launch images supplied in the application XCode project.
 * This method is not related to the splash screen feature which is available through the Cordova framework.
 *
 * @warning A root view controller must be defined before calling this method.
 */
-(void) showSplashScreen;

/**
 * Hides a shown splash screen.
 *
 */
-(void) hideSplashScreen;

/**
 * Sends action to JavaScript action receivers.
 *
 * Note: if there are no JavaScript action receivers registered, the action is queued until a JavaScript action receiver is registered.
 *
 * @param action custom string representing an action
 */
-(void)sendActionToJS:(NSString*)action;

/**
 * Sends action and optional data object to JavaScript action receivers.
 *
 * Note: if there are no JavaScript action receivers registered, the action is queued until a JavaScript action receiver is registered.
 * <p>
 * Example:
 * </p>
 *
 *		[[WL sharedInstance] sendActionToJS:@"doSomething"];
 *		NSMutableDictionary *data = [NSDictionary dictionaryWithObject:@"12345" forKey:@"customData"];
 *		[[WL sharedInstance] sendActionToJS:@"doSomething" data:data];
 *
 * @param action custom string representing an action
 * @param data (optional) custom NSDictionary instance containing key-value pairs
 */
-(void)sendActionToJS:(NSString *)action withData:(NSDictionary*)data;

/**
 * Registers a new native action receiver with the Worklight framework.
 *
 * @param actionReceiver object that implements the WLActionReceiver protocol
 * @since IBM Worklight V6.2.0
 *
 * <p>
 * Example:
 * </p>
 *
 * 		MyReceiver *myReceiver = [MyReceiver new];
 * 		[[WL sharedInstance] addActionReceiver:myReceiver];
 *
 */
-(void)addActionReceiver:(id<WLActionReceiver>)wlActionreceiver;

/**
 * Unregisters a receiver from receiving actions.
 * After calling this API, the receiver will no longer receive actions.
 *
 * @param actionReceiver object that implements the WLActionReceiver protocol
 *
 * <p>
 * Example:
 * </p>
 *
 * 		MyReceiver *myReceiver = [MyReceiver new];
 * 		[[WL sharedInstance] removeActionReceiver:myReceiver];
 *
 */
-(void)removeActionReceiver:(id<WLActionReceiver>)wlActionreceiver;

/**
 * Sets the IBM MobileFirst Platform server URL to the specified URL.
 *
 * Changes the IBM MobileFirst Platform server URL to the new URL and cleans the HTTP client context.
 * After calling this method, the application is not logged in to any server.
 * <p></p>
 * Notes:
 * <ul>
 * <li>The responsibility for checking the validity of the URL is on the developer.
 * <li>For hybrid applications: This call does not clean the HTTP client context saved in JavaScript.
 * For hybrid applications, it is recommended to set the server URL by using the following JavaScript function: <code>WL.App.setServerUrl</code>.
 * </ul>
 *
 * Example:
 *
 *   	[[WL sharedInstance] setServerUrl:[NSURL URLWithString:@"http://9.148.23.88:10080/context"]];</code>
 *
 * @param url - The URL of the new server, including protocol, IP, port, and context.
 */
- (void) setServerUrl: (NSURL*) url;

/**
 * Returns the current IBM MobileFirst Platform server URL
 *
 * @return IBM MobileFirst Platform server URL
 */
- (NSURL*) serverUrl;

/**
 * Sets the Ionic base server URL
 *
 * @param serverPath - Base URL which needs to be set
 * @param webViewEngine - Instance of Ionic webview
 */
- (void) updateIonicBaseServerPath:(NSString*)serverPath webView:(id<CDVWebViewEngineProtocol>) webViewEngine;

@end

