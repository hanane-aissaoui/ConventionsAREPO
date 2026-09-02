import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import {
  getAllPartenaires,
  getPartenaireById,
  createPartenaire,
  updatePartenaire,
  deletePartenaire,
} from "../api/partenairesApi"
import { getApiErrorMessage } from "../utils/apiError"
import type { Partenaire, PartenaireCreateRequest } from "../types/partenaire"

export const fetchPartenaires = createAsyncThunk(
  "partenaires/fetchPartenaires",
  async () => getAllPartenaires()
)

export const fetchPartenaireDetail = createAsyncThunk(
  "partenaires/fetchPartenaireDetail",
  async (id: string, { rejectWithValue }) => {
    try { return await getPartenaireById(id) }
    catch (err) { return rejectWithValue("Impossible de charger ce partenaire.") }
  }
)

export const addPartenaire = createAsyncThunk(
  "partenaires/addPartenaire",
  async (payload: PartenaireCreateRequest, { dispatch, rejectWithValue }) => {
    try {
      await createPartenaire(payload)
      await dispatch(fetchPartenaires())
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Erreur lors de la création"))
    }
  }
)

export const editPartenaire = createAsyncThunk(
  "partenaires/editPartenaire",
  async ({ id, payload }: { id: string; payload: PartenaireCreateRequest }, { dispatch, rejectWithValue }) => {
    try {
      await updatePartenaire(id, payload)
      await dispatch(fetchPartenaires())
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Erreur lors de la modification"))
    }
  }
)

export const removePartenaire = createAsyncThunk(
  "partenaires/removePartenaire",
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      await deletePartenaire(id)
      await dispatch(fetchPartenaires())
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Erreur lors de la suppression"))
    }
  }
)

interface PartenairesState {
  items: Partenaire[]
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  createStatus: "idle" | "loading" | "succeeded" | "failed"
  createError: string | null
  editStatus: "idle" | "loading" | "succeeded" | "failed"
  editError: string | null
  deleteStatus: "idle" | "loading" | "succeeded" | "failed"
  deleteError: string | null

  selected: Partenaire | null
  detailLoading: boolean
  detailError: string | null
}

const initialState: PartenairesState = {
  items: [],
  status: "idle",
  error: null,
  createStatus: "idle",
  createError: null,
  editStatus: "idle",
  editError: null,
  deleteStatus: "idle",
  deleteError: null,

  selected: null,
  detailLoading: false,
  detailError: null,
}

const partenairesSlice = createSlice({
  name: "partenaires",
  initialState,
  reducers: {
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
      .addCase(fetchPartenaires.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchPartenaires.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = [...action.payload].sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
      })
      .addCase(fetchPartenaires.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message ?? "Erreur inconnue"
      })
      // Détail (Fiche Partenaire)
      .addCase(fetchPartenaireDetail.pending, (state) => {
        state.detailLoading = true
        state.detailError = null
      })
      .addCase(fetchPartenaireDetail.fulfilled, (state, action) => {
        state.detailLoading = false
        state.selected = action.payload
      })
      .addCase(fetchPartenaireDetail.rejected, (state, action) => {
        state.detailLoading = false
        state.detailError = action.payload as string
      })
      // Création
      .addCase(addPartenaire.pending, (state) => {
        state.createStatus = "loading"
        state.createError = null
      })
      .addCase(addPartenaire.fulfilled, (state) => {
        state.createStatus = "succeeded"
      })
      .addCase(addPartenaire.rejected, (state, action) => {
        state.createStatus = "failed"
        state.createError =
          (action.payload as string) ?? action.error.message ?? "Erreur lors de la création"
      })
      // Édition
      .addCase(editPartenaire.pending, (state) => {
        state.editStatus = "loading"
        state.editError = null
      })
      .addCase(editPartenaire.fulfilled, (state) => {
        state.editStatus = "succeeded"
      })
      .addCase(editPartenaire.rejected, (state, action) => {
        state.editStatus = "failed"
        state.editError =
          (action.payload as string) ?? action.error.message ?? "Erreur lors de la modification"
      })
      // Suppression
      .addCase(removePartenaire.pending, (state) => {
        state.deleteStatus = "loading"
        state.deleteError = null
      })
      .addCase(removePartenaire.fulfilled, (state) => {
        state.deleteStatus = "succeeded"
      })
      .addCase(removePartenaire.rejected, (state, action) => {
        state.deleteStatus = "failed"
        state.deleteError =
          (action.payload as string) ?? action.error.message ?? "Erreur lors de la suppression"
      })
  },
})

export const { resetCreateStatus, resetEditStatus, resetDeleteStatus } = partenairesSlice.actions
export default partenairesSlice.reducer
