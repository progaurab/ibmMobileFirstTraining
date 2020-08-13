/**
* @license
* Licensed Materials - Property of IBM
* 5725-I43 (C) Copyright IBM Corp. 2006, 2013. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/

/*******************************************************************************
 * This file is needed for Cordova simulation in the Mobile Browser 
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
		return;
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
			cordova.require = function (){ return {onPluginsReady : { fire : function (){}}}};
		}
	}
}