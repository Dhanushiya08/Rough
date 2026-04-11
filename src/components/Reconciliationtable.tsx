import React, { useState, useEffect } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CircleCheck } from "lucide-react";
import { Radio } from "antd";

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
    { title: "Field", dataIndex: "label" },
    { title: "Extracted", dataIndex: "extractedValue" },
    { title: "SAP", dataIndex: "sapValue" },
    {
      title: "Action",
      render: (_, record) => {
        const isSame = record.extractedValue === record.sapValue;

        if (isSame) {
          return (
            <div className="flex items-center gap-2 text-primary">
              <CircleCheck size={16} /> Matched
            </div>
          );
        }

        return (
          <Radio.Group
            value={record.source}
            onChange={(e) => updateRow(record.key, e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="small"
          >
            <Radio.Button value="extracted">Extracted</Radio.Button>
            <Radio.Button value="sap">SAP</Radio.Button>
          </Radio.Group>
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
