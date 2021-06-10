const initState = {
  sortAlgorithm: null,
  boolean: true,
};

const exampleReducer = (state = initState, action) => {
  switch (action.type) {
    case "EXAMPLE_ACTION":
      return {
        ...state,
        boolean: !state.boolean,
      };

    default:
      return state;
  }
};

export default exampleReducer;
