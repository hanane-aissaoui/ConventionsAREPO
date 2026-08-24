import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchProjetsPage, fetchProjetById, createProjet, updateProjet, deleteProjet } from '../api/projetApi'
import type { ProjetDto, ProjetRequest } from '../types/projet'

interface ProjetsState {
  items: ProjetDto[]
  page: number
  totalPages: number
  totalElements: number
  loading: boolean
  error: string | null
  selected: ProjetDto | null
  detailLoading: boolean
  detailError: string | null
}

const initialState: ProjetsState = {
  items: [], page: 0, totalPages: 0, totalElements: 0,
  loading: false, error: null,
  selected: null, detailLoading: false, detailError: null,
}

export const loadProjets = createAsyncThunk(
  'projets/load',
  async ({ page, size, search }: { page: number; size: number; search: string }, { rejectWithValue }) => {
    try { return await fetchProjetsPage(page, size, search) }
    catch (err) { return rejectWithValue('Impossible de charger les projets.') }
  }
)

export const loadProjetDetail = createAsyncThunk(
  'projets/loadDetail',
  async (id: string, { rejectWithValue }) => {
    try { return await fetchProjetById(id) }
    catch (err) { return rejectWithValue('Impossible de charger ce projet.') }
  }
)

export const createProjetThunk = createAsyncThunk(
  'projets/create',
  async (data: ProjetRequest, { rejectWithValue }) => {
    try { return await createProjet(data) }
    catch (err) { return rejectWithValue('Impossible de créer le projet.') }
  }
)

export const updateProjetThunk = createAsyncThunk(
  'projets/update',
  async ({ id, data }: { id: string; data: ProjetRequest }, { rejectWithValue }) => {
    try { return await updateProjet(id, data) }
    catch (err) { return rejectWithValue('Impossible de modifier le projet.') }
  }
)

export const deleteProjetThunk = createAsyncThunk(
  'projets/delete',
  async (id: string, { rejectWithValue }) => {
    try { await deleteProjet(id); return id }
    catch (err) { return rejectWithValue('Impossible de supprimer le projet.') }
  }
)

const projetsSlice = createSlice({
  name: 'projets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadProjets.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loadProjets.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.content
        state.page = action.payload.page
        state.totalPages = action.payload.totalPages
        state.totalElements = action.payload.totalElements
      })
      .addCase(loadProjets.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

      .addCase(loadProjetDetail.pending, (state) => { state.detailLoading = true; state.detailError = null })
      .addCase(loadProjetDetail.fulfilled, (state, action) => { state.detailLoading = false; state.selected = action.payload })
      .addCase(loadProjetDetail.rejected, (state, action) => { state.detailLoading = false; state.detailError = action.payload as string })

      .addCase(createProjetThunk.rejected, (state, action) => { state.error = action.payload as string })
      .addCase(updateProjetThunk.rejected, (state, action) => { state.error = action.payload as string })
      .addCase(deleteProjetThunk.rejected, (state, action) => { state.error = action.payload as string })
  },
})

export default projetsSlice.reducer
