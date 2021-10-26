var Messages = {
    // Add here your messages for the default language.
    // Generate a similar file with a language suffix containing the translated messages.
    // key1 : message1,
  };
  
  var wlInitOptions = {
    // Options to initialize with the WL.Client object.
    // For initialization options please refer to IBM MobileFirst Platform Foundation Knowledge Center.
  };
  
function wlCommonInit(){

    //initialize app for push notification
         MFPPush.initialize (
             function(successResponse) {
                 alert("Push Notification Successfully intialized");
                 MFPPush.registerNotificationsCallback(notificationReceived);
             },
             function(failureResponse) {
                 alert(failureResponse);
             }
         );
 
         //Check device is Supported for push notification
         MFPPush.isPushSupported (
             function(successResponse) {
                 alert("Device is Push Supported");
             },
             function(failureResponse) {
                 alert("Failed to get push support status");
             }
         );
 
         //register app for push notification
         MFPPush.registerDevice( null,
             function(successResponse) {
                     alert("Device Successfully registered");
             },
             function(failureResponse) {
                 alert(failureResponse);
             }
         );
-------------------
        // Get Tags
        MFPPush.getTags(
            function(newTags) {
                 alert(JSON.stringify(newTags));
                 console.log(JSON.stringify(tags));
            },
            function(failureResponse){
                 alert("Failed to get tags");
                 console.log("Failed to get tags:" + JSON.stringify(failureResponse));
            }
         )

        // Get Subscription
        MFPPush.getSubscriptions(
            function(subscriptions) {
                alert(JSON.stringify(subscriptions));
                console.log(JSON.stringify(subscriptions));
             },
            function(failureResponse){
                alert("Failed to get subscriptions");
                console.log("Failed to get subscriptions:" + JSON.stringify(failureResponse));
            }
        )
 

        // subscribe tags
        tags = ['transactional','testTag3'];
        MFPPush.subscribe(
            tags,
            function(tags) {
                alert("Subscribed successfully");
                console.log(JSON.stringify(tags));
            },function(failureResponse){
                alert("Failed to subscribe");
                console.log("Failed to subscribe:" + JSON.stringify(failureResponse));
            }
        )

    tags2 = ['testTag3', 't1'];
    MFPPush.unsubscribe(
        tags2,
        function(tags2) {
            alert("Unsubscribed successfully");
            console.log(JSON.stringify(tags2));
        },
        function(failureResponse){
            alert("Failed to unsubscribe");
            console.log("Failed to unsubscribe:" + JSON.stringify(failureResponse));
        }
    )

    //unregister
    MFPPush.unregisterDevice(
        function(successResponse) {
           alert("Unregistered successfully");
           disableButtons();
       },
       function(failureResponse){
           alert("Failed to unregister");
           console.log("Failed to unregister:" + JSON.stringify(failureResponse));
       }
    )

         var notificationReceived = function(message) {
             alert(JSON.stringify(message));
         };
 }