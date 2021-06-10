import React, { useState } from "react";
import "./HomePage.css";
import imagenHouseekeeper1 from "../../assets/images/Background-ingreso-plataforma.png";
import LoginBox from "../LogInBox/Login";
import EmailBox from "../EmailBox/Email";
import axios from "axios";
import CustomToast from "../custom-toast";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signInSuccess, signInFail } from "../../actions/index";
import { TUNNEL } from "../../assets/constants/url";

const HomePage = () => {
  const dispatch = useDispatch();
  const [showEmailBox, setShowEmailBox] = useState(false);
  const [tempEmail, setTempEmail] = useState("");
  let history = useHistory();

  const registerUser = async (
    username,
    email,
    password,
    passRepeat,
    fullName,
    department,
    city,
    typeID,
    id,
    phone,
    address,
    birthDate,
    acceptPrivacy,
    acceptTerms
  ) => {
    const user = {
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password,
      passRepeat,
      fullName: fullName.toLowerCase().trim(),
      department,
      city,
      typeID,
      id: id.toLowerCase().trim(),
      phone: phone.trim(),
      address: address.trim(),
      birthDate,
      acceptPrivacy,
      acceptTerms,
    };
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify(user);
      // eslint-disable-next-line no-unused-vars
      const res = await axios.post(`${TUNNEL}/api/users`, body, config);
      toast(<CustomToast title="¡Registro exitoso!" />);
      setTempEmail(email);
      setShowEmailBox(true);
    } catch (err) {
      toast(<CustomToast title={err.response.data.errors[0].msg} />);
    }
  };

  const changeEmailBox = () => {
    setShowEmailBox(false);
  };

  const handleLogin = async (usern, password) => {
    // User can be either username or password
    const user = {
      usern: usern.toLowerCase().trim(),
      password,
    };
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify(user);
      const res = await axios.post(`${TUNNEL}/api/auth/`, body, config);
      dispatch(signInSuccess(res.data));
      history.push("/signedIn");
      toast(<CustomToast title="¡Credenciales correctas!" />);
    } catch (err) {
      dispatch(signInFail(err));
      toast(<CustomToast title={err.response.data.errors[0].msg} />);
    }
  };

  const resendEmail = async (email) => {
    const user = { email };
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify(user);
      // eslint-disable-next-line no-unused-vars
      const res = await axios.post(
        `${TUNNEL}/api/users/email-verify`,
        body,
        config
      );
      toast(<CustomToast title="¡Correo enviado de nuevo!" />);
    } catch (err) {
      toast(
        <CustomToast title="¡No se pudo enviar el correo! Intente de nuevo." />
      );
    }
  };

  return (
    <div className="main__content">
      <hr />
      <img src={imagenHouseekeeper1} alt="" className="background-login" />

      {!showEmailBox ? (
        <LoginBox registerUser={registerUser} handleLogin={handleLogin} />
      ) : (
        <EmailBox
          changeEmailBox={changeEmailBox}
          resendEmail={resendEmail}
          tempEmail={tempEmail}
        />
      )}

      <div className="shadow"></div>
    </div>
  );
};

export default HomePage;
