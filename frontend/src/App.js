import "./App.css";
import { useState } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import * as React from "react";
import Box from "@mui/material/Box";

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const refreshToken = async () => {
    try {
      const res = await axios.post("/refresh", { token: user.refreshToken });
      setUser({
        ...user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });

      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(
   
    async (config) => {
      let currentDate = new Date();
      const decodedToken = jwt_decode(user.accessToken);

      if (decodedToken.exp * 1000 < currentDate.getTime()) {
        const data = await refreshToken();
        config.headers["Hello"]="How are you";
        config.headers["authorization"] = "Bearer " + data.accessToken;
      
        console.log("New Access Token ", data.accessToken);

        console.log("New Refresh Token ", data.refreshToken);
      }

      return config;
    },
    (error_1) => {
      return Promise.reject(error_1);
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/login", { username, password });
      console.log("Access Token ", res.data.accessToken);
      console.log("Refresh Token ", res.data.refreshToken);

      setUser(res.data);
    } catch (error_2) {
      console.log(error_2);
    }
  };

  const handleDelete = async (id) => {
    setSuccess(false);
    setError(false);
    try {
      await axiosJWT.delete("/users/" + id, {
        headers: { authorization: "Bearer " + user.accessToken },
      });
      setSuccess(true);
    } catch (err) {
      setError(true);
    }
  };

  return (
    <div className="App">
      <Box
        alignContent={"center"}
        xs={12}
        sx={{
          width: 300,
          margin: "auto",
          border: 1,
          height: 200,
          marginTop: 10,
          backgroundColor: "primary.light",
          borderRadius: 8,
          padding: 3,

          // opacity: [0.9, 0.8, 0.7],
        }}
      >
        {user ? (
          <div className="home">
            <div>
              Welcome to the <b>if(user.isAdmin){"admin"} else {"user"} </b> dashboard{" "}
              <b>{user.username}</b>.
            </div>
            <br />
            <div>Delete Users:</div>

            <Button variant="contained" onClick={() => handleDelete(1)}>
              Delete Theo
            </Button>
            <br />

            <br />
            <Button variant="contained" onClick={() => handleDelete(2)}>
              Delete John
            </Button>
            <br />

            {error && (
              <div className="error">
                You are not allowed to delete this user!
              </div>
            )}
            {success && (
              <div className="success">
                User has been deleted successfully...
              </div>
            )}
          </div>
        ) : (
          <div className="login">
            <form onSubmit={handleSubmit}>
              <Box sx={{ typography: "body1" }}>Login</Box>

              <TextField
                id="outlined-basic"
                label="UserName"
                color="success"
                variant="outlined"
                type="text"
                placeholder="username"
                onChange={(e) => setUsername(e.target.value)}
              />

              <TextField
                id="outlined-basic"
                label="Password"
                type="password"
                color="success"
                variant="outlined"
                sx={{ m: 3 }}
                type="password"
                placeholder="password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button variant="contained" type="submit">
                Login
              </Button>
            </form>
          </div>
        )}
      </Box>
    </div>
  );
}

export default App;
