import React, { useState, useEffect } from "react";
import "./Services.css";
import { useDispatch, useSelector } from "react-redux";
import CustomToast from "../custom-toast";
import { toast } from "react-toastify";
import axios from "axios";
import { withRouter } from "react-router-dom";
import { userLoaded } from "../../actions/index";
import { timeConverter } from "../../functionsFormat/Functions";
import { TUNNEL } from "../../assets/constants/url";

const Services = (props) => {
  // eslint-disable-next-line no-undef
  let handler = ePayco.checkout.configure({
    key: "2d53da2c1c205fdacaa3f50f5eea04bc",
    test: true,
  });
  const dispatch = useDispatch();
  const [valueToPay, setValueToPay] = useState(0);
  const token = useSelector((state) => state.auth.token);
  const toDateTime = (secs) => {
    let t = new Date(1969, 11, 31, 19); // Epoch
    t.setSeconds(secs);
    return t;
  };

  const getUserInfo = async () => {
    const config = {
      headers: {
        "content-type": "application/json",
        "x-auth-token": token,
      },
    };
    try {
      const res = await axios.get(`${TUNNEL}/api/auth/`, config);
      dispatch(userLoaded(res.data));
      props.history.push("/signedIn");
    } catch (e) {
      dispatch(userLoaded({}));
    }
  };

  const createServiceWithCredits = async () => {
    const config = {
      headers: {
        "content-type": "application/json",
      },
    };
    const paymentInfo = {
      data: {
        x_respuesta: "Aceptada",
        x_extra5: "true",
        x_extra2: serviceInfo.client, //Client ID (client)
        x_extra3: serviceInfo.employee, //employee ID (employee)
        x_extra4: serviceInfo.serviceType, // serviceType ID (serviceType)
        x_extra6: serviceInfo.serviceAddress, // serviceAddress
        x_extra7: serviceInfo.cityService, // cityService
        x_extra9: serviceInfo.startDate, // startDate
        x_extra10: serviceInfo.endDate, // endDate
        x_extra11: serviceInfo.bookedDate, // bookedDate
        x_extra12: serviceInfo.nameService, // nameService
        x_amount: serviceInfo.price,
        x_extra14: serviceInfo.comment,
      },
    };
    const body = JSON.stringify(paymentInfo);
    try {
      await axios.post(`${TUNNEL}/api/payment`, body, config);
      toast(<CustomToast title="¡Servicio creado!" />);
      getUserInfo();
    } catch (err) {
      toast(<CustomToast title="¡Error al crear servicio!" />);
      console.log(err);
    }
  };

  const createRecurrentServicesWithCredits = async (schedules) => {
    const config = {
      headers: {
        "content-type": "application/json",
      },
    };
    const paymentInfo = {
      data: {
        x_respuesta: "Aceptada",
        x_extra5: "true",
        x_extra2: serviceInfo.client, //Client ID (client)
        possibleSchedules: schedules,
        x_extra4: serviceInfo.serviceType, // serviceType ID (serviceType)
        x_extra6: serviceInfo.serviceAddress, // serviceAddress
        x_extra7: serviceInfo.cityService, // cityService
        x_extra11: serviceInfo.bookedDate, // bookedDate
        x_extra12: serviceInfo.nameService, // nameService
        x_amount: serviceInfo.price,
        x_extra14: serviceInfo.comment,
      },
    };
    const body = JSON.stringify(paymentInfo);
    try {
      await axios.post(`${TUNNEL}/api/payment/recurrent`, body, config);
      toast(<CustomToast title="¡Servicios creados!" />);
      getUserInfo();
    } catch (err) {
      toast(<CustomToast title="¡Error al crear servicios!" />);
      console.log(err);
    }
  };

  const formatterPeso = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });

  const handleTransaction = () => {
    if (new Date() < toDateTime(serviceInfo.startDate - 3600 * 24)) {
      if (valueToPay > 0) {
        let data = {
          //Parametros compra (obligatorio)
          name: serviceInfo.nameService,
          description: serviceInfo.description,
          currency: "cop",
          amount: valueToPay.toString(),
          tax_base: "0",
          tax: "0",
          country: "co",
          lang: "es",

          //Onpage="false" - Standard="true"
          external: "false",

          //Atributos opcionales
          extra1: userInfo._id,
          extra2: serviceInfo.client,
          extra3: serviceInfo.employee,
          extra4: serviceInfo.serviceType,
          extra5: "false",
          extra6: serviceInfo.serviceAddress,
          extra7: serviceInfo.cityService,
          extra8: serviceInfo.chat,
          extra9: serviceInfo.startDate,
          extra10: serviceInfo.endDate,
          extra11: serviceInfo.bookedDate,
          extra12: serviceInfo.nameService,
          extra14: serviceInfo.comment,
          confirmation: "http://localhost:3000/response",
          response: "http://localhost:3000/response",

          //Atributos cliente
          name_billing: userInfo.fullName,
          address_billing: serviceInfo.serviceAddress,
          type_doc_billing: userInfo.idType,
          mobilephone_billing: userInfo.fullName,
          number_doc_billing: userInfo.idNumber,
        };
        handler.open(data);
      } else {
        createServiceWithCredits();
      }
    } else {
      toast(
        <CustomToast title="¡No puede agendar un servicio 1 día antes del tiempo estipulado!" />
      );
    }
  };

  const handleRecurrentTransaction = async () => {
    if (
      new Date(new Date().setDate(new Date().getDate() + 1)).getTime() / 1000 <
      serviceInfo.possibleSchedules[0].startDate
    ) {
      const schedules = {
        possibleSchedules: serviceInfo.possibleSchedules,
        clientID: serviceInfo.client,
      };
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        const body = JSON.stringify(schedules);
        // eslint-disable-next-line no-unused-vars
        await axios.post(`${TUNNEL}/api/payment/save-schedule`, body, config);
      } catch (e) {
        console.log(e);
      }
      if (valueToPay > 0) {
        let data = {
          //Parametros compra (obligatorio)
          name: serviceInfo.nameService,
          description: serviceInfo.description,
          currency: "cop",
          amount: valueToPay.toString(),
          tax_base: "0",
          tax: "0",
          country: "co",
          lang: "en",

          //Onpage="false" - Standard="true"
          external: "false",

          //Atributos opcionales
          extra1: userInfo._id,
          extra2: serviceInfo.client,
          extra3: serviceInfo.possibleSchedules,
          extra4: serviceInfo.serviceType,
          extra5: "false",
          extra6: serviceInfo.serviceAddress,
          extra7: serviceInfo.cityService,
          extra8: serviceInfo.chat,
          extra11: serviceInfo.bookedDate,
          extra12: serviceInfo.nameService,
          extra13: serviceInfo.isRecurrent,
          extra14: serviceInfo.comment,
          confirmation: "http://localhost:3000/response",
          response: "http://localhost:3000/response",
          //Atributos cliente
          name_billing: userInfo.fullName,
          address_billing: serviceInfo.serviceAddress,
          type_doc_billing: userInfo.idType,
          mobilephone_billing: userInfo.fullName,
          number_doc_billing: userInfo.idNumber,
        };
        handler.open(data);
      } else {
        createRecurrentServicesWithCredits(schedules.possibleSchedules);
      }
    } else {
      toast(
        <CustomToast title="¡No puede agendar un servicio 1 día antes del tiempo estipulado!" />
      );
    }
  };

  const serviceInfo = useSelector(
    (state) => state.serviceUser.userServiceToPay
  );
  const userInfo = useSelector((state) => state.auth.allUserInfo);

  useEffect(() => {
    if (serviceInfo) {
      if (Object.entries(serviceInfo).length > 0) {
        const currentCredits = serviceInfo.credits;
        const serviceValue = serviceInfo.price;
        if (currentCredits >= serviceValue) {
          setValueToPay(0);
        } else if(currentCredits <= 0){
          setValueToPay(serviceValue)
        } else {
          setValueToPay(serviceValue - currentCredits);
        }
      }
    }
  }, [serviceInfo]);

  return (
    <div className="services-container">
      {!serviceInfo.isRecurrent && Object.entries(serviceInfo).length > 0 && (
        <div className="services-container">
          <div className="title-summary-service">Resumen de Agendamiento</div>
          <div className="table-container2">
            <table className="tableStats">
              <tr>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Nombre Servicio</th>
                <th>Duración (Horas)</th>
                <th>Ciudad</th>
                <th>Dirección</th>
                <th>Empleada</th>
                <th>Precio (COP)</th>
                <th>Créditos Disponibles (COP)</th>
                <th>Precio Final (COP)</th>
              </tr>
              <tr key={1}>
                <td>
                  {" "}
                  {toDateTime(serviceInfo.startDate)
                    .toString()
                    .substring(
                      4,
                      toDateTime(serviceInfo.startDate)
                        .toString()
                        .indexOf("G") - 9
                    ) +
                    timeConverter(
                      toDateTime(serviceInfo.startDate)
                        .toString()
                        .substring(
                          toDateTime(serviceInfo.startDate)
                            .toString()
                            .indexOf("G"),
                          toDateTime(serviceInfo.startDate)
                            .toString()
                            .indexOf("G") - 9
                        )
                    )}
                </td>
                <td>
                  {toDateTime(serviceInfo.endDate)
                    .toString()
                    .substring(
                      4,
                      toDateTime(serviceInfo.endDate).toString().indexOf("G") -
                        9
                    ) +
                    timeConverter(
                      toDateTime(serviceInfo.endDate)
                        .toString()
                        .substring(
                          toDateTime(serviceInfo.endDate)
                            .toString()
                            .indexOf("G"),
                          toDateTime(serviceInfo.endDate)
                            .toString()
                            .indexOf("G") - 9
                        )
                    )}
                </td>
                <td>{serviceInfo.nameService}</td>
                <td>{serviceInfo.duration}</td>
                <td>{serviceInfo.cityService}</td>
                <td>{serviceInfo.serviceAddress}</td>
                <td>{serviceInfo.employeeName}</td>
                <td>{formatterPeso.format(serviceInfo.price)}</td>
                <td>{formatterPeso.format(userInfo.credits)}</td>
                <td>{formatterPeso.format(valueToPay)}</td>
              </tr>
            </table>
          </div>
          <div>
            <button className="paymentButton" onClick={handleTransaction}>
              Pagar
            </button>{" "}
          </div>
        </div>
      )}
      {serviceInfo.isRecurrent && Object.entries(serviceInfo).length > 0 && (
        <div className="services-container">
          <div className="title-summary-service">Resumen de Agendamiento</div>
          <div className="table-container2">
            <table className="tableStats">
              <tr>
                <th>Nombre Servicio</th>
                <th>Duración (Horas)</th>
                <th>Ciudad</th>
                <th>Dirección</th>
                <th>Precio (COP)</th>
                <th>Créditos Disponibles (COP)</th>
                <th>Precio Final (COP)</th>
              </tr>
              <tr key={1}>
                <td>{serviceInfo.nameService}</td>
                <td>{serviceInfo.duration}</td>
                <td>{serviceInfo.cityService}</td>
                <td>{serviceInfo.serviceAddress}</td>
                <td>{formatterPeso.format(serviceInfo.price)}</td>
                <td>{formatterPeso.format(userInfo.credits)}</td>
                <td>{formatterPeso.format(valueToPay)}</td>
              </tr>
            </table>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#114a9fb3",
              marginTop: "40px",
            }}
          >
            {serviceInfo.possibleSchedules.map((schedule, index) => {
              return (
                <div key={index} className="option-maid-schedule">
                  <span className="light-green">Fecha Inicial:</span>{" "}
                  {schedule.startDateFormat
                    .toString()
                    .substring(
                      4,
                      schedule.startDateFormat.toString().indexOf("G") - 9
                    ) +
                    timeConverter(
                      schedule.startDateFormat
                        .toString()
                        .substring(
                          schedule.startDateFormat.toString().indexOf("G"),
                          schedule.startDateFormat.toString().indexOf("G") - 9
                        )
                    )}
                  , <span className="light-green">Fecha Final:</span>{" "}
                  {schedule.endDateFormat
                    .toString()
                    .substring(
                      4,
                      schedule.endDateFormat.toString().indexOf("G") - 9
                    ) +
                    timeConverter(
                      schedule.endDateFormat
                        .toString()
                        .substring(
                          schedule.endDateFormat.toString().indexOf("G"),
                          schedule.endDateFormat.toString().indexOf("G") - 9
                        )
                    )}
                  , <span className="light-green"> Nombre Empleada:</span>{" "}
                  {schedule.employeeName}
                </div>
              );
            })}
          </div>
          <button
            className="paymentButton"
            onClick={handleRecurrentTransaction}
          >
            Pagar
          </button>{" "}
        </div>
      )}
    </div>
  );
};

export default withRouter(Services);
