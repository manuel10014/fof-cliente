export const signInSuccess = (info) => {
  return {
    type: "SIGNIN_SUCCESS",
    payload: info,
  };
};

export const signInFail = (info) => {
  return {
    type: "SIGNIN_FAIL",
    payload: info,
  };
};

export const userLoaded = (info) => {
  return {
    type: "USER_LOADED",
    payload: info,
  };
};

export const authError = (info) => {
  return {
    type: "AUTH_ERROR",
    payload: info,
  };
};

export const bookServiceInfo = (info) => {
  return {
    type: "BOOK_SERVICE",
    payload: info,
  };
};

export const logoutUser = () => {
  return {
    type: "LOGOUT_USER",
  };
};

export const addToCart = (info) => {
  return {
    type: "ADD_TO_CART",
    payload: info,
  };
};

export const removeFromCart = (info) => {
  return {
    type: "REMOVE_FROM_CART",
    payload: info,
  };
};

export const cartReset = (info) => {
  return {
    type: "CART_RESET",
    payload: info,
  };
};
