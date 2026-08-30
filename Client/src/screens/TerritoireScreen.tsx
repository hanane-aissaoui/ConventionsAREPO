import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import {
  fetchHierarchieTerritoriale, type TerritoireNode,
  createRegion, updateRegion, deleteRegion,
  createPrefecture, updatePrefecture, deletePrefecture,
  createCommune, updateCommune, deleteCommune,
} from "../api/territoireApi";
import ConfirmDialog from "../components/ConfirmDialog";
import "./TerritoireScreen.css";

const getNiveau1Info = (nom: string) =>
  /^préfecture/i.test(nom.trim())
    ? { label: "Préfecture", cls: "badge-prefecture" }
    : { label: "Province", cls: "badge-province" };

const getBadgeInfo = (node: TerritoireNode, level: number) => {
  if (level === 0) return { label: "Région", cls: "badge-region" };
  if (level === 1) return getNiveau1Info(node.nom);
  return { label: "Commune", cls: "badge-commune" };
};

// Construit "Province de Berkane" / "Préfecture d'Oujda-Angad" à partir du
// type choisi et du nom brut tapé par l'utilisateur (sans article).
function construireNomAvecArticle(type: "Province" | "Préfecture", nomBrut: string): string {
  const nom = nomBrut.trim();
  const commenceParVoyelle = /^[aeiouyàâäéèêëïîôöùûü]/i.test(nom);
  return `${type} ${commenceParVoyelle ? "d'" : "de "}${nom}`;
}

// Cherche un nœud (région, préfecture ou commune) par id dans tout l'arbre.
function trouverNoeud(nodes: TerritoireNode[], id: string): TerritoireNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    const trouve = trouverNoeud(n.enfants, id);
    if (trouve) return trouve;
  }
  return undefined;
}

// Cherche l'id du parent d'un nœud donné (utile pour savoir dans quelle
// fratrie vérifier les doublons lors d'une édition).
function trouverParentId(nodes: TerritoireNode[], childId: string, parentId: string | null = null): string | null | undefined {
  for (const n of nodes) {
    if (n.id === childId) return parentId;
    const trouve = trouverParentId(n.enfants, childId, n.id);
    if (trouve !== undefined) return trouve;
  }
  return undefined;
}

// Renvoie la liste des "frères et sœurs" d'un nœud : les régions si
// parentId est null, sinon les enfants du parent visé.
function getFratrie(data: TerritoireNode[], parentId: string | null): TerritoireNode[] {
  if (parentId === null) return data;
  const parent = trouverNoeud(data, parentId);
  return parent ? parent.enfants : [];
}

// Vérifie si un nom existe déjà parmi la fratrie (insensible à la casse,
// espaces ignorés). excludeId sert à ignorer le nœud qu'on est en train
// de modifier lors d'une édition.
function nomExisteDeja(nom: string, fratrie: TerritoireNode[], excludeId?: string): boolean {
  return fratrie.some(
    (n) => n.id !== excludeId && n.nom.trim().toLowerCase() === nom.trim().toLowerCase()
  );
}

