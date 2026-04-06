import { useEffect, useMemo, useState } from "react";
import { Row, Col, Typography, Input, Spin, Button } from "antd";
import debounce from "lodash.debounce";
import PdfPreview from "./PdfPreview";
import { File, Hash, RotateCcw, SquareMenu } from "lucide-react";
import type {
  ExtractedItem,
  LineItem,
  ReconciliationItem,
} from "../types/common";
import ForwardButton from "./ForwardButton";
import BackButton from "./BackButton";
import ReconciliationTable from "./Reconciliationtable";
import { LineItemsTable } from "./LineItemTable";
import { POSelector } from "./POSelector";
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
const sampleData: ReconciliationItem[] = [
  {
    key: "companyCode",
    label: "Company Code",
    extractedValue: "3001",
    sapValue: "3001",
    value: "3001",
    originalValue: "3001",
    source: null,
  },
  {
    key: "documentDate",
    label: "Document Date",
    extractedValue: "11 Sep 2026",
    sapValue: "12 Sep 2026",
    value: "11 Sep 2026",
    originalValue: "11 Sep 2026",
    source: null,
  },
];
const formatLabel = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

export default function Reconciliation() {
  const [data, setData] = useState<ExtractedItem[]>(initialData);

  const poData: Record<string, LineItem[]> = {
    "450044967832": [
      {
        shortText: "Server Racks",
        amount: 4200,
        qty: 10,
        unitPrice: 420,
      },
      {
        shortText: "Optic Cabling",
        amount: 5750,
        qty: 10,
        unitPrice: 575,
      },
    ],

    "450044967643": [
      {
        material: "Cooling Fan",
        price: 1200,
        quantity: 5,
      },
    ],

    "450044967779": [
      {
        description: "Router",
        total: 8000,
        count: 8,
        vendor: "Cisco",
      },
    ],
  };
  const poList = Object.keys(poData);

  const [selectedPO, setSelectedPO] = useState<string>(poList[0]);

  const currentData = poData[selectedPO];
  //  Fake API
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

  const handleChange = (key: string, value: string) => {
    setData((prev) =>
      prev.map((item) => (item.key === key ? { ...item, value } : item)),
    );

    if (key === "cbsValue") {
      debouncedLookup(value);
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
          <div className="pt-2">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <File size={18} className="text-primary" />
              SAP Reconciliation
            </h2>
          </div>

          <ReconciliationTable initialData={sampleData} />
          <div className="pt-2 py-2">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <Hash size={18} className="text-primary" />
              Purchase Orders
            </h2>
          </div>
          <div className="py-2">
            <POSelector
              selectedPO={selectedPO}
              onSelect={setSelectedPO}
              poList={poList}
            />
          </div>
          <div className="py-2">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <SquareMenu size={18} className="text-primary" />
              Line Items
            </h2>
          </div>
          <div className="py-2">
            <LineItemsTable data={currentData} selectedPO={selectedPO} />
          </div>
        </div>

        <div className="p-4 border-t bg-stepbgbody flex justify-between items-center">
          <Button
            icon={<RotateCcw size={16} />}
            className="flex items-center gap-2 border border-borderer text-primary bg-white hover:!bg-secondary hover:!text-white hover:!border-secondary shadow-sm"
          >
            Retry Fetch SAP Data
          </Button>

          <ForwardButton label=" Parking" />
        </div>
      </div>
    </div>
  );
}
