const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
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

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

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

  console.log(JSON.stringify(userinfo, null, 2))
  const userMetadata = userinfo["https://dev-iam138t:jp:auth0:com/user_metadata"] || {}
  const history = userMetadata.order_history || []
  history.push({
    date: Date.now(),
    pizza: pizza
  })

  const res = await fetch(`https://dev-iam138t.jp.auth0.com/api/v2/users/${userinfo.sub}`, {
    method: "PATCH",
    headers: {
      Authorization: auth,
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
  await addHistory(req.headers.authorization, req.body)

  res.header("cache-control", "no-store")
  res.send({
    msg: "Thank you for the order!"
  })
})
app.get("/api/userinfo", checkJwt, async (req, res) => {
  res.header("cache-control", "no-store")
  res.send(await getUserinfo(req.headers.authorization))
})

app.listen(port, () => console.log(`API Server listening on port ${port}`));
