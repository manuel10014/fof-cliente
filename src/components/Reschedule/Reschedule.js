import React, { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import ServiceContainer from "../ServiceContainer/ServiceContainer";
import DatePicker from "react-datepicker";
import { ScheduleAlgoPrep } from "../Schedule/ScheduleAlgo";
import CustomToast from "../custom-toast";
import { toast } from "react-toastify";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import "./Reschedule.css";
import { TUNNEL } from "../../assets/constants/url";

const Reschedule = (props) => {
  const [reprogrammableServices, setReprogrammableServices] = useState([]);
  const [currentSelectedService, setCurrentSelectedService] = useState(null);
  const [newServiceDate, setNewServiceDate] = useState(new Date());
  const [clientBusySchedule, setClientBusySchedule] = useState(null);
  const [specificServiceInfo, setSpecificServiceInfo] = useState(null);
  const [possibleSchedules, setPossibleSchedules] = useState([]);
  const [maidsData, setMaidsData] = useState(null);
  const [selectedOption, setSelectedOption] = useState([]);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(-1);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  const userInfo = useSelector((state) => state.auth.allUserInfo); // Toda la información de la DB del usuario
  const [stateCounter, setStateCounter] = useState(0);

  useEffect(() => {
    if (stateCounter > 0) {
      if (Object.entries(userInfo).length === 0) {
        props.history.push("/");
      }
    }
    setStateCounter(stateCounter + 1);
  }, [userInfo]);

  const toDateTime = (secs) => {
    var t = new Date(1969, 11, 31, 19); // Epoch
    t.setSeconds(secs);
    return t;
  };

  const formatDayFunction = (d) => {
    const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
    const mo = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
    const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);
    return `${da} de ${mo} de ${ye}`;
  };

  const formatDates = (service) => {
    const indexParenthesisStart = service.formatStartDate.indexOf("(");
    const hourStart = service.formatStartDate.substring(
      indexParenthesisStart - 19,
      indexParenthesisStart - 10
    );
    const indexParenthesisEnd = service.formatEndDate.indexOf("(");
    return [
      hourStart,
      service.formatEndDate.substring(
        indexParenthesisEnd - 19,
        indexParenthesisEnd - 10
      ),
    ];
  };

  const getMaidsBySelectedServiceCity = async () => {
    const config = {
      params: {
        city: currentSelectedService.cityService,
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
      setMaidsData(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSelectedOption = (option, index) => {
    setSelectedOption(option);
    setSelectedOptionIdx(index);
  };

  const rescheduleService = async () => {
    const reschedulingInfo = {
      previousService: currentSelectedService,
      newMaidID: selectedOption[4],
      startDate: selectedDateTime + 3600 * selectedOption[0],
      endDate: selectedDateTime + 3600 * selectedOption[1],
      bookedDate: new Date().getTime() / 1000,
    };
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify(reschedulingInfo);
      const res = await axios.post(
        `${TUNNEL}/api/services/reschedule`,
        body,
        config
      );
      toast(<CustomToast title={"¡Se reprogramó el servicio!"} />);
      props.history.push("/signedin");
    } catch (err) {
      toast(<CustomToast title={err.response.data} />);
    }
  };
  useEffect(() => {
    if (props.location.state) {
      setReprogrammableServices(props.location.state.services);
      setClientBusySchedule(props.location.state.clientBusySchedule);
    }
  }, []);

  useEffect(() => {
    if (currentSelectedService) {
      getMaidsBySelectedServiceCity();
      setSpecificServiceInfo(currentSelectedService.serviceTypeInfo);
    }
  }, [currentSelectedService]);

  useEffect(() => {
    console.log(possibleSchedules);
  }, [possibleSchedules]);

  useEffect(() => {
    if (newServiceDate !== new Date() && currentSelectedService) {
      const month = newServiceDate.getMonth();
      const year = newServiceDate.getFullYear();
      const day = newServiceDate.getDate();
      const selectedDateTimeVar = new Date(year, month, day).getTime() / 1000;
      setSelectedDateTime(selectedDateTimeVar);
      setSelectedOption([]);
      setSelectedOptionIdx(-1);
      setPossibleSchedules(
        ScheduleAlgoPrep(
          maidsData,
          specificServiceInfo,
          selectedDateTimeVar,
          clientBusySchedule,
          false,
          -1
        )
      );
    }
  }, [newServiceDate]);

  return (
    <div className="service-viewer-container">
      <div className="service-viewer-title-main">SERVICIOS</div>
      <div className="reschedule-title">
        {currentSelectedService
          ? "Servicio a reprogramar "
          : "Escoja servicio para reprogramar."}
      </div>
      <div
        className="service-viewer-all-services"
        style={{ height: currentSelectedService && "10vh" }}
      >
        {reprogrammableServices.length > 0 ? (
          !currentSelectedService ? (
            reprogrammableServices.map((service, index) => {
              let startHour = formatDates(service)[0];
              let endHour = formatDates(service)[1];
              return (
                <ServiceContainer
                  key={index}
                  wasSelected={false}
                  index={index}
                  service={service}
                  setCurrentSelectedService={setCurrentSelectedService}
                  formatDayFunction={formatDayFunction}
                  startHour={startHour}
                  endHour={endHour}
                />
              );
            })
          ) : (
            reprogrammableServices
              .filter((service) => service._id === currentSelectedService._id)
              .map((service, index) => {
                let startHour = formatDates(service)[0];
                let endHour = formatDates(service)[1];
                return (
                  <ServiceContainer
                    key={index}
                    wasSelected={true}
                    index={index}
                    service={service}
                    setCurrentSelectedService={setCurrentSelectedService}
                    formatDayFunction={formatDayFunction}
                    startHour={startHour}
                    endHour={endHour}
                  />
                );
              })
          )
        ) : (
          <div style={{ display: "flex", alignSelf: "center" }}>
            {" "}
            No hay servicios para reprogramar.{" "}
          </div>
        )}
      </div>
      {currentSelectedService && (
        <div className="reschedule-selected-main-div">
          <div>Fecha para reprogramar: </div>
          <div className="margin-reschedule">
            <DatePicker
              selected={newServiceDate}
              onChange={(date) => setNewServiceDate(date)}
            />
          </div>
        </div>
      )}
      {possibleSchedules.length > 0 && (
        <div
          style={{ alignSelf: "center", display: "flex", marginTop: "30px" }}
        >
          Posibles opciones:{" "}
        </div>
      )}
      <div className="reschedule-possible-options-container">
        {possibleSchedules.length > 0 &&
          possibleSchedules.map((schedule, index) => {
            // No se puede agendar 1 día antes...
            if (toDateTime(schedule[5] - 3600 * 24) > new Date()) {
              return (
                <div
                  className="option-maid-schedule"
                  style={{
                    color: selectedOptionIdx === index ? "red" : undefined,
                    textAlign: "center",
                  }}
                  key={index}
                  onClick={() => handleSelectedOption(schedule, index)}
                >
                  <span
                    className={
                      selectedOptionIdx !== index ? "light-green" : undefined
                    }
                  >
                    Hora inicial:
                  </span>{" "}
                  {schedule[0]},
                  <span
                    className={
                      selectedOptionIdx !== index ? "light-green" : undefined
                    }
                  >
                    {" "}
                    Hora Final:
                  </span>{" "}
                  {schedule[1]},
                  <span
                    className={
                      selectedOptionIdx !== index ? "light-green" : undefined
                    }
                  >
                    {" "}
                    Fecha:
                  </span>{" "}
                  {schedule[3]},{" "}
                  <span
                    className={
                      selectedOptionIdx !== index ? "light-green" : undefined
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

      {selectedOption.length > 0 && (
        <input
          name=""
          type="submit"
          style={{ marginTop: "30px" }}
          className="book-button"
          value="REAGENDAR"
          onClick={() => rescheduleService()}
        />
      )}
    </div>
  );
};

export default withRouter(Reschedule);
