import React from 'react';
import './Navbar.css';
import Logo from '../../assets/images/Logo.png'
import * as ROUTES from "../../routes/Routes";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="main__nav">
            <div className="main__logo">
                <Link to={ROUTES.HOME}>
                <img src={Logo} alt="logo"/>
                </Link>
            </div>
            <div className="main__navitems">
                <ul>
                    <li style={{color: "#9fcc3b"}}>Inicio</li>
                    <li>Aseo Hogar</li>
                    <li>Aseo Oficinas</li>
                    <li>Desinfección y Sanitización</li>
                    <li>Preguntas frecuentes</li>
                    <li>
                        <button className="fakebtn">Trabaja con nosotros</button>
                    </li>
                </ul>  
            </div>
        </nav>           
    )
}

export default Navbar;
