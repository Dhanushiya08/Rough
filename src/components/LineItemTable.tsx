import { Table } from "antd";
import { useState } from "react";
import type { LineItem } from "../types/reconciliation";

type LineItemsTableProps = {
  data: LineItem[];
  selectedPO: string;
  onChange: (map: Record<string, string[]>) => void;
};

export const LineItemsTable = ({
  data,
  selectedPO,
  onChange,
}: LineItemsTableProps) => {
  const [selectionMap, setSelectionMap] = useState<Record<string, string[]>>(
    {},
  );

  const computedInitialKeys = data
    ?.map((item, index) =>
      item.genaiSelected ? `${selectedPO}-${index}` : null,
    )
    .filter(Boolean) as string[];

  const selectedRowKeys = selectionMap[selectedPO] ?? computedInitialKeys;

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      const updated = {
        ...selectionMap,
        [selectedPO]: keys as string[],
      };
      setSelectionMap(updated);
      onChange(updated);
    },
  };

  const columns =
    data && data.length > 0
      ? Object.keys(data[0])
          .filter((key) => key !== "genaiSelected")
          .map((key) => ({
            title: key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase()),
            dataIndex: key,
            key,
          }))
      : [];

  return (
    <Table
      rowKey={(_, index) => `${selectedPO}-${index}`}
      columns={columns}
      dataSource={data}
      pagination={false}
      rowSelection={rowSelection}
      className="custom-ant-table"
    />
  );
};
