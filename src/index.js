const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io"); //when we require this lib, we get a function back
const Filter = require("bad-words");
const { generateMessage, generateLocMessage } = require("./utills/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utills/users");

const app = express();
const server = http.createServer(app); //Express lib does this behind the scenes anyway
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

//Setup static directory to serve
app.use(express.static(publicDirectoryPath));

// let count = 0;

// //server(emit) -> client(receive) - countUpdated
// //client(emit) -> server(receive) - increment

//for detecting a new web-socket connection or a new client //listening
io.on("connection", (socket) => {
  console.log("New webSocket connection");

  // // socket.emit("messageEvent", "Welcome!");
  // socket.emit("messageEvent", generateMessage("Welcome!"));
  // socket.broadcast.emit(
  //   "messageEvent",
  //   generateMessage("A new user has joined!")
  // );

  //   //send some data back to the newly connected client
  //   socket.emit("countUpdated", count);

  //   //listening for events
  //   socket.on("increment", () => {
  //     count++;

  //     //code to ensure that the client gets the updated count
  //     // socket.emit("countUpdated", count); //emits an event to a specific connection
  //     io.emit("countUpdated", count); //emits an event to all available connections
  //   });

  socket.on("join", ({ username, room }, callback) => {
    //adding User
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room); //arguments changed from room,username to user.room, user,username- to implement
    //triming and lowercase functionality from addUser

    socket.emit("messageEvent", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "messageEvent",
        generateMessage("Admin", `${user.username} has joined!`)
      );
    //emitting a new event - get list of all users in a  room
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });
  socket.on("sendMessage", (message, callback) => {
    // adding a 2nd param to callback func to acknowledge the event

    const user = getUser(socket.id);

    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    // io.emit("messageEvent", generateMessage(message));
    io.to(user.room).emit(
      "messageEvent",
      generateMessage(user.username, message)
    );
    // callback("Delivered!"); //server can send some data while acknowledging
    callback();
  });

  //listening for location
  socket.on("sendLocation", (location, callback) => {
    // io.emit(
    //   "messageEvent",
    //   `location: ${location.latitude},${location.longitude}`
    // );

    // io.emit(
    //   "messageEvent",
    //   // "locationMessage",
    //   `https://google.com/maps?q=${location.latitude},${location.longitude}`
    // );
    const user = getUser(socket.id);
    // io.emit(
    //   "locationMessage",
    //   generateLocMessage(
    //     `https://google.com/maps?q=${location.latitude},${location.longitude}`
    //   )
    // );
    io.to(user.room).emit(
      "locationMessage",
      generateLocMessage(
        user.username,
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );

    callback();
  });

  //for disconnecting
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      // io.emit("messageEvent", generateMessage("A user has left"));
      io.to(user.room).emit(
        "messageEvent",
        generateMessage("Admin", `${user.username} has left`)
      );
      //emitting a new event - getting list of all users in a room
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

// app.listen(port, () => {
server.listen(port, () => {
  console.log("Server is up on port ", port);
});
