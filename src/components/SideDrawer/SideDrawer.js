import React from "react";
import "./SideDrawer.css";
import { Link } from "react-router-dom";
import * as ROUTES from "../../routes/Routes";

const sideDrawer = (props) => {
  let classN = props.shown ? "side-drawer open" : "side-drawer";

  return (
    <nav className={classN}>
      <ul>
        <li>
          <Link onClick={props.click} to={ROUTES.HOME}>
            Home
          </Link>
        </li>
        <li>
          <Link onClick={props.click} to={ROUTES.SIGNED_IN}>
            Sign In
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default sideDrawer;
