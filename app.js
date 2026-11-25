let deferredInstallPrompt = null;

const pwaBar = document.getElementById("pwaBar");
const installButton = document.getElementById("installButton");
const pwaStatus = document.getElementById("pwaStatus");

/* =========================================
   HIDE INSTALL BUTTON
========================================= */

function hideInstallButton(){

    const bar = document.getElementById("pwaBar");

    if(bar){

        bar.hidden = true;

    }

}

// শুরুতে বাটন লুকিয়ে রাখুন (যতক্ষণ না ব্রাউজার নিশ্চিত করে যে অ্যাপটি ইনস্টল করা সম্ভব)
if (pwaBar) {
    pwaBar.hidden = true;
}
   
  // Show the installation option when the browser allows installation.
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    showInstallBar();

    console.log('PWA installation is available.');
  });



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
