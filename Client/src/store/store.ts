import { configureStore } from "@reduxjs/toolkit"
import programmesReducer from "./programmesSlice"
import programmesDetailReducer from "./programmesDetailSlice"
import projetsReducer from "./projetsSlice"
export const store = configureStore({
  reducer: {
    programmes: programmesReducer,
    programmeDetail: programmesDetailReducer,
    projets: projetsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch