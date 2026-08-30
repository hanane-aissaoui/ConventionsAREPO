import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchProjetsPage, fetchProjetById, createProjet, updateProjet, deleteProjet } from '../api/projetApi'
import {
  getConventionsSpecifiquesByProjet,
  createConventionSpecifique,
  updateConventionSpecifique,
  deleteConventionSpecifique,
} from '../api/conventionsSpecifiquesApi'
import { getMarchesByProjet, createMarche, updateMarche, deleteMarche } from '../api/marchesApi'
import type { ProjetDto, ProjetRequest } from '../types/projet'
import type { ConventionSpecifique, ConventionSpecifiqueCreateRequest } from '../types/conventionSpecifique'
import type { Marche, MarcheCreateRequest } from '../types/marche'

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

  conventionsSpecifiques: ConventionSpecifique[]
  conventionsSpecifiquesStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  addConventionSpecifiqueStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  addConventionSpecifiqueError: string | null
  editConventionSpecifiqueStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  editConventionSpecifiqueError: string | null
  deleteConventionSpecifiqueStatus: 'idle' | 'loading' | 'succeeded' | 'failed'

  marches: Marche[]
  marchesStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  addMarcheStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  addMarcheError: string | null
  editMarcheStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  editMarcheError: string | null
  deleteMarcheStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
}

