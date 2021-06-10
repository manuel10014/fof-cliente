import { RRule, RRuleSet, rrulestr } from "rrule";

export const checkRecurrentHour = (
  specificHourSelected,
  timeRestrictions,
  durationService
) => {
  let passesAll = false;
  timeRestrictions.map((timeFrame) => {
    if (
      specificHourSelected >= timeFrame[0] &&
      specificHourSelected <= timeFrame[1]
    ) {
      if (specificHourSelected + durationService <= timeFrame[1]) {
        passesAll = true;
      }
    }
  });
  return passesAll;
};

export const checkRRuleWeekRecurring = (arrayOfDays) => {
  let RRuleFormatArray = [];
  arrayOfDays.map((day) => {
    if (day === "Lunes") {
      RRuleFormatArray.push(RRule.MO);
    } else if (day === "Martes") {
      RRuleFormatArray.push(RRule.TU);
    } else if (day === "Miercoles") {
      RRuleFormatArray.push(RRule.WE);
    } else if (day === "Jueves") {
      RRuleFormatArray.push(RRule.TH);
    } else if (day === "Viernes") {
      RRuleFormatArray.push(RRule.FR);
    } else if (day === "Sabado") {
      RRuleFormatArray.push(RRule.SA);
    } else if (day === "Domingo") {
      RRuleFormatArray.push(RRule.SU);
    }
  });

  return RRuleFormatArray;
};

export const getAllDatesFromRRule = (
  rRuleWeekDayArray,
  recurrentFrequency,
  startRecurrentDate,
  endRecurrentDate,
  recurrentType,
  recurrentHour
) => {
  let rule;
  const yearFirstDate = startRecurrentDate.getFullYear();
  const monthFirstDate = startRecurrentDate.getMonth();
  const dayFirstMonth = startRecurrentDate.getDate();
  const yearLastDate = endRecurrentDate.getFullYear();
  const monthLastDate = endRecurrentDate.getMonth();
  const dayLastMonth = endRecurrentDate.getDate();
  console.log(
    yearFirstDate,
    monthFirstDate,
    dayFirstMonth,
    recurrentHour,
    yearLastDate,
    monthLastDate,
    dayLastMonth
  );

  if (recurrentType === "Semanal") {
    rule = new RRule({
      freq: RRule.WEEKLY,
      dtstart: new Date(
        Date.UTC(
          yearFirstDate,
          monthFirstDate,
          dayFirstMonth,
          recurrentHour + 5,
          0,
          0
        )
      ),
      tzid: "America/Bogota",
      until: new Date(
        Date.UTC(
          yearLastDate,
          monthLastDate,
          dayLastMonth,
          recurrentHour + 5,
          0,
          0
        )
      ),
      count: 100,
      interval: 1,
      byweekday: rRuleWeekDayArray,
    });
  } else if (recurrentType === "Diario") {
    rule = new RRule({
      freq: RRule.DAILY,
      dtstart: new Date(
        Date.UTC(
          yearFirstDate,
          monthFirstDate,
          dayFirstMonth,
          recurrentHour + 5,
          0,
          0
        )
      ),
      tzid: "America/Bogota",
      until: new Date(
        Date.UTC(
          yearLastDate,
          monthLastDate,
          dayLastMonth,
          recurrentHour + 5,
          0,
          0
        )
      ),
      count: 100,
      interval: 1,
    });
  } else if (recurrentType === "Mensual") {
    rule = new RRule({
      freq: RRule.MONTHLY,
      dtstart: new Date(
        Date.UTC(
          yearFirstDate,
          monthFirstDate,
          dayFirstMonth,
          recurrentHour + 5,
          0,
          0
        )
      ),
      tzid: "America/Bogota",
      until: new Date(
        Date.UTC(
          yearLastDate,
          monthLastDate,
          dayLastMonth,
          recurrentHour + 5,
          0,
          0
        )
      ),
      count: 100,
      interval: 1,
    });
  }
  return rule
    .all()
    .filter(
      (date) => date > new Date(new Date().setDate(new Date().getDate() + 1))
    )
    .map((date) => date.getTime() / 1000);
};
