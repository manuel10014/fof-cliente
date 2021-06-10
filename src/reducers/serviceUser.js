const initState = {
  userServiceToPay: {},
};

const serviceUserReducer = (state = initState, action) => {
  switch (action.type) {
    case "BOOK_SERVICE":
      return { ...state, userServiceToPay: action.payload };
    default:
      return state;
  }
};

export default serviceUserReducer;
