import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./Example.css";
import { exampleAction } from "../../actions";

function Example() {
  const reduxState = useSelector(state => state.example);
  const dispatch = useDispatch();
  const boolean = reduxState.boolean;
  const changeReduxState = () => {
    dispatch(exampleAction()); // REMEMBER YOU CAN DISPATCH WITH PAYLOAD
  };

  return <div onClick={changeReduxState}>{boolean.toString()}</div>;
}

export default Example;
