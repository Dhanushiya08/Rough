import { useEffect, useState } from "react";
import { Row, Col, Typography, Input, Spin, Button, Alert } from "antd";
import apiClient from "../services/apiClient";
// import PdfPreview from "./PdfPreview";
import { File } from "lucide-react";
import type {
  ExtractedItem,
  LineItem,
  ReconciliationItem,
} from "../types/common";
import ForwardButton from "./ForwardButton";
// import BackButton from "./BackButton";
import ReconciliationTable from "./Reconciliationtable";
import { LineItemsTable } from "./LineItemTable";
import { POSelector } from "./POSelector";
import { useAppStore } from "../store/useAppStore";
import type { SapReconcileApiItem } from "../types/reconciliation";
import { usePollDocumentStatus } from "../hooks/usePollDocumentStatus";
import { useStep } from "../hooks/useStep";
import ProcessingOverlay from "./ProcessingOverlay";
type GetListResponse = {
  data: ExtractedItem[];
  sapReconcile: SapReconcileApiItem[];
  items: LineItem[];
  poNumber: string[];
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
  const [isDirty, setIsDirty] = useState(false);
  const [selectedPO, setSelectedPO] = useState<string>("");

  const { startPolling } = usePollDocumentStatus();
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

  const { current, goTo } = useStep();

  const isAnyProcessing =
    !!progress &&
    pollingActive &&
    Object.values(progress).some((s) => s === "processing");
  console.log(selectionMap, "selectionMap");
  // Add state for items grouped by PO
  const [itemsByPO, setItemsByPO] = useState<Record<string, LineItem[]>>({});

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await apiClient.post(API_URL, {
        event: "get-list",
        file_id: fileId,
        file_name: fileName,
        state: "sap",
      });

      // const body = res.data.body;
      const body: GetListResponse = res.data.body;
      console.log(body, "sap body");

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

      // Group items by PO
      const grouped: Record<string, LineItem[]> = {};
      (body.items || []).forEach((item) => {
        const po = (item.poNumber as string) || body.poNumber?.[0] || "unknown";
        // const po = item.poNumber || body.poNumber?.[0] || "unknown";
        if (!grouped[po]) grouped[po] = [];
        grouped[po].push(item);
      });
      setItemsByPO(grouped);
      // PO
      setPoList(body.poNumber || []);
      setSelectedPO(body.poNumber?.[0] || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    // When PO changes, if no manual selection exists, fall back to genaiSelected
    if (!selectionMap[selectedPO]) {
      // nothing to do, computedInitialKeys already handles this
      return;
    }
  }, [selectedPO]);

  const handleChange = (key: string, value: string) => {
    setData((prev) =>
      prev.map((item) => (item.key === key ? { ...item, value } : item)),
    );
  };

  const handleRetry = async () => {
    try {
      setRetryLoading(true);
      setIsDirty(false);
      await apiClient.post(API_URL, {
        event: "retry-process",
        file_id: fileId,
        file_name: fileName,
        lang: lang,
        state: "sap",
        data: {
          poNumber: poList,
          data: data.map((i) => ({
            key: i.key,
            value: i.value,
          })),
        },
      });

      startPolling(fileId, goTo, () => current);
      await fetchData(); // refresh
    } catch (err) {
      console.error(err);
    } finally {
      setRetryLoading(false);
    }
  };
  const handleParking = async () => {
    try {
      setRetryLoading(true);

      const payload = {
        event: "update-data",
        file_id: fileId,
        file_name: fileName,
        state: "sap",
        data: {
          poNumber: poList,

          data: data.map((item) => ({
            key: item.key,
            value: item.value,
          })),

          sapReconcile: reconcileData.map((item) => ({
            field: item.key,
            extracted: item.extractedValue,
            sap: item.sapValue,
            selected: item.source,
          })),

          // items: items.map((item, index) => {
          //   const rowKey = `${selectedPO}-${index}`;

          //   return {
          //     ...item,
          //     genaiSelected: (selectionMap[selectedPO] || []).includes(rowKey),
          //   };
          // }),
          items: Object.entries(itemsByPO).flatMap(([po, poItems]) =>
            poItems.map((item, index) => {
              const rowKey = `${po}-${index}`;
              return {
                ...item,
                genaiSelected: (selectionMap[po] || []).includes(rowKey),
              };
            }),
          ),
        },
      };

      console.log(" Parking Payload:", payload);

      await apiClient.post(API_URL, payload);

      startPolling(fileId, goTo, () => current);
    } catch (err) {
      console.error(" Parking API failed:", err);
    } finally {
      setRetryLoading(false);
    }
  };
  const currentData = items;
  console.log(currentData);
  // const handlePOEdit = (oldPO: string, newPO: string) => {
  //   setIsDirty(true);
  //   setPoList((prev) => prev.map((po) => (po === oldPO ? newPO : po)));
  // };
  const handlePOEdit = (oldPO: string, newPO: string) => {
    setIsDirty(true);

    setPoList((prev) => prev.map((po) => (po === oldPO ? newPO : po)));

    setItemsByPO((prev) => {
      const updated = { ...prev };
      if (updated[oldPO]) {
        updated[newPO] = updated[oldPO];
        delete updated[oldPO];
      }
      return updated;
    });
    setSelectionMap((prev) => {
      const updated = { ...prev };
      if (updated[oldPO]) {
        updated[newPO] = updated[oldPO].map((key) =>
          key.replace(`${oldPO}-`, `${newPO}-`),
        );
        delete updated[oldPO];
      }
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-full">
        <Spin />
      </div>
    );
  }

  return (
    // <div className="flex gap-6 h-full">
    //   <PdfPreview />

    //   <div className="w-1/2 border rounded-xl flex flex-col bg-[#F7F9FB] overflow-hidden">

    <div className="w-full h-full flex flex-col bg-[#F7F9FB] overflow-hidden">
      {isAnyProcessing && (
        <ProcessingOverlay
          title="Processing in Progress"
          description="Please wait..."
        />
      )}

      {/* HEADER */}
      <div className="flex justify-start items-center p-6 border-b bg-stepbgheader">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
          <File size={18} /> SAP Reconciliation Data
        </h2>

        {/* <BackButton /> */}
      </div>
      {isDirty && (
        <div className="mb-4">
          <Alert
            message="You have unsaved changes. Click 'Retry Fetch SAP Data' to update data, or they will be lost."
            type="warning"
            showIcon
          />
        </div>
      )}
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
        <br></br>

        {/* RECONCILIATION */}

        <ReconciliationTable data={reconcileData} onChange={setReconcileData} />
        <br></br>

        {poList?.length > 0 && (
          <>
            <h2 className="text-lg font-semibold flex items-center gap-2 text-primary mb-2">
              <File size={18} /> PO Number(s)
            </h2>

            <POSelector
              selectedPO={selectedPO}
              onSelect={setSelectedPO}
              poList={poList}
              onEdit={handlePOEdit}
            />
          </>
        )}
        <br></br>
        {/* 
        {currentData?.length > 0 && (
          <LineItemsTable
            data={currentData}
            selectedPO={selectedPO}
            onChange={setSelectionMap}
          />
        )} */}

        {currentData?.length > 0 && (
          <LineItemsTable
            data={(selectedPO && itemsByPO[selectedPO]) || currentData}
            selectedPO={selectedPO}
            selectionMap={selectionMap} // 👈 pass parent state
            onChange={setSelectionMap}
          />
        )}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t flex justify-between">
        <Button loading={retryLoading} onClick={handleRetry}>
          Retry Fetch SAP Data
        </Button>

        <ForwardButton label="Parking" onClick={handleParking} />
        {/* </div> */}
      </div>
    </div>
  );
}
