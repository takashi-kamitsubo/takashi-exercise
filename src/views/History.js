import React, { useState } from "react";
import { Container, Row, Col } from "reactstrap";

import Loading from "../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import apis from "../api_config.json"
import contentData from "../utils/contentData"

console.log(apis)

export const HistoryComponent = () => {
  const [started, setStarted] = useState(false)
  const [processing, setProcessing ] = useState(true);
  const [orderHistory, setOrderHistory] = useState([]);
  const { user, error, getAccessTokenSilently } = useAuth0();

  (async function() {
    if (started) {
      return
    }
    setStarted(true)

    const token = await getAccessTokenSilently({
      scope: "read:users"
    });
    const response = await fetch(apis.userinfo, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (response.ok) {
      const json = await response.json()
      console.log(json)
      const meta = json["https://dev-iam138t:jp:auth0:com/user_metadata"] || {}
      setOrderHistory((meta.order_history || []).reverse())
    }
    setProcessing(false)
  })()

  const style = {
    padding: "10px"
  }
  const dateStyle = {
    fontWeight: "bold"
  }
  const pizzaStyle = {
    fontSize: "1.25rem"
  }

  return (<>
    <h1>History</h1>
    {processing && (
      <Loading />
    )}{
      !processing && orderHistory.map((item, i) => {
        return (<div key={i} style={style}>
          <span style={dateStyle}>{new Date(item.date).toString()}</span>
          {Object.keys(item.pizza).map(function(k, j) {
            return (<div key={j} style={pizzaStyle}>
              {contentData.find(a=>{return a.code === k}).title} x {this[k]}
            </div>)
          }, item.pizza)
          }
        </div>)
      })
    }
  </>)
};

export default withAuthenticationRequired(HistoryComponent, {
  onRedirecting: () => <Loading />,
});
