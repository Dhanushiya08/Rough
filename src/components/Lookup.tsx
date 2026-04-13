import { useState, useEffect } from "react";
import { Row, Col, Typography, Input, Button, Alert } from "antd";
import { File, RotateCcw } from "lucide-react";
// import PdfPreview from "./PdfPreview";
// import ForwardButton from "./ForwardButton";
// import BackButton from "./BackButton";
import { useAppStore } from "../store/useAppStore";
import ProcessingOverlay from "./ProcessingOverlay";
import { useLookup } from "../hooks/useLookup";
import { retryLookupProcess } from "../services/lookupListService";
import type { LookupItem } from "../types/lookup";
import { usePollDocumentStatus } from "../hooks/usePollDocumentStatus";
import { useStep } from "../hooks/useStep";

const { Text } = Typography;

const formatLabel = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

export default function Lookup() {
  const fileId = useAppStore((s) => s.fileId);
  const fileName = useAppStore((s) => s.fileName);
  const progress = useAppStore((s) => s.progress);
  const pollingActive = useAppStore((s) => s.pollingActive);
  const lang = useAppStore((s) => s.lang);
  const { startPolling } = usePollDocumentStatus();
  const { current, goTo } = useStep();
  const isAnyProcessing =
    !!progress &&
    pollingActive &&
    Object.values(progress).some((s) => s === "processing");

  const {
    data = { poNumber: [], data: [] },
    isLoading,
    error,
    refetch,
  } = useLookup(fileId);

  const [localData, setLocalData] = useState<LookupItem[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [loadingRetry, setLoadingRetry] = useState(false);

  useEffect(() => {
    setLocalData(data.data);
    setIsDirty(false);
  }, [data.data]);

  const handleChange = (key: string, value: string) => {
    const updated = localData.map((item) =>
      item.key === key ? { ...item, value } : item,
    );

    setLocalData(updated);
    setIsDirty(true);
  };

  const handleRetry = async () => {
    setLoadingRetry(true);

    try {
      await retryLookupProcess(fileId, "lookup", fileName, lang, {
        poNumber: data.poNumber,
        data: localData,
      });

      startPolling(fileId, goTo, () => current);

      await refetch();

      setIsDirty(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRetry(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-stepbgbody overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-center p-6 border-b bg-stepbgheader border rounded-xl">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
          <File size={18} />
          Lookup Data
        </h2>
        <Button
          icon={<RotateCcw size={16} />}
          loading={loadingRetry}
          disabled={isAnyProcessing}
          onClick={handleRetry}
        >
          Retry Look Up
        </Button>
        {/* <BackButton /> */}
      </div>
      {/* CONTENT */}
      <div className="flex-1 overflow-auto p-6">
        {isAnyProcessing ? (
          <ProcessingOverlay
            title="Processing Document"
            description="Your request is currently being processed. Please wait and do not make any changes or navigate away."
          />
        ) : isLoading ? (
          <div className="flex justify-center items-center h-full w-full">
            <ProcessingOverlay
              title="Loading Data"
              description="Please wait..."
            />
          </div>
        ) : error ? (
          <div className="mx-2">
            <Alert message="Failed to load data" type="error" />
          </div>
        ) : (
          <>
            {isDirty && (
              <div className="mb-4">
                <Alert
                  message="You have unsaved changes. Click 'Retry Look Up' to save them, or they will be lost."
                  type="warning"
                  showIcon
                />
              </div>
            )}

            <Row gutter={[16, 16]}>
              {/* PO Numbers */}
              {data.poNumber.length > 0 && (
                <Col span={24}>
                  <div className="bg-[#E9EEF3] rounded-xl p-4 shadow-sm">
                    <Text className="text-xs text-gray-500">PO Numbers</Text>
                    <div className="mt-2 text-sm">
                      {data.poNumber.join(", ")}
                    </div>
                  </div>
                </Col>
              )}

              {/* Fields */}
              {localData.map((item: LookupItem) => {
                const isFullWidth =
                  item.key === "text" || item.key === "headerText";

                const isEdited =
                  item.originalValue && item.value !== item.originalValue;

                const isDisabled = item.dependsOn
                  ? !localData.find((i) => i.key === item.dependsOn)?.value
                  : false;

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
                          disabled={isDisabled}
                          onChange={(e) =>
                            handleChange(item.key, e.target.value)
                          }
                          className="mt-2"
                        />
                      ) : (
                        <div className="mt-2 text-sm">{item.value || "--"}</div>
                      )}
                    </div>
                  </Col>
                );
              })}
            </Row>
          </>
        )}
      </div>
      {/* FOOTER */}
      {/* <div className="p-4 border-t flex justify-end items-center">
        <Button
          icon={<RotateCcw size={16} />}
          loading={loadingRetry}
          disabled={isAnyProcessing}
          onClick={handleRetry}
        >
          Retry Look Up
        </Button>

        <ForwardButton label="Next Step" disabled={isAnyProcessing} />
      </div> */}
    </div>
  );
}
