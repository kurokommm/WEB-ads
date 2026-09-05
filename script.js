/* =========================================================
   THUMBDOWNLOADER — MASTER JS
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

const urlInput = document.getElementById("url");
const image = document.getElementById("img");
const fullscreen = document.getElementById("fullpage");
const fullscreenImage = document.getElementById("fullscreenImage");
const pasteBtn = document.getElementById("pasteBtn");
const clearBtn = document.getElementById("clearBtn");
const previewLoading = document.getElementById("previewLoading");

let toastTimer;


/* =========================================================
   YOUTUBE ID
   ========================================================= */

function getYouTubeId(url) {

    if (!url) {
        return null;
    }

    url = url.trim();

    try {

        const parsed = new URL(url);

        const hostname =
            parsed.hostname
                .replace("www.", "")
                .toLowerCase();

        /* youtu.be */

        if (hostname === "youtu.be") {

            const id =
                parsed.pathname
                    .split("/")
                    .filter(Boolean)[0];

            return id || null;
        }


        /* youtube.com */

        if (
            hostname === "youtube.com" ||
            hostname === "m.youtube.com" ||
            hostname === "youtube-nocookie.com"
        ) {

            /* /watch?v= */

            const videoId =
                parsed.searchParams.get("v");

            if (videoId) {
                return videoId;
            }


            /* /shorts/ */

            const shorts =
                parsed.pathname.match(
                    /^\/shorts\/([^/?#]+)/
                );

            if (shorts) {
                return shorts[1];
            }


            /* /embed/ */

            const embed =
                parsed.pathname.match(
                    /^\/embed\/([^/?#]+)/
                );

            if (embed) {
                return embed[1];
            }


            /* /v/ */

            const legacy =
                parsed.pathname.match(
                    /^\/v\/([^/?#]+)/
                );

            if (legacy) {
                return legacy[1];
            }
        }

    } catch (error) {

        /*
         * Allow users to paste a raw YouTube ID.
         */

        const rawId =
            url.match(
                /^[a-zA-Z0-9_-]{11}$/
            );

        if (rawId) {
            return rawId[0];
        }
    }

    return null;
}


/* =========================================================
   VALIDATION
   ========================================================= */

function validateUrl() {

    const url =
        urlInput.value.trim();

    const id =
        getYouTubeId(url);

    if (!id) {

        showToast(
            "Please enter a valid YouTube URL.",
            true
        );

        urlInput.focus();

        return null;
    }

    return id;
}


/* =========================================================
   DYNAMIC URL
   ========================================================= */

function dynamicUrl(type) {

    const id =
        validateUrl();

    if (!id) {
        return null;
    }


    let imgUrl;


    /*
     * Preview
     */

    if (type === 0) {

        imgUrl =
            `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }


    /*
     * Max HD
     */

    else if (type === 1) {

        imgUrl =
            `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    }


    /*
     * WebP
     */

    else if (type === 2) {

        imgUrl =
            `https://img.youtube.com/vi_webp/${id}/maxresdefault.webp`;
    }


    /*
     * Change image
     */

    setLoading(true);

    image.onload = function () {

        setLoading(false);

        updateQualityCards(type);

        showToast(
            "Thumbnail updated."
        );
    };

    image.onerror = function () {

        setLoading(false);

        showToast(
            "This thumbnail quality is not available.",
            true
        );
    };

    image.src = imgUrl;

    return imgUrl;
}


/* =========================================================
   QUALITY UI
   ========================================================= */

function updateQualityCards(activeIndex) {

    const cards =
        document.querySelectorAll(
            ".quality-card"
        );

    cards.forEach(
        (card, index) => {

            card.classList.toggle(
                "active",
                index === activeIndex
            );

        }
    );
}


/* =========================================================
   DOWNLOAD
   ========================================================= */

function download() {

    const id =
        validateUrl();

    if (!id) {
        return;
    }


    const currentImage =
        document.getElementById("img");


    if (!currentImage.src) {

        showToast(
            "No thumbnail available.",
            true
        );

        return;
    }


    /*
     * Create temporary download link.
     */

    const link =
        document.createElement("a");

    link.href =
        currentImage.src;

    link.download =
        "youtube-thumbnail.jpg";

    link.target =
        "_blank";

    link.rel =
        "noopener noreferrer";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    showToast(
        "Download started."
    );
}


/* =========================================================
   FULLSCREEN
   ========================================================= */

function fullPage() {

    const src =
        document.getElementById("img").src;

    if (!src) {
        return;
    }


    if (fullscreenImage) {
        fullscreenImage.src = src;
    }


    fullscreen.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";
}


function closeFullscreen() {

    fullscreen.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";
}


/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {
            closeFullscreen();
        }

    }
);


/* =========================================================
   PASTE
   ========================================================= */

if (pasteBtn) {

    pasteBtn.addEventListener(
        "click",
        async function () {

            try {

                const text =
                    await navigator.clipboard.readText();

                if (!text) {

                    showToast(
                        "Clipboard is empty.",
                        true
                    );

                    return;
                }

                urlInput.value =
                    text.trim();

                showToast(
                    "YouTube URL pasted."
                );

                /*
                 * Automatically preview.
                 */

                dynamicUrl(0);

            } catch (error) {

                showToast(
                    "Please allow clipboard access.",
                    true
                );

            }

        }
    );
}


/* =========================================================
   CLEAR
   ========================================================= */

if (clearBtn) {

    clearBtn.addEventListener(
        "click",
        function () {

            urlInput.value = "";

            urlInput.focus();

            showToast(
                "URL cleared."
            );

        }
    );
}


/* =========================================================
   ENTER KEY
   ========================================================= */

if (urlInput) {

    urlInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                dynamicUrl(0);

            }

        }
    );

}


/* =========================================================
   LOADING
   ========================================================= */

function setLoading(state) {

    if (!previewLoading) {
        return;
    }

    previewLoading.classList.toggle(
        "active",
        state
    );
}


/* =========================================================
   IMAGE ERROR
   ========================================================= */

if (image) {

    image.addEventListener(
        "load",
        function () {

            setLoading(false);

        }
    );

    image.addEventListener(
        "error",
        function () {

            setLoading(false);

        }
    );
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message,
    error = false
) {

    const toast =
        document.getElementById("toast");

    const text =
        document.getElementById("toastText");

    if (!toast || !text) {
        return;
    }


    text.textContent =
        message;


    const icon =
        toast.querySelector("i");


    if (error) {

        icon.className =
            "bi bi-exclamation-circle-fill";

        icon.style.color =
            "#dc2626";

    } else {

        icon.className =
            "bi bi-check-circle-fill";

        icon.style.color =
            "#059669";
    }


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2800
        );
}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateQualityCards(0);

        /*
         * Make initial preview clickable.
         */

        if (image && image.complete) {
            setLoading(false);
        }

    }
);