export const timeConverter = (timeSent) => {
    let time = timeSent.split(':')
    let hours = Number(time[0])
    let minutes = Number(time[1])
    let seconds = Number(time[2])
    let timeValue
    if (hours > 0 && hours <= 12) {
      timeValue = '' + hours
    } else if (hours > 12) {
      timeValue = '' + (hours - 12)
    } else if (hours === 0) {
      timeValue = '12'
    }
    timeValue += minutes < 10 ? ':0' + minutes : ':' + minutes // get minutes
    timeValue += seconds < 10 ? ':0' + seconds : ':' + seconds // get seconds
    timeValue += hours >= 12 ? ' P.M.' : ' A.M.' // get AM/PM
    return timeValue
  }

export const miniTimeFunction = (time) => {
    let timeToReturn = ''
    if (time <= 9) {
      timeToReturn += '0' + time.toString()
    } else {
      timeToReturn += time.toString()
    }
    return (timeToReturn += ':00:00')
  }

