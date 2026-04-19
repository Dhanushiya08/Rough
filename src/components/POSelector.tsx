import React, { useState } from "react";
import { Pencil, Check, X, Trash2, AlertTriangle } from "lucide-react";
import { Tooltip } from "antd";

interface Props {
  selectedPO: string;
  onSelect: (po: string) => void;
  poList: string[];
  onEdit: (oldPO: string, newPO: string) => void;
  onAdd: () => void;
  onCancelAdd: () => void;
  onRemove: (po: string) => void;
  lang?: string;
}

export const POSelector: React.FC<Props> = ({
  selectedPO,
  onSelect,
  poList,
  onEdit,
  onAdd,
  onCancelAdd,
  onRemove,
  lang,
}) => {
  const getPoError = (po: string): string => {
    if (!/^\d+$/.test(po)) return "PO Number contains non-numeric characters";
    if (po.length !== 10) return "PO Number must be exactly 10 digits";
    return "";
  };
  const [editingPO, setEditingPO] = useState<string | null>(
    poList.includes("") ? "" : null,
  );
  const [editValue, setEditValue] = useState("");

  const handleEditClick = (e: React.MouseEvent, po: string) => {
    e.stopPropagation();
    setEditingPO(po);
    setEditValue(po);
  };

  const handleSave = (e: React.MouseEvent, originalPO: string) => {
    e.stopPropagation();
    if (editValue.trim()) {
      onEdit(originalPO, editValue.trim());
      if (selectedPO === originalPO) onSelect(editValue.trim());
    }
    setEditingPO(null);
  };

  // ✅ accepts po param + closing brace was missing
  const handleCancel = (e: React.MouseEvent, po: string) => {
    e.stopPropagation();
    if (po === "") {
      onCancelAdd();
    }
    setEditingPO(null);
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {poList.map((po) => {
        const isActive = selectedPO.trim() === po.trim();
        const isEditing = editingPO === po;
        const poError = !isEditing && lang !== "english" ? getPoError(po.trim()) : "";

        return (
          <Tooltip key={po === "" ? "__new__" : po} title={poError || ""}>
            <div
              onClick={() => !isEditing && onSelect(po.trim())}
              className={`p-3 border rounded cursor-pointer transition relative group ${
                poError
                  ? "border-orange-400 bg-orange-50 hover:shadow-md"
                  : isActive
                    ? "bg-stepbgheader border-primary text-primary"
                    : "bg-white hover:bg-gray-50"
              }`}
            >
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        if (editValue.trim()) {
                          onEdit(po, editValue.trim());
                          if (selectedPO === po) onSelect(editValue.trim());
                        }
                        setEditingPO(null);
                      }
                      if (e.key === "Escape") {
                        e.stopPropagation();
                        if (po === "") onCancelAdd();
                        setEditingPO(null);
                      }
                    }}
                    className="w-full border border-primary rounded px-1 py-0.5 text-sm font-medium outline-none focus:ring-1 focus:ring-primary text-gray-800"
                  />
                  <button
                    onClick={(e) => handleSave(e, po)}
                    title="Save"
                    className="text-green-500 hover:text-green-700 shrink-0"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={(e) => handleCancel(e, po)}
                    title="Cancel"
                    className="text-red-400 hover:text-red-600 shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{po}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Click to select
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => handleEditClick(e, po)}
                      title="Edit PO number"
                      className="text-gray-400 hover:text-primary transition-colors ml-2 shrink-0"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemove(po); }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                    {poError && <AlertTriangle size={14} className="text-orange-500 shrink-0" />}
                  </div>
                </div>
              )}
            </div>
          </Tooltip>
        );
      })}

      {/* ── ADD PO ── */}
      <div
        onClick={onAdd}
        className="p-3 border border-dashed rounded cursor-pointer transition flex items-center justify-center gap-2 text-gray-400 hover:text-primary hover:border-primary hover:bg-gray-50"
      >
        <span className="text-xl leading-none">+</span>
        <span className="text-sm font-medium">Add PO</span>
      </div>
    </div>
  );
};
