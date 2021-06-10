export const ScheduleAlgoPrep = (
  APIDataEmployee,
  specificServiceInfo,
  selectedDateTime,
  userSchedule,
  isRecurrent,
  recurrentHour,
) => {
  //const baseDate = [1606280400, 1606366800]; // seconds 25/11/2020 00:00 -5 GMT
  // 25/11/2020 8:00 a.m - 25/11/2020 10 a.m ;  25/11/2020 2p.m - 25/11/2020 3p.m

  // Change this for recurrence
  const serviceRestrictions = specificServiceInfo.timeRestrictions;

  const serviceDuration = specificServiceInfo.durationHours; // hours

  const baseDate = isRecurrent ? selectedDateTime : [selectedDateTime];

  let scheduleEmployee = APIDataEmployee.map((employee) => {
    let fullName =
      employee.firstName +
      " " +
      employee.lastName +
      " " +
      employee.secondLastName;

    if (employee.busySchedule.length === 0) {
      return [{ ti: 0, tf: 0, nombre: fullName, id: employee._id }];
    }
    return employee.busySchedule.map((schedule) => {
      return {
        ti: schedule.ti,
        tf: schedule.tf,
        nombre: fullName,
        id: employee._id,
      };
    });
  });
  // if recurrent
  if (isRecurrent) {
    let getRecurrenceSlotsFromMaids = ScheduleRecurrence(
      baseDate,
      scheduleEmployee,
      serviceDuration,
      recurrentHour
    );
    console.log(baseDate, scheduleEmployee, getRecurrenceSlotsFromMaids);
    let getSlotsConsideringUserRec = slotsConsideringUserRec(
      getRecurrenceSlotsFromMaids,
      userSchedule
    );

    return getSlotsConsideringUserRec;
  } else {
    let getAllPossibleSlots = ScheduleAlgo(
      baseDate,
      scheduleEmployee,
      serviceRestrictions,
      serviceDuration
    );

    let slotsConsideringUser = slotsConsideringUserSchedule(
      getAllPossibleSlots,
      userSchedule
    );

      let formatedTimeSlots = slotsConsideringUser.map((slot) => {
      // Ojo formato desfasado

      let newTimeSlot = formatTime(slot[3]);

      let newTimeSlotDateFormat = formatDayFunction(newTimeSlot);
      let newArray = slot;
      newArray[3] = newTimeSlotDateFormat;
      return newArray;
    });

    // [{horaInicial, horaFinal, nombreEmpleada, FechaModificada,  IDEmpleada}]

    return formatedTimeSlots;
  }

  // if not recurrent
};

// schedule for recurrence
const ScheduleRecurrence = (
  baseDate,
  scheduleEmployee,
  serviceDuration,
  recurrentHour
) => {
  let recurrencePickedByAlgorithm = [];
  for (let m = 0; m < baseDate.length; m++) {
    let possibleSlotsForSpecificDate = [];
    // All maids schedule looping begins here
    for (let k = 0; k < scheduleEmployee.length; k++) {
      let lowerLimit = baseDate[m];
      let upperLimit = baseDate[m] + serviceDuration * 3600;
      let interferes = false;
      //Specific employee schedule begins here
      for (let j = 0; j < scheduleEmployee[k].length; j++) {
        let currentSchedule = scheduleEmployee[k][j];
        let lowerLimit2 = currentSchedule.ti;
        let upperLimit2 = currentSchedule.tf;

        if (
          upperLimit2 < baseDate[m] + (24 - recurrentHour) * 3600 &&
          lowerLimit2 > baseDate[m] - 3600 * recurrentHour
        ) {
          if (
            (lowerLimit >= lowerLimit2 && lowerLimit < upperLimit2) ||
            (upperLimit > lowerLimit2 && upperLimit < upperLimit2)
          ) {
            interferes = true;
          }
        }
      }
      //Specific employee schedule ends here
      if (!interferes) {
        possibleSlotsForSpecificDate.push({
          startDate: lowerLimit,
          endDate: upperLimit,
          employeeName: scheduleEmployee[k][0].nombre,
          employeeID: scheduleEmployee[k][0].id,
          startDateFormat: formatTime(lowerLimit),
          endDateFormat: formatTime(upperLimit),
        });
      }
    }
    // All maids schedule looping ends here
    if (possibleSlotsForSpecificDate.length > 0) {
      let randomOption = pickRandomMaidForSpecificDate(
        possibleSlotsForSpecificDate
      );
      recurrencePickedByAlgorithm.push(randomOption);
    }
  }
  return recurrencePickedByAlgorithm;
};

