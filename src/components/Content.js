import React, { Component } from "react";
import { Row, Col } from "reactstrap";
import contentData from "../utils/contentData";

const spanStyle = {
  fontSize: "1.25rem",
  fontWeight: "bold"
}
const buttonStyle = {
  marginLeft: "10px",
  padding: "auto",
  width: "25px",
  border: "1px",
  borderRadius: "5px",
  fontWeight: "bold",
  color: "white",
  backgroundColor: "darkgray"
}
const textStyle = {
  marginLeft: "10px",
  width: "30px",
  textAlign: "right"
}
const submitStyle = {
  width: "100px",
  height: "30px",
  border: "0px",
  backgroundColor: "lightblue",
  fontWeight: "bold",
  borderRadius: "5px"
}

const order = {}
function addPizza(e) {
  const code = e.target.dataset.code
  const index = e.target.dataset.index
  if (!order[code]) {
    order[code] = 0
  }
  order[code]++
  document.querySelector(`#text-pizza-` + index).value = order[code]
}
function delPizza(e) {
  const code = e.target.dataset.code
  const index = e.target.dataset.index
  if (!order[code]) {
    order[code] = 0
  }
  if (order[code] > 0) {
    order[code]--
  }
  document.querySelector(`#text-pizza-` + index).value = order[code]
}
function resetPizza() {
  Object.keys(order).forEach(function(k) {
    delete this[k]
  }, order)
  document.querySelectorAll(".pizza_count").forEach(text => {
    text.value = "0"
  })
}

class Content extends Component {
  constructor(params) {
    super()
    this._orderHandler = async (e)=> {
      const msg = await params.orderHandler({...order})
      if (msg) {
        resetPizza()
        alert(msg)
        window.location.reload()
      }
    }
  }

  render() {
    return (
      <div className="next-steps my-5">
        {/* <h2 className="my-5 text-center">What can I do next?</h2> */}
        <Row className="d-flex justify-content-between">
          {contentData.map((col, i) => (
            <Col key={i} md={5} className="mb-4">
              <h6>
                <img src={col.img} alt={col.code}></img>
              </h6>
              <span style={spanStyle}>{col.title}</span>
              <button style={buttonStyle} onClick={addPizza} data-index={i} data-code={col.code}>+</button>
              <button style={buttonStyle} onClick={delPizza} data-index={i} data-code={col.code}>-</button>
              <input type="text" className="pizza_count" id={`text-pizza-` + i} disabled style={textStyle} data-code={col.code} value="0"></input>
            </Col>
          ))}
        </Row>
        <button style={submitStyle} onClick={this._orderHandler}>Order</button>
      </div>
    );
  }
}

export default Content;
