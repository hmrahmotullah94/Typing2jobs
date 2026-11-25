let deferredInstallPrompt = null;

const pwaBar = document.getElementById("pwaBar");
const installButton = document.getElementById("installButton");
const pwaStatus = document.getElementById("pwaStatus");

function updateNetworkStatus() {
    if (!pwaStatus) return;
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) {
        pwaStatus.textContent = navigator.onLine
            ? "PWA চালু আছে • অনলাইন"
            : "PWA চালু আছে • অফলাইন মোড";
    } else {
        pwaStatus.textContent = navigator.onLine
            ? "ফোন বা কম্পিউটারে অ্যাপ হিসেবে ইনস্টল করুন"
            : "অফলাইন মোডে আছেন • লোকাল অনুশীলন সক্রিয়";
    }
}

if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            const registration = await navigator.serviceWorker.register("./sw.js", { scope: "./" });

            registration.addEventListener("updatefound", () => {
                const newWorker = registration.installing;
                if (!newWorker) return;

                newWorker.addEventListener("statechange", () => {
                    if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                        if (pwaBar && pwaStatus) {
                            pwaBar.hidden = false;
                            pwaStatus.textContent = "নতুন আপডেট পাওয়া গেছে! রিলোড করলে আপডেট হবে।";
                        }
                    }
                });
            });
        } catch (err) {
            if (pwaStatus) {
                pwaStatus.textContent = "Service Worker রেজিস্টার করা যায়নি (HTTPS বা localhost প্রয়োজন)।";
            }
        }
        updateNetworkStatus();
    });
}

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (pwaBar) pwaBar.hidden = false;
    if (installButton) installButton.disabled = false;
    if (pwaStatus) pwaStatus.textContent = "অ্যাপটি ডিভাইসে ইনস্টল করার জন্য প্রস্তুত";
});

if (installButton) {
    installButton.addEventListener("click", async () => {
        if (!deferredInstallPrompt) {
            const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
            if (pwaStatus) {
                pwaStatus.textContent = isIos
                    ? "iPhone/iPad-এ Safari-এর Share বাটন থেকে 'Add to Home Screen' চাপুন।"
                    : "ব্রাউজার মেনু থেকে 'Install App' বা 'Add to Home screen' নির্বাচন করুন।";
            }
            return;
        }

        installButton.disabled = true;
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;

        if (pwaStatus) {
            pwaStatus.textContent = choice.outcome === "accepted"
                ? "অ্যাপ ইনস্টল সফল হয়েছে!"
                : "ইনস্টল বাতিল করা হয়েছে।";
        }

        if (choice.outcome === "accepted" && pwaBar) {
            setTimeout(() => {
                pwaBar.hidden = true;
            }, 2500);
        } else {
            installButton.disabled = false;
        }
    });
}

window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    if (pwaStatus) pwaStatus.textContent = "Typing Jobs অ্যাপ সফলভাবে ইনস্টল হয়েছে!";
    if (pwaBar) {
        pwaBar.hidden = false;
        setTimeout(() => {
            pwaBar.hidden = true;
        }, 2500);
    }
});

window.addEventListener("online", () => {
    updateNetworkStatus();
    if (typeof fetchOnlineLeaderboard === "function") {
        fetchOnlineLeaderboard();
    }
});

window.addEventListener("offline", () => {
    updateNetworkStatus();
});
