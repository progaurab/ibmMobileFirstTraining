
var Messages = {
    // Add here your messages for the default language.
    // Generate a similar file with a language suffix containing the translated messages.
    // key1 : message1,
  };
  
  var wlInitOptions = {
    // Options to initialize with the WL.Client object.
    // For initialization options please refer to IBM MobileFirst Platform Foundation Knowledge Center.
  };
  
  function wlCommonInit() {
    app.init();
  }
  
  var app = {
    //initialize app
    "init": function init() {
      var buttonElement = document.getElementById("ping_button");
      buttonElement.style.display = "block";
      buttonElement.addEventListener('click', app.testServerConnection, false);
    },
    //test server connection
    "testServerConnection": function testServerConnection() {
  
      var titleText = document.getElementById("main_title");
      var statusText = document.getElementById("main_status");
      var infoText = document.getElementById("main_info");
      titleText.innerHTML = "Hello MobileFirst";
      statusText.innerHTML = "Connecting to Server...";
      infoText.innerHTML = "";
      WL.App.getServerUrl(function (url) {
        infoText.innerHTML = url;
      });
  
      WLAuthorizationManager.obtainAccessToken()
      .then(
          function(accessToken) {
              titleText.innerHTML = "Yay!";
              statusText.innerHTML = "Connected to MobileFirst Server";
  
              var resourceRequest = new WLResourceRequest(
                  "/adapters/javaAdapter/resource/greet/",
                  WLResourceRequest.GET
              );
  
              resourceRequest.setQueryParameter("name", "world");
              resourceRequest.send().then(
                  function(response) {
                      // Will display "Hello world" in an alert dialog.
                      alert("Success: " + response.responseText);
                  },
                  function(response) {
                      alert("Failure: " + JSON.stringify(response));
                  }
              );
          },
  
          function(error) {
              titleText.innerHTML = "Bummer...";
              statusText.innerHTML = "Failed to connect to MobileFirst Server";
          }
      );
    },
  
  }
  
  
  
  
  