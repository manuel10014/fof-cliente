const initState = {
  user: null,
  token: localStorage.getItem("token"),
  isLoggedIn: false,
  allUserInfo: {},
};

const authReducer = (state = initState, action) => {
  switch (action.type) {
    case "SIGNIN_SUCCESS":
      localStorage.setItem("token", action.payload.token);
      return {
        ...state,
        token: localStorage.getItem("token"),
        isLoggedIn: true,
      };
    case "SIGNIN_FAIL":
    case "AUTH_ERROR":
    case "LOGOUT_USER":
      localStorage.removeItem("token");
      return {
        ...state,
        user: null,
        token: null,
        isLoggedIn: false,
        allUserInfo: {},
      };
    case "USER_LOADED":
      return {
        ...state,
        user: action.payload.username,
        allUserInfo: action.payload,
        isLoggedIn: true,
      };
    default:
      return state;
  }
};

export default authReducer;
