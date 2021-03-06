import "./index.css";

import * as remote from "@syncstate/remote-client";

import App from "./App.js";
import { Provider } from "@syncstate/react";
import React from "react";
import ReactDOM from "react-dom";
import { createDocStore } from "@syncstate/core";
import io from "socket.io-client";
import reportWebVitals from "./reportWebVitals";

const store = createDocStore({ todos: [] }, [remote.createInitializer()]);

//enable remote plugin
store.dispatch(remote.enableRemote("/todos"));

//setting up socket connection with the server
let socket = io.connect("http://localhost:8000");

// send request to server to get patches everytime when page reloads
socket.emit("fetchDoc", "/todos");

//observe the changes in store state
store.observe(
  "doc",
  "/todos",
  (todos, change) => {
    if (!change.origin) {
      //send json patch to the server
      socket.emit("change", "/todos", change);
    }
  },
  Infinity
);

//get patches from server and dispatch
socket.on("change", (path, patch) => {
  console.log(patch, "patch");
  store.dispatch(remote.applyRemote(path.replace("/todos", ""), patch));
});

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
