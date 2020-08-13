package com.ibm;

import android.app.Application;

import com.worklight.androidgap.api.WL;
import com.worklight.common.Logger;
import com.worklight.common.WLAnalytics;

import org.apache.cordova.ConfigXmlParser;
import org.apache.cordova.PluginEntry;

import java.util.ArrayList;

public class MFPApplication extends Application {

    private ConfigXmlParser parser;

    @Override
    public void onCreate() {
        super.onCreate();
        WL.createInstance(this);
        Logger.setContext(this);
        WLAnalytics.init(this);
        WLAnalytics.addDeviceEventListener(WLAnalytics.DeviceEvent.NETWORK);
        WLAnalytics.addDeviceEventListener(WLAnalytics.DeviceEvent.LIFECYCLE);

        parser = new ConfigXmlParser();
        parser.parse(this);
    }

    public Boolean hasCordovaSplashscreen() {
        ArrayList<PluginEntry> plugins = parser.getPluginEntries();
        for (PluginEntry plugin : plugins) {
            if (plugin.pluginClass.equals("org.apache.cordova.splashscreen.SplashScreen")) {
                return true;
            }
        }
        return false;
    }

}