const pickRandomMaidForSpecificDate = (possibleSlotsForSpecificDate) => {
  const randomIndex = Math.floor(
    Math.random() * possibleSlotsForSpecificDate.length
  );
  return possibleSlotsForSpecificDate[randomIndex];
};

const slotsConsideringUserRec = (slots, userSchedule) => {
  let slotsConsideringUser = [];
  console.log(slots);
  for (let i = 0; i < slots.length; i++) {
    let lowerLimitOfSlot = slots[i].startDate;
    let upperLimitOfSlot = slots[i].endDate;
    let interferes = false;
    for (let j = 0; j < userSchedule.length; j++) {
      let currentUserSchedule = userSchedule[j];
      let lowerLimit = currentUserSchedule.ti;
      let upperLimit = currentUserSchedule.tf;
      if (
        (lowerLimitOfSlot >= lowerLimit && lowerLimitOfSlot < upperLimit) ||
        (upperLimitOfSlot > lowerLimit && upperLimitOfSlot < upperLimit)
      ) {
        interferes = true;
      }
    }
    if (!interferes) {
      slotsConsideringUser.push(slots[i]);
    }
  }
  return slotsConsideringUser;
};

// Schedule for normal type of services (non-recurrence)

const slotsConsideringUserSchedule = (slots, userSchedule) => {
  let slotsConsideringUser = [];

  for (let i = 0; i < slots.length; i++) {
    let lowerLimitOfSlot = slots[i][3] + slots[i][0] * 3600;
    let upperLimitOfSlot = slots[i][3] + slots[i][1] * 3600;
    let interferes = false;
    for (let j = 0; j < userSchedule.length; j++) {
      let currentUserSchedule = userSchedule[j];
      let lowerLimit = currentUserSchedule.ti;
      let upperLimit = currentUserSchedule.tf;

      if (
        (lowerLimitOfSlot >= lowerLimit && lowerLimitOfSlot < upperLimit) ||
        (upperLimitOfSlot > lowerLimit && upperLimitOfSlot < upperLimit)
      ) {
        interferes = true;
      }
    }
    if (!interferes) {
      slotsConsideringUser.push(slots[i]);
    }
  }
  return slotsConsideringUser;
};

const ScheduleAlgo = (
  baseDate,
  scheduleEmployee,
  serviceRestrictions,
  serviceDuration
) => {
  let possibleSlots = [];
  for (let m = 0; m < baseDate.length; m++) {
    for (let k = 0; k < scheduleEmployee.length; k++) {
      for (let i = 0; i < serviceRestrictions.length; i++) {
        let currentHour = serviceRestrictions[i][0];
        while (currentHour + serviceDuration <= serviceRestrictions[i][1]) {
          // To get all possible values within that slot
          let lowerLimit = baseDate[m] + currentHour * 3600;
          let upperLimit = lowerLimit + serviceDuration * 3600;
          let interferes = false;
          for (let j = 0; j < scheduleEmployee[k].length; j++) {
            let currentSchedule = scheduleEmployee[k][j];
            let lowerLimit2 = currentSchedule.ti;
            let upperLimit2 = currentSchedule.tf;

            if (
              upperLimit2 < baseDate[m] + 24 * 3600 &&
              lowerLimit2 > baseDate[m]
            ) {
              // It is within the current date...
              if (
                (lowerLimit >= lowerLimit2 && lowerLimit < upperLimit2) ||
                (upperLimit > lowerLimit2 && upperLimit < upperLimit2)
              ) {
                interferes = true;
              }
            }
          }
          if (!interferes) {
            possibleSlots.push([
              currentHour,
              currentHour + serviceDuration,
              scheduleEmployee[k][0].nombre,
              baseDate[m],
              scheduleEmployee[k][0].id,
              baseDate[m] + currentHour * 3600,
              baseDate[m] + currentHour * 3600 + serviceDuration * 3600,
            ]);
          }
          currentHour++;
        }
      }
    }
  }

  return possibleSlots;
};
const formatTime = (possibleSlots) => {
  var t = new Date(1969, 11, 31, 19);
  t.setSeconds(possibleSlots);
  return t;
};

const formatDayFunction = (d) => {
  const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
  const mo = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
  const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);
  return `${da} de ${mo} de ${ye}`;
};