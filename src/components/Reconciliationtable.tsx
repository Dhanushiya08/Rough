import React, { useState } from "react";
import { Table, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CircleCheck } from "lucide-react";

export interface ReconciliationItem {
  key: string;
  label: string;
  extractedValue: string;
  sapValue: string;
  value: string;
  originalValue: string;
  source?: "sap" | "extracted" | null;
}

interface Props {
  initialData: ReconciliationItem[];
}

const ReconciliationTable: React.FC<Props> = ({ initialData }) => {
  const [data, setData] = useState<ReconciliationItem[]>(initialData);

  const handleUseSAP = (key: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, value: item.sapValue, source: "sap" }
          : item,
      ),
    );
  };

  const handleReset = (key: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, value: item.originalValue, source: "extracted" }
          : item,
      ),
    );
  };

  const columns: ColumnsType<ReconciliationItem> = [
    {
      title: "Field",
      dataIndex: "label",
      key: "label",
    },
    {
      title: "Extracted Value",
      dataIndex: "extractedValue",
      key: "extractedValue",
    },
    {
      title: "SAP Value",
      dataIndex: "sapValue",
      key: "sapValue",
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: ReconciliationItem) => {
        const isSame = record.extractedValue === record.sapValue;

        if (isSame) {
          return (
            <div className="flex items-center gap-2 text-primary font-medium">
              <CircleCheck size={16} />
              Matched
            </div>
          );
        }

        return (
          <div className="flex gap-2">
            <Button
              size="small"
              onClick={() => handleUseSAP(record.key)}
              className={
                record.source === "sap"
                  ? "!bg-primary !text-white !border-primary"
                  : "!bg-white !text-secondary !border-accent"
              }
            >
              Use SAP
            </Button>

            <Button
              size="small"
              onClick={() => handleReset(record.key)}
              className={
                record.source === "extracted"
                  ? "!bg-primary !text-white !border-primary"
                  : "!bg-white !text-secondary !border-accent"
              }
            >
              Use Default
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Table<ReconciliationItem>
      columns={columns}
      dataSource={data}
      rowKey="key"
      pagination={false}
      className="custom-ant-table"
      rowClassName={(record) => {
        if (record.extractedValue === record.sapValue) return "";

        if (record.source === "sap") return "bg-green-50";
        if (record.source === "extracted") return "bg-stepbgbody";

        return "";
      }}
    />
  );
};

export default ReconciliationTable;
