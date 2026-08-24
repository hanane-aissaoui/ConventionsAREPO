import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { getProgrammes, createProgramme, updateProgramme, deleteProgramme } from "../api/programmesApi"
import type { Programme, ProgrammeCreateRequest } from "../types/programme"

interface FetchProgrammesArgs {
  page?: number
  objet?: string
}

export const fetchProgrammes = createAsyncThunk(
  "programmes/fetchProgrammes",
  async ({ page = 0, objet = "" }: FetchProgrammesArgs = {}) => {
    return getProgrammes({ page, objet })
  }
)

export const addProgramme = createAsyncThunk(
  "programmes/addProgramme",
  async (payload: ProgrammeCreateRequest, { dispatch, getState }) => {
    await createProgramme(payload)
    const state = getState() as { programmes: ProgrammesState }
    await dispatch(fetchProgrammes({ page: state.programmes.page, objet: state.programmes.searchTerm }))
  }
)

export const editProgramme = createAsyncThunk(
  "programmes/editProgramme",
  async ({ id, payload }: { id: string; payload: ProgrammeCreateRequest }, { dispatch, getState }) => {
    await updateProgramme(id, payload)
    const state = getState() as { programmes: ProgrammesState }
    await dispatch(fetchProgrammes({ page: state.programmes.page, objet: state.programmes.searchTerm }))
  }
)

export const removeProgramme = createAsyncThunk(
  "programmes/removeProgramme",
  async (id: string, { dispatch, getState }) => {
    await deleteProgramme(id)
    const state = getState() as { programmes: ProgrammesState }
    // Si on supprime le dernier élément d'une page > 0, on recule d'une page
    const isLastItemOnPage = state.programmes.items.length === 1 && state.programmes.page > 0
    const targetPage = isLastItemOnPage ? state.programmes.page - 1 : state.programmes.page
    await dispatch(fetchProgrammes({ page: targetPage, objet: state.programmes.searchTerm }))
  }
)

interface ProgrammesState {
  items: Programme[]
  page: number
  totalPages: number
  totalElements: number
  searchTerm: string
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  createStatus: "idle" | "loading" | "succeeded" | "failed"
  createError: string | null
  editStatus: "idle" | "loading" | "succeeded" | "failed"
  editError: string | null
  deleteStatus: "idle" | "loading" | "succeeded" | "failed"
  deleteError: string | null
}

const initialState: ProgrammesState = {
  items: [],
  page: 0,
  totalPages: 0,
  totalElements: 0,
  searchTerm: "",
  status: "idle",
  error: null,
  createStatus: "idle",
  createError: null,
  editStatus: "idle",
  editError: null,
  deleteStatus: "idle",
  deleteError: null,
}

const programmesSlice = createSlice({
  name: "programmes",
  initialState,
  reducers: {
    setSearchTerm: (state, action: { payload: string }) => {
      state.searchTerm = action.payload
    },
    resetCreateStatus: (state) => {
      state.createStatus = "idle"
      state.createError = null
    },
    resetEditStatus: (state) => {
      state.editStatus = "idle"
      state.editError = null
    },
    resetDeleteStatus: (state) => {
      state.deleteStatus = "idle"
      state.deleteError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgrammes.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchProgrammes.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload.content
        state.page = action.payload.number
        state.totalPages = action.payload.totalPages
        state.totalElements = action.payload.totalElements
      })
      .addCase(fetchProgrammes.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message ?? "Erreur inconnue"
      })
      // Création
      .addCase(addProgramme.pending, (state) => {
        state.createStatus = "loading"
        state.createError = null
      })
      .addCase(addProgramme.fulfilled, (state) => {
        state.createStatus = "succeeded"
      })
      .addCase(addProgramme.rejected, (state, action) => {
        state.createStatus = "failed"
        state.createError = action.error.message ?? "Erreur lors de la création"
      })
      // Édition
      .addCase(editProgramme.pending, (state) => {
        state.editStatus = "loading"
        state.editError = null
      })
      .addCase(editProgramme.fulfilled, (state) => {
        state.editStatus = "succeeded"
      })
      .addCase(editProgramme.rejected, (state, action) => {
        state.editStatus = "failed"
        state.editError = action.error.message ?? "Erreur lors de la modification"
      })
      // Suppression
      .addCase(removeProgramme.pending, (state) => {
        state.deleteStatus = "loading"
        state.deleteError = null
      })
      .addCase(removeProgramme.fulfilled, (state) => {
        state.deleteStatus = "succeeded"
      })
      .addCase(removeProgramme.rejected, (state, action) => {
        state.deleteStatus = "failed"
        state.deleteError = action.error.message ?? "Erreur lors de la suppression"
      })
  },
})

export const { setSearchTerm, resetCreateStatus, resetEditStatus, resetDeleteStatus } = programmesSlice.actions
export default programmesSlice.reducer