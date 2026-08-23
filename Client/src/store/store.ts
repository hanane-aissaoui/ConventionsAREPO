import { configureStore } from "@reduxjs/toolkit"
import programmesReducer from "./programmesSlice"
import programmesDetailReducer from "./programmesDetailSlice"
export const store = configureStore({
  reducer: {
    programmes: programmesReducer,
    programmeDetail: programmesDetailReducer, 
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch