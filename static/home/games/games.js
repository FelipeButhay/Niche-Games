// -------------------------------
//         HOVERS & CLICKS
// -------------------------------

document.querySelectorAll("div.game").forEach(div => {
    div.addEventListener("mouseenter", () => {
        div.querySelector("span.title").classList.add("golden-text");
        // div.querySelector("svg use").classList.add("golden-svg");
    });
    
    div.addEventListener("mouseleave", () => {
        div.querySelector("span.title").classList.remove("golden-text");
        // div.querySelector("svg use").classList.remove("golden-svg");
    });

    // redirects the user to crete a room and join it
    div.addEventListener("click", () => {
        fetch(`/home/games/create-new-room?game-id=${div.id}`)
            .then(response1 => response1.json())
            .then(resp1 => {
                const room_config = io("/room-config");
                room_config.emit("join-room", {"room_id": resp1.room_id}, (response2) => {
                    window.location.href = response2.redirect;
                });
            });
    });
});

