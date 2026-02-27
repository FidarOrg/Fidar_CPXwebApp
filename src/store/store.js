import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./dashboardSlice";
import beneficiaryReducer from "./beneficiarySlice";

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    beneficiaries: beneficiaryReducer,
  },
});
