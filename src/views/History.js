import React, { useState } from "react";

import Loading from "../components/Loading";
import { useAuth0, withAuthenticationRequired} from "@auth0/auth0-react";
import contentData from "../utils/contentData"

export const HistoryComponent = ({user}) => {
  const { isAuthenticated } = useAuth0()

  if (!isAuthenticated) {
    window.location.href = "/";
    return;
  }

  const style = {
    padding: "10px"
  }
  const dateStyle = {
    fontWeight: "bold"
  }
  const pizzaStyle = {
    fontSize: "1.25rem"
  }

  const meta = user["https://takashi-exercise.example.com/user_metadata"] || {}

  return (<>
    <h1>History</h1>
    {(meta.order_history || []).reverse().map((item, i) => {
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
