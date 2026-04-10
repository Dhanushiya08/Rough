import { useState, useEffect } from "react";
import { Row, Col, Typography, Input, Spin, Button } from "antd";
import { File, RotateCcw } from "lucide-react";
import PdfPreview from "./PdfPreview";
import ForwardButton from "./ForwardButton";
import BackButton from "./BackButton";
import { useAppStore } from "../store/useAppStore";
import ProcessingOverlay from "./ProcessingOverlay";
import apiClient from "../services/apiClient";

const { Text } = Typography;

type ParkItem = {
  key: string;
  value: string;
  originalValue: string;
};

const formatLabel = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

export default function Parking() {
  const fileId = useAppStore((s) => s.fileId);
  const progress = useAppStore((s) => s.progress);
  const pollingActive = useAppStore((s) => s.pollingActive);
  const lang = useAppStore((s) => s.lang);

  const [data, setData] = useState<ParkItem[]>([]);
  const [poNumber, setpoNumber] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPark, setLoadingPark] = useState(false);

  const isAnyProcessing =
    !!progress &&
    pollingActive &&
    Object.values(progress).some((s) => s === "processing");

  //  Fetch Data
  const fetchParkData = async () => {
    if (!fileId) return;

    setLoading(true);
    try {
      const res = await apiClient.post("/posts", {
        event: "get-list",
        file_id: fileId,
        state: "park",
      });

      const body = res.data?.body;

      setData(body?.data || []);
      setpoNumber(body?.poNumber || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkData();
  }, [fileId]);

  //  Handle Edit
  const handleChange = (index: number, newValue: string) => {
    setData((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, value: newValue } : item,
      ),
    );
  };

  //  PARK API
  const handlePark = async () => {
    if (!fileId) return;

    try {
      setLoadingPark(true);

      await apiClient.post("/posts", {
        event: "park_data",
        file_id: fileId,
        lang: lang,
        data: {
          poNumber,
          data,
        },
      });

      console.log(" Park successful");
    } catch (err) {
      console.error("Park error:", err);
    } finally {
      setLoadingPark(false);
    }
  };

  return (
    <div className="flex gap-6">
      {/* LEFT PDF */}
      <PdfPreview />

      {/* RIGHT PANEL */}
      <div className="w-1/2 border rounded-xl flex flex-col bg-[#F7F9FB] overflow-hidden relative">
        {/* Overlay */}
        {isAnyProcessing && (
          <ProcessingOverlay
            title="Processing in Progress"
            description="Please wait..."
          />
        )}

        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b bg-stepbgheader">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
            <File size={18} />
            Park Data
          </h2>
          <BackButton />
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <Spin />
          ) : (
            <Row gutter={[16, 16]}>
              {data.map((item, index) => {
                const isEdited = item.value !== item.originalValue;

                return (
                  <Col xs={24} sm={12} key={item.key}>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      {/* Label */}
                      <Text className="text-xs text-gray-500">
                        {formatLabel(item.key)}
                      </Text>

                      {/* Input */}
                      <Input
                        value={item.value}
                        disabled={isAnyProcessing}
                        onChange={(e) => handleChange(index, e.target.value)}
                        className="mt-1 font-medium"
                        status={isEdited ? "warning" : ""}
                      />
                    </div>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t flex justify-between items-center">
          <Button
            icon={<RotateCcw size={16} />}
            loading={loadingPark}
            disabled={isAnyProcessing}
            onClick={handlePark}
          >
            Park Data
          </Button>

          <ForwardButton label="Next Step" disabled={isAnyProcessing} />
        </div>
      </div>
    </div>
  );
}
