import React, { useState, useEffect } from "react";
import { DropdownList } from "react-widgets";
import axios from "axios";
import { ScheduleAlgoPrep } from "./ScheduleAlgo";
import "./Schedule.css";
import CustomToast from "../custom-toast";
import { toast } from "react-toastify";
import { bookServiceInfo } from "../../actions/index";
import Pusher from "pusher-js";
import { useDispatch, useSelector } from "react-redux";
import { withRouter } from "react-router-dom";
import { RRule, RRuleSet, rrulestr } from "rrule";
import DatePicker from "react-datepicker";
import TimePicker from "rc-time-picker";
import "react-datepicker/dist/react-datepicker-cssmodules.css";
import "rc-time-picker/assets/index.css";
import {
  timeConverter,
  miniTimeFunction,
} from "../../functionsFormat/Functions";
import {
  checkRecurrentHour,
  checkRRuleWeekRecurring,
  getAllDatesFromRRule,
} from "./CheckRecurrentHour";
import { TUNNEL } from "../../assets/constants/url";

const Schedule = ({ userInfo, selectedDateTime, ...props }) => {
  const [allServices, setAllServices] = useState([]);
  const [serviceNames, setServiceNames] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [specificServiceInfo, setSpecificServiceInfo] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [address, setAddress] = useState("");
  const [selectedOption, setSelectedOption] = useState([]);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(-1);
  const [employeeByCity, setEmployeeByCity] = useState([]);

  const [possibleSchedules, setPossibleSchedules] = useState([]);
  const [busySchedule, setBusySchedule] = useState([]);
  const [isRecurrent, setIsRecurrent] = useState(null);
  const [startRecurrentDate, setStartRecurrentDate] = useState(new Date());
  const [endRecurrentDate, setEndRecurrentDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 1))
  );
  const [isStartDateLower, setIsStartDateLower] = useState(true);
  const [recurrentHour, setRecurrentHour] = useState(-1);
  const [recurrentType, setRecurrentType] = useState(null);
  const [rRuleWeekDayArray, setrRuleWeekDayArray] = useState([]);
  const [arrayOfOptionValues, setArrayOfOptionValues] = useState([]);
  const [allReadyRecurrence, setAllReadyRecurrence] = useState(false);
  const [recurrentFrequency, setRecurrentFrequency] = useState(null);
  const [allRecurrenceDays, setAllRecurrenceDays] = useState([]);
  const [showAvailableCities, setShowAvailableCities] = useState(false);
  const [prettyHourToDisplay, setPrettyHourToDisplay] = useState("");
  const [comment, setComment] = useState("");
  const dispatch = useDispatch();
  const servicesInCart = useSelector((state) => state.shoppingCart.cartItems);
  const cartScheduled = servicesInCart.map((service) => {
    return {
      ti: service.startDate,
      tf: service.endDate,
      nombre: service.employeeName,
      id: service.employee,
    };
  });

  function toDateTime(secs) {
    var t = new Date(1969, 11, 31, 19); // Epoch
    t.setSeconds(secs);
    return t;
  }

  const getAllServices = async () => {
    const config = {
      headers: {
        "content-type": "application/json",
      },
    };
    try {
      const res = await axios.get(
        `${TUNNEL}/api/services/all-active-services`,
        config
      );
      setAllServices(res.data);
    } catch (e) {
      console.log(e.response.data);
    }
  };

  const getMaidsByCity = async () => {
    const config = {
      params: {
        city: selectedCity,
      },
      headers: {
        "content-type": "application/json",
      },
    };
    try {
      const res = await axios.get(
        `${TUNNEL}/api/users/employee-by-city`,
        config
      );
      setEmployeeByCity(res.data);
      setPossibleSchedules(
        ScheduleAlgoPrep(
          res.data,
          specificServiceInfo[0],
          isRecurrent ? allRecurrenceDays : selectedDateTime, // have to change this parameter if we want to do recurring dates... (array of all the selected times?)
          busySchedule,
          isRecurrent,
          recurrentHour,
          cartScheduled
        )
      );
    } catch (e) {
      console.log(e);
    }
  };

  const handleSelectedOption = (option, index) => {
    setSelectedOption(option);
    setSelectedOptionIdx(index);
  };

  const formatterPeso = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });

  const handleSelectedRecurrenceOption = (value) => {
    if (value === "Sí") {
      setIsRecurrent(true);
      setSelectedOption([]);
      setPossibleSchedules([]);
      setSelectedCity("");
    } else if (value === "No") {
      setIsRecurrent(false);
      setSelectedOption([]);
      setPossibleSchedules([]);
      setSelectedCity("");
    }
  };

  const handleRecurrenceDates = (value, indicator) => {
    if (indicator === "start") {
      setStartRecurrentDate(value);
    } else if (indicator === "end") {
      setEndRecurrentDate(value);
    }
  };

  useEffect(() => {
    if (endRecurrentDate > startRecurrentDate) {
      setIsStartDateLower(true);
    } else {
      toast(
        <CustomToast title="¡La fecha inicial no puede ser mayor que la final!" />
      );
      setIsStartDateLower(false);
    }
    console.log(endRecurrentDate);
  }, [startRecurrentDate, endRecurrentDate]);

  const handleTimePickerValue = (value) => {
    const selectedHour = value._d.toString();
    let specificHour = selectedHour.substring(
      selectedHour.indexOf(":") - 2,
      selectedHour.indexOf(":")
    );
    setPrettyHourToDisplay(specificHour);

    let hourSatisfiesRestrictions = checkRecurrentHour(
      parseInt(specificHour),
      specificServiceInfo[0].timeRestrictions,
      specificServiceInfo[0].durationHours
    );
    if (hourSatisfiesRestrictions) {
      setRecurrentHour(parseInt(specificHour));
    } else {
      toast(
        <CustomToast title="¡La hora debe cumplir con las restricciones del servicio!" />
      );
      setRecurrentHour(-1);
    }
  };

  const bookService = async () => {
    const day = new Date(selectedDateTime * 1000).getDay();
    const dayPrueba = new Date(selectedDateTime * 1000)
      .toISOString()
      .substr(0, 10);
    const festivos = [
      "2021-05-17",
      "2021-06-07",
      "2021-06-14",
      "2021-07-05",
      "2021-07-20",
      "2021-08-07",
      "2021-08-16",
      "2021-10-18",
      "2021-11-01",
      "2021-11-15",
      "2021-12-08",
      "2021-12-25",
    ];
    if (address.trim() !== "") {
      const service = {
        client: userInfo._id,
        employee: selectedOption[4],
        serviceType: specificServiceInfo[0]._id,
        activitiesDone: [],
        serviceAddress: address,
        cityService: selectedCity,
        chat: [],
        startDate: selectedDateTime + 3600 * selectedOption[0],
        endDate: selectedDateTime + 3600 * selectedOption[1],
        bookedDate: new Date().getTime() / 1000,
        price:
          day === 0 || festivos.indexOf(dayPrueba) !== -1
            ? specificServiceInfo[0].price + specificServiceInfo[0].surcharge
            : specificServiceInfo[0].price,
        employeeName: selectedOption[2],
        nameService: specificServiceInfo[0].name,
        duration: specificServiceInfo[0].durationHours,
        description: specificServiceInfo[0].description,
        isRecurrent: isRecurrent,
        credits: userInfo.credits,
        comment: comment,
      };

      dispatch(bookServiceInfo(service));
      props.history.push("/servicepay", servicesInCart);
    } else {
      toast(<CustomToast title="¡Por favor digita una dirección!" />);
    }
  };

  const bookRecurrentService = async () => {
    if (address.trim() !== "") {
      const service = {
        client: userInfo._id,
        possibleSchedules: possibleSchedules,
        serviceType: specificServiceInfo[0]._id,
        activitiesDone: [],
        serviceAddress: address,
        cityService: selectedCity,
        chat: [],
        bookedDate: new Date().getTime() / 1000,
        price:
          possibleSchedules.length >= 5
            ? (specificServiceInfo[0].price - specificServiceInfo[0].discount) *
              possibleSchedules.length
            : specificServiceInfo[0].price * possibleSchedules.length,
        nameService: specificServiceInfo[0].name,
        duration: specificServiceInfo[0].durationHours,
        description: specificServiceInfo[0].description,
        isRecurrent: isRecurrent,
        credits: userInfo.credits,
        comment: comment,
      };
      dispatch(bookServiceInfo(service));
      props.history.push("/servicepay");
    } else {
      toast(<CustomToast title="¡Por favor digita una dirección!" />);
    }
  };

  const handleOptionChange = (e) => {
    let value = Array.from(e.target.selectedOptions, (option) => option.value);
    setArrayOfOptionValues(value);
    let RRuleWeekArray = checkRRuleWeekRecurring(value);
    setrRuleWeekDayArray(RRuleWeekArray);
  };

  useEffect(() => {
    getAllServices();
    setBusySchedule(userInfo.busySchedule);
  }, []);

  useEffect(() => {
    const pusher = new Pusher("0fe647d7c6dd95bb7af7", {
      cluster: "us2",
    });

    const channelUserSchedule = pusher.subscribe("schedules-users");
    channelUserSchedule.bind("updated", (data) => {
      if (data.userID === userInfo._id) {
        setBusySchedule(data.newSchedule);
        setPossibleSchedules(
          ScheduleAlgoPrep(
            employeeByCity,
            specificServiceInfo[0],
            isRecurrent ? allRecurrenceDays : selectedDateTime, // have to change this parameter if we want to do recurring dates... (array of all the selected times?)
            data.newSchedule,
            isRecurrent,
            recurrentHour
          )
        );
      }
    });

    return () => {
      channelUserSchedule.unbind_all();
      channelUserSchedule.unsubscribe();
    };
  }, [busySchedule, possibleSchedules]);

  useEffect(() => {
    const pusher = new Pusher("0fe647d7c6dd95bb7af7", {
      cluster: "us2",
    });

    const channelEmployeeSchedule = pusher.subscribe("schedules-employees");
    channelEmployeeSchedule.bind("updated", (data) => {
      // Asegurarse de que la empleada esté en la ciudad que está actualmente seleccionada...

      let isEmployeeFromCity = employeeByCity.filter(
        (obj) => obj._id === data.employeeID
      );

      if (isEmployeeFromCity.length > 0) {
        setEmployeeByCity((previousVal) => {
          let newEmployees = [...previousVal];
          let indexToChange;
          for (let i = 0; i < employeeByCity.length; i++) {
            if (employeeByCity[i]._id === data.employeeID) {
              indexToChange = i;
            }
          }

          newEmployees[indexToChange].busySchedule = data.busySchedule;
          return newEmployees;
        });
      }
    });

    return () => {
      channelEmployeeSchedule.unbind_all();
      channelEmployeeSchedule.unsubscribe();
    };
  }, [employeeByCity]);

  useEffect(() => {
    if (employeeByCity.length > 0) {
      setPossibleSchedules(
        ScheduleAlgoPrep(
          employeeByCity,
          specificServiceInfo[0],
          isRecurrent ? allRecurrenceDays : selectedDateTime, // have to change this parameter if we want to do recurring dates... (array of all the selected times?)
          busySchedule,
          isRecurrent,
          recurrentHour,
          cartScheduled
        )
      );
    }
  }, [employeeByCity]);

  useEffect(() => {
    if (allServices.length !== 0) {
      setServiceNames(allServices.map((ele) => ele.name));
    }
  }, [allServices]);

  useEffect(() => {
    if (selectedService !== "") {
      setSpecificServiceInfo(
        allServices.filter((ele) => ele.name === selectedService)
      );
      setSelectedOption([]);
      setSelectedOptionIdx(-1);
      setPossibleSchedules([]);
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedCity !== "") {
      getMaidsByCity();
      setSelectedOption([]);
      setSelectedOptionIdx(-1);
    }
  }, [selectedCity]);

  useEffect(() => {
    if (recurrentType === "Semanal") {
      setRecurrentFrequency(RRule.WEEKLY);
    } else if (recurrentType === "Mensual") {
      setRecurrentFrequency(RRule.MONTHLY);
    } else if (recurrentType === "Diario") {
      setRecurrentFrequency(RRule.DAILY);
    }
  }, [recurrentType]);

  useEffect(() => {
    if (recurrentHour !== -1 && isStartDateLower && recurrentType !== null) {
      if (recurrentType === "Semanal") {
        if (arrayOfOptionValues.length > 0) {
          setAllReadyRecurrence(true);
          let allDates = getAllDatesFromRRule(
            rRuleWeekDayArray,
            recurrentFrequency,
            startRecurrentDate,
            endRecurrentDate,
            recurrentType,
            recurrentHour
          );
          setAllRecurrenceDays(allDates);
        } else {
          setAllReadyRecurrence(false);
        }
      } else {
        setAllReadyRecurrence(true);
        let allDates = getAllDatesFromRRule(
          rRuleWeekDayArray,
          recurrentFrequency,
          startRecurrentDate,
          endRecurrentDate,
          recurrentType,
          recurrentHour
        );
        setAllRecurrenceDays(allDates);
      }
    } else {
      setAllReadyRecurrence(false);
    }
    setSelectedCity("");
  }, [
    recurrentHour,
    isStartDateLower,
    recurrentType,
    arrayOfOptionValues,
    rRuleWeekDayArray,
    startRecurrentDate,
    endRecurrentDate,
  ]);

  return (
    <div className="scheduling-container">
      <div className="scheduling-title">Menú de Agendamiento</div>
      <div className="choose-service">Escoge tu servicio:</div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <DropdownList
          style={{
            marginTop: "10px",
            width: "30vw",
            textAlign: "right",
            marginRight: "15vw",
          }}
          className="first-dropdown"
          data={serviceNames}
          value={selectedService}
          placeholder={"Servicio"}
          onChange={(value) => {
            setSelectedService(value);
            setSelectedCity("");
          }}
        />
      </div>
      {selectedService !== "" && specificServiceInfo.length > 0 && (
        <div className="specific-service">
          <div className="service-information">
            <div className="white bold italic" style={{ marginBottom: "5px" }}>
              Descripción del servicio:
            </div>
            <div className="white italic" style={{ textAlign: "center" }}>
              {specificServiceInfo[0].description}
            </div>
            <div className="information-service-container">
              <div className="price-service">
                Precio: {formatterPeso.format(specificServiceInfo[0].price)} COP
              </div>
              <div className="white">
                <span className="white bold">Duración:</span>{" "}
                {specificServiceInfo[0].durationHours} horas
              </div>
              <div className="horario-container">
                <span className="white bold">Horarios:</span>
                {specificServiceInfo[0].timeRestrictions.map((ele, index) => (
                  <div
                    key={index}
                    style={{ marginLeft: "5px" }}
                    className="white"
                  >
                    {timeConverter(miniTimeFunction(ele[0]))}-
                    {timeConverter(miniTimeFunction(ele[1]))};
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="italic margin"
            style={{ color: "gray", fontWeight: "bold" }}
          >
            Consulta el listado de ciudades donde puede realizarse este
            servicio,{" "}
            <span
              onClick={() => setShowAvailableCities(true)}
              id="here-div"
              className="italic light-green under"
            >
              aquí.
            </span>
          </div>
          {showAvailableCities && (
            <div className="cities-div">
              <span id="x" onClick={() => setShowAvailableCities(false)}>
                X
              </span>
              {specificServiceInfo[0].citiesAvailable.map((city, index) => (
                <div key={index}>{city} </div>
              ))}
            </div>
          )}
          <div
            className="italic margin"
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                paddingTop: "7px",
              }}
            >
              ¿Desea agendar servicios recurrentes?
            </div>
            <DropdownList
              style={{ marginLeft: "2%", marginTop: "10px", width: "20%" }}
              data={["Sí", "No"]}
              onChange={(value) => handleSelectedRecurrenceOption(value)}
            />
          </div>
          <div className="recurrent-date-container">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: !isRecurrent && "none" }}>
                Fecha de inicio de recurrencia:{" "}
              </div>
              <div
                style={{ display: !isRecurrent && "none" }}
                className="margin"
              >
                <DatePicker
                  selected={startRecurrentDate}
                  onChange={(date) => handleRecurrenceDates(date, "start")}
                  style={{ display: !isRecurrent && "none" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: !isRecurrent && "none" }}>
                Fecha de final de recurrencia:{" "}
              </div>
              <div
                style={{ display: !isRecurrent && "none" }}
                className="margin"
              >
                <DatePicker
                  selected={endRecurrentDate}
                  onChange={(date) => handleRecurrenceDates(date, "end")}
                  style={{ display: !isRecurrent && "none" }}
                />
              </div>
            </div>
          </div>

          <div
            style={{ display: (!isRecurrent || !isStartDateLower) && "none" }}
          >
            Hora del servicio para recurrencia:{" "}
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <TimePicker
              onChange={(value) => handleTimePickerValue(value)}
              showMinute={false}
              showSecond={false}
              allowEmpty={false}
              style={{
                display: (!isRecurrent || !isStartDateLower) && "none",
                width: "10vw",
                marginTop: "10px",
              }}
            />
            {
              <div
                style={{
                  display: !isRecurrent || !isStartDateLower ? "none" : "flex",
                  alignItems: "center",
                  marginLeft: "20px",
                }}
              >
                {" "}
                {timeConverter(miniTimeFunction(prettyHourToDisplay))}{" "}
              </div>
            }
          </div>
          <div
            style={{
              display: (!isRecurrent || recurrentHour === -1) && "none",
              marginTop: "8px",
            }}
          >
            Tipo de Recurrencia:{" "}
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <DropdownList
              style={{
                marginTop: "10px",
                width: "20vw",
                display: (!isRecurrent || recurrentHour === -1) && "none",
              }}
              data={["Diario", "Semanal", "Mensual"]}
              onChange={(value) => setRecurrentType(value)}
            />
          </div>
          {recurrentType && recurrentType === "Semanal" && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                display: (!isRecurrent || recurrentHour === -1) && "none",
              }}
            >
              <div className="margin">
                Deje presionado la tecla CTRL para seleccionar varios días.
              </div>
              <select
                className="margin days-week"
                multiple={true}
                value={arrayOfOptionValues}
                onChange={(e) => handleOptionChange(e)}
              >
                <option value={"Lunes"}>Lunes</option>
                <option value={"Martes"}>Martes</option>
                <option value={"Miercoles"}>Miércoles</option>
                <option value={"Jueves"}>Jueves</option>
                <option value={"Viernes"}>Viernes</option>
                <option value={"Sabado"}>Sábado</option>
                <option value={"Domingo"}>Domingo</option>
              </select>
            </div>
          )}
          <div
            className="margin"
            style={{
              display:
                ((isRecurrent && !allReadyRecurrence) ||
                  isRecurrent === null) &&
                "none",
            }}
          >
            Escoja la ciudad del servicio:
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <DropdownList
              style={{
                marginTop: "10px",
                width: "20vw",
                display:
                  ((isRecurrent && !allReadyRecurrence) ||
                    isRecurrent === null) &&
                  "none",
              }}
              data={specificServiceInfo[0].citiesAvailable}
              value={selectedCity}
              placeholder={"Ciudades Disponibles"}
              onChange={(value) => setSelectedCity(value)}
            />
          </div>
          <div
            style={{ display: (isRecurrent || isRecurrent === null) && "none" }}
            className="margin"
          >
            Posibles opciones (Escoja):
          </div>
          {/* Servicios recurrentes */}
          <div className="possible-schedules-list">
            {possibleSchedules.length > 0 &&
              allRecurrenceDays.length === possibleSchedules.length &&
              isRecurrent &&
              selectedCity !== "" &&
              possibleSchedules.map((schedule, index) => {
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
          {/* Servicios no recurrentes */}
          <div className="possible-schedules-list">
            {possibleSchedules.length > 0 &&
              !isRecurrent &&
              possibleSchedules.map((schedule, index) => {
                // No se puede agendar 1 día antes...
                if (toDateTime(schedule[5] - 3600 * 24) > new Date()) {
                  return (
                    <div
                      className="option-maid-schedule"
                      style={{
                        color: selectedOptionIdx === index ? "red" : undefined,
                      }}
                      key={index}
                      onClick={() => handleSelectedOption(schedule, index)}
                    >
                      <span
                        className={
                          selectedOptionIdx !== index
                            ? "light-green"
                            : undefined
                        }
                      >
                        Hora inicial:
                      </span>{" "}
                      {timeConverter(miniTimeFunction(schedule[0]))},
                      <span
                        className={
                          selectedOptionIdx !== index
                            ? "light-green"
                            : undefined
                        }
                      >
                        {" "}
                        Hora Final:
                      </span>{" "}
                      {timeConverter(miniTimeFunction(schedule[1]))},
                      <span
                        className={
                          selectedOptionIdx !== index
                            ? "light-green"
                            : undefined
                        }
                      >
                        {" "}
                        Fecha:
                      </span>{" "}
                      {schedule[3]},{" "}
                      <span
                        className={
                          selectedOptionIdx !== index
                            ? "light-green"
                            : undefined
                        }
                      >
                        Empleada:
                      </span>{" "}
                      {schedule[2]}{" "}
                    </div>
                  );
                }
              })}
          </div>
          {possibleSchedules.length === 0 &&
            allRecurrenceDays.length === possibleSchedules.length &&
            isRecurrent &&
            selectedCity !== "" && (
              <div> No hay servicios disponibles con estos parámetros. </div>
            )}

          {possibleSchedules.length > 0 &&
            allRecurrenceDays.length === possibleSchedules.length &&
            isRecurrent &&
            selectedCity !== "" && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div> Dirección del servicio: </div>
                <input
                  className="user-input-login reg text-left"
                  type="text"
                  onChange={(e) => setAddress(e.target.value)}
                  value={address}
                ></input>
                <div> Comentarios adicionales: </div>
                <textarea
                  className="user-input-login reg text-left"
                  style={{ height: 75, padding: 10, resize: "none" }}
                  type="text"
                  onChange={(e) => setComment(e.target.value)}
                  value={comment}
                ></textarea>
                <input
                  name=""
                  type="submit"
                  className="book-button"
                  value="Agendar"
                  onClick={() => bookRecurrentService()}
                />
              </div>
            )}
          {selectedOption.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div> Dirección del servicio: </div>
              <input
                className="user-input-login reg text-left"
                type="text"
                onChange={(e) => setAddress(e.target.value)}
                value={address}
              ></input>
              <div> Comentarios adicionales: </div>
              <textarea
                className="user-input-login reg text-left"
                style={{ height: 75, padding: 10, resize: "none" }}
                type="text"
                onChange={(e) => setComment(e.target.value)}
                value={comment}
              ></textarea>
              <input
                name=""
                type="submit"
                className="book-button"
                value="AGENDAR"
                onClick={() => bookService()}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default withRouter(Schedule);
