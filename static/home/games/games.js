// ----------------------
//         HOVERS
// ----------------------

document.querySelectorAll("div.game").forEach(div => {
    div.addEventListener("mouseenter", () => {
        div.querySelector("span.title").classList.add("golden-text");
        // div.querySelector("svg use").classList.add("golden-svg");
    });
    div.addEventListener("mouseleave", () => {
        div.querySelector("span.title").classList.remove("golden-text");
        // div.querySelector("svg use").classList.remove("golden-svg");
    });
});