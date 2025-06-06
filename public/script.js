form.addEventListener("submit", async e => {
    e.preventDefault();
    const isFile = file?.files?.[0];
    if (!isFile) return;
    submit.style.display = "none";
    loading.style.display = "flex";
    error.style.display = "none";

    const formData = new FormData();
    formData.append("image", isFile);

    const response = await fetch("/upload", {
        method: "POST",
        header: {
            "Content-Type": "application/json"
        },
        body: formData
    });

    if (!response?.ok) {
        imgWrapper.style.display = "none";
        label.style.display = "flex";
        submit.style.display = "flex";
        loading.style.display = "none";
        error.style.display = "flex";
        file.files[0] = undefined;
    } else {
        loading.style.display = "none";
        refresh.style.display = "flex";
        const result = await response.json();
        urlwrap.style.display = "flex";
        url.value = document?.URL + "file/" + result?.id;
    }
});

file.addEventListener("change", e => {
    const isFile = file?.files?.[0];
    if (isFile) {
        imgWrapper.style.display = "flex";
        label.style.display = "none";

        const reader = new FileReader();
        reader.onload = e => {
            image.src = e.target.result;
            submit.disabled = false;
        };
        reader.onerror = e => {
            console.error(e);
        };
        reader.readAsDataURL(isFile);
    }
});

refresh.addEventListener("click", e => {
    window.location.reload(true);
});

copy.addEventListener("click", e => {
    icopy.style.display = "none";
    icheck.style.display = "inline-block";
    window.navigator.clipboard.writeText(url?.value || "");
    setTimeout(function () {
        icopy.style.display = "inline-block";
        icheck.style.display = "none";
    }, 500);
});
