import React from "react";
import {timeConverter} from "../../functionsFormat/Functions"
import "./ServiceContainer.css";

const ServiceContainer = ({
  wasSelected,
  index,
  service,
  setCurrentSelectedService,
  formatDayFunction,
  startHour,
  endHour,
}) => {
  return (
    <div
      className={
        wasSelected
          ? "service-viewer-service-selected"
          : "service-viewer-service"
      }
      key={index}
      onClick={() => setCurrentSelectedService(service)}
    >
      <div className="service-viewer-service-info">
        <div style={{ marginLeft: "3px" }}>
          {" "}
          <span>Fecha:</span>{" "}
          {formatDayFunction(new Date(service.startDate * 1000))}
        </div>
        <div style={{ marginLeft: "3px" }}>
          {" "}
          <span> Hora:</span> {timeConverter(startHour) + " - " + timeConverter(endHour)}
        </div>

        <div style={{ textTransform: "capitalize", display: "flex" }}>
          <span> Empleada: </span>
          <div className="employee-div">{service.employeeInfo.fullName}</div>
        </div>
      </div>
      <div className="service-viewer-service-green" key={index}>
        <div className="service-viewer-title"> {service.nameService} </div>
      </div>
    </div>
  );
};

export default ServiceContainer;
