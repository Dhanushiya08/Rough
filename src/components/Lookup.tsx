import { useEffect, useMemo, useState } from "react";
import { Row, Col, Typography, Input, Spin, Button } from "antd";
import debounce from "lodash.debounce";
import PdfPreview from "./PdfPreview";
import { File, RotateCcw } from "lucide-react";
import type { ExtractedItem } from "../types/common";
import ForwardButton from "./ForwardButton";
import BackButton from "./BackButton";
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
  
  const fetchInternalOrder = async (cbs: string) => {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve("INT-" + cbs.replace(/\./g, ""));
      }, 1000);
    });
  };

  //  Debounced function
  const debouncedLookup = useMemo(
    () =>
      debounce(async (cbs: string) => {
        if (!cbs) return;

        // set loading
        setData((prev) =>
          prev.map((item) =>
            item.dependsOn === "cbsValue" ? { ...item, loading: true } : item,
          ),
        );

        const result = await fetchInternalOrder(cbs);

        setData((prev) =>
          prev.map((item) =>
            item.dependsOn === "cbsValue"
              ? {
                  ...item,
                  value: result,
                  loading: false,
                }
              : item,
          ),
        );
      }, 500),
    [],
  );

  //  Handle change
  const handleChange = (key: string, value: string) => {
    setData((prev) =>
      prev.map((item) => (item.key === key ? { ...item, value } : item)),
    );

    // trigger dependency
    if (key === "cbsValue") {
      debouncedLookup(value);
    }
  };

  useEffect(() => {
    return () => {
      debouncedLookup.cancel(); // cleanup
    };
  }, []);

  return (
    <div className="flex gap-6 h-screen">
      <PdfPreview />
      {/* RIGHT PANEL */}
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
                        {item.loading ? (
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

        {/*  FOOTER (FIXED) */}
        <div className="p-4 border-t bg-stepbgbody flex justify-between items-center">
          <Button
            icon={<RotateCcw size={16} />}
            className="flex items-center gap-2 border border-borderer text-primary bg-white hover:!bg-secondary hover:!text-white hover:!border-secondary shadow-sm"
          >
            Retry Look Up
          </Button>

          {/* <Button
            type="primary"
            icon={<ArrowRight size={16} />}
            iconPlacement="end"
            className="flex items-center gap-2 bg-primary hover:!bg-secondary shadow-sm"
          >
            Fetch SAP Data
          </Button> */}
          <ForwardButton label=" Fetch SAP Data" />
        </div>
      </div>
    </div>
  );
}
