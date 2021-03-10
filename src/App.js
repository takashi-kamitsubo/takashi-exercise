import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";

import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./views/Home";
import History from "./views/History";
import { useAuth0 } from "@auth0/auth0-react";
import history from "./utils/history";

import apis from "./api_config.json"

// styles
import "./App.css";

// fontawesome
import initFontAwesome from "./utils/initFontAwesome";
initFontAwesome();

const App = () => {
  const { user, isLoading, error , getAccessTokenSilently} = useAuth0();

  console.log(isLoading)
  console.log(user)

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <Loading />;
  }

  const onOrder = async (order) => {
    console.log(order)
    if (!user) {
      alert("Please log in")
      return null
    }
    if (!user.email_verified) {
      alert("Please verify your email")
      return null
    }

    let number = 0
    const orderData = {}
    Object.keys(order).forEach(function(k) {
      number += this[k]
      if (this[k] > 0) {
        orderData[k] = this[k]
      }
    }, order)
    if (number === 0) {
      alert("Please select your pizza!")
      return null
    }
    console.log(number)

    const token = await getAccessTokenSilently({
      scope: 'update:users update:current_user_metadata'
    });

    console.log(JSON.stringify(orderData))
    const response = await fetch(apis.order_pizza, {
      method: "POST",
      body: JSON.stringify(orderData),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': "application/json"
      }
    });
    console.log(response)
    
    if (response.ok) {
      return (await response.json()).msg
    }
    return null
  }
  
  return (
    <Router history={history}>
      <div id="app" className="d-flex flex-column h-100">
        <NavBar />
        <Container className="flex-grow-1 mt-5">
          <Switch>
            {/* <Route path="/" exact component={Home} /> */}
            <Route path="/" exact>
              <Home orderHandler={onOrder} />
            </Route>
            <Route path="/history" component={History} />
            {/* <Route path="/external-api" component={ExternalApi} /> */}
          </Switch>
        </Container>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
