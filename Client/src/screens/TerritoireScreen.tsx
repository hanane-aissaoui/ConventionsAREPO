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
    setEditingId(node.id);
    setEditValue(node.nom);
  };

  const saveEdit = async (node: TerritoireNode, level: number) => {
    if (!editValue.trim()) return;
    if (level === 0) await updateRegion(node.id, editValue);
    else if (level === 1) await updatePrefecture(node.id, editValue);
    else await updateCommune(node.id, editValue);
    setEditingId(null);
    load();
  };

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
    setAddingParentId(parentId);
    setAddValue("");
    setAddType("Province");
  };

  const cancelAdd = () => setAddingParentId(undefined);

  const saveAdd = async (parentId: string | null, parentLevel: number) => {
    if (!addValue.trim()) return;
    const nom = parentLevel === 0 ? `${addType} ${addValue.trim()}` : addValue.trim();

    if (parentId === null) await createRegion(nom);
    else if (parentLevel === 0) await createPrefecture(parentId, nom);
    else await createCommune(parentId, nom);

    setAddingParentId(undefined);
    if (parentId) setExpanded((prev) => new Set(prev).add(parentId));
    load();
  };

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
        placeholder={parentLevel === 0 ? "ex: de Berkane, d'Oujda-Angad..." : "Nom..."}
        value={addValue}
        onChange={(e) => setAddValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && saveAdd(parentId, parentLevel)}
      />
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