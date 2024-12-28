function showInfoMsg(msg, type, opts = {}) {
    if (type === "failure") {
        type = "danger";
    }

    const msgElement = document.createElement("div");
    msgElement.classList.add("alert-msg", "alert", `alert-${type}`, "d-flex", "justify-content-center", "gap-2");

    const alertIcon = document.createElement("i");
    const alertIconClass = type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill";
    alertIcon.classList.add("bi", alertIconClass);

    const alertContent = document.createElement("span");
    alertContent.textContent = msg;

    msgElement.appendChild(alertIcon);
    msgElement.appendChild(alertContent);

    document.body.appendChild(msgElement);

    setTimeout(() => {
        setTimeout(() => {
            document.body.removeChild(msgElement);
            if (opts.reloadOnTimeout) {
                window.location.reload();
            }
        }, 250); // Duration of fade-out animation
    }, 1500);
    if (opts.forceReload) {
        window.location.reload();
    }
}

function redirect(href, opts = {}) {
    if (!href) {
        return;
    }

    if (opts.timeout) {
        setTimeout(() => {
            window.location.href = href;
        }, opts.timeout);
    } else {
        window.location.href = href;
    }
}

function openInNewTab(href) {
    if (!href) {
        return;
    }

    window.open(href, "_blank", "noopener noreferrer");
}

const generateSHA256Hash = async(message) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
};


export { showInfoMsg, generateSHA256Hash, redirect, openInNewTab };
