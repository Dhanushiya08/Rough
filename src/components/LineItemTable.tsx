import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import type { LineItem, LineItemsTableProps } from "../types/common";

export const LineItemsTable: React.FC<LineItemsTableProps> = ({
  data,
  selectedPO,
}) => {
  /**
   * Store selection per PO
   */
  const [selectionMap, setSelectionMap] = useState<Record<string, React.Key[]>>(
    {},
  );

  if (!data || data.length === 0) return null;

  const keys = Object.keys(data[0]);

  const columns: ColumnsType<LineItem> = keys.map((key) => ({
    title: key.toUpperCase(),
    dataIndex: key,
    key,
    render: (value: unknown) => (value != null ? String(value) : "-"),
  }));

  const selectedRowKeys = selectionMap[selectedPO] || [];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectionMap((prev) => ({
        ...prev,
        [selectedPO]: selectedKeys,
      }));
    },
  };

  return (
    <Table<LineItem>
      rowKey={(_, index) => `${selectedPO}-${index}`}
      //   rowKey={(_, index) => index!.toString()} // still ok now (scoped by PO)
      columns={columns}
      dataSource={data}
      pagination={false}
      bordered
      rowSelection={rowSelection}
      className="custom-ant-table"
      rowClassName={(_, index) =>
        // selectedRowKeys.includes(index!.toString())
        selectedRowKeys.includes(`${selectedPO}-${index}`)
          ? "bg-blue-50 border border-primary"
          : "hover:bg-gray-50 cursor-pointer"
      }
    />
  );
};
