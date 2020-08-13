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
//  WLAppDelegate.h
//

#pragma mark -
#pragma mark - WL lifecycle events constants
extern NSString *const WLapplicationHandleOpenURL;
extern NSString *const WLapplicationDidReceiveLocalNotification;
extern NSString *const WLapplicationDidRegisterForRemoteNotificationsWithDeviceToken;
extern NSString *const WLapplicationDidFailToRegisterForRemoteNotificationsWithError;
extern NSString *const WLapplicationDidReceiveRemoteNotification;
typedef void (^CompletionHandler)(UIBackgroundFetchResult);

/**
 *
 * WLAppDelegate is the base IBM MobileFirst Platform hybrid application class implementing the `UIApplicationDelegate` protocol.
 * Extending this class allows you to utilize the IBM MobileFirst Platform framework API.
 */
@interface WLAppDelegate : UIResponder <UIApplicationDelegate>{
    
}

@property (nonatomic, strong) IBOutlet UIWindow* window;

@property (nonatomic, strong) NSMutableDictionary* launchOptions;

@property (nonatomic, strong) NSMutableDictionary *completionHandlers;

@end
