const type_selector = document.querySelector("div.type-selector");
const background = document.querySelector("div.type-selector div.background");

const span_username = document.querySelector("div.type-selector span.username"); 
const span_user_id  = document.querySelector("div.type-selector span.user-id");

const request_input = document.querySelector("div.send input");

let input_type = -1; // -1 -> user id, 1 -> username
type_selector.addEventListener("click", () => {
    input_type *= -1;
    if (input_type == 1) {
        background.style.left = "0";
        request_input.placeholder = "Username"

        span_username.classList.add("golden-text");
        span_user_id.classList.remove("golden-text");
    } else {
        background.style.left = "50%";
        request_input.placeholder = "User ID"

        span_username.classList.remove("golden-text");
        span_user_id.classList.add("golden-text");
    }
});

const response_span = document.querySelector("div.send span.response");
document.addEventListener("keydown", (event) => {
    if (event.key == "Enter") {
        const variable = input_type == 1 ? "username" : "user-id"; 
        const value = request_input.value;
        
        console.log(request_input.value);
        request_input.value = "";

        fetch(`/home/friends/send-request?${variable}=${encodeURIComponent(value)}`)
            .then(response => response.json())
            .then(resp => {
                response_span.textContent = resp.message;
            })
            .catch(err => {
                console.log("Error:", err);
                response_span.textContent = "Network error.";
            });
    }
});