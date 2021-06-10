import React, { useState } from "react";
import "./ForgotPW.css";
import Logo from "../../assets/images/Logo-HouseKeeper365.png";
import { withRouter } from "react-router-dom";
import axios from "axios";
import CustomToast from "../custom-toast";
import { toast } from "react-toastify";
import { TUNNEL } from "../../assets/constants/url";

const ForgotPW = ({ ...props }) => {
  const [email, setEmail] = useState("");

  const sendPWEmail = async () => {
    const user = { email };
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify(user);
      const res = await axios.post(
        `${TUNNEL}/api/users/email-pw-forget`,
        body,
        config
      );
      setEmail("");
      toast(<CustomToast title={res.data.msg} />);
    } catch (err) {
      toast(
        <CustomToast title="¡No se pudo enviar el correo! Intente de nuevo." />
      );
    }
  };
  return (
    <div className="forgotpw-container">
      <div className="header-pw">PORTAL DE CLIENTES</div>
      <div className="header-img-login-pw">
        <img src={Logo} alt="" className="header-img-login-pw" />
      </div>
      <div className="text-pw-forgot1">
        ¿Olvidaste tu contraseña o se expiró tu correo de verificación?
      </div>
      <div className="text-pw-forgot2">
        Escribe el correo registrado para su usuario.
      </div>
      <div className="text-pw-forgot2">
        Enviaremos un link para reestablecer tus credenciales o para verificar
        su cuenta si aún no se ha hecho.
      </div>
      <div className="text-pw-forgot3">CORREO ELECTRÓNICO:</div>
      <input
        className="email-input-pw-forgot"
        type="text"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      ></input>
      <div className="login-btns-forgot">
        <button
          className="forgot-btn-cancel"
          onClick={() => props.history.push("/")}
        >
          CANCELAR
        </button>
        <button className="forgot-btn-confirm" onClick={sendPWEmail}>
          CONFIRMAR
        </button>
      </div>
    </div>
  );
};

export default withRouter(ForgotPW);
