import React, { useState, useEffect } from "react";
import Logo from "../../assets/images/Logo-HouseKeeper365.png";
import "./Login.css";
import { DropdownList } from "react-widgets";
import citiesJSON from "./colombia";
import { withRouter, Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "../../../node_modules/react-datepicker/dist/react-datepicker.css";
import "react-widgets/dist/css/react-widgets.css";

const LoginBox = ({ registerUser, handleLogin, ...props }) => {
  const [register, setRegister] = useState(false);
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passRepeat, setPassRepeat] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState("");
  const [typeID, setTypeID] = useState("");
  const [id, setID] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [address, setAddress] = useState("");
  const [userLogin, setUserLogin] = useState("");
  const [pwLogin, setPwLogin] = useState("");
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [startDate, setStartDate] = useState(new Date());

  const [birthDate, setBirthDate] = useState(null);

  useEffect(() => {
    if (startDate) {
      setBirthDate(
        startDate.toString().substring(0, startDate.toString().indexOf(":") - 3)
      );
    } else {
      setStartDate(new Date());
    }
  }, [startDate]);

  const allDepartments = citiesJSON.map((ele) => ele.departamento);

  const idData = ["TI", "CC", "NIT"];
  const handleDepartmentChange = (value) => {
    setCities([]);
    setCity("");
    setDepartment(value);
  };
  const handleRegister = async () => {
    if (register) {
      registerUser(
        user,
        email,
        password,
        passRepeat,
        fullName,
        department,
        city,
        typeID,
        id,
        cellphone,
        address,
        birthDate,
        acceptPrivacy,
        acceptTerms
      );
    } else {
      setRegister(true);
    }
  };
  useEffect(() => {
    if (department !== "") {
      const listCities = citiesJSON.filter(
        (ele) => ele.departamento === department
      )[0].ciudades;
      setCities(listCities);
    }
  }, [department]);

  return (
    <div
      className="login-container"
      style={{ backgroundSize: register && "auto" }}
    >
      <div className="header-login">PORTAL DE CLIENTES</div>
      <div className="header-img-login">
        <img
          src={Logo}
          alt=""
          className="header-img-login"
          style={{ width: register && "150px" }}
        />
      </div>
      {/* User Inputs for Sign in */}
      <input
        className={"user-input-login1"}
        type="text"
        style={{ display: register && "none" }}
        placeholder="U s u a r i o"
        value={userLogin}
        onChange={(e) => setUserLogin(e.target.value)}
      ></input>
      <input
        className={"user-input-login1"}
        type="password"
        style={{ display: register && "none" }}
        placeholder="C o n t r a s e ñ a"
        value={pwLogin}
        onChange={(e) => setPwLogin(e.target.value)}
      ></input>
      {/* User Inputs for registering */}

      <input
        className="user-input-login1 regis"
        type="text"
        style={{ display: !register && "none" }}
        placeholder="U s u a r i o"
        value={user}
        onChange={(e) => setUser(e.target.value)}
      ></input>
      <input
        className="user-input-login1 regis"
        type="password"
        style={{ display: !register && "none" }}
        placeholder="C o n t r a s e ñ a"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      ></input>

      <div className="text-register" style={{ display: !register && "none" }}>
        REPETIR CONTRASEÑA:
      </div>
      <input
        className="user-input-login reg text-left"
        type="password"
        style={{ display: !register && "none" }}
        onChange={(e) => setPassRepeat(e.target.value)}
        value={passRepeat}
      ></input>
      <div className="text-register" style={{ display: !register && "none" }}>
        NOMBRE COMPLETO:
      </div>
      <input
        className="user-input-login reg text-left"
        type="text"
        style={{ display: !register && "none" }}
        onChange={(e) => setFullName(e.target.value)}
        value={fullName}
      ></input>
      <div className="text-register" style={{ display: !register && "none" }}>
        CORREO ELECTRÓNICO:
      </div>
      <input
        className="user-input-login reg text-left"
        type="text"
        style={{ display: !register && "none" }}
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      ></input>
      <div className="text-register" style={{ display: !register && "none" }}>
        IDENTIFICACIÓN:
      </div>
      <div style={{ display: !register ? "none" : "flex" }}>
        <DropdownList
          style={{ marginLeft: "18%" }}
          data={idData}
          value={typeID}
          placeholder={"Tipo"}
          onChange={(value) => setTypeID(value)}
        />
        <input
          className="user-input-login id text-left"
          type="text"
          style={{ display: !register && "none" }}
          placeholder="Número"
          onChange={(e) => setID(e.target.value)}
          value={id}
        ></input>
      </div>
      <div className="text-register" style={{ display: !register && "none" }}>
        TELÉFONO:
      </div>
      <input
        className="user-input-login reg text-left"
        type="text"
        style={{ display: !register && "none" }}
        onChange={(e) => setCellphone(e.target.value)}
        value={cellphone}
      ></input>
      <div
        className="text-register"
        style={{
          display: !register && "none",
          textAlign: "center",
          marginLeft: "0px",
        }}
      >
        FECHA DE NACIMIENTO:
      </div>
      <div
        style={{
          display: !register ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "5px",
        }}
      >
        <DatePicker
          showYearDropdown
          selected={startDate}
          onChange={(date) => setStartDate(date)}
        />
      </div>
      <div className="text-register" style={{ display: !register && "none" }}>
        UBICACIÓN:
      </div>
      <div
        style={{ display: !register ? "none" : "flex", marginBottom: "10px" }}
      >
        <DropdownList
          style={{ width: "30%", marginLeft: "18%" }}
          data={allDepartments}
          onChange={(value) => handleDepartmentChange(value)}
          placeholder={"Departamento"}
        />
        <DropdownList
          style={{ width: "30%", marginLeft: "4%" }}
          value={city}
          data={cities}
          onChange={(value) => setCity(value)}
          placeholder={"Ciudad"}
        />
      </div>

      <div className="text-register" style={{ display: !register && "none" }}>
        DIRECCIÓN:
      </div>
      <input
        className="user-input-login reg text-left margin-address"
        type="text"
        id="direccion"
        placeholder="Ej: Cra 10 #20-30, Conjunto Granada - Torre 1 Apt 203"
        style={{ display: !register && "none" }}
        onChange={(e) => setAddress(e.target.value)}
        value={address}
      ></input>
      <div
        style={{
          display: !register ? "none" : "flex",
          marginTop: "10px",
          flexDirection: "column",
        }}
        className="user-input-login-checkbox"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: 10,
          }}
        >
          <input
            type="checkbox"
            checked={acceptPrivacy}
            onChange={(e) => setAcceptPrivacy(e.target.checked)}
          ></input>
          <div style={{ marginLeft: "10px", marginRight: "10px" }}>
            Acepto
            <a
              href="https://admin.housekeeper365.co/POLITICA_TRATAMIENTO_DE_DATOS.pdf" 
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="span-register">aviso de privacidad</span>
            </a>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: 10,
          }}
        >
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
          ></input>
          <div style={{ marginLeft: "10px", marginRight: "10px"}}>
            Acepto
            <a 
              href="https://admin.housekeeper365.co/TERMINOS_Y_CONDICIONES_DE_USO.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="span-register">Términos y condiciones</span>
            </a>
          </div>
        </div>
      </div>
      {/* Buttons */}
      <div className="login-btns">
        <button className="login-btn-register" onClick={() => handleRegister()}>
          REGISTRAR
        </button>
        {register ? (
          <button
            className="login-btn-signin"
            onClick={() => setRegister(false)}
          >
            CANCELAR
          </button>
        ) : (
          <button
            className="login-btn-signin"
            onClick={() => handleLogin(userLogin, pwLogin)}
          >
            INGRESAR
          </button>
        )}
      </div>
      {/* PW Recovery */}
      <div className="text-pw-recovery" style={{ display: register && "none" }}>
        Si tienes problemas para ingresar,
      </div>
      <div
        className="text-pw-recovery2"
        style={{ display: register && "none" }}
      >
        dale{" "}
        <span onClick={() => props.history.push("/forgotpw")}>click aquí.</span>
      </div>
    </div>
  );
};

export default withRouter(LoginBox);
