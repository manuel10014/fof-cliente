import exampleReducer from "./exampleReducer";
import { combineReducers } from "redux";
import authReducer from "./auth";
import serviceUserReducer from "./serviceUser";
import shoppingReducer from "./shoppingCart";

const allReducer = combineReducers({
  example: exampleReducer,
  auth: authReducer,
  serviceUser: serviceUserReducer,
  shoppingCart: shoppingReducer,
});

export default allReducer;
