const express = require("express");

const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());

const users = [
  {
    id: "1",
    username: "theo",
    password: "123123",
    isAdmin: false,
  },
  {
    id: "2",
    username: "john",
    password: "123123",
    isAdmin: true,
  },
];

//test
let refreshTokens = [];

app.post("/api/refresh", (req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken)
    return res.status(401).json("You are not Authenticated ! ");

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("Refresh token is not valid!");
  }

  
  jwt.verify(refreshToken, "123qweasdzxcqweasdzxcasdqwe123", (error, user) => {
    error && console.log(error);
    refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // const isTokenExpired = (refreshToken) => (Date.now() >= JSON.parse(Buffer.from(refreshToken.split('.')[1], 'base64').toString()).exp * 1000);
    // console.log(isTokenExpired);
    refreshTokens.push(newRefreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
});

const generateAccessToken = (user) => {
  const ACCESS_TOKEN = jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    "qweasdzxcqweasdzxcasdqwe",
    {
      expiresIn: "10s",
    }
  );
  console.log(ACCESS_TOKEN);
  return ACCESS_TOKEN;
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    "123qweasdzxcqweasdzxcasdqwe123",
    { expiresIn: "20s" }
  );
};

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find((user) => {
    return user.username === username && user.password === password;
  });

  if (user) {
    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken(user);

    refreshTokens.push(refreshToken);

    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(400).json("Username or password incorrect!");
  }
});

const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, "qweasdzxcqweasdzxcasdqwe", (error, user) => {
      if (error) {
        return res.status(403).json("Token is not valid ! ");
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You are not authenticated!");
  }
};

app.delete("/api/users/:userId", verify, (req, res) => {
  if (req.user.id === req.params.userId || req.user.isAdmin) {
    res.status(200).json("User has been deleted.");
  } else {
    res.status(403).json(" You are not allowed to delete this user !");
  }
});

app.post("/api/logout", verify, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).json("You have been logged out successfully");
});

app.listen(5000, () => console.log("Backend Server is listening to port 5000"));
