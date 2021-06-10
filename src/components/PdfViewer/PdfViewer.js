import React from "react";
import "./PdfViewer.css";
import AvisoDePrivacidad from "../../assets/docs/POLITICA_TRATAMIENTO_DE_DATOS.pdf";
import TerminosYCondiciones from "../../assets/docs/TERMINOS_Y_CONDICIONES_DE_USO.pdf";

const PdfViewer = (props) => {
  console.log(props.location.state.doc);

  return (
    <div className="PdfViewer-container" style={{ height: "100vh" }}>
      <object
        data={
          props.location.state.doc === "privacy"
            ? AvisoDePrivacidad
            : TerminosYCondiciones
        }
        type="application/pdf"
        width="100%"
        height="100%"
        title="document"
      ></object>
    </div>
  );
};

export default PdfViewer;
