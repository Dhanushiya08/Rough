import { useEffect, useState } from "react";
import { Row, Col, Typography, Input, Spin, Button } from "antd";
import axios from "axios";
import PdfPreview from "./PdfPreview";
import { File } from "lucide-react";
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
import { useAppStore } from "../store/useAppStore";
import type { SapReconcileApiItem } from "../types/reconciliation";
type GetListResponse = {
  data: ExtractedItem[];
  sapReconcile: SapReconcileApiItem[];
  items: LineItem[];
  poNumbers: string[];
};
const { Text } = Typography;

const API_URL = "/posts";

const formatLabel = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

export default function Reconciliation() {
  const [data, setData] = useState<ExtractedItem[]>([]);
  const [reconcileData, setReconcileData] = useState<ReconciliationItem[]>([]);

  const [items, setItems] = useState<LineItem[]>([]);
  const [poList, setPoList] = useState<string[]>([]);
  const [selectedPO, setSelectedPO] = useState<string>("");

  const [selectionMap, setSelectionMap] = useState<Record<string, string[]>>(
    {},
  );

  const [loading, setLoading] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);

  const fileId = useAppStore((s) => s.fileId);
  const fileName = useAppStore((s) => s.fileName);
  const lang = useAppStore((s) => s.lang);

  const progress = useAppStore((s) => s.progress);
  const pollingActive = useAppStore((s) => s.pollingActive);

  const isAnyProcessing =
    !!progress &&
    pollingActive &&
    Object.values(progress).some((s) => s === "processing");
  console.log(selectionMap, "selectionMap");
  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.post(API_URL, {
        event: "get-list",
        file_id: fileId,
        file_name: fileName,
        state: "sap",
      });

      // const body = res.data.body;
      const body: GetListResponse = res.data.body;

      // Extracted
      setData(
        body.data.map((i) => ({
          key: i.key,
          value: i.value,
          originalValue: i.value,
          editable: i.editable ?? false,
        })),
      );

      // Reconcile
      setReconcileData(
        body.sapReconcile.map((i: SapReconcileApiItem) => ({
          key: i.field,
          label: formatLabel(i.field),
          extractedValue: i.extracted || "",
          sapValue: i.sap || "",
          value: i.selected === "sap" ? i.sap! : i.extracted!,
          source: i.selected ?? null,
          originalValue: i.extracted || "",
        })),
      );

      // Items
      setItems(body.items || []);

      // PO
      setPoList(body.poNumbers || []);
      setSelectedPO(body.poNumbers?.[0] || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (key: string, value: string) => {
    setData((prev) =>
      prev.map((item) => (item.key === key ? { ...item, value } : item)),
    );
  };

  const handleRetry = async () => {
    try {
      setRetryLoading(true);

      await axios.post(API_URL, {
        event: "retry-process",
        file_id: fileId,
        file_name: fileName,
        lang: lang,
        state: "sap",
        data: {
          poNumbers: poList,
          data: data.map((i) => ({
            key: i.key,
            value: i.value,
          })),
        },
      });

      await fetchData(); // refresh
    } catch (err) {
      console.error(err);
    } finally {
      setRetryLoading(false);
    }
  };

  const currentData = items;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin />
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-screen">
      <PdfPreview />

      <div className="w-1/2 border rounded-xl flex flex-col bg-[#F7F9FB] overflow-hidden">
        {isAnyProcessing && <div>Processing...</div>}

        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b bg-stepbgheader">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
            <File size={18} /> Extracted Data
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
                    className={`rounded-xl p-4 ${
                      isEdited ? "bg-blue-50" : "bg-[#E9EEF3]"
                    }`}
                  >
                    <Text>{formatLabel(item.key)}</Text>

                    {item.editable ? (
                      <Input
                        value={item.value}
                        onChange={(e) => handleChange(item.key, e.target.value)}
                      />
                    ) : (
                      <div>{item.value || "--"}</div>
                    )}
                  </div>
                </Col>
              );
            })}
          </Row>

          {/* RECONCILIATION */}

          <ReconciliationTable
            data={reconcileData}
            onChange={setReconcileData}
          />

          {/* PO */}
          <POSelector
            selectedPO={selectedPO}
            onSelect={setSelectedPO}
            poList={poList}
          />

          {/* LINE ITEMS */}
          <LineItemsTable
            data={currentData}
            selectedPO={selectedPO}
            onChange={setSelectionMap}
          />
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t flex justify-between">
          <Button loading={retryLoading} onClick={handleRetry}>
            Retry Fetch SAP Data
          </Button>

          <ForwardButton label=" Parking" />
        </div>
      </div>
    </div>
  );
}
