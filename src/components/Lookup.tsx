import { useEffect, useMemo, useState } from "react";
import { Row, Col, Typography, Input, Spin, Button } from "antd";
import debounce from "lodash.debounce";
import PdfPreview from "./PdfPreview";
import { File, RotateCcw } from "lucide-react";
import type { ExtractedItem } from "../types/common";
import ForwardButton from "./ForwardButton";
import BackButton from "./BackButton";
import { triggerLookupProcess } from "../services/lookupService";
import { useAppStore } from "../store/useAppStore";

const { Text } = Typography;

const initialData: ExtractedItem[] = [
  { key: "companyCode", value: "3001" },
  { key: "supplierCode", value: "200399" },
  { key: "documentDate", value: "Oct 24, 2024" },
  { key: "baselineDate", value: "Oct 24, 2024" },
  { key: "totalAmount", value: "12,990,920,120.00" },
  { key: "currency", value: "USD" },
  { key: "reference", value: "IBCE260262/ABCLV10" },
  { key: "assignment", value: "IBCE260262/ABCLV10" },
  {
    key: "text",
    value: "PPMC Invoice 25C03-013 - November 2025 - DECEMBER 2025",
  },
  {
    key: "headerText",
    value: "PPMC Invoice 25C03-013 - November 2025 - DECEMBER 2025",
  },
  {
    key: "cbsValue",
    value: "2.5.2.1.1",
    originalValue: "2.5.2.1.1",
    editable: true,
  },
  {
    key: "internalOrder",
    value: "-- LOOK UP --",
    originalValue: "-- LOOK UP --",
    dependsOn: "cbsValue",
  },
];

const formatLabel = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

export default function Lookup() {
  const [data, setData] = useState<ExtractedItem[]>(initialData);
  const [loading, setLoading] = useState(false);
  const fileId = useAppStore((s) => s.fileId);
  const callApi = async (
    event: "lookup-trigger" | "lookup-change" | "sap-trigger",
    status: "uploaded" | "lookup",
    payloadData?: ExtractedItem[],
  ) => {
    try {
      setLoading(true);

      const result = await triggerLookupProcess({
        event,
        file_id: fileId,
        status,
        data: payloadData,
      });

      if (result) {
        setData(result);
      }
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    callApi("lookup-trigger", "uploaded");
  }, []);

  const debouncedLookup = useMemo(
    () =>
      debounce((updatedData: ExtractedItem[]) => {
        callApi("lookup-change", "uploaded", updatedData);
      }, 500),
    [],
  );

  const handleChange = (key: string, value: string) => {
    const updatedData = data.map((item) =>
      item.key === key ? { ...item, value } : item,
    );

    setData(updatedData);

    if (key === "cbsValue") {
      debouncedLookup(updatedData);
    }
  };

  useEffect(() => {
    return () => {
      debouncedLookup.cancel();
    };
  }, []);

  return (
    <div className="flex gap-6 h-screen">
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

        {/* CONTENT */}
        <div className="flex-1 overflow-auto p-6">
          <Row gutter={[16, 16]}>
            {data.map((item) => {
              const isFullWidth =
                item.key === "text" || item.key === "headerText";

              const isEdited =
                item.originalValue && item.value !== item.originalValue;

              return (
                <Col span={isFullWidth ? 24 : 12} key={item.key}>
                  <div
                    className={`rounded-xl p-4 shadow-sm ${
                      isEdited
                        ? "border border-blue-400 bg-blue-50"
                        : "bg-[#E9EEF3]"
                    }`}
                  >
                    <Text className="text-xs text-gray-500">
                      {formatLabel(item.key)}
                    </Text>

                    {item.editable ? (
                      <Input
                        value={item.value}
                        onChange={(e) => handleChange(item.key, e.target.value)}
                        className="mt-2"
                      />
                    ) : (
                      <div className="mt-2 text-sm text-gray-800">
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Spin size="small" />
                            Fetching...
                          </span>
                        ) : (
                          item.value || "--"
                        )}
                      </div>
                    )}
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t bg-stepbgbody flex justify-between items-center">
          <Button
            icon={<RotateCcw size={16} />}
            onClick={() => callApi("lookup-trigger", "uploaded")}
            className="flex items-center gap-2 border border-borderer text-primary bg-white hover:!bg-secondary hover:!text-white hover:!border-secondary shadow-sm"
          >
            Retry Look Up
          </Button>

          <ForwardButton
            label="Fetch SAP Data"
            onClick={() => callApi("sap-trigger", "lookup")}
          />
        </div>
      </div>
    </div>
  );
}
