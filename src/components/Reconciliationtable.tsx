import React, { useState, useEffect } from "react";
import { Table, Radio } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CircleCheck } from "lucide-react";

import type { ReconciliationItem } from "../types/reconciliation";

interface Props {
  data: ReconciliationItem[];
  onChange: (data: ReconciliationItem[]) => void;
}

const ReconciliationTable: React.FC<Props> = ({ data, onChange }) => {
  const [localData, setLocalData] = useState<ReconciliationItem[]>(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const updateRow = (key: string, source: "sap" | "extracted") => {
    const updated = localData.map((item) =>
      item.key === key
        ? {
            ...item,
            source,
            value: source === "sap" ? item.sapValue : item.extractedValue,
          }
        : item,
    );

    setLocalData(updated);
    onChange(updated);
  };

  const columns: ColumnsType<ReconciliationItem> = [
    {
      title: "Field",
      dataIndex: "label",
    },
    {
      title: "Extracted",
      render: (_, record) => {
        const isSame = record.extractedValue === record.sapValue;

        return (
          <div className="flex items-center gap-2">
            {!isSame && (
              <Radio
                checked={record.source === "extracted"}
                onChange={() => updateRow(record.key, "extracted")}
              />
            )}
            {record.extractedValue || "--"}
          </div>
        );
      },
    },
    {
      title: "SAP",
      render: (_, record) => {
        const isSame = record.extractedValue === record.sapValue;

        if (isSame) {
          return (
            <div className="flex items-center gap-2 text-primary">
              {record.sapValue || "--"}
              <CircleCheck size={16} />
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <Radio
              checked={record.source === "sap"}
              onChange={() => updateRow(record.key, "sap")}
            />
            {record.sapValue || "--"}
          </div>
        );
      },
    },
  ];

  return (
    <Table
      rowKey="key"
      columns={columns}
      dataSource={localData}
      pagination={false}
      className="custom-ant-table"
    />
  );
};

export default ReconciliationTable;
