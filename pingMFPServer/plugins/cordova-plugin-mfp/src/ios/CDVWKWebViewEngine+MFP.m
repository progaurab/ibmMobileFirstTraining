/**
 Licensed Materials - Property of IBM
 
 (C) Copyright 2019 IBM Corp.
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

//
//  CDVWKWebViewEngine+MFP.m
//  IBMMobileFirstPlatformFoundation
//
//  Created by Vittal R Pai on 02/01/19.
//

#if defined(__has_include)
#if __has_include("CDVWKWebViewEngine.h")

#import "CDVWKWebViewEngine.h"
#import <IBMMobileFirstPlatformFoundationHybrid/IBMMobileFirstPlatformFoundationHybrid.h>

@interface CDVWKWebViewEngine(MFP)
@property (nonatomic, readwrite) NSString *CDV_LOCAL_SERVER;
@end

@implementation CDVWKWebViewEngine(MFP)
@dynamic CDV_LOCAL_SERVER;

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-protocol-method-implementation"


// Override loadRequest Method to provide compatability with MF SDK in Ionic App
- (id)loadRequest:(NSURLRequest *)request {
    // Check if it is an ionic webeview
    if (request.URL.isFileURL) {
         // VP : - Check if the app is loaded with Ionic CDVWKWebViewEngine & setServerBasePath Method is available (Ionic wkwebview > 2.x)
         //      - Check if the request url is MFP main html path 
        if ([request.URL.absoluteString isEqualToString:[[WL sharedInstance] mainHtmlFilePath]] && [NSStringFromClass([self class])  isEqual: @"CDVWKWebViewEngine"] && [self respondsToSelector: NSSelectorFromString(@"setServerBasePath:")]) {
            // Change viewcontroller start page to relative path instead of absolute
            NSMutableArray * urlItems = [request.URL pathComponents].mutableCopy;
            ((CDVViewController *)self.viewController).startPage = [urlItems lastObject];
            [[WL sharedInstance] updateIonicBaseServerPath: request.URL.path webView: self];
            return nil;
        } 
        // VP: - Check if the app is loaded with Ionic CDVWKWebViewEngine
        //     - Check if the request url is not a MFP main html path 
        else if (![request.URL.absoluteString isEqualToString:[[WL sharedInstance] mainHtmlFilePath]] &&  [NSStringFromClass([self class])  isEqual: @"CDVWKWebViewEngine"]) {
            NSURL* startURL = [NSURL URLWithString:((CDVViewController *)self.viewController).startPage];
            NSString* startFilePath = [self.commandDelegate pathForResource:[startURL path]];
            NSURL *url = [[NSURL URLWithString:self.CDV_LOCAL_SERVER] URLByAppendingPathComponent:request.URL.path];
            if ([request.URL.path isEqualToString:startFilePath]) {
                url = [NSURL URLWithString:self.CDV_LOCAL_SERVER];
            }
            if(request.URL.query) {
                url = [NSURL URLWithString:[@"?" stringByAppendingString:request.URL.query] relativeToURL:url];
            }
            if(request.URL.fragment) {
                url = [NSURL URLWithString:[@"#" stringByAppendingString:request.URL.fragment] relativeToURL:url];
            }
            request = [NSURLRequest requestWithURL:url];
            return [(WKWebView*)self.engineWebView loadRequest:request];
        } 
        // VP: - Fallback to default mechanism for cordova
        else {
        
        #if TARGET_IPHONE_SIMULATOR
                    //Default
                    return [(WKWebView*)self.engineWebView loadRequest: request];
        #else
                   if ([request.URL.absoluteString rangeOfString:@"Library"].location !=NSNotFound) {
                       return [(WKWebView*)self.engineWebView loadFileURL:request.URL allowingReadAccessToURL:[[request.URL URLByDeletingLastPathComponent] URLByDeletingLastPathComponent]];
                   }
                   else
                   {
                       return [(WKWebView*)self.engineWebView loadFileURL:request.URL allowingReadAccessToURL:[[[NSBundle mainBundle] bundleURL] URLByDeletingLastPathComponent]];
                   }
         #endif
            }
    } else {
        return [(WKWebView*)self.engineWebView loadRequest: request];
    }
}

#pragma clang diagnostic pop

@end

#endif
#endif

