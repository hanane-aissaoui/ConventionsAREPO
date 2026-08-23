import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { getProgrammeById, updateProgramme, deleteProgramme } from "../api/programmesApi"
import { getAllPartenaires } from "../api/partenairesApi"
import {
  getConventionsCadreByProgramme,
  createConventionCadre,
  updateConventionCadre,
  deleteConventionCadre,
} from "../api/conventionsCadreApi"
import type { Programme, ProgrammeCreateRequest } from "../types/programme"
import type { Partenaire } from "../types/partenaire"
import type { ConventionCadre, ConventionCadreCreateRequest } from "../types/conventionCadre"

export const fetchProgrammeById = createAsyncThunk(
  "programmeDetail/fetchById",
  async (id: string) => getProgrammeById(id)
)

export const editProgrammeDetail = createAsyncThunk(
  "programmeDetail/edit",
  async ({ id, payload }: { id: string; payload: ProgrammeCreateRequest }) => updateProgramme(id, payload)
)

export const removeProgramme = createAsyncThunk(
  "programmeDetail/remove",
  async (id: string) => {
    await deleteProgramme(id)
    return id
  }
)

export const fetchPartenairesList = createAsyncThunk(
  "programmeDetail/fetchPartenairesList",
  async () => getAllPartenaires()
)

export const fetchConventionsCadre = createAsyncThunk(
  "programmeDetail/fetchConventionsCadre",
  async (idProgramme: string) => getConventionsCadreByProgramme(idProgramme)
)

export const addConventionCadre = createAsyncThunk(
  "programmeDetail/addConventionCadre",
  async (payload: ConventionCadreCreateRequest, { dispatch }) => {
    await createConventionCadre(payload)
    await dispatch(fetchConventionsCadre(payload.idProgramme))
  }
)

export const editConventionCadre = createAsyncThunk(
  "programmeDetail/editConventionCadre",
  async (
    { id, idProgramme, payload }: { id: string; idProgramme: string; payload: ConventionCadreCreateRequest },
    { dispatch }
  ) => {
    await updateConventionCadre(id, payload)
    await dispatch(fetchConventionsCadre(idProgramme))
  }
)

export const removeConventionCadre = createAsyncThunk(
  "programmeDetail/removeConventionCadre",
  async ({ id, idProgramme }: { id: string; idProgramme: string }, { dispatch }) => {
    await deleteConventionCadre(id)
    await dispatch(fetchConventionsCadre(idProgramme))
  }
)

interface ProgrammeDetailState {
  current: Programme | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null

  editStatus: "idle" | "loading" | "succeeded" | "failed"
  editError: string | null

  deleteStatus: "idle" | "loading" | "succeeded" | "failed"

  partenaires: Partenaire[]
  partenairesStatus: "idle" | "loading" | "succeeded" | "failed"

  conventionsCadre: ConventionCadre[]
  conventionsStatus: "idle" | "loading" | "succeeded" | "failed"

  addConventionStatus: "idle" | "loading" | "succeeded" | "failed"
  addConventionError: string | null

  editConventionStatus: "idle" | "loading" | "succeeded" | "failed"
  editConventionError: string | null

  deleteConventionStatus: "idle" | "loading" | "succeeded" | "failed"
}

const initialState: ProgrammeDetailState = {
  current: null,
  status: "idle",
  error: null,
  editStatus: "idle",
  editError: null,
  deleteStatus: "idle",
  partenaires: [],
  partenairesStatus: "idle",
  conventionsCadre: [],
  conventionsStatus: "idle",
  addConventionStatus: "idle",
  addConventionError: null,
  editConventionStatus: "idle",
  editConventionError: null,
  deleteConventionStatus: "idle",
}

const programmeDetailSlice = createSlice({
  name: "programmeDetail",
  initialState,
  reducers: {
    clearProgrammeDetail: () => initialState,
    resetEditStatus: (state) => {
      state.editStatus = "idle"
      state.editError = null
    },
    resetAddConventionStatus: (state) => {
      state.addConventionStatus = "idle"
      state.addConventionError = null
    },
    resetEditConventionStatus: (state) => {
      state.editConventionStatus = "idle"
      state.editConventionError = null
    },
    resetDeleteConventionStatus: (state) => {
      state.deleteConventionStatus = "idle"
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgrammeById.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchProgrammeById.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.current = action.payload
      })
      .addCase(fetchProgrammeById.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message ?? "Programme introuvable"
      })
      .addCase(editProgrammeDetail.pending, (state) => {
        state.editStatus = "loading"
        state.editError = null
      })
      .addCase(editProgrammeDetail.fulfilled, (state, action) => {
        state.editStatus = "succeeded"
        state.current = action.payload
      })
      .addCase(editProgrammeDetail.rejected, (state, action) => {
        state.editStatus = "failed"
        state.editError = action.error.message ?? "Erreur lors de la modification"
      })
      .addCase(removeProgramme.pending, (state) => {
        state.deleteStatus = "loading"
      })
      .addCase(removeProgramme.fulfilled, (state) => {
        state.deleteStatus = "succeeded"
      })
      .addCase(removeProgramme.rejected, (state) => {
        state.deleteStatus = "failed"
      })
      .addCase(fetchPartenairesList.pending, (state) => {
        state.partenairesStatus = "loading"
      })
      .addCase(fetchPartenairesList.fulfilled, (state, action) => {
        state.partenairesStatus = "succeeded"
        state.partenaires = [...action.payload].sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
      })
      .addCase(fetchPartenairesList.rejected, (state) => {
        state.partenairesStatus = "failed"
      })
      .addCase(fetchConventionsCadre.pending, (state) => {
        state.conventionsStatus = "loading"
      })
      .addCase(fetchConventionsCadre.fulfilled, (state, action) => {
        state.conventionsStatus = "succeeded"
        state.conventionsCadre = action.payload
      })
      .addCase(fetchConventionsCadre.rejected, (state) => {
        state.conventionsStatus = "failed"
      })
      .addCase(addConventionCadre.pending, (state) => {
        state.addConventionStatus = "loading"
        state.addConventionError = null
      })
      .addCase(addConventionCadre.fulfilled, (state) => {
        state.addConventionStatus = "succeeded"
      })
      .addCase(addConventionCadre.rejected, (state, action) => {
        state.addConventionStatus = "failed"
        state.addConventionError = action.error.message ?? "Erreur lors de la création de la convention"
      })
      .addCase(editConventionCadre.pending, (state) => {
        state.editConventionStatus = "loading"
        state.editConventionError = null
      })
      .addCase(editConventionCadre.fulfilled, (state) => {
        state.editConventionStatus = "succeeded"
      })
      .addCase(editConventionCadre.rejected, (state, action) => {
        state.editConventionStatus = "failed"
        state.editConventionError = action.error.message ?? "Erreur lors de la modification de la convention"
      })
      .addCase(removeConventionCadre.pending, (state) => {
        state.deleteConventionStatus = "loading"
      })
      .addCase(removeConventionCadre.fulfilled, (state) => {
        state.deleteConventionStatus = "succeeded"
      })
      .addCase(removeConventionCadre.rejected, (state) => {
        state.deleteConventionStatus = "failed"
      })
  },
})

export const {
  clearProgrammeDetail,
  resetEditStatus,
  resetAddConventionStatus,
  resetEditConventionStatus,
  resetDeleteConventionStatus,
} = programmeDetailSlice.actions
export default programmeDetailSlice.reducer