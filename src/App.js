import React, { useState, useEffect } from "react";
import "./App.css";
import Toolbar from "./components/Toolbar/Toolbar";
import SideDrawer from "./components/SideDrawer/SideDrawer";
import Backdrop from "./components/Backdrop/Backdrop";
import * as ROUTES from "./routes/Routes";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import SignedIn from "./components/Signedin/Signedin";
import HomePage from "./components/HomePage/HomePage";
// import Schedule from "./components/Schedule/Schedule";
import Services from "./components/Services/Services";
import ForgotPW from "./components/ForgotPW/ForgotPW";
import ChangePW from "./components/ChangePW/ChangePW";
import EpaycoResponse from "./components/EpaycoResponse/EpaycoResponse";
import Reschedule from "./components/Reschedule/Reschedule";
import { RemoveScrollBar } from "react-remove-scroll-bar";
import { toast } from "react-toastify";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { userLoaded } from "./actions/index";
import "react-toastify/dist/ReactToastify.css";
import { TUNNEL } from "./assets/constants/url";
import ChangePWEmployee from "./components/ChangePWEmployee/ChangePWEmployee";
import PdfViewer from "./components/PdfViewer/PdfViewer";

toast.configure({
  autoClose: 8000,
  draggable: false,
});

function App() {
  const token = useSelector((state) => state.auth.token);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const dispatch = useDispatch();

  const drawerToggleClickHandler = () => {
    setSideDrawerOpen(!sideDrawerOpen);
  };
  const getAdminInfo = async (token) => {
    const config = {
      headers: {
        "content-type": "application/json",
        "x-auth-token": token,
      },
    };
    try {
      const res = await axios.get(`${TUNNEL}/api/auth/`, config);
      dispatch(userLoaded(res.data));
    } catch (e) {
      dispatch(userLoaded({}));
    }
  };

  useEffect(() => {
    if (token) {
      getAdminInfo(token);
    } else {
      dispatch(userLoaded({}));
    }
  }, [token]);

  return (
    <Router>
      <div className="totalContainer">
        <RemoveScrollBar />
        <Toolbar sideFunction={drawerToggleClickHandler} />
        {sideDrawerOpen && <Backdrop click={drawerToggleClickHandler} />}
        <SideDrawer shown={sideDrawerOpen} click={drawerToggleClickHandler} />

        <div>
          <Switch>
            <Route exact path={ROUTES.HOME} component={HomePage} />
            <Route exact path={ROUTES.FORGOT_PW} component={ForgotPW} />
            <Route exact path={ROUTES.RESCHEDULE} component={Reschedule} />
            <Route exact path={ROUTES.CHANGE_PW} component={ChangePW} />
            <Route
              exact
              path={ROUTES.CHANGE_PWEMPLOYEE}
              component={ChangePWEmployee}
            />
            <Route path={ROUTES.SIGNED_IN} component={SignedIn} />
            {/* <Route path={ROUTES.SCHEDULE_SERVICE} component={Schedule}></Route> */}
            <Route path={ROUTES.SERVICES_PAY} component={Services}></Route>
          </Switch>
        </div>
        <div>
          <Switch>
            <Route path={ROUTES.PDFVIEWER} component={PdfViewer} />
            <Route
              path={ROUTES.EPAYCO_RESPONSE}
              component={EpaycoResponse}
            ></Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;
