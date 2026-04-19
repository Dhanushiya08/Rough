import { useEffect, useState } from "react";
import { Row, Col, Typography, Input, Button, Alert } from "antd";
import { Tooltip } from "antd";
import apiClient from "../services/apiClient";
import { File, RotateCcw } from "lucide-react";
import type {
  ExtractedItem,
  LineItem,
  ReconciliationItem,
} from "../types/common";
import ForwardButton from "./ForwardButton";
// import BackButton from "./BackButton";
import ReconciliationTable from "./Reconciliationtable";
import toast, { Toaster } from "react-hot-toast";
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
  const [reconcileByPO, setReconcileByPO] = useState<
    Record<string, ReconciliationItem[]>
  >({});

  const [items, setItems] = useState<LineItem[]>([]);
  const [poList, setPoList] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedPO, setSelectedPO] = useState<string>("");
  const setUserManualStep = useAppStore((s) => s.setUserManualStep);
  const { startPolling } = usePollDocumentStatus();
  const [selectionMap, setSelectionMap] = useState<Record<string, string[]>>(
    {},
  );

  const [loading, setLoading] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);
  const [parkLoading, setParkLoading] = useState(false);

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
  // console.log(selectionMap, "selectionMap");
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
      const mappedReconcile: ReconciliationItem[] = body.sapReconcile.map(
        (i: SapReconcileApiItem) => ({
          key: i.field,
          label: formatLabel(i.field),
          extractedValue: i.extracted || "",
          sapValue: i.sap || "",
          value: i.selected === "sap" ? i.sap! : i.extracted!,
          source: i.selected ?? null,
          originalValue: i.extracted || "",
          poNumber: i.poNumber,
        }),
      );
      setReconcileData(mappedReconcile);

      const groupedReconcile: Record<string, ReconciliationItem[]> = {};
      mappedReconcile.forEach((item) => {
        const key = item.poNumber || body.poNumber?.[0] || "unknown";
        if (!groupedReconcile[key]) groupedReconcile[key] = [];
        groupedReconcile[key].push(item);
      });
      setReconcileByPO(groupedReconcile);

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
      setUserManualStep(false);
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
      setParkLoading(true);

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
      toast.success("Updated successful");

      startPolling(fileId, goTo, () => current);
    } catch (err) {
      console.error("Parking API failed:", err);
      toast.error("Failed");
    } finally {
      setParkLoading(false);
    }
  };
  const currentData = items;
  console.log(currentData);

  const handlePORemove = (po: string) => {
    setIsDirty(true);
    const newList = poList.filter((p) => p !== po);
    setPoList(newList);
    setItemsByPO((prev) => {
      const u = { ...prev };
      delete u[po];
      return u;
    });
    setReconcileByPO((prev) => {
      const u = { ...prev };
      delete u[po];
      return u;
    });
    setSelectionMap((prev) => {
      const u = { ...prev };
      delete u[po];
      return u;
    });
    if (selectedPO === po) setSelectedPO(newList[0] || "");
  };

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
        <ProcessingOverlay title="Loading Data" description="Please wait..." />
      </div>
    );
  }
  const handleAddPO = () => {
    if (poList.includes("")) return;
    setPoList((prev) => [...prev, ""]);
    setItemsByPO((prev) => ({ ...prev, "": [] }));
    setSelectedPO("");
  };
  const handleCancelAdd = () => {
    setPoList((prev) => prev.filter((p) => p !== ""));
    setItemsByPO((prev) => {
      const updated = { ...prev };
      delete updated[""];
      return updated;
    });
    setSelectedPO(poList.filter((p) => p !== "")[0] ?? "");
  };
  const truncate = (text: string | undefined, limit: number = 50): string =>
    text && text.length > limit ? text.slice(0, limit) + "..." : text || "--";

  return (
    <div className="w-full h-full flex flex-col bg-stepbgbody border rounded-xl overflow-hidden">
      <Toaster />
      {(retryLoading || parkLoading || isAnyProcessing) && (
        <ProcessingOverlay
          title="Processing Document"
          description="Your request is currently being processed. Please wait and do not make any changes or navigate away."
        />
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center px-4 py-3 border-b bg-stepbgheader border rounded-t-xl">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
          <File size={18} /> SAP Reconciliation
        </h2>
        <div className="flex items-center gap-3">
          <Button
            loading={retryLoading}
            onClick={handleRetry}
            icon={<RotateCcw size={16} />}
          >
            Retry Fetch
          </Button>

          <ForwardButton
            label="Update"
            onClick={handleParking}
            loading={parkLoading}
          />
        </div>

        {/* <BackButton /> */}
      </div>
      {isDirty && (
        <div className="my-4 px-3">
          <Alert
            message="You have unsaved changes. Click 'Retry Fetch SAP Data' to update data, or they will be lost."
            type="warning"
            showIcon
          />
        </div>
      )}
      {/* CONTENT */}
      <div className="flex-1 overflow-auto p-6 thinscroll">
        <ReconciliationTable
          data={(selectedPO && reconcileByPO[selectedPO]) || reconcileData}
          onChange={(updated) => {
            setReconcileData(updated);
            if (selectedPO) {
              setReconcileByPO((prev) => ({ ...prev, [selectedPO]: updated }));
            }
            setIsDirty(true);
          }}
        />
        <br></br>
        {lang !== "english" && (
          <>
            <h2 className="text-lg font-semibold flex items-center gap-2 text-primary mb-2">
              <File size={18} /> PO Number(s)
            </h2>
            <POSelector
              selectedPO={selectedPO}
              onSelect={setSelectedPO}
              poList={poList}
              onEdit={handlePOEdit}
              onAdd={handleAddPO}
              onCancelAdd={handleCancelAdd}
              onRemove={handlePORemove}
              lang={lang}
            />
          </>
        )}
        <br></br>

        {currentData?.length > 0 && (
          <LineItemsTable
            // data={(selectedPO && itemsByPO[selectedPO]) || currentData}
            data={itemsByPO[selectedPO] ?? currentData}
            selectedPO={selectedPO}
            selectionMap={selectionMap}
            onChange={setSelectionMap}
          />
        )}
        <br></br>
        <Row gutter={[16, 16]}>
          {data.map((item) => {
            const isFullWidth =
              item.key === "text" || item.key === "headerText";

            const isEdited =
              item.originalValue && item.value !== item.originalValue;

            const isLong = item.value && item.value.length > 50;

            return (
              <Col span={isFullWidth ? 24 : 12} key={item.key}>
                <div
                  className={`rounded-xl p-4 ${
                    isEdited ? "bg-blue-50" : "bg-[#E9EEF3]"
                  }`}
                >
                  <Text className="text-xs text-gray-500">
                    {formatLabel(item.key)}
                  </Text>

                  {item.editable ? (
                    <Input
                      value={item.value}
                      onChange={(e) => handleChange(item.key, e.target.value)}
                    />
                  ) : (
                    // <div className="text-sm text-gray-800 ">
                    //   {item.value || "--"}
                    // </div>
                    <div className="text-sm text-gray-800 break-words">
                      {isLong ? (
                        <Tooltip
                          title={
                            <div className="max-w-[250px] break-words whitespace-pre-wrap">
                              {item.value}
                            </div>
                          }
                          placement="topLeft"
                        >
                          <span className="cursor-pointer">
                            {truncate(item.value)}
                          </span>
                        </Tooltip>
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
      {/* <div className="p-4 border-t flex justify-between">
        <Button loading={retryLoading} onClick={handleRetry}>
          Retry Fetch SAP Data
        </Button>

        <ForwardButton label="Update" onClick={handleParking} />

      </div> */}
    </div>
  );
}
