import React from "react";
import "./Toolbar.css";
import DrawerToggleButton from "../SideDrawer/DrawerToggleButton";
import * as ROUTES from "../../routes/Routes";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../actions/index";
function Toolbar(props) {
  const dispatch = useDispatch();
  const userLoaded = useSelector((state) => state.auth.allUserInfo);
  return (
    <header className="toolbar">
      <nav className="toolbar__navigation">
        <div>
          <DrawerToggleButton click={props.sideFunction} />
        </div>
        <div className="spacer"></div>
        <div className="toolbar__navitems">
          <ul
            style={{
              display: Object.entries(userLoaded).length === 0 && "none",
            }}
          >
            <li>
              <Link to={ROUTES.SIGNED_IN}>Mi cuenta</Link>
            </li>
            <li
              onClick={() => dispatch(logoutUser())}
              style={{
                display: Object.entries(userLoaded).length === 0 && "none",
              }}
            >
              <Link to={ROUTES.HOME}>
                <i className="fas fa-sign-out-alt"></i>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default Toolbar;
