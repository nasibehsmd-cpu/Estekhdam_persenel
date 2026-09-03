document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const codeInput = document.getElementById("trackingCode");
    const loginResult = document.getElementById("loginMessage");

    if (!loginForm) return;

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const code = codeInput.value.trim();
        console.log("CODE_TEST:", JSON.stringify(code));

        if (!/^Nk_[0-9]{4}$/i.test(code)) {
            loginResult.textContent = "کد پیگیری صحیح نیست.";
            loginResult.className = "login-result error";
            return;
        }

        loginResult.textContent = "در حال بررسی کد پیگیری...";
        loginResult.className = "login-result";

        const API_URL = "https://script.google.com/macros/s/AKfycbzVRv0Xaa3FwMDugi8--ZTC_1uwNdqn1RlDfntAR98j-v9uW2Ngxe8Cfh6w1hksw-Mzxg/exec";

        fetch(API_URL + "?action=login&workerCode=" + encodeURIComponent(code))
            .then(function (response) {
                return response.json();
            })
            .then(function (result) {
                if (result.success === true && result.access === true) {
                    sessionStorage.setItem("workerCode", code); sessionStorage.setItem("workerInfo", JSON.stringify(result.worker));
                    loginResult.textContent = "ورود با موفقیت انجام شد.";
                    loginResult.className = "login-result success";

                    setTimeout(function () {
                        window.location.href = "worker.html";
                    }, 500);
                } else {
                    loginResult.textContent = result.message || "دسترسی شما تأیید نشد.";
                    loginResult.className = "login-result error";
                }
            })
            .catch(function (error) {
                console.error(error);
                loginResult.textContent = "خطا در ارتباط با سامانه. لطفاً دوباره تلاش کنید.";
                loginResult.className = "login-result error";
            });
    });

});

