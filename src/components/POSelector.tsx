// components/POSelector.tsx

interface Props {
  selectedPO: string;
  onSelect: (po: string) => void;
  poList: string[];
}

export const POSelector: React.FC<Props> = ({
  selectedPO,
  onSelect,
  poList,
}) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {poList.map((po) => {
        const isActive = selectedPO.trim() === po.trim();

        return (
          <div
            key={po}
            onClick={() => onSelect(po.trim())}
            className={`p-3 border rounded cursor-pointer transition ${
              isActive
                ? "bg-stepbgheader border-primary text-primary"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <p className="text-xs text-gray-400">PO NUMBER</p>
            <p className="font-medium">{po}</p>
          </div>
        );
      })}
    </div>
  );
};
