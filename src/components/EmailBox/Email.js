import React from "react";
import "./Email.css";
import Logo from "../../assets/images/Logo-HouseKeeper365.png";

const EmailBox = ({ changeEmailBox, resendEmail, tempEmail, ...props }) => {
  return (
    <div className="email-container">
      {" "}
      <div className="header-login">PORTAL DE CLIENTES</div>
      <div className="header-img-login" style={{ marginBottom: "30%" }}>
        <img
          src={Logo}
          alt=""
          className="header-img-login"
          style={{ width: "40%" }}
        />
      </div>
      <div className="text-email-verfication">
        Hemos enviado un link a tu correo para confirmar tu registro.
      </div>
      <div className="text-email-verfication2">
        <span onClick={() => resendEmail(tempEmail)}>Volver a enviar</span>
      </div>
      <div className="login-btns-verification">
        <button
          className="login-btn-verification"
          onClick={() => changeEmailBox()}
        >
          INGRESAR
        </button>
      </div>
    </div>
  );
};

export default EmailBox;
