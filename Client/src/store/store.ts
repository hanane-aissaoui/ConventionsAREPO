import { configureStore } from "@reduxjs/toolkit"
import programmesReducer from "./programmesSlice"
import programmesDetailReducer from "./programmesDetailSlice"
import projetsReducer from "./projetsSlice"
import partenairesReducer from "./partenairesSlice"
export const store = configureStore({
  reducer: {
    programmes: programmesReducer,
    programmeDetail: programmesDetailReducer,
    projets: projetsReducer,
    partenaires: partenairesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch