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
//  WLActionReceiver.h
//  WorklightStaticLibProject
//
//  Created by Anton Aleksandrov on 16/03/14.
//

#import <Foundation/Foundation.h>

/**
 * The WLActionReceiver protocol allows every implementing object to receive actions and data from the IBM MobileFirst Platform Framework
 */
@protocol WLActionReceiver <NSObject>

/**
 * Any object can receive actions. To do so, it must implement the following protocol. 
 *
 * Actions will always be delivered on a background thread. 
 * If you want to update the application user interface from the received action, you must do so on a main user interface thread, 
 * for example by using the performSelectorOnMainThread API.
 */ 
-(void)onActionReceived:(NSString *)action withData:(NSDictionary*) data;

@end
