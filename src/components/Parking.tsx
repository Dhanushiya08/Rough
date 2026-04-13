import { useState, useEffect, useRef } from "react";
import { Row, Col, Typography, Input, Button, Table, Modal } from "antd";
import { File } from "lucide-react";

import { useAppStore } from "../store/useAppStore";
import ProcessingOverlay from "./ProcessingOverlay";
import apiClient from "../services/apiClient";

import toast from "react-hot-toast";
import type { LineItem } from "../types/parking";
import type { ExtractedItem } from "../types/common";

import { usePollDocumentStatus } from "../hooks/usePollDocumentStatus";
import { useStep } from "../hooks/useStep";
import type { ColumnsType } from "antd/es/table";

const { Text } = Typography;

type ParkItem = {
  key: string;
  value: string;
  originalValue: string;
  editable?: boolean;
};

type GetListResponse = {
  data: ExtractedItem[];
  items: LineItem[];
  poNumber: string[];
};

const API_URL = "/posts";

const formatLabel = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

export default function Parking() {
  const fileId = useAppStore((s) => s.fileId);
  const fileName = useAppStore((s) => s.fileName);
  const progress = useAppStore((s) => s.progress);
  const pollingActive = useAppStore((s) => s.pollingActive);

  const completedToastRef = useRef(false);
  const [data, setData] = useState<ParkItem[]>([]);
  const [poList, setPoList] = useState<string[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);

  const [selectedPO, setSelectedPO] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [loadingPark, setLoadingPark] = useState(false);

  const { current, goTo } = useStep();
  const { startPolling } = usePollDocumentStatus();

  const isAnyProcessing =
    !!progress &&
    pollingActive &&
    Object.values(progress).some((s) => s === "processing");

  const isAllCompleted =
    !!progress && Object.values(progress).every((s) => s === "completed");

  const fetchParkData = async () => {
    try {
      setLoading(true);

      const res = await apiClient.post(API_URL, {
        event: "get-list",
        file_id: fileId,
        file_name: fileName,
        state: "park",
      });

      const body: GetListResponse = res.data.body;

      setData(
        body.data.map((i) => ({
          key: i.key,
          value: i.value,
          originalValue: i.value,
          editable: i.editable ?? true,
        })),
      );

      setItems(body.items || []);
      setPoList(body.poNumber || []);
      setSelectedPO(body.poNumber?.[0] || "");
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fileId) fetchParkData();
  }, [fileId]);

  const handleChange = (index: number, newValue: string) => {
    setData((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, value: newValue } : item,
      ),
    );
  };

  const getAllKeys = (data: LineItem[]): string[] => {
    const keySet = new Set<string>();
    data.forEach((row) => {
      Object.keys(row).forEach((key) => keySet.add(key));
    });
    return Array.from(keySet);
  };
  const getDynamicColumns = (): ColumnsType<LineItem> => {
    if (!items.length) return [];

    const allKeys = getAllKeys(items);

    return allKeys.map((key) => ({
      title: formatLabel(key),
      dataIndex: key,
      key,
    }));
  };
  const handleParkConfirm = () => {
    Modal.confirm({
      title: "Confirm Parking",
      content: "Are you sure you want to park this data into SAP?",
      okText: "Yes, Park",
      cancelText: "Cancel",
      okButtonProps: {
        style: { backgroundColor: "#002D62", borderColor: "#002D62" },
      },

      onOk: async () => {
        try {
          setLoadingPark(true);

          const payload = {
            event: "park-data",
            file_id: fileId,
            file_name: fileName,
            state: "park",
            data: {
              poNumber: poList,

              data: data.map((item) => ({
                key: item.key,
                value: item.value,
              })),

              items: items.map((item) => ({
                ...item,
                genaiSelected: true,
              })),
            },
          };

          console.log("Parking Payload:", payload);

          await apiClient.post(API_URL, payload);

          startPolling(fileId, goTo, () => current);
        } catch (err) {
          console.error("Parking API failed:", err);
        } finally {
          setLoadingPark(false);
        }
      },
    });
  };

  useEffect(() => {
    if (isAllCompleted && !completedToastRef.current) {
      completedToastRef.current = true;
      toast.success("All steps completed successfully");
    }
  }, [isAllCompleted]);
  return (
    <div className="w-full h-full flex flex-col bg-stepbgbody overflow-hidden">
      
      {isAnyProcessing && (
        <ProcessingOverlay
          title="Processing Document"
          description="Your request is currently being processed. Please wait and do not make any changes or navigate away."
        />
      )}

      {/* HEADER */}
      <div className="flex justify-between px-4 py-3 border-b bg-stepbgheader border rounded-t-xl">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
          <File size={18} />
          Parking Data in SAP
        </h2>
        <Button
          loading={loadingPark}
          // disabled={isAnyProcessing}
          disabled={isAnyProcessing || isAllCompleted}
          onClick={handleParkConfirm}
          className="bg-primary text-white border-none hover:!bg-secondary"
        >
          Park Data
        </Button>
        {/* <div className="flex items-center gap-3"></div> */}
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <ProcessingOverlay
            title="Loading Data"
            description="Please wait..."
          />
        ) : (
          <>
            {/* FORM */}
            <Row gutter={[16, 16]}>
              {data.map((item, index) => {
                const isEdited = item.value !== item.originalValue;

                return (
                  <Col xs={24} sm={12} key={item.key}>
                    <div
                      className={`p-4 rounded-lg border border-borderer transition ${
                        isEdited ? "bg-stepbgheader" : "bg-white"
                      }`}
                    >
                      <Text className="text-xs text-gray-500">
                        {formatLabel(item.key)}
                      </Text>

                      <Input
                        value={item.value}
                        disabled={isAnyProcessing}
                        onChange={(e) => handleChange(index, e.target.value)}
                        className="mt-1 font-medium border border-borderer focus:border-primary focus:ring-0"
                      />
                    </div>
                  </Col>
                );
              })}
            </Row>

            {/* PO LIST */}
            {poList.length > 0 && (
              <div className="mt-6">
                <Text strong>PO Numbers</Text>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {poList.map((po) => (
                    <Button
                      key={po}
                      type={selectedPO === po ? "primary" : "default"}
                      onClick={() => setSelectedPO(po)}
                    >
                      {po}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* TABLE */}
            {items.length > 0 && (
              <div className="mt-6">
                <Table<LineItem>
                  rowKey={(_, index) => `${selectedPO}-${index}`}
                  dataSource={items}
                  columns={getDynamicColumns()}
                  pagination={false}
                  className="custom-ant-table"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t flex justify-end">
        {/* <Button
          loading={loadingPark}
          // disabled={isAnyProcessing}
          disabled={isAnyProcessing || isAllCompleted}
          onClick={handleParkConfirm}
          className="bg-primary text-white border-none hover:!bg-secondary"
        >
          Park Data
        </Button> */}
      </div>
    </div>
  );
}
