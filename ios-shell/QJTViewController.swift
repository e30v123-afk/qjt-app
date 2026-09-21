import UIKit
import WebKit
import Capacitor

/// يحقن قشرة التطبيق (shell.js) في كل صفحة تُحمَّل من qjt.sa،
/// فتظهر شريط التنقّل السفلي وبقية المميزات الأصلية داخل المتجر.
class QJTViewController: CAPBridgeViewController {

    override func webViewConfiguration(for instanceConfiguration: InstanceConfiguration) -> WKWebViewConfiguration {
        let configuration = super.webViewConfiguration(for: instanceConfiguration)

        if let url = Bundle.main.url(forResource: "shell", withExtension: "js"),
           let source = try? String(contentsOf: url, encoding: .utf8) {
            let script = WKUserScript(source: source,
                                      injectionTime: .atDocumentEnd,
                                      forMainFrameOnly: true)
            configuration.userContentController.addUserScript(script)
        } else {
            CAPLog.print("QJT: تعذّر العثور على shell.js في حزمة التطبيق")
        }

        return configuration
    }

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        // خلفية داكنة أثناء التحميل بدل الوميض الأبيض
        webView?.isOpaque = false
        webView?.backgroundColor = UIColor(red: 0.063, green: 0.078, blue: 0.094, alpha: 1)
        webView?.scrollView.backgroundColor = webView?.backgroundColor
        webView?.allowsBackForwardNavigationGestures = true
    }
}
