import React, { useEffect, useState } from "react";
import { TUNNEL } from "../../assets/constants/url";
import { useLocation, useHistory } from "react-router-dom";
import { userLoaded } from "../../actions/index";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { timeConverter } from "../../functionsFormat/Functions";
import "./EpaycoResponse.css";

const EpaycoResponse = () => {
  const location = useLocation();
  const [paymentInfo, setPaymentInfo] = useState({});
  const token = useSelector((state) => state.auth.token);
  let history = useHistory();
  const dispatch = useDispatch();

  const formatterPeso = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });

  const getPaymentDetails = async () => {
    const config = {
      headers: {
        "content-type": "application/json",
      },
    };
    const epaycoid = location.search.substring(11, location.search.length);
    const res = await axios.get(
      `https://secure.epayco.co/validation/v1/reference/${epaycoid}`
    );
    setPaymentInfo(res.data.data);
    console.log(res.data.data);
    if (res.data.data.x_extra13) {
      if (res.data.data.x_respuesta === "Aceptada") {
        const config = {
          params: {
            userID: res.data.data.x_extra2,
          },
          headers: {
            "content-type": "application/json",
          },
        };
        try {
          const response = await axios.get(
            `${TUNNEL}/api/payment/save-schedule`,
            config
          );
          res.data.data.possibleSchedules =
            response.data.userSchedule.possibleSchedules;
          console.log(res.data);
          console.log(response.data);
          await axios.post(`${TUNNEL}/api/payment/recurrent`, res.data, config);
        } catch (e) {
          console.log(e.response.data);
        }
      }
    } else {
      await axios.post(`${TUNNEL}/api/payment`, res.data, config);
    }
  };

  useEffect(() => {
    getPaymentDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      history.push("/signedin");
    } catch (e) {
      dispatch(userLoaded({}));
    }
  };

  return (
    <div className="total-container">
      <div className="title-summary-service" style={{ marginTop: "40px" }}>
        Detalles de la transacción
      </div>
      <div className="table-container">
        <table className="table-payment-response">
          <tbody>
            <tr>
              <td>Referencia </td>
              <td id="referencia">{paymentInfo.x_transaction_id}</td>
            </tr>
            <tr>
              <td>Fecha</td>
              <td id="fecha">
                {paymentInfo.x_fecha_transaccion &&
                  paymentInfo.x_fecha_transaccion.substring(
                    0,
                    paymentInfo.x_fecha_transaccion.indexOf(":") - 2
                  ) +
                    timeConverter(
                      paymentInfo.x_fecha_transaccion.substring(
                        paymentInfo.x_fecha_transaccion.indexOf(":") - 2,
                        paymentInfo.x_fecha_transaccion.length
                      )
                    )}
              </td>
            </tr>
            <tr>
              <td>Respuesta</td>
              <td id="respuesta">{paymentInfo.x_transaction_state} </td>
            </tr>
            <tr>
              <td> Motivo </td>
              <td id="motivo">{paymentInfo.x_response_reason_text} </td>
            </tr>
            <tr>
              <td> Banco </td>
              <td id="banco">{paymentInfo.x_bank_name} </td>
            </tr>
            <tr>
              <td> Recibo </td>
              <td id="recibo">{paymentInfo.x_id_factura} </td>
            </tr>
            <tr>
              <td> Total </td>
              <td id="total">
                {formatterPeso.format(paymentInfo.x_amount)} COP
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <button className="paymentButton" onClick={getUserInfo}>
        Finalizar
      </button>
    </div>
  );
};

export default EpaycoResponse;
