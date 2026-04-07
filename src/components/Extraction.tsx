import { useState } from "react";
import { Row, Col, Typography, Button, Spin } from "antd";
import { RotateCcw, File } from "lucide-react";
import PdfPreview from "./PdfPreview";
import BackButton from "./BackButton";
import ForwardButton from "./ForwardButton";
import { useExtraction } from "../hooks/useExtraction";
import { useAppStore } from "../store/useAppStore";
import { Alert } from "antd";
import type { ExtractionEvent } from "../types/common";

const { Text } = Typography;

// type ExtractedItem = {
//   key: string;
//   value: string;
// };

// const extractedData: ExtractedItem[] = [
//   { key: "companyCode", value: "3001" },
//   { key: "supplierCode", value: "200399" },
//   { key: "documentDate", value: "Oct 24, 2024" },
//   { key: "baselineDate", value: "Oct 24, 2024" },
//   { key: "totalAmount", value: "12,990,920,120.00" },
//   { key: "currency", value: "USD" },
//   { key: "reference", value: "IBCE260262/ABCLV10" },
//   { key: "assignment", value: "IBCE260262/ABCLV10" },
//   {
//     key: "text",
//     value: "PPMC Invoice 25C03-013 - November 2025 - DECEMBER 2025",
//   },
//   {
//     key: "headerText",
//     value: "PPMC Invoice 25C03-013 - November 2025 - DECEMBER 2025",
//   },
//   { key: "cbsValue", value: "2.5.2.1.1" },
//   { key: "internalOrder", value: "-- LOOK UP --" },
// ];

const formatLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase());

export default function Extraction() {
  const fileId = useAppStore((s) => s.fileId);
  const [event, setEvent] = useState<ExtractionEvent>("get-list");
  const [retryCount, setRetryCount] = useState(0);
  const [loadingRetry, setLoadingRetry] = useState(false);

  const { data, isLoading, error, refetch } = useExtraction(
    fileId,
    event,
    retryCount,
  );

  // useEffect(() => {
  //   // setEvent("get-list");
  // }, [fileId]);

  const handleRetry = async () => {
    setLoadingRetry(true);
    setRetryCount((prev) => prev + 1);
    setEvent("retry-process");
    await refetch();
    setLoadingRetry(false);
  };

  const handleLookUp = async () => {
    setEvent("look-up");
    await refetch();
  };

  return (
    <div className="flex gap-6 h-screen overflow-hidden">
      <PdfPreview />
      <div className="w-1/2 border rounded-xl flex flex-col bg-[#F7F9FB] overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b bg-stepbgheader">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
            <File size={18} className="text-primary" />
            Extracted Data
          </h2>
          <BackButton />
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spin />
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm">
              <Alert title="Failed to load extracted data." type="error" />
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {(data ?? []).map((item) => {
                const isFullWidth =
                  item.key === "text" || item.key === "headerText";
                return (
                  <Col span={isFullWidth ? 24 : 12} key={item.key}>
                    <div className="bg-[#E9EEF3] rounded-xl p-4 shadow-sm">
                      <Text className="text-xs text-gray-500">
                        {formatLabel(item.key)}
                      </Text>
                      <div className="mt-2 text-sm text-gray-800 break-words">
                        {item.value || "--"}
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>

        <div className="p-4 border-t bg-stepbgbody flex justify-between items-center">
          <Button
            icon={<RotateCcw size={16} />}
            loading={loadingRetry}
            onClick={handleRetry}
            className="flex items-center gap-2 border border-borderer text-primary bg-white hover:!bg-secondary hover:!text-white hover:!border-secondary shadow-sm"
          >
            Retry Extraction
          </Button>

          <ForwardButton label="Look Up" onClick={handleLookUp} />
        </div>
      </div>
    </div>
  );
}
