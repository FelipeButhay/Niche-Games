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

// --------------------------
//     REQUESTS & FRIENDS
// --------------------------

const data_json = JSON.parse(`{{ data|tojson | safe }}`);

const friends_list = data_json.friends;
const requests_list = data_json.requests;

const friends_ul = document.querySelector("div.friends ul");
for (const friend_li in friends_list) {
    const li = document.createElement("li");
    const span_username = document.createElement("span.username");
    const span_status = document.createElement("span.status");

    span_username.textContent = friend_li.username;
    span_status.textContent   = friend_li.status;

    li.appendChild(span_username);
    li.appendChild(span_status);

    li.id = `friend-${friend_li.username}`;

    friends_ul.appendChild(li);
}

const requests_ul = document.querySelector("div.requests ul");
for (const request_li in friends_list) {
    const li = document.createElement("li");
    const span_username = document.createElement("span.username");

    span_username.textContent = request_li.username;

    const icon1 = document.createElement("svg.icon");
    const use1 = document.createElement("use");
    use1.href = "#check-icon";
    icon1.appendChild(use1);
    
    const icon2 = document.createElement("svg.icon");
    const use2 = document.createElement("use");
    use2.href = "#cross-icon";
    icon2.appendChild(use2);

    li.appendChild(span_username);
    li.appendChild(icon1);
    li.appendChild(icon2);

    li.id = `request-${friend_li.username}`;

    friends_ul.appendChild(li);
}