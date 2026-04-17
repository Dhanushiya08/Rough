import React, { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

interface Props {
  selectedPO: string;
  onSelect: (po: string) => void;
  poList: string[];
  onEdit: (oldPO: string, newPO: string) => void;
  onAdd: () => void;
}

export const POSelector: React.FC<Props> = ({
  selectedPO,
  onSelect,
  poList,
  onEdit,
  onAdd,
}) => {
  const [editingPO, setEditingPO] = useState<string | null>(null);
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

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPO(null);
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {poList.map((po) => {
        const isActive = selectedPO.trim() === po.trim();
        const isEditing = editingPO === po;

        return (
          <div
            key={po}
            onClick={() => !isEditing && onSelect(po.trim())}
            className={`p-3 border rounded cursor-pointer transition relative group ${
              isActive
                ? "bg-stepbgheader border-primary text-primary"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            {isEditing ? (
              // ── EDIT MODE ──
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
                  onClick={handleCancel}
                  title="Cancel"
                  className="text-red-400 hover:text-red-600 shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              // ── DEFAULT MODE ──
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{po}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Click to select
                  </p>
                </div>
                <button
                  onClick={(e) => handleEditClick(e, po)}
                  title="Edit PO number"
                  className="text-gray-400 hover:text-primary transition-colors ml-2 shrink-0"
                >
                  <Pencil size={13} />
                </button>
              </div>
            )}
          </div>
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