const initialState: ProjetsState = {
  items: [], page: 0, totalPages: 0, totalElements: 0,
  loading: false, error: null,
  selected: null, detailLoading: false, detailError: null,

  conventionsSpecifiques: [],
  conventionsSpecifiquesStatus: 'idle',
  addConventionSpecifiqueStatus: 'idle',
  addConventionSpecifiqueError: null,
  editConventionSpecifiqueStatus: 'idle',
  editConventionSpecifiqueError: null,
  deleteConventionSpecifiqueStatus: 'idle',

  marches: [],
  marchesStatus: 'idle',
  addMarcheStatus: 'idle',
  addMarcheError: null,
  editMarcheStatus: 'idle',
  editMarcheError: null,
  deleteMarcheStatus: 'idle',
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

// ─── Partenaires associés au projet (ConventionSpecifique) ─────────────────

export const fetchConventionsSpecifiques = createAsyncThunk(
  'projets/fetchConventionsSpecifiques',
  async (idProjet: string) => getConventionsSpecifiquesByProjet(idProjet)
)

export const addConventionSpecifique = createAsyncThunk(
  'projets/addConventionSpecifique',
  async (payload: ConventionSpecifiqueCreateRequest, { dispatch }) => {
    await createConventionSpecifique(payload)
    await dispatch(fetchConventionsSpecifiques(payload.idProjet))
    await dispatch(loadProjetDetail(payload.idProjet))
  }
)

export const editConventionSpecifique = createAsyncThunk(
  'projets/editConventionSpecifique',
  async (
    { id, idProjet, payload }: { id: string; idProjet: string; payload: ConventionSpecifiqueCreateRequest },
    { dispatch }
  ) => {
    await updateConventionSpecifique(id, payload)
    await dispatch(fetchConventionsSpecifiques(idProjet))
  }
)

export const removeConventionSpecifique = createAsyncThunk(
  'projets/removeConventionSpecifique',
  async ({ id, idProjet }: { id: string; idProjet: string }, { dispatch }) => {
    await deleteConventionSpecifique(id)
    await dispatch(fetchConventionsSpecifiques(idProjet))
    await dispatch(loadProjetDetail(idProjet))
  }
)

// ─── Sociétés / marchés associés au projet ─────────────────────────────────

export const fetchMarches = createAsyncThunk(
  'projets/fetchMarches',
  async (idProjet: string) => getMarchesByProjet(idProjet)
)

export const addMarche = createAsyncThunk(
  'projets/addMarche',
  async (payload: MarcheCreateRequest, { dispatch }) => {
    await createMarche(payload)
    await dispatch(fetchMarches(payload.idProjet))
    await dispatch(loadProjetDetail(payload.idProjet))
  }
)

export const editMarche = createAsyncThunk(
  'projets/editMarche',
  async (
    { id, idProjet, payload }: { id: string; idProjet: string; payload: MarcheCreateRequest },
    { dispatch }
  ) => {
    await updateMarche(id, payload)
    await dispatch(fetchMarches(idProjet))
    await dispatch(loadProjetDetail(idProjet))
  }
)

export const removeMarche = createAsyncThunk(
  'projets/removeMarche',
  async ({ id, idProjet }: { id: string; idProjet: string }, { dispatch }) => {
    await deleteMarche(id)
    await dispatch(fetchMarches(idProjet))
    await dispatch(loadProjetDetail(idProjet))
  }
)

const projetsSlice = createSlice({
  name: 'projets',
  initialState,
  reducers: {
    resetAddConventionSpecifiqueStatus: (state) => {
      state.addConventionSpecifiqueStatus = 'idle'
      state.addConventionSpecifiqueError = null
    },
    resetEditConventionSpecifiqueStatus: (state) => {
      state.editConventionSpecifiqueStatus = 'idle'
      state.editConventionSpecifiqueError = null
    },
    resetDeleteConventionSpecifiqueStatus: (state) => {
      state.deleteConventionSpecifiqueStatus = 'idle'
    },
    resetAddMarcheStatus: (state) => {
      state.addMarcheStatus = 'idle'
      state.addMarcheError = null
    },
    resetEditMarcheStatus: (state) => {
      state.editMarcheStatus = 'idle'
      state.editMarcheError = null
    },
    resetDeleteMarcheStatus: (state) => {
      state.deleteMarcheStatus = 'idle'
    },
  },
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

      // Partenaires associés (ConventionSpecifique)
      .addCase(fetchConventionsSpecifiques.pending, (state) => {
        state.conventionsSpecifiquesStatus = 'loading'
      })
      .addCase(fetchConventionsSpecifiques.fulfilled, (state, action) => {
        state.conventionsSpecifiquesStatus = 'succeeded'
        state.conventionsSpecifiques = action.payload
      })
      .addCase(fetchConventionsSpecifiques.rejected, (state) => {
        state.conventionsSpecifiquesStatus = 'failed'
      })
      .addCase(addConventionSpecifique.pending, (state) => {
        state.addConventionSpecifiqueStatus = 'loading'
        state.addConventionSpecifiqueError = null
      })
      .addCase(addConventionSpecifique.fulfilled, (state) => {
        state.addConventionSpecifiqueStatus = 'succeeded'
      })
      .addCase(addConventionSpecifique.rejected, (state, action) => {
        state.addConventionSpecifiqueStatus = 'failed'
        state.addConventionSpecifiqueError = action.error.message ?? "Erreur lors de l'association du partenaire"
      })
      .addCase(editConventionSpecifique.pending, (state) => {
        state.editConventionSpecifiqueStatus = 'loading'
        state.editConventionSpecifiqueError = null
      })
      .addCase(editConventionSpecifique.fulfilled, (state) => {
        state.editConventionSpecifiqueStatus = 'succeeded'
      })
      .addCase(editConventionSpecifique.rejected, (state, action) => {
        state.editConventionSpecifiqueStatus = 'failed'
        state.editConventionSpecifiqueError = action.error.message ?? 'Erreur lors de la modification'
      })
      .addCase(removeConventionSpecifique.pending, (state) => {
        state.deleteConventionSpecifiqueStatus = 'loading'
      })
      .addCase(removeConventionSpecifique.fulfilled, (state) => {
        state.deleteConventionSpecifiqueStatus = 'succeeded'
      })
      .addCase(removeConventionSpecifique.rejected, (state) => {
        state.deleteConventionSpecifiqueStatus = 'failed'
      })

      // Sociétés / marchés
      .addCase(fetchMarches.pending, (state) => {
        state.marchesStatus = 'loading'
      })
      .addCase(fetchMarches.fulfilled, (state, action) => {
        state.marchesStatus = 'succeeded'
        state.marches = action.payload
      })
      .addCase(fetchMarches.rejected, (state) => {
        state.marchesStatus = 'failed'
      })
      .addCase(addMarche.pending, (state) => {
        state.addMarcheStatus = 'loading'
        state.addMarcheError = null
      })
      .addCase(addMarche.fulfilled, (state) => {
        state.addMarcheStatus = 'succeeded'
      })
      .addCase(addMarche.rejected, (state, action) => {
        state.addMarcheStatus = 'failed'
        state.addMarcheError = action.error.message ?? "Erreur lors de l'ajout du marché"
      })
      .addCase(editMarche.pending, (state) => {
        state.editMarcheStatus = 'loading'
        state.editMarcheError = null
      })
      .addCase(editMarche.fulfilled, (state) => {
        state.editMarcheStatus = 'succeeded'
      })
      .addCase(editMarche.rejected, (state, action) => {
        state.editMarcheStatus = 'failed'
        state.editMarcheError = action.error.message ?? 'Erreur lors de la modification'
      })
      .addCase(removeMarche.pending, (state) => {
        state.deleteMarcheStatus = 'loading'
      })
      .addCase(removeMarche.fulfilled, (state) => {
        state.deleteMarcheStatus = 'succeeded'
      })
      .addCase(removeMarche.rejected, (state) => {
        state.deleteMarcheStatus = 'failed'
      })
  },
})

export const {
  resetAddConventionSpecifiqueStatus,
  resetEditConventionSpecifiqueStatus,
  resetDeleteConventionSpecifiqueStatus,
  resetAddMarcheStatus,
  resetEditMarcheStatus,
  resetDeleteMarcheStatus,
} = projetsSlice.actions
export default projetsSlice.reducer
