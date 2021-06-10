const initState = {
  cartItems: [],
  serviceQty: 0,
};

const shoppingReducer = (state = initState, action) => {
  switch (action.type) {
    case "ADD_TO_CART":
      const item = action.payload;
      const existItem = state.cartItems.find(
        (x) => x.serviceType === item.serviceType
      );
      if (existItem) {
        return {
          ...state,
          cartItems: state.cartItems.map((x) =>
            x.serviceType === existItem.serviceType ? item : x
          ),
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, item],
        };
      }
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cartItems: state.cartItems.filter(
          (x) => x.serviceType !== action.payload
        ),
      };
    case "CART_RESET":
      return {
        ...state,
        cartItems: [],
        serviceQty: 0,
      };
    default:
      return state;
  }
};

export default shoppingReducer;
