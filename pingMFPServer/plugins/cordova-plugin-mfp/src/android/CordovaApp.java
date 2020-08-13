package ${packageName};

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.os.Bundle;
import java.net.URI;

import org.apache.cordova.CordovaActivity;

import com.worklight.androidgap.api.WL;
import com.worklight.androidgap.api.WLInitWebFrameworkResult;
import com.worklight.androidgap.api.WLInitWebFrameworkListener;

import com.ibm.MFPApplication;

public class CordovaApp extends CordovaActivity implements WLInitWebFrameworkListener {

	@Override
	public void onCreate(Bundle savedInstanceState){
		super.onCreate(savedInstanceState);

        if (!((MFPApplication)this.getApplication()).hasCordovaSplashscreen()) {
            WL.getInstance().showSplashScreen(this);
        }

        init();

		WL.getInstance().initializeWebFramework(getApplicationContext(), this);
	}

	/**
	 * The IBM MobileFirst Platform calls this method after its initialization is complete and web resources are ready to be used.
	 */
 	public void onInitWebFrameworkComplete(WLInitWebFrameworkResult result){
		if (result.getStatusCode() == WLInitWebFrameworkResult.SUCCESS) {
		    final String mainHtmlFilePath = WL.getInstance().getMainHtmlFilePath();
		    // wi00199: Fix for Ionic Webview WhiteScreen issue. Check whether the app in Ionic and it is not loaded with
		    // 			default url, If yes, update the Ionic base path instead of calling loadurl API.
            if (WL.getInstance().isIonicWebview() && !mainHtmlFilePath.toLowerCase().contains("/android_asset/www")) {
                try {
					String webviewUrlPath = new URI(mainHtmlFilePath).getPath();
					String webviewServerPath = webviewUrlPath.substring(0, webviewUrlPath.indexOf("/index.html"));
					WL.getInstance().updateIonicBasePath(webviewServerPath, appView, this);
                }
				 catch (Exception EX) {
					 super.loadUrl(mainHtmlFilePath);
                 }
			}
            else {
				super.loadUrl(mainHtmlFilePath);
			}
		} else {
			handleWebFrameworkInitFailure(result);
		}
	}

	private void handleWebFrameworkInitFailure(WLInitWebFrameworkResult result){
		AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(this);
		alertDialogBuilder.setNegativeButton(R.string.close, new OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int which){
				finish();
			}
		});

		alertDialogBuilder.setTitle(R.string.error);
		alertDialogBuilder.setMessage(result.getMessage());
		alertDialogBuilder.setCancelable(false).create().show();
	}
}
