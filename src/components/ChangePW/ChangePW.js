import React, { useState } from "react";
import "./ChangePW.css";
import { withRouter, useParams } from "react-router-dom";
import axios from "axios";
import CustomToast from "../custom-toast";
import { toast } from "react-toastify";
import Logo from "../../assets/images/Logo-HouseKeeper365.png";
import { TUNNEL } from "../../assets/constants/url";

const ChangePW = ({ ...props }) => {
  const [newPass, setNewPass] = useState("");
  const [repeatNewPass, setRepeatNewPass] = useState("");
  let { userid } = useParams();

  const handleResetPass = async () => {
    if (newPass !== repeatNewPass) {
      toast(<CustomToast title="¡Las contraseñas no coinciden!" />);
    } else if (newPass.length < 6) {
      toast(
        <CustomToast title="¡La contraseña nueva debe tener por lo menos 6 caracteres!" />
      );
    } else {
      const config = {
        params: {
          userid: userid,
          newPass: newPass,
        },
        headers: {
          "content-type": "application/json",
        },
      };
      try {
        const res = await axios.get(`${TUNNEL}/api/auth/changepw`, config);
        setNewPass("");
        setRepeatNewPass("");
        props.history.push("/");
        toast(<CustomToast title="¡Contraseña cambiada con éxito!" />);
      } catch (e) {
        console.log(e.response.data);
        toast(
          <CustomToast title="No se pudo cambiar su contraseña. Intente más tarde." />
        );
      }
    }
  };

  return (
    <div className="forgotpw-container">
      <div className="header-pw">PORTAL DE CLIENTES</div>
      <div className="header-img-login-pw">
        <img src={Logo} alt="" className="header-img-login-pw" />
      </div>

      <div className="text-pw-forgot3">NUEVA CONTRASEÑA:</div>
      <input
        className="email-input-pw-forgot"
        type="password"
        style={{ marginBottom: "0" }}
        onChange={(e) => setNewPass(e.target.value)}
        value={newPass}
      ></input>
      <div className="text-pw-forgot3">REPETIR CONTRASEÑA:</div>
      <input
        className="email-input-pw-forgot"
        type="password"
        onChange={(e) => setRepeatNewPass(e.target.value)}
        value={repeatNewPass}
      ></input>
      <div className="login-btns-change" style={{ justifyContent: "center" }}>
        <button
          className="change-pw-btn"
          onClick={handleResetPass}
          style={{ marginRight: "0" }}
        >
          RESTABLECER CONTRASEÑA
        </button>
      </div>
    </div>
  );
};

export default withRouter(ChangePW);
