import React, { useState, useEffect } from "react";
import StarRatings from "react-star-ratings";
import {timeConverter} from "../../functionsFormat/Functions"
import "./History.css";

const History = ({
  allUserServices,
  setIsHistory,
  handleEventSelectedHistory,
  ...props
}) => {
  const [indexShower, setIndexShower] = useState(3);
  const [showMore, setShowMore] = useState(true);
  const [rating, setRating] = useState(0);

  const handleShowMore = () => {
    const newIndexShower = indexShower + 3;
    if (newIndexShower >= allUserServices.length) {
      setIndexShower(allUserServices.length);
      setShowMore(false);
    } else {
      setIndexShower(newIndexShower);
    }
  };
  useEffect(() => {
    if (allUserServices.length > 3) {
      setShowMore(true);
    } else {
      setShowMore(false);
    }
  }, [allUserServices]);

  useEffect(() => {
    return () => {
      setIsHistory(false);
    };
  }, []);

  let displayAllServices = allUserServices.map((service, index) => {
    return (
      <div key={index} className="specific-service-history">
        <div
          className="history-name"
          onClick={() =>
            handleEventSelectedHistory(allUserServices[index], allUserServices)
          }
        >
          {" "}
          {service.nameService}{" "}
        </div>
        <div className="history-date">
          Fecha:{" "}
          {service.formatStartDate.substring(
            4,
            service.formatStartDate.indexOf("G") - 9
          ) + timeConverter( service.formatStartDate.substring(
            service.formatStartDate.indexOf("G"),
            service.formatStartDate.indexOf("G") - 9
          ))}
        </div>
        {service.rating === 0 ? (
          <div className="history-date" style={{ marginTop: "1px" }}>
            Aún no ha calificado.
          </div>
        ) : (
          <StarRatings
            starHoverColor={"gray"}
            starRatedColor={"#114a9fb3"}
            rating={service.rating}
            starDimension="20px"
            starSpacing="5px"
            disabled={true}
          />
        )}
      </div>
    );
  });

  return (
    <div className="history-services">
      <div className="title-history"> Historial de servicios</div>
      {displayAllServices.slice(0, indexShower)}
      {showMore && (
        <div className="show-more-history" onClick={handleShowMore}>
          Mostrar más{" "}
        </div>
      )}

      {displayAllServices && displayAllServices.length === 0 && (
        <div className="no-history">No posee un historial aún.</div>
      )}
    </div>
  );
};

export default History;
