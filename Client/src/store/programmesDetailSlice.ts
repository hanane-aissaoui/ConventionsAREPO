import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { getProgrammeById, updateProgramme, deleteProgramme } from "../api/programmesApi"
import { getAllPartenaires } from "../api/partenairesApi"
import {
  getConventionsCadreByProgramme,
  createConventionCadre,
  updateConventionCadre,
  deleteConventionCadre,
} from "../api/conventionsCadreApi"
import {
  fetchProjetsByProgramme,
  createProjet,
  updateProjet,
  deleteProjet,
} from "../api/projetApi"
import type { Programme, ProgrammeCreateRequest } from "../types/programme"
import type { Partenaire } from "../types/partenaire"
import { getApiErrorMessage } from "../utils/apiError"
import type { ConventionCadre, ConventionCadreCreateRequest } from "../types/conventionCadre"
import type { ProjetDto, ProjetRequest } from "../types/projet"

export const fetchProgrammeById = createAsyncThunk(
  "programmeDetail/fetchById",
  async (id: string) => getProgrammeById(id)
)

export const editProgrammeDetail = createAsyncThunk(
  "programmeDetail/edit",
  async ({ id, payload }: { id: string; payload: ProgrammeCreateRequest }, { rejectWithValue }) => {
    try { return await updateProgramme(id, payload) }
    catch (err) { return rejectWithValue(getApiErrorMessage(err, "Erreur lors de la modification")) }
  }
)

export const removeProgramme = createAsyncThunk(
  "programmeDetail/remove",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteProgramme(id)
      return id
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Erreur lors de la suppression"))
    }
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
  async (payload: ConventionCadreCreateRequest, { dispatch, rejectWithValue }) => {
    try {
      await createConventionCadre(payload)
      await dispatch(fetchConventionsCadre(payload.idProgramme))
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Erreur lors de la création de la convention"))
    }
  }
)

export const editConventionCadre = createAsyncThunk(
  "programmeDetail/editConventionCadre",
  async (
    { id, idProgramme, payload }: { id: string; idProgramme: string; payload: ConventionCadreCreateRequest },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await updateConventionCadre(id, payload)
      await dispatch(fetchConventionsCadre(idProgramme))
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Erreur lors de la modification de la convention"))
    }
  }
)

export const removeConventionCadre = createAsyncThunk(
  "programmeDetail/removeConventionCadre",
  async ({ id, idProgramme }: { id: string; idProgramme: string }, { dispatch, rejectWithValue }) => {
    try {
      await deleteConventionCadre(id)
      await dispatch(fetchConventionsCadre(idProgramme))
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Erreur lors de la suppression de la convention"))
    }
  }
)

// ---- Projets ----

export const fetchProjets = createAsyncThunk(
  "programmeDetail/fetchProjets",
  async (idProgramme: string) => fetchProjetsByProgramme(idProgramme)
)

export const addProjet = createAsyncThunk(
  "programmeDetail/addProjet",
  async (payload: ProjetRequest, { dispatch, rejectWithValue }) => {
    try {
      await createProjet(payload)
      await dispatch(fetchProjets(payload.idProgramme))
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Erreur lors de la création du projet"))
    }
  }
)

export const editProjet = createAsyncThunk(
  "programmeDetail/editProjet",
  async (
    { id, idProgramme, payload }: { id: string; idProgramme: string; payload: ProjetRequest },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await updateProjet(id, payload)
      await dispatch(fetchProjets(idProgramme))
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Erreur lors de la modification du projet"))
    }
  }
)

export const removeProjet = createAsyncThunk(
  "programmeDetail/removeProjet",
  async ({ id, idProgramme }: { id: string; idProgramme: string }, { dispatch, rejectWithValue }) => {
    try {
      await deleteProjet(id)
      await dispatch(fetchProjets(idProgramme))
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Erreur lors de la suppression du projet"))
    }
  }
)

interface ProgrammeDetailState {
  current: Programme | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null

  editStatus: "idle" | "loading" | "succeeded" | "failed"
  editError: string | null

  deleteStatus: "idle" | "loading" | "succeeded" | "failed"
  deleteError: string | null

  partenaires: Partenaire[]
  partenairesStatus: "idle" | "loading" | "succeeded" | "failed"

  conventionsCadre: ConventionCadre[]
  conventionsStatus: "idle" | "loading" | "succeeded" | "failed"

  addConventionStatus: "idle" | "loading" | "succeeded" | "failed"
  addConventionError: string | null

  editConventionStatus: "idle" | "loading" | "succeeded" | "failed"
  editConventionError: string | null

  deleteConventionStatus: "idle" | "loading" | "succeeded" | "failed"
  deleteConventionError: string | null

  projets: ProjetDto[]
  projetsStatus: "idle" | "loading" | "succeeded" | "failed"

  addProjetStatus: "idle" | "loading" | "succeeded" | "failed"
  addProjetError: string | null

