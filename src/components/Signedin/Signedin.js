import React, { useEffect, useState } from "react";
import "./Signedin.css";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";
import AgendaIcon from "../../assets/images/IconoAgendar.png";
import ModifiedIcon from "../../assets/images/IconoModificar.png";
import HistoricIcon from "../../assets/images/IconoHistorial.png";
import History from "../History/History";
import { userLoaded, authError } from "../../actions/index";
import setAuthToken from "../../utils/setAuthToken";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Chat from "../Chat/Chat";
import ActivityList from "../ActivityList/ActivityList";
import Schedule from "../Schedule/Schedule";
//import CustomToast from "../custom-toast";
//import { toast } from "react-toastify";
import Pusher from "pusher-js";
import { TUNNEL } from "../../assets/constants/url";

moment.locale("es");
const localizer = momentLocalizer(moment);

const SignedIn = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [selectedCalendarDate, setSelectedCalendarDate] = useState("");
  const [selectedDateTime, setSelectedDateTime] = useState(0);
  const [hasService, setHasService] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const [allUserServices, setAllUserServices] = useState([]);
  const [userServiceEvents, setUserServiceEvents] = useState([]);
  const [currentSelectedEvent, setCurrentSelectedEvent] = useState([]);
  const [isHistory, setIsHistory] = useState(false);

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
  // eslint-disable-next-line no-unused-vars

  const formatDayFunction = (d) => {
    const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
    const mo = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
    const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);
    return `${da} de ${mo} de ${ye}`;
  };

  const toDateTime = (secs) => {
    var t = new Date(1969, 11, 31, 19); // Epoch
    t.setSeconds(secs);
    return t;
  };

  const handleSelectedDate = (e) => {
    const formatDate = formatDayFunction(e);
    setSelectedCalendarDate(formatDate);
    setSelectedDateTime(e.getTime() / 1000);
    setIsScheduling(false);
  };

  const getAllUserServices = async () => {
    const config = {
      params: {
        userid: userInfo._id,
      },
      headers: {
        "content-type": "application/json",
      },
    };
    try {
      const res = await axios.get(
        `${TUNNEL}/api/services/all-services/user`,
        config
      );
      setAllUserServices(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const pusher = new Pusher("0fe647d7c6dd95bb7af7", {
      cluster: "us2",
    });
    if (allUserServices.length > 0) {
      let events = allUserServices.map((service) => {
        let transformedStartDate = toDateTime(service.startDate);
        let transformedEndDate = toDateTime(service.endDate);

        return {
          start: transformedStartDate,
          end: transformedEndDate,
          state: service.state,
          title: service.nameService,
          isActive: service.active,
          eventID: service._id,
        };
      });
      setUserServiceEvents(events);
    }

    const channelUserServices = pusher.subscribe("new-service-user");
    channelUserServices.bind("inserted", (data) => {
      if (data.service.client === userInfo._id) {
        setAllUserServices((prevServices) => {
          return [...prevServices, data.service];
        });
      }
    });

    const channelUserChat = pusher.subscribe("new-message");
    channelUserChat.bind("updated", (data) => {
      if (data.newChat) {
        let serviceBeingModified = allUserServices.filter(
          (ele) => ele._id === data.serviceID
        );
        serviceBeingModified[0].chat = data.newChat;
        if (serviceBeingModified.length > 0) {
          let allServicesButModified = allUserServices.filter(
            (ele) => ele._id !== data.serviceID
          );
          allServicesButModified.push(serviceBeingModified[0]);
          setAllUserServices(allServicesButModified);
        }
      }
    });

    const channelActivitiesServices = pusher.subscribe("activity-modified");
    channelActivitiesServices.bind("updated", (data) => {
      if (data.modifiedActivities) {
        let serviceBeingModified = allUserServices.filter(
          (ele) => ele._id === data.serviceID
        );
        serviceBeingModified[0].activitiesDone = data.modifiedActivities;
        if (serviceBeingModified.length > 0) {
          let allServicesButModified = allUserServices.filter(
            (ele) => ele._id !== data.serviceID
          );
          allServicesButModified.push(serviceBeingModified[0]);
          setAllUserServices(allServicesButModified);
        }
      }
    });

    return () => {
      channelUserServices.unbind_all();
      channelUserServices.unsubscribe();
      channelUserChat.unbind_all();
      channelUserChat.unsubscribe();
      channelActivitiesServices.unbind_all();
      channelActivitiesServices.unsubscribe();
    };
  }, [allUserServices]);

  useEffect(() => {
    const d = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );
    const formatDate = formatDayFunction(d);
    setSelectedCalendarDate(formatDate);
    setSelectedDateTime(d.getTime() / 1000);
  }, []);

  useEffect(() => {
    if (Object.entries(userInfo).length > 0) {
      getAllUserServices();
    }
  }, [userInfo]);

  const manageScheduling = () => {
    setIsScheduling(true);
    setIsHistory(false);
  };

  const manageHistory = () => {
    setIsHistory(true);
    setIsScheduling(false);
    setHasService(false);
  };
  const handleEventSelectedHistory = (e) => {
    let currentEvent = allUserServices.filter(
      (service) => service._id === e._id
    );
    const formatDate = formatDayFunction(new Date(e.formatStartDate));
    setSelectedCalendarDate(formatDate);
    setCurrentSelectedEvent(currentEvent);
    setIsScheduling(false);
    setIsHistory(false);
  };
  const handleEventSelected = (e) => {
    let currentEvent = allUserServices.filter(
      (service) => service._id === e.eventID
    );
    const formatDate = formatDayFunction(e.start);
    setSelectedCalendarDate(formatDate);
    setCurrentSelectedEvent(currentEvent);
    setIsScheduling(false);
    setIsHistory(false);
  };

  useEffect(() => {
    if (currentSelectedEvent.length > 0) {
      setHasService(true);
    }
  }, [currentSelectedEvent]);

  return (
    <div className="signedInContainer">
      <div className="calendarContainer">
        <div className="bckg1"></div>
        <div className="title-signedin">Mis Servicios</div>

        <div className="calendar">
          <Calendar
            localizer={localizer}
            events={userServiceEvents}
            step={60}
            startAccessor="start"
            endAccessor="end"
            messages={{
              next: "sig",
              previous: "ant",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
            }}
            //view={"month"}
            eventPropGetter={(event, start, end, isSelected) => {
              let newStyle = {
                backgroundColor: "red",
                color: "black",
                borderRadius: "0px",
                borderRight: "1px solid black",
                borderLeft: "1px solid black",
                borderTop: "1px solid black",
              };

              if (event.state === "activo") {
                newStyle.backgroundColor = "green";
              }
              if (event.state === "finalizado") {
                newStyle.backgroundColor = "red";
              }
              if (event.state === "programado") {
                newStyle.backgroundColor = "yellow";
              }
              return {
                className: "",
                style: newStyle,
              };
            }}
            onSelectSlot={(e) => console.log(e, "slot")}
            onSelectEvent={(e) => handleEventSelected(e)}
            onNavigate={(e) => handleSelectedDate(e)}
            onView={(e) => {
              if (e === "day") {
                setHasService(false);
                setIsHistory(false);
              }
            }}
          />
        </div>
        <div className="calendar-indicator-container">
          {/* <div>Realizado</div>
          <div>Programado</div> */}
        </div>
        <div className="btn-container-signedin">
          <div className="AgendaIcon-btn">
            <img
              id="AgendaIcon"
              src={AgendaIcon}
              alt=""
              onClick={() => manageScheduling()}
            />
            <p>Agendar</p>
          </div>

          <div className="HistoricIcon-btn">
            <img
              id="HistoricIcon"
              src={HistoricIcon}
              alt=""
              onClick={() => {
                manageHistory();
              }}
            />
            <p>Historial</p>
          </div>
          <div className="RescheduleIcon-btn">
            <img
              id="RescheduleIcon"
              src={AgendaIcon}
              alt=""
              onClick={() =>
                props.history.push({
                  pathname: "/reschedule",
                  state: {
                    services: allUserServices.filter(
                      (serviceInfo) =>
                        new Date() <
                        toDateTime(serviceInfo.startDate - 3600 * 24)
                    ),
                    clientBusySchedule: userInfo.busySchedule,
                  },
                })
              }
            />
            <p>Reagendar</p>
          </div>
        </div>
      </div>

      <div className="right-container-signedin">
        <div className="date-title-signedin">{selectedCalendarDate}</div>
        {!isScheduling ? (
          hasService ? (
            <div className="chat-and-activity-container">
              <Chat
                profileMaid={AgendaIcon}
                chat={currentSelectedEvent[0].chat}
                serviceAddress={currentSelectedEvent[0].serviceAddress}
                userInfo={userInfo}
                chatEnabled={
                  currentSelectedEvent[0].state === "activo" ? true : false
                }
                employeeID={currentSelectedEvent[0].employee}
                serviceID={currentSelectedEvent[0]._id}
                serviceName={currentSelectedEvent[0].nameService}
                formatStartDate={currentSelectedEvent[0].formatStartDate.toString()}
                formatEndDate={currentSelectedEvent[0].formatEndDate.toString()}
                serviceRating={currentSelectedEvent[0].rating}
                serviceState={currentSelectedEvent[0].state}
                comments={currentSelectedEvent[0].comments}
              />
              <ActivityList
                eventStillToCome={
                  currentSelectedEvent[0].state === "programado" ? true : false
                }
                allActivities={currentSelectedEvent[0].activitiesDone}
                serviceID={currentSelectedEvent[0]._id}
              />
            </div>
          ) : (
            <div
              className="no-service-date"
              style={{ display: isHistory && "none" }}
            >
              Seleccione servicio específico en el calendario.{" "}
            </div>
          )
        ) : (
          <Schedule userInfo={userInfo} selectedDateTime={selectedDateTime} />
        )}
        {isHistory && (
          <History
            allUserServices={allUserServices}
            setIsHistory={setIsHistory}
            handleEventSelectedHistory={handleEventSelectedHistory}
          />
        )}
      </div>
    </div>
  );
};

export default SignedIn;
