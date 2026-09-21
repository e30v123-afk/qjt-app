import UIKit
import WebKit
import Capacitor

/// يحقن قشرة التطبيق (shell.js) في كل صفحة تُحمَّل من qjt.sa،
/// فتظهر شريط التنقّل السفلي وبقية المميزات الأصلية داخل المتجر.
///
/// مزلقان مهمّان عُولجا هنا:
/// 1) لا تُضف السكربت في `webViewConfiguration(for:)` — فـ Capacitor يستبدل
///    `userContentController` بعدها مباشرة (prepareWebView) فيُفقد السكربت.
///    الموضع الصحيح `capacitorDidLoad()`: يُنفَّذ في loadView() بعد إنشاء
///    الـ webView وقبل loadWebView() في viewDidLoad().
/// 2) لا تعتمد على env(safe-area-inset-*) في صفحات الموقع — فهي تساوي صفراً
///    ما لم يحتوِ وسم viewport على viewport-fit=cover، وموقع qjt.sa لا يحتويه.
///    لذا نُبلّغ الويب بقيم المنطقة الآمنة الحقيقية كمتغيّرات CSS.
class QJTViewController: CAPBridgeViewController {

    private var lastInsets: UIEdgeInsets = .zero

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        injectShell()

        webView?.isOpaque = true
        webView?.backgroundColor = .white
        webView?.scrollView.backgroundColor = .white
        webView?.allowsBackForwardNavigationGestures = true
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        let insets = view.safeAreaInsets
        guard insets != lastInsets else { return }
        lastInsets = insets
        pushSafeArea(insets)
    }

    override func viewSafeAreaInsetsDidChange() {
        super.viewSafeAreaInsetsDidChange()
        lastInsets = view.safeAreaInsets
        pushSafeArea(lastInsets)
    }

    /// يمرّر قيم المنطقة الآمنة إلى الصفحة كمتغيّرات CSS تقرأها القشرة.
    private func pushSafeArea(_ i: UIEdgeInsets) {
        let js = """
        (function(){var r=document.documentElement;if(!r||!r.style)return;
        r.style.setProperty('--qjt-sat','\(Int(i.top))px');
        r.style.setProperty('--qjt-sab','\(Int(i.bottom))px');
        r.style.setProperty('--qjt-sal','\(Int(i.left))px');
        r.style.setProperty('--qjt-sar','\(Int(i.right))px');})();
        """
        webView?.evaluateJavaScript(js, completionHandler: nil)
    }

    private func injectShell() {
        guard let controller = webView?.configuration.userContentController else {
            CAPLog.print("QJT: لا يوجد userContentController")
            return
        }
        guard let url = Bundle.main.url(forResource: "shell", withExtension: "js"),
              let source = try? String(contentsOf: url, encoding: .utf8) else {
            CAPLog.print("QJT: تعذّر العثور على shell.js في حزمة التطبيق")
            return
        }
        controller.addUserScript(WKUserScript(source: source,
                                              injectionTime: .atDocumentEnd,
                                              forMainFrameOnly: true))
        CAPLog.print("QJT: حُقنت القشرة (\(source.count) حرفاً)")
    }
}