  editProjetStatus: "idle" | "loading" | "succeeded" | "failed"
  editProjetError: string | null

  deleteProjetStatus: "idle" | "loading" | "succeeded" | "failed"
  deleteProjetError: string | null
}

const initialState: ProgrammeDetailState = {
  current: null,
  status: "idle",
  error: null,
  editStatus: "idle",
  editError: null,
  deleteStatus: "idle",
  deleteError: null,
  partenaires: [],
  partenairesStatus: "idle",
  conventionsCadre: [],
  conventionsStatus: "idle",
  addConventionStatus: "idle",
  addConventionError: null,
  editConventionStatus: "idle",
  editConventionError: null,
  deleteConventionStatus: "idle",
  deleteConventionError: null,
  projets: [],
  projetsStatus: "idle",
  addProjetStatus: "idle",
  addProjetError: null,
  editProjetStatus: "idle",
  editProjetError: null,
  deleteProjetStatus: "idle",
  deleteProjetError: null,
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
      state.deleteConventionError = null
    },
    resetAddProjetStatus: (state) => {
      state.addProjetStatus = "idle"
      state.addProjetError = null
    },
    resetEditProjetStatus: (state) => {
      state.editProjetStatus = "idle"
      state.editProjetError = null
    },
    resetDeleteProjetStatus: (state) => {
      state.deleteProjetStatus = "idle"
      state.deleteProjetError = null
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
        state.editError =
          (action.payload as string) ?? action.error.message ?? "Erreur lors de la modification"
      })
      .addCase(removeProgramme.pending, (state) => {
        state.deleteStatus = "loading"
        state.deleteError = null
      })
      .addCase(removeProgramme.fulfilled, (state) => {
        state.deleteStatus = "succeeded"
      })
      .addCase(removeProgramme.rejected, (state, action) => {
        state.deleteStatus = "failed"
        state.deleteError =
          (action.payload as string) ?? action.error.message ?? "Erreur lors de la suppression"
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
        state.addConventionError =
          (action.payload as string) ?? action.error.message ?? "Erreur lors de la création de la convention"
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
        state.editConventionError =
          (action.payload as string) ?? action.error.message ?? "Erreur lors de la modification de la convention"
      })
      .addCase(removeConventionCadre.pending, (state) => {
        state.deleteConventionStatus = "loading"
        state.deleteConventionError = null
      })
      .addCase(removeConventionCadre.fulfilled, (state) => {
        state.deleteConventionStatus = "succeeded"
      })
      .addCase(removeConventionCadre.rejected, (state, action) => {
        state.deleteConventionStatus = "failed"
        state.deleteConventionError =
          (action.payload as string) ?? action.error.message ?? "Erreur lors de la suppression de la convention"
      })
      // Projets
      .addCase(fetchProjets.pending, (state) => {
        state.projetsStatus = "loading"
      })
      .addCase(fetchProjets.fulfilled, (state, action) => {
        state.projetsStatus = "succeeded"
        state.projets = action.payload
      })
      .addCase(fetchProjets.rejected, (state) => {
        state.projetsStatus = "failed"
      })
      .addCase(addProjet.pending, (state) => {
        state.addProjetStatus = "loading"
        state.addProjetError = null
      })
      .addCase(addProjet.fulfilled, (state) => {
        state.addProjetStatus = "succeeded"
      })
      .addCase(addProjet.rejected, (state, action) => {
        state.addProjetStatus = "failed"
        state.addProjetError =
          (action.payload as string) ?? action.error.message ?? "Erreur lors de la création du projet"
      })
      .addCase(editProjet.pending, (state) => {
        state.editProjetStatus = "loading"
        state.editProjetError = null
      })
      .addCase(editProjet.fulfilled, (state) => {
        state.editProjetStatus = "succeeded"
      })
      .addCase(editProjet.rejected, (state, action) => {
        state.editProjetStatus = "failed"
        state.editProjetError =
          (action.payload as string) ?? action.error.message ?? "Erreur lors de la modification du projet"
      })
      .addCase(removeProjet.pending, (state) => {
        state.deleteProjetStatus = "loading"
        state.deleteProjetError = null
      })
      .addCase(removeProjet.fulfilled, (state) => {
        state.deleteProjetStatus = "succeeded"
      })
      .addCase(removeProjet.rejected, (state, action) => {
        state.deleteProjetStatus = "failed"
        state.deleteProjetError =
          (action.payload as string) ?? action.error.message ?? "Erreur lors de la suppression du projet"
      })
  },
})

export const {
  clearProgrammeDetail,
  resetEditStatus,
  resetAddConventionStatus,
  resetEditConventionStatus,
  resetDeleteConventionStatus,
  resetAddProjetStatus,
  resetEditProjetStatus,
  resetDeleteProjetStatus,
} = programmeDetailSlice.actions
export default programmeDetailSlice.reducer