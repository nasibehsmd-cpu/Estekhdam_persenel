document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       تنظیمات اصلی
    ========================================= */

    const API_URL =
        "https://script.google.com/macros/s/AKfycbzVRv0Xaa3FwMDugi8--ZTC_1uwNdqn1RlDfntAR98j-v9uW2Ngxe8Cfh6w1hksw-Mzxg/exec";

    const workerCode =
        localStorage.getItem("workerCode") || sessionStorage.getItem("workerCode");

    const workerInfoRaw =
        localStorage.getItem("workerInfo") || sessionStorage.getItem("workerInfo");


    /* =========================================
       بررسی ورود پرسنل
    ========================================= */

    if (!workerCode) {
        window.location.href = "login.html";
        return;
    }
    /* =========================================
       صدای آب و هوا
    ========================================= */

    const weatherSound =
        document.getElementById("rainSound");

    const weatherSoundToggle =
        document.getElementById("rainSoundToggle");

    let weatherSoundEnabled = true;

    function updateWeatherSoundButton() {
        if (!weatherSoundToggle) return;

        if (weatherSoundEnabled) {
            weatherSoundToggle.textContent = "🔊";
            weatherSoundToggle.setAttribute(
                "aria-label",
                "خاموش کردن صدا"
            );
        } else {
            weatherSoundToggle.textContent = "🔇";
            weatherSoundToggle.setAttribute(
                "aria-label",
                "فعال کردن صدا"
            );
        }
    }

    function setWeatherSound(weather) {
        if (!weatherSound) return;

        const weatherSounds = {
            "باران": "rain-sound.mp3",
            "پاییز": "payiz.mp3",
            "زمستان": "barf.mp3",
            "بهار": "bahar.mp3",
            "تابستان": "tabestan.mp3",
            "پرنده": "parande.mp3",
        };

        const sound = weatherSounds[weather];

        if (!sound) {
            weatherSound.pause();
            weatherSound.currentTime = 0;
            weatherSound.removeAttribute("src");
            weatherSound.load();
            weatherSoundEnabled = false;

            if (weatherSoundToggle) {
                weatherSoundToggle.style.display = "none";
            }

            updateWeatherSoundButton();
            return;
        }

        weatherSound.src = sound;
        weatherSound.loop = true;
        weatherSoundEnabled = true;

        if (weatherSoundToggle) {
            weatherSoundToggle.style.display = "block";
        }

        updateWeatherSoundButton();

        weatherSound.play().catch(function (error) {
            console.log(
                "پخش خودکار صدا توسط مرورگر متوقف شد:",
                error
            );
        });
    }

    if (weatherSoundToggle) {
        weatherSoundToggle.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                weatherSoundEnabled = !weatherSoundEnabled;

                if (weatherSoundEnabled) {
                    weatherSound.play().catch(function (error) {
                        console.log(
                            "پخش صدا توسط مرورگر متوقف شد:",
                            error
                        );
                    });
                } else if (weatherSound) {
                    weatherSound.pause();
                }

                updateWeatherSoundButton();
            }
        );
    }

    document.addEventListener(
        "click",
        function () {
            if (weatherSoundEnabled && weatherSound) {
                weatherSound.play().catch(function () {});
            }
        },
        { once: true }
    );

    updateWeatherSoundButton();



    /* =========================================
       ارتباط با API
    ========================================= */

    function apiRequest(action) {

        const url =
            API_URL +
            "?action=" +
            encodeURIComponent(action) +
            "&workerCode=" +
            encodeURIComponent(workerCode);

        return fetch(url)
            .then(function (response) {

                if (!response.ok) {
                    throw new Error(
                        "HTTP " + response.status
                    );
                }

                return response.json();
            });
    }


    /* =========================================
       ثبت دریافت شد
    ========================================= */

    function markJobReceivedRequest(jobRow) {

        return fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type":
                    "text/plain;charset=utf-8"
            },

            body: JSON.stringify({
                action: "markReceived",
                workerCode: workerCode,
                jobRow: jobRow
            })
        })
        .then(function (response) {

            if (!response.ok) {
                throw new Error(
                    "HTTP " + response.status
                );
            }

            return response.json();
        });
    }


    /* =========================================
       منوی پنل
    ========================================= */

    const menuCards =
        document.querySelectorAll(".menu-card");

    const panelSections =
        document.querySelectorAll(".panel-section");


    menuCards.forEach(function (card) {

        card.addEventListener("click", function () {

            const sectionName =
                card.getAttribute("data-section");


            panelSections.forEach(function (section) {
                section.classList.remove("active");
            });


            const selectedSection =
                document.getElementById(
                    sectionName + "Section"
                );


            if (selectedSection) {

                selectedSection.classList.add("active");

                selectedSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }


            if (sectionName === "profile") {
    /* =========================================
       تست تنظیمات آب و هوا
    ========================================= */

    fetch("https://script.google.com/macros/s/AKfycbynEmf1HJvTdtIf10gKNLi7xWUFIMnCwkMUr7lYm83r1DOlq4PGiTwutgGqdtEMMyAW/exec?action=weather")
        .then(function (response) {
            return response.json();
        })
        .then(function (result) {
            console.log("تنظیمات آب و هوا:", result);
        })
        .catch(function (error) {
            console.error("خطا در دریافت تنظیمات آب و هوا:", error);
        });


                loadWorkerInfo();
            }

            if (sectionName === "jobs") {
                loadWorkerJobs();
            }

            if (sectionName === "account") {
                loadWorkerAccount();
            }

            if (sectionName === "announcements") {
                loadAnnouncements();
            }

        });

    });


    /* =========================================
       اطلاعات پرسنل
    ========================================= */

    function loadWorkerInfo() {

        const workerName =
            document.getElementById("workerName");

        const workerCodeElement =
            document.getElementById("workerCode");

        const workerPhone =
            document.getElementById("workerPhone");

        const workerAddress =
            document.getElementById("workerAddress");

        const workerStatus =
            document.getElementById("workerStatus");

        const workerStartDate =
            document.getElementById("workerStartDate");

        const workerWelcome =
            document.getElementById("workerWelcome");


        let worker = null;


        if (workerInfoRaw) {

            try {

                worker =
                    JSON.parse(workerInfoRaw);

            } catch (error) {

                console.error(
                    "خطا در خواندن اطلاعات پرسنل:",
                    error
                );
            }
        }


        if (!worker) {
            return;
        }


        if (workerName) {
            workerName.textContent =
                worker["نام و نام خانوادگی"] ||
                "---";
        }


        if (workerCodeElement) {
            workerCodeElement.textContent =
                worker["کد پیگیری"] ||
                workerCode ||
                "---";
        }


        if (workerPhone) {
            workerPhone.textContent =
                worker["شماره موبایل"] ||
                "---";
        }


        if (workerAddress) {
            workerAddress.textContent =
                worker["آدرس"] ||
                "---";
        }


        if (workerStatus) {
            workerStatus.textContent =
                worker["وضعیت"] ||
                "---";
        }


        if (workerStartDate) {
            workerStartDate.textContent =
                worker["تاریخ شروع همکاری"] ||
                "---";
        }


        if (workerWelcome) {

            workerWelcome.textContent =
                "خوش آمدید، " +
                (
                    worker["نام و نام خانوادگی"] ||
                    "پرسنل"
                );
        }
    }


    /* =========================================
       کارهای من
    ========================================= */

    function loadWorkerJobs() {

        const container =
            document.getElementById("jobsContainer");


        if (!container) {
            return;
        }


        container.innerHTML = `
            <div class="empty-state">
                <span>⏳</span>
                <p>در حال دریافت کارهای شما...</p>
            </div>
        `;


        apiRequest("jobs")

            .then(function (result) {

                console.log(
                    "پاسخ jobs:",
                    result
                );


                if (!result.success) {

                    throw new Error(
                        result.message ||
                        "خطا در دریافت کارها"
                    );
                }


                const jobs =
                    result.data || [];


                if (!jobs.length) {

                    container.innerHTML = `
                        <div class="empty-state">
                            <span>🧹</span>
                            <p>
                                هنوز کاری برای شما ثبت نشده است.
                            </p>
                        </div>
                    `;

                    return;
                }


                container.innerHTML = "";


                jobs.forEach(function (job) {

                    const card =
                        document.createElement("div");


                    card.className =
                        "job-card";


                    const fixedPhone =
                        job["ثابت"] || "";


                    const mobilePhone =
                        job["موبایل مشتری"] ||
                        job["شماره موبایل"] ||
                        job.mobile ||
                        "";


                    const received =
                        job["دریافت شد"];


                    card.innerHTML = `

                        <div class="job-details">

                            <div class="job-detail">
                                <span>روز</span>
                                <strong>
                                    ${
                                        job["روز"] ||
                                        job.day ||
                                        "---"
                                    }
                                </strong>
                            </div>

                            <div class="job-detail">
                                <span>تاریخ</span>
                                <strong>
                                    ${
                                        job["تاریخ"] ||
                                        job.date ||
                                        "---"
                                    }
                                </strong>
                            </div>

                            <div class="job-detail">
                                <span>مشتری</span>
                                <strong>
                                    ${
                                        job["مشتری"] ||
                                        job["نام مشتری"] ||
                                        job.customer ||
                                        "---"
                                    }
                                </strong>
                            </div>

                            <div class="job-detail">
                                <span>آدرس</span>
                                <strong>
                                    ${
                                        job["آدرس"] ||
                                        job.address ||
                                        "---"
                                    }
                                </strong>
                            </div>

                            <div class="job-detail">
                                <span>مبلغ</span>
                                <strong>
                                    ${
                                        job["مبلغ"] ||
                                        job.amount ||
                                        "---"
                                    }
                                </strong>
                            </div>

                            <div class="job-detail">
                                <span>ثابت</span>
                                <strong>
                                    ${
                                        fixedPhone
                                        ? `<a href="tel:${fixedPhone}">
                                             ${fixedPhone}
                                           </a>`
                                        : "---"
                                    }
                                </strong>
                            </div>

                            <div class="job-detail">
                                <span>موبایل مشتری</span>
                                <strong>
                                    ${
                                        mobilePhone
                                        ? `<a href="tel:${mobilePhone}">
                                             ${mobilePhone}
                                           </a>`
                                        : "---"
                                    }
                                </strong>
                            </div>

                            <div class="job-detail">
                                <span>پرسنل معرفی شده</span>
                                <strong>
                                    ${
                                        job["پرسنل معرفی شده"] ||
                                        "---"
                                    }
                                </strong>
                            </div>

                            <div class="job-detail">
                                <span>نوع کار</span>
                                <strong>
                                    ${
                                        job["نوع کار"] ||
                                        job["نوع خدمت"] ||
                                        job.type ||
                                        "---"
                                    }
                                </strong>
                            </div>

                            <div class="job-detail">
                                <span>تایم</span>
                                <strong>
                                    ${
                                        job["تایم"] ||
                                        job["ساعت"] ||
                                        job.time ||
                                        "---"
                                    }
                                </strong>
                            </div>

                            <div class="job-detail">
                                <span>توضیحات</span>
                                <strong>
                                    ${
                                        job["توضیحات"] ||
                                        job.description ||
                                        "---"
                                    }
                                </strong>
                            </div>

                            <div class="job-detail">
                                <span>حساب</span>
                                <strong>
                                    ${
                                        job["حساب"] ||
                                        job.account ||
                                        "---"
                                    }
                                </strong>
                            </div>

                            <div class="job-detail">
                                <span>دریافت شد</span>
                                <strong>

                                    <button
                                        type="button"
                                        class="received-btn"
                                        data-row="${
                                            job["_row"] || ""
                                        }"
                                        ${
                                            received
                                            ? "disabled"
                                            : ""
                                        }
                                    >
                                        ${
                                            received
                                            ? "✓ دریافت شد"
                                            : "☐ دریافت شد"
                                        }
                                    </button>

                                </strong>
                            </div>

                        </div>
                    `;


                    const receivedBtn =
                        card.querySelector(
                            ".received-btn"
                        );


                    if (
                        receivedBtn &&
                        !receivedBtn.disabled
                    ) {

                        receivedBtn.addEventListener(
                            "click",
                            function () {

                                const jobRow =
                                    this.getAttribute(
                                        "data-row"
                                    );


                                if (!jobRow) {

                                    alert(
                                        "شماره ردیف کار پیدا نشد."
                                    );

                                    return;
                                }


                                this.disabled = true;

                                this.textContent =
                                    "⏳ در حال ثبت...";


                                markJobReceivedRequest(
                                    jobRow
                                )

                                .then(function (result) {

                                    if (!result.success) {

                                        throw new Error(
                                            result.message ||
                                            "ثبت دریافت انجام نشد."
                                        );
                                    }


                                    receivedBtn.textContent =
                                        "✓ دریافت شد";
                                })

                                .catch(function (error) {

                                    console.error(
                                        "خطا در ثبت دریافت:",
                                        error
                                    );


                                    receivedBtn.disabled =
                                        false;

                                    receivedBtn.textContent =
                                        "☐ دریافت شد";


                                    alert(
                                        "ثبت دریافت انجام نشد."
                                    );
                                });

                            }
                        );
                    }


                    container.appendChild(card);

                });

            })

            .catch(function (error) {

                console.error(
                    "خطا در دریافت کارها:",
                    error
                );


                container.innerHTML = `
                    <div class="empty-state">
                        <span>⚠️</span>
                        <p>
                            خطا در دریافت کارها.
                        </p>
                    </div>
                `;
            });
    }


    /* =========================================
       حساب من
    ========================================= */

    function loadWorkerAccount() {

        const accountElement =
            document.getElementById(
                "workerAccount"
            );


        if (!accountElement) {
            return;
        }


        accountElement.textContent =
            "در حال دریافت...";


        apiRequest("accountTotal")

            .then(function (result) {

                console.log(
                    "پاسخ accountTotal:",
                    result
                );


                if (!result.success) {

                    throw new Error(
                        result.message ||
                        "خطا در دریافت حساب"
                    );
                }


                let total = 0;


                if (result.data) {

                    if (
                        typeof result.data ===
                        "object"
                    ) {

                        total =
                            result.data.total ||
                            result.data["مجموع"] ||
                            result.data.amount ||
                            0;

                    } else {

                        total =
                            result.data;
                    }
                }


                accountElement.textContent =
                    Number(total || 0)
                        .toLocaleString("fa-IR") +
                    " ریال";
            })

            .catch(function (error) {

                console.error(
                    "خطا در دریافت حساب:",
                    error
                );


                accountElement.textContent =
                    "خطا در دریافت حساب";
            });
    }


    /* =========================================
       اطلاعیه‌ها
    ========================================= */

    function loadAnnouncements() {

        const container =
            document.getElementById(
                "announcementsContainer"
            );


        if (!container) {
            return;
        }


        container.innerHTML = `
            <div class="empty-state">
                <span>⏳</span>
                <p>
                    در حال دریافت اطلاعیه‌ها...
                </p>
            </div>
        `;


        fetch(
            API_URL +
            "?action=announcements"
        )

        .then(function (response) {

            if (!response.ok) {

                throw new Error(
                    "HTTP " + response.status
                );
            }


            return response.json();
        })

        .then(function (result) {

            console.log(
                "پاسخ announcements:",
                result
            );


            if (!result.success) {

                throw new Error(
                    result.message ||
                    "خطا در دریافت اطلاعیه‌ها"
                );
            }


            const announcements =
                result.data || [];


            if (!announcements.length) {

                container.innerHTML = `
                    <div class="empty-state">
                        <span>📢</span>
                        <p>
                            در حال حاضر اطلاعیه‌ای ثبت نشده است.
                        </p>
                    </div>
                `;

                return;
            }


            container.innerHTML = "";


            announcements.forEach(
                function (item) {

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "announcement-card";


                    const title =
                        item["عنوان"] ||
                        item.title ||
                        "اطلاعیه شرکت";


                    const text =
                        item["متن اطلاعیه"] ||
                        item["متن"] ||
                        item.text ||
                        "";


                    const date =
                        item["تاریخ"] ||
                        item.date ||
                        "";


                    card.innerHTML = `

                        <h4>
                            ${title}
                        </h4>

                        <p>
                            ${text}
                        </p>

                        <span class="announcement-date">
                            ${date}
                        </span>

                    `;


                    container.appendChild(card);

                }
            );

        })

        .catch(function (error) {

            console.error(
                "خطا در دریافت اطلاعیه‌ها:",
                error
            );


            container.innerHTML = `
                <div class="empty-state">
                    <span>⚠️</span>
                    <p>
                        خطا در دریافت اطلاعیه‌ها.
                    </p>
                </div>
            `;
        });
    }


    /* =========================================
       ارسال پیام و عکس
    ========================================= */

    const messageForm =
        document.getElementById(
            "messageForm"
        );


    const messageResult =
        document.getElementById(
            "messageResult"
        );


    const receiptImage =
        document.getElementById(
            "receiptImage"
        );


    const receiptPreview =
        document.getElementById(
            "receiptPreview"
        );


    /*
     * تبدیل فایل عکس به Base64
     *
     * ابتدا تلاش می‌کنیم عکس را با Canvas
     * کوچک و فشرده کنیم.
     *
     * اگر Canvas یا باز کردن عکس مشکل داشت،
     * خود فایل را با FileReader می‌خوانیم.
     */

    function prepareImage(file) {

        return new Promise(function (resolve, reject) {

            if (!file) {

                resolve({
                    base64: "",
                    mimeType: "",
                    name: ""
                });

                return;
            }


            if (
                !file.type ||
                !file.type.startsWith("image/")
            ) {

                reject(
                    new Error(
                        "فایل انتخاب شده تصویر نیست."
                    )
                );

                return;
            }


            const objectUrl =
                URL.createObjectURL(file);


            const image =
                new Image();


            image.onload =
                function () {

                    try {

                        const maxSize =
                            1200;


                        let width =
                            image.naturalWidth;

                        let height =
                            image.naturalHeight;


                        if (
                            !width ||
                            !height
                        ) {

                            throw new Error(
                                "ابعاد عکس قابل تشخیص نیست."
                            );
                        }


                        if (
                            width > maxSize ||
                            height > maxSize
                        ) {

                            if (
                                width >= height
                            ) {

                                height =
                                    Math.round(
                                        height *
                                        maxSize /
                                        width
                                    );

                                width =
                                    maxSize;

                            } else {

                                width =
                                    Math.round(
                                        width *
                                        maxSize /
                                        height
                                    );

                                height =
                                    maxSize;
                            }
                        }


                        const canvas =
                            document.createElement(
                                "canvas"
                            );


                        canvas.width =
                            width;

                        canvas.height =
                            height;


                        const ctx =
                            canvas.getContext(
                                "2d"
                            );


                        if (!ctx) {

                            throw new Error(
                                "Canvas در دسترس نیست."
                            );
                        }


                        ctx.drawImage(
                            image,
                            0,
                            0,
                            width,
                            height
                        );


                        const dataUrl =
                            canvas.toDataURL(
                                "image/jpeg",
                                0.75
                            );


                        const parts =
                            dataUrl.split(",");


                        if (
                            parts.length < 2 ||
                            !parts[1]
                        ) {

                            throw new Error(
                                "تبدیل عکس به Base64 انجام نشد."
                            );
                        }


                        URL.revokeObjectURL(
                            objectUrl
                        );


                        resolve({

                            base64:
                                parts[1],

                            mimeType:
                                "image/jpeg",

                            name:
                                file.name
                        });


                    } catch (error) {

                        URL.revokeObjectURL(
                            objectUrl
                        );


                        /*
                         * اگر فشرده‌سازی شکست خورد،
                         * فایل اصلی را می‌خوانیم.
                         */

                        readOriginalFile(
                            file
                        )
                        .then(resolve)
                        .catch(reject);
                    }
                };


            image.onerror =
                function () {

                    URL.revokeObjectURL(
                        objectUrl
                    );


                    /*
                     * تلاش دوم با FileReader
                     */

                    readOriginalFile(
                        file
                    )
                    .then(resolve)
                    .catch(reject);
                };


            image.src =
                objectUrl;

        });
    }


    /* =========================================
       خواندن فایل اصلی
    ========================================= */

    function readOriginalFile(file) {

        return new Promise(
            function (resolve, reject) {

                const reader =
                    new FileReader();


                reader.onload =
                    function () {

                        try {

                            const result =
                                reader.result;


                            if (
                                typeof result !==
                                "string"
                            ) {

                                reject(
                                    new Error(
                                        "فرمت فایل قابل خواندن نیست."
                                    )
                                );

                                return;
                            }


                            const parts =
                                result.split(",");


                            if (
                                parts.length < 2 ||
                                !parts[1]
                            ) {

                                reject(
                                    new Error(
                                        "خواندن Base64 عکس انجام نشد."
                                    )
                                );

                                return;
                            }


                            resolve({

                                base64:
                                    parts[1],

                                mimeType:
                                    file.type ||
                                    "image/jpeg",

                                name:
                                    file.name
                            });


                        } catch (error) {

                            reject(error);
                        }
                    };


                reader.onerror =
                    function () {

                        reject(
                            new Error(
                                "FileReader نتوانست عکس را بخواند."
                            )
                        );
                    };


                reader.onabort =
                    function () {

                        reject(
                            new Error(
                                "خواندن عکس لغو شد."
                            )
                        );
                    };


                try {

                    reader.readAsDataURL(file);

                } catch (error) {

                    reject(error);
                }

            }
        );
    }


    /* =========================================
       ارسال پیام به API
    ========================================= */

    function sendWorkerMessage(
        message,
        imageData
    ) {

        return fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type":
                    "text/plain;charset=utf-8"
            },

            body: JSON.stringify({

                action:
                    "sendMessage",

                workerCode:
                    workerCode,

                message:
                    message,

                imageBase64:
                    imageData.base64 ||
                    "",

                imageMimeType:
                    imageData.mimeType ||
                    "",

                imageName:
                    imageData.name ||
                    ""

            })

        })

        .then(function (response) {

            if (!response.ok) {

                throw new Error(
                    "HTTP " +
                    response.status
                );
            }


            return response.json();
        })

        .then(function (result) {

            if (!result.success) {

                throw new Error(
                    result.message ||
                    "ارسال پیام انجام نشد."
                );
            }


            return result;
        });
    }


    /* =========================================
       فرم ارسال پیام
    ========================================= */

    if (messageForm) {

        messageForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const messageElement =
                    document.getElementById(
                        "workerMessage"
                    );


                const message =
                    messageElement
                    ? messageElement.value.trim()
                    : "";


                const file =
                    receiptImage &&
                    receiptImage.files &&
                    receiptImage.files.length
                    ? receiptImage.files[0]
                    : null;


                if (!message) {

                    if (messageResult) {

                        messageResult.textContent =
                            "لطفاً متن پیام را وارد کنید.";
                    }

                    return;
                }


                if (messageResult) {

                    messageResult.textContent =
                        "⏳ در حال آماده‌سازی پیام...";
                }


                /*
                 * اگر عکس وجود نداشته باشد،
                 * مستقیماً پیام ارسال می‌شود.
                 */

                if (!file) {

                    sendWorkerMessage(
                        message,
                        {
                            base64: "",
                            mimeType: "",
                            name: ""
                        }
                    )

                    .then(function () {

                        if (messageResult) {

                            messageResult.textContent =
                                "✅ پیام با موفقیت ارسال شد.";
                        }


                        messageForm.reset();


                        if (receiptPreview) {

                            receiptPreview.innerHTML =
                                "";
                        }
                    })

                    .catch(function (error) {

                        console.error(
                            "خطا در ارسال پیام:",
                            error
                        );


                        if (messageResult) {

                            messageResult.textContent =
                                "❌ ارسال پیام انجام نشد.";
                        }
                    });


                    return;
                }


                /*
                 * بررسی تصویر
                 */

                if (
                    !file.type ||
                    !file.type.startsWith("image/")
                ) {

                    if (messageResult) {

                        messageResult.textContent =
                            "❌ لطفاً فقط فایل تصویری انتخاب کنید.";
                    }

                    return;
                }


                if (messageResult) {

                    messageResult.textContent =
                        "⏳ در حال آماده‌سازی عکس...";
                }


                prepareImage(file)

                .then(function (imageData) {

                    if (messageResult) {

                        messageResult.textContent =
                            "⏳ در حال ارسال پیام و عکس...";
                    }


                    return sendWorkerMessage(
                        message,
                        imageData
                    );
                })

                .then(function () {

                    if (messageResult) {

                        messageResult.textContent =
                            "✅ پیام و عکس با موفقیت ارسال شد.";
                    }


                    messageForm.reset();


                    if (receiptPreview) {

                        receiptPreview.innerHTML =
                            "";
                    }
                })

                .catch(function (error) {

                    console.error(
                        "خطا در ارسال پیام یا عکس:",
                        error
                    );


                    if (messageResult) {

                        messageResult.textContent =
                            "❌ ارسال عکس یا پیام انجام نشد.";
                    }
                });

            }
        );
    }


    /* =========================================
       پیش‌نمایش عکس رسید
    ========================================= */

    if (
        receiptImage &&
        receiptPreview
    ) {

        receiptImage.addEventListener(
            "change",
            function () {

                receiptPreview.innerHTML =
                    "";


                const file =
                    this.files &&
                    this.files.length
                    ? this.files[0]
                    : null;


                if (!file) {
                    return;
                }


                if (
                    !file.type ||
                    !file.type.startsWith("image/")
                ) {

                    receiptPreview.textContent =
                        "لطفاً فقط یک فایل تصویری انتخاب کنید.";


                    this.value =
                        "";


                    return;
                }


                const image =
                    document.createElement(
                        "img"
                    );


                const objectUrl =
                    URL.createObjectURL(
                        file
                    );


                image.src =
                    objectUrl;


                image.alt =
                    "پیش‌نمایش رسید واریز";


                image.style.maxWidth =
                    "100%";


                image.style.maxHeight =
                    "300px";


                image.style.marginTop =
                    "15px";


                image.style.borderRadius =
                    "12px";


                image.onload =
                    function () {

                        URL.revokeObjectURL(
                            objectUrl
                        );
                    };


                image.onerror =
                    function () {

                        URL.revokeObjectURL(
                            objectUrl
                        );

                        receiptPreview.textContent =
                            "❌ نمایش عکس امکان‌پذیر نیست.";
                    };


                receiptPreview.appendChild(
                    image
                );

            }
        );
    }


    /* =========================================
       تأیید قوانین
    ========================================= */

    const acceptRulesButton =
        document.getElementById(
            "acceptRulesButton"
        );


    const acceptRules =
        document.getElementById(
            "acceptRules"
        );


    const rulesConfirmResult =
        document.getElementById(
            "rulesConfirmResult"
        );


    if (acceptRulesButton) {

        acceptRulesButton.addEventListener(
            "click",
            function () {

                if (
                    !acceptRules ||
                    !acceptRules.checked
                ) {

                    if (rulesConfirmResult) {

                        rulesConfirmResult.textContent =
                            "لطفاً ابتدا تیک پذیرش قوانین را بزنید.";

                        rulesConfirmResult.className =
                            "rules-confirm-result error";
                    }

                    return;
                }


                if (rulesConfirmResult) {

                    rulesConfirmResult.textContent =
                        "قوانین همکاری با موفقیت تأیید شد.";

                    rulesConfirmResult.className =
                        "rules-confirm-result success";
                }


                acceptRulesButton.disabled =
                    true;


                acceptRulesButton.textContent =
                    "قوانین تأیید شد";
            }
        );
    }


    /* =========================================
       خروج
    ========================================= */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                sessionStorage.removeItem(
                    "workerCode"
                );


                sessionStorage.removeItem(
                    "workerInfo"
                );
                localStorage.removeItem("workerCode");
                localStorage.removeItem("workerInfo");



                window.location.href =
                    "login.html";
            }
        );
    }


    /* =========================================
       شروع اولیه
    ========================================= */

    /* =========================================
       تست تنظیمات آب و هوا
    ========================================= */

    fetch("https://script.google.com/macros/s/AKfycbynEmf1HJvTdtIf10gKNLi7xWUFIMnCwkMUr7lYm83r1DOlq4PGiTwutgGqdtEMMyAW/exec?action=weather")
        .then(function (response) {
            return response.json();
        })
        .then(function (result) {
            console.log("تنظیمات آب و هوا:", result);

            const weatherEffect = document.getElementById("weatherEffect");

            const weatherImages = {
                "باران": "rain-gif.gif",
                "پاییز": "payiz.gif",
                "زمستان": "barf.gif",
                "بهار": "bahar.gif",
                "تابستان": "tabestan.gif",
                "پرنده": "parande.gif"
            };

            const weather = result.data && result.data.weather;
            setWeatherSound(weather);
            const image = weatherImages[weather];

            if (weatherEffect) {
                if (image) {
                    weatherEffect.style.setProperty("--weather-image", "url(\"" + image + "\")");
                    weatherEffect.style.display = "block";
                } else {
                    weatherEffect.style.setProperty("--weather-image", "none");
                    weatherEffect.style.display = "none";
                }
            }
        })
        .catch(function (error) {
            console.error("خطا در دریافت تنظیمات آب و هوا:", error);
        });


    loadWorkerInfo();


    console.log(
        "پنل پرسنل آماده شد:",
        workerCode
    );

});