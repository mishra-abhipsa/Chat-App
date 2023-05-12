const users = [];

//addUser, removeUser,getUser,getUsersInRoom

const addUser = ({ id, username, room }) => {
  //Clean the data--which is provided by client - username,room --convert to lowercase,trim extra spaces
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //Validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  //Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //Validate username
  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }

  //Store User
  const user = { id, username, room };
  users.push(user);
  return { user };
};

//remove user
const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//get User
const getUser = (id) => {
  // const matchUser = users.find((user) => {
  //   return user.id === id;
  // });

  // if (!matchUser) {
  //   return undefined;
  // }
  // return matchUser;
  return users.find((user) => user.id === id);
};

//get users in a room
const getUsersInRoom = (room) => {
  // const usersInRoom = users.filter((user) => {
  //   return user.room.toLowerCase() === room.toLowerCase();
  // });
  // if (usersInRoom.length === 0) {
  //   return undefined;
  // }
  // return usersInRoom;
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

// //addUser function call
// addUser({
//   id: 11,
//   username: "Megha",
//   room: "Music",
// });
// addUser({
//   id: 12,
//   username: "Ira",
//   room: "Music",
// });
// addUser({
//   id: 13,
//   username: "Saila",
//   room: "Dance",
// });

// console.log(users);
// console.log(getUsersInRoom("  Dance"));

// //testing remove user
// const removedUser = removeUser(11);
// console.log(removedUser);
// console.log(users);
// //testing get user
// console.log(getUser(10));

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