export default function TerritoireScreen() {
  const [data, setData] = useState<TerritoireNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // undefined = aucun ajout en cours, null = ajout d'une région, string = ajout sous ce parent
  const [addingParentId, setAddingParentId] = useState<string | null | undefined>(undefined);
  const [addValue, setAddValue] = useState("");
  const [addType, setAddType] = useState<"Province" | "Préfecture">("Province");

  // Suppression avec confirmation
  const [toDelete, setToDelete] = useState<{ node: TerritoireNode; level: number } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const load = () => {
    fetchHierarchieTerritoriale()
      .then((nodes) => {
        setData(nodes);
        setExpanded((prev) => new Set([...prev, ...nodes.map((n) => n.id)]));
      })
      .catch(() => setError("Impossible de charger la hiérarchie territoriale"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

const startEdit = (node: TerritoireNode) => {
  setEditingId(node.id)
  setEditValue(node.nom)
  setEditError(null)
}

const saveEdit = async (node: TerritoireNode, level: number) => {
  if (!editValue.trim()) return

  const parentId = level === 0 ? null : trouverParentId(data, node.id) ?? null
  if (nomExisteDeja(editValue, getFratrie(data, parentId), node.id)) {
    setEditError("Ce nom existe déjà.")
    return
  }

  try {
    if (level === 0) await updateRegion(node.id, editValue)
    else if (level === 1) await updatePrefecture(node.id, editValue)
    else await updateCommune(node.id, editValue)
    setEditingId(null)
    setEditError(null)
    load()
  } catch (err) {
    setEditError(err instanceof Error ? err.message : "Une erreur est survenue.")
  }
}

  const askRemove = (node: TerritoireNode, level: number) => {
    setToDelete({ node, level });
  };

  const confirmRemove = async () => {
    if (!toDelete) return;
    const { node, level } = toDelete;
    setDeleting(true);
    try {
      if (level === 0) await deleteRegion(node.id);
      else if (level === 1) await deletePrefecture(node.id);
      else await deleteCommune(node.id);
      load();
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  const cancelRemove = () => {
    if (deleting) return;
    setToDelete(null);
  };

  // parentLevel : -1 = ajout d'une région, 0 = ajout d'une province/préfecture, 1 = ajout d'une commune
const startAdd = (parentId: string | null, parentLevel: number) => {
  setAddingParentId(parentId)
  setAddValue("")
  setAddType("Province")
  setAddError(null)
}

 const cancelAdd = () => {
  setAddingParentId(undefined)
  setAddError(null)
}
const saveAdd = async (parentId: string | null, parentLevel: number) => {
  if (!addValue.trim()) return
  const nom = parentLevel === 0 ? construireNomAvecArticle(addType, addValue) : addValue.trim()

  if (nomExisteDeja(nom, getFratrie(data, parentId))) {
    setAddError("Ce nom existe déjà.")
    return
  }

  try {
    if (parentId === null) await createRegion(nom)
    else if (parentLevel === 0) await createPrefecture(parentId, nom)
    else await createCommune(parentId, nom)

    setAddingParentId(undefined)
    setAddError(null)
    if (parentId) setExpanded((prev) => new Set(prev).add(parentId))
    load()
  } catch (err) {
    setAddError(err instanceof Error ? err.message : "Une erreur est survenue.")
  }
}

  const countPrefectures = data.reduce((sum, r) => sum + r.enfants.length, 0);
  const countCommunes = data.reduce(
    (sum, r) => sum + r.enfants.reduce((s, p) => s + p.enfants.length, 0),
    0
  );

  const renderAddRow = (parentId: string | null, parentLevel: number, indent: number) => (
    <div className="territoire-row" style={{ paddingLeft: indent }}>
      <span className="territoire-toggle-spacer" />

      {parentLevel === 0 && (
        <div className="territoire-type-toggle">
          <button
            type="button"
            className={`type-toggle-btn ${addType === "Province" ? "active" : ""}`}
            onClick={() => setAddType("Province")}
          >
            Province
          </button>
          <button
            type="button"
            className={`type-toggle-btn ${addType === "Préfecture" ? "active" : ""}`}
            onClick={() => setAddType("Préfecture")}
          >
            Préfecture
          </button>
        </div>
      )}

      <input
        autoFocus
        className="territoire-input"
        placeholder={parentLevel === 0 ? "ex: Berkane, Oujda-Angad..." : "Nom..."}
        value={addValue}
        onChange={(e) => setAddValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && saveAdd(parentId, parentLevel)}
     />
      {addError && <span className="field-error-inline">{addError}</span>}

      <button className="icon-btn icon-btn--confirm" onClick={() => saveAdd(parentId, parentLevel)}>
        <Check size={15} />
      </button>
      <button className="icon-btn" onClick={cancelAdd}>
        <X size={15} />
      </button>
    </div>
  );

  const renderNode = (node: TerritoireNode, level: number) => {
    const hasChildren = node.enfants.length > 0;
    const isOpen = expanded.has(node.id);
    const isEditing = editingId === node.id;
    const indent = level * 28;
    const badge = getBadgeInfo(node, level);

    return (
      <div key={node.id}>
        <div className="territoire-row" style={{ paddingLeft: indent }}>
          {hasChildren ? (
            <button className="territoire-toggle" onClick={() => toggle(node.id)}>
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <span className="territoire-toggle-spacer" />
          )}
          <span className={`territoire-badge ${badge.cls}`}>{badge.label}</span>

          {isEditing ? (
            <>
              <input
                autoFocus
                className="territoire-input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveEdit(node, level)}
              />
              {editError && <span className="field-error-inline">{editError}</span>}

              <button className="icon-btn icon-btn--confirm" onClick={() => saveEdit(node, level)}>
                <Check size={15} />
              </button>
              <button className="icon-btn" onClick={() => setEditingId(null)}>
                <X size={15} />
              </button>
            </>
          ) : (
            <>
              <span className="territoire-nom">{node.nom}</span>
              <span className="territoire-actions">
                <button className="icon-btn" onClick={() => startEdit(node)} title="Modifier">
                  <Pencil size={14} />
                </button>
                {level < 2 && (
                  <button className="icon-btn" onClick={() => startAdd(node.id, level)} title="Ajouter">
                    <Plus size={14} />
                  </button>
                )}
                <button className="icon-btn icon-btn--danger" onClick={() => askRemove(node, level)} title="Supprimer">
                  <Trash2 size={14} />
                </button>
              </span>
            </>
          )}
        </div>

        {addingParentId === node.id && renderAddRow(node.id, level, indent + 28)}
        {hasChildren && isOpen && node.enfants.map((child) => renderNode(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="territoire-container">
      <div className="territoire-header">
        <div>
          <h1 className="territoire-title">Territoire</h1>
          
        </div>
        <button className="btn-primary" onClick={() => startAdd(null, -1)}>
          <Plus size={16} />
          Ajouter une Région
        </button>
      </div>

      {loading && <p style={{ color: "#9CA3AF", fontSize: 13 }}>Chargement...</p>}
      {error && <p style={{ color: "#C64A11", fontSize: 13 }}>{error}</p>}

      {!loading && !error && (
        <>
          <div className="territoire-stats">
            <div className="stat-card">
              <div className="stat-value stat-blue">{data.length}</div>
              <div className="stat-label">Région{data.length > 1 ? "s" : ""}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value stat-orange">{countPrefectures}</div>
              <div className="stat-label">Provinces &amp; Préfectures</div>
            </div>
            <div className="stat-card">
              <div className="stat-value stat-green">{countCommunes}</div>
              <div className="stat-label">Communes</div>
            </div>
          </div>

          <div className="territoire-tree">
            <h2 className="section-title">Structure territoriale</h2>
            {addingParentId === null && renderAddRow(null, -1, 0)}
            {data.map((region) => renderNode(region, 0))}
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={toDelete !== null}
        title="Supprimer cette entité ?"
        message={
          toDelete
            ? `Voulez-vous vraiment supprimer "${toDelete.node.nom}" ? Cette action est irréversible${
                toDelete.node.enfants.length > 0
                  ? " et supprimera également toutes les entités qu'elle contient"
                  : ""
              }.`
            : ""
        }
        isLoading={deleting}
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
      />
    </div>
  );
}