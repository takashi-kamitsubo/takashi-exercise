const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const request = require("request")
const fetch = require("node-fetch")
const authConfig = require("./src/auth_config.json");

const app = express();

const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

if (
  !authConfig.domain ||
  !authConfig.audience ||
  authConfig.audience === "YOUR_API_IDENTIFIER"
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );

  process.exit();
}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),

  // audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

const getAccessToken = async () => {
  var options = { method: 'POST',
  url: 'https://dev-iam138t.jp.auth0.com/oauth/token',
  headers: { 'content-type': 'application/json' },
  body: '{"client_id":"LlfAXPxz0nyMqtXGlK5S7BSu8FRY6rz3","client_secret":"lzZNQmaonnxmbXHSmiROp0fdj8wli6Md71LACXn_IWkwhnrqR4R1lxDXdVN7NJ6C","audience":"https://dev-iam138t.jp.auth0.com/api/v2/","grant_type":"client_credentials"}' };

  return new Promise(async (resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
        return
      };
  
      resolve(JSON.parse(body))
    });
  })
}

const getUserinfo = async (auth) => {
  const res = await fetch("https://dev-iam138t.jp.auth0.com/userinfo", {
    headers: {
      Authorization: auth
    }
  })
  if (!res.ok) {
    return null
  }
  return await res.json()
}
const addHistory = async (auth, pizza) => {
  const userinfo = await getUserinfo(auth)
  if (!userinfo) {
    return
  }

  const userMetadata = userinfo["https://takashi-exercise.example.com/user_metadata"] || {}
  const history = userMetadata.order_history || []
  history.push({
    date: Date.now(),
    pizza: pizza
  })

  const token = await getAccessToken()
  console.log(`token:${token}`)
  const res = await fetch(`https://dev-iam138t.jp.auth0.com/api/v2/users/${userinfo.sub}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_metadata: {
        order_history: history
      }
    })
  })
  
  console.log(await res.json())

}

app.post("/api/pizza/order", checkJwt, async (req, res) => {
  console.log(req.user)
  console.log(req.user.scope)
  if (!req.user.scope.split(" ").includes("update:order_pizza")) {
    res.header("cache-control", "no-store")
    res.status(403)
    res.send({
      msg: "Insufficient permissions"
    })
    return
  }

  console.log("[start] add history")
  await addHistory(req.headers.authorization, req.body)
  console.log("[end] add history")

  res.header("cache-control", "no-store")
  res.send({
    msg: "Thank you for the order!"
  })
})
app.get("/api/userinfo", checkJwt, async (req, res) => {
  console.log(req.user)
  res.header("cache-control", "no-store")
  res.send(await getUserinfo(req.headers.authorization))
})

app.listen(port, () => console.log(`API Server listening on port ${port}`));
