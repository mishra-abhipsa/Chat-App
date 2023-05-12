// //First up, the return value from the io function.That needs to be stored in a variable because
// //we're gonna wanna access it in this file.
const socket = io();
//Elements -each for form,button and input
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
//location button
const $sendLocBtn = document.querySelector("#send-loc");
//messages
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#locationMessage-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  //get the new message element
  const $newMessage = $messages.lastElementChild;

  //get the height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  // const newMessageHeight = $newMessage.offsetHeight; //this doesn't give the margin
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = $messages.offsetHeight;

  //Height of messages container
  const containerHeight = $messages.scrollHeight;

  //How far have I scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    //autoscroll
    $messages.scrollTop = $messages.scrollHeight
  }
};

// //We want to receive the event that the server is sending to us.
socket.on("messageEvent", (msg) => {
  //msg is now an object
  console.log(msg);
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});
// socket.on("countUpdated", (count) => {
//   console.log("Count is updated", count);
// });

// let incBtn = document.querySelector("#increment");
// incBtn.addEventListener("click", () => {
//   console.log("Clicked!");
//   socket.emit("increment"); //no need to send any data ,server knows count value
// });

socket.on("locationMessage", (locMsg) => {
  console.log(locMsg);
  const html = Mustache.render(locationMessageTemplate, {
    username: locMsg.username,
    locationMessage: locMsg.url,
    createdAt: moment(locMsg.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

//listening to a new event by server- getting list of all users in a rom
socket.on("roomData", ({ room, users }) => {
  //destructuring room,users from the object received
  console.log(room);
  console.log(users);
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // const message = document.querySelector("input").value;
  //disable

  $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;
  //for acknowledgement, added 3rd argument -- a callback function
  // socket.emit("sendMessage", message, (msg) => {
  //   //in the callback we have access to the argument that the server sent
  //   console.log("The message was delivered", msg);
  // });

  socket.emit("sendMessage", message, (error) => {
    //enable
    $messageFormButton.removeAttribute("disabled");
    //clearing input field after submit
    $messageFormInput.value = "";
    //bring focus back on i/p field
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log("Message delivered!");
  });
});

$sendLocBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser!");
  }
  //disable loc button
  $sendLocBtn.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position);

    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      (error) => {
        if (error) {
          return console.log(error);
        }
        //enable loc btn
        $sendLocBtn.removeAttribute("disabled");
        console.log("Location shared");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/"; //redirecting users to homepage incase of any errors
  }
});
