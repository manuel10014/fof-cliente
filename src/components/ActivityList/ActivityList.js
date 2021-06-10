import React, { useState, useEffect } from "react";
import "./ActivityList.css";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { timeConverter } from "../../functionsFormat/Functions";
import { TUNNEL } from "../../assets/constants/url";

const ActivityList = ({
  eventStillToCome,
  allActivities,
  serviceID,
  ...props
}) => {
  const [currentActivity, setCurrentActivity] = useState(null);

  const seeMore = async (activity) => {
    setCurrentActivity(activity);
  };

  useEffect(() => {
    setCurrentActivity(null);
  }, [serviceID]);

  return (
    <div className="activity-container-signedin">
      <div className="activity-total-title">Lista de actividades</div>
      {/* Cambiar eventStillToCome por !eventStillToCome */}
      {!eventStillToCome ? (
        <div className="all-activites">
          <VerticalTimeline layout={"1-column-left"}>
            {allActivities.length > 0 &&
              allActivities.map((activity, index) => {
                return (
                  <VerticalTimelineElement
                    key={index}
                    className="vertical-timeline-element--work"
                    contentStyle={{
                      backgroundColor: "#114a9fb3",
                      color: "#fff",
                    }}
                    contentArrowStyle={{
                      borderRight: "7px solid   #114a9fb3",
                    }}
                    iconStyle={{
                      backgroundColor: activity.isDone ? "#9fcc3b" : "#fff",
                    }}
                  >
                    <h3 className="vertical-timeline-element-title">
                      {activity.activityName}
                    </h3>
                    <h5 className="vertical-timeline-element-subtitle">
                      {" "}
                      Hora completado:{" "}
                      {activity.isDone
                        ? timeConverter(activity.timeDone)
                        : "En progreso..."}{" "}
                    </h5>
                    <h6
                      className="vertical-timeline-element-subtitle see-more"
                      onClick={() => seeMore(activity)}
                    >
                      Ver más
                    </h6>
                  </VerticalTimelineElement>
                );
              })}
          </VerticalTimeline>
        </div>
      ) : (
        <div className="all-activites no-active-activities">
          Esta sección se habilitará una vez el servicio esté activo.
        </div>
      )}
      {!eventStillToCome && currentActivity && (
        <div className="activity-description">
          <div className="activity-title">{currentActivity.activityName} </div>
          <div className="activity-specific-description">
            <div>
              <span style={{ fontWeight: "bold" }}>
                Descripción de la empleada:
              </span>
              {currentActivity.maidDescription !== ""
                ? currentActivity.maidDescription
                : "La empleada aún no ha descrito la actividad."}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Foto de evidencia: </span>
              {currentActivity.photoLink !== "" ? (
                <a
                  href={`${TUNNEL}/api/files/case-photo/${currentActivity.photoLink}`}
                  target="_blank"
                  className="see-more"
                >
                  Ver Imagen
                </a>
              ) : (
                "La empleada aún no ha subido foto de evidencia."
              )}{" "}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityList;
