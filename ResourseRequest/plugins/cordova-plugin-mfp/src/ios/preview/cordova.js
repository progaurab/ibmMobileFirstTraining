/**
* @license
* Licensed Materials - Property of IBM
* 5725-I43 (C) Copyright IBM Corp. 2006, 2013. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/

/*******************************************************************************
 * This file is needed for PhoneGap simulation in the Mobile Browser 
 * Simulator.
 *******************************************************************************/
var mbs_path = window.parent.location.pathname;
var p = mbs_path.indexOf("index");
var _mbs_cordova_sim_js_file = mbs_path.substring(0, p) + "cordova/cordovasim.js";
function _mbs_cordova_sim_load_js() {
	var xhrObj = new XMLHttpRequest();
	xhrObj.open('GET', _mbs_cordova_sim_js_file, false);
	xhrObj.send('');
	if (xhrObj.status != 200) {
	   // Cannot load cordovasim.js...
	   // Taken from https://gist.github.com/476358
	   var safariDebug = ( navigator.platform.indexOf("iPhone") < 0 && navigator.platform.indexOf("iPod") < 0 && navigator.platform.indexOf("iPad") < 0 );
	   Cordova = cordova || Cordova;
	   if(safariDebug) {
		   Cordova.run_command = function() {
		       if (!Cordova.available || !Cordova.queue.ready)
		           return;

		       Cordova.queue.ready = false;

		       var args = Cordova.queue.commands.shift();
		       if (Cordova.queue.commands.length == 0) {
		           clearInterval(Cordova.queue.timer);
		           Cordova.queue.timer = null;
		       }

		       var uri = [];
		       var dict = null;
		       for (var i = 1; i < args.length; i++) {
		           var arg = args[i];
		           if (arg == undefined || arg == null)
		               arg = '';
		           if (typeof(arg) == 'object')
		               dict = arg;
		           else
		               uri.push(encodeURIComponent(arg));
		       }
		       var url = "gap://" + args[0] + "/" + uri.join("/");
		       if (dict != null) {
		           var query_args = [];
		           for (var name in dict) {
		               if (typeof(name) != 'string')
		                   continue;
		               query_args.push(encodeURIComponent(name) + "=" + encodeURIComponent(dict[name]));
		           }
		           if (query_args.length > 0)
		               url += "?" + query_args.join("&");
		       }
		       console.log(url);
		   	setTimeout(function(){Cordova.queue.ready = true;},10); // so the next one can go

		   };

		   setTimeout(function(){
			   if (typeof DeviceInfo == "undefined") {
				   DeviceInfo = {};
			   };
			   DeviceInfo.uuid = "testing";
			   },2000);
	   }
	} else {
		// Success : we reset the original Cordova init and load the Cordova simulation JS Code
		if (typeof cordova !== "undefined") {
			var handlers = cordova.getOriginalHandlers();
			if (typeof handlers.document !== "undefined") {
				if (typeof handlers.document.addEventListener !== "undefined")
					document.addEventListener = handlers.document.addEventListener;
				if (typeof handlers.document.removeEventListener !== "undefined")
					document.removeEventListener = handlers.document.removeEventListener;
			}
			if (typeof handlers.window !== "undefined") {
				if (typeof handlers.window.addEventListener !== "undefined")
					window.addEventListener = handlers.window.addEventListener;
				if (typeof handlers.window.removeEventListener !== "undefined")
					window.removeEventListener = handlers.window.removeEventListener;
			}
			delete cordova;
		}
		if (typeof PhoneGap !== "undefined") {
			delete PhoneGap;
		}
		eval(xhrObj.responseText);
		if (typeof Cordova !== "undefined") {
			cordova = Cordova;
		}
		cordova.require = function (){ return {onPluginsReady : { fire : function (){}}}};
	}
}
