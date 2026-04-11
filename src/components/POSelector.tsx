// components/POSelector.tsx
import React, { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

interface Props {
  selectedPO: string;
  onSelect: (po: string) => void;
  poList: string[];
  onEdit: (oldPO: string, newPO: string) => void;
}

export const POSelector: React.FC<Props> = ({
  selectedPO,
  onSelect,
  poList,
  onEdit,
}) => {
  const [editingPO, setEditingPO] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleEditClick = (e: React.MouseEvent, po: string) => {
    e.stopPropagation(); // prevent card selection
    setEditingPO(po);
    setEditValue(po);
  };

  const handleSave = (e: React.MouseEvent, originalPO: string) => {
    e.stopPropagation();
    if (editValue.trim()) {
      onEdit(originalPO, editValue.trim());
      // If the edited PO was selected, update selection too
      if (selectedPO === originalPO) {
        onSelect(editValue.trim());
      }
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
            {/* <p className="text-xs text-gray-400">PO NUMBER</p> */}
            {isEditing ? (
              <div className="flex items-center gap-1 mt-1">
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
                  className="text-green-500 hover:text-green-700 shrink-0"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={handleCancel}
                  className="text-red-400 hover:text-red-600 shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-0.5">
                <p className="font-medium">{po}</p>
                <button
                  onClick={(e) => handleEditClick(e, po)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-primary"
                >
                  <Pencil size={13} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
