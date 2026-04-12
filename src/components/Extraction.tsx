import { useEffect, useState, useRef } from "react";
import { Row, Col, Typography, Button, Alert } from "antd";
import { RotateCcw, File } from "lucide-react";
// import PdfPreview from "./PdfPreview";
// import BackButton from "./BackButton";
// import ForwardButton from "./ForwardButton";
import { useExtraction } from "../hooks/useExtraction";
import { useAppStore } from "../store/useAppStore";
// import type { ExtractionEvent } from "../types/common";
import ProcessingOverlay from "./ProcessingOverlay";
import { usePollDocumentStatus } from "../hooks/usePollDocumentStatus";
import { useStep } from "../hooks/useStep";
import { retryExtractionProcess } from "../services/extractionListService";

const { Text } = Typography;

const formatLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase());

export default function Extraction() {
  const fileId = useAppStore((s) => s.fileId);
  const fileName = useAppStore((s) => s.fileName);
  const progress = useAppStore((s) => s.progress);
  const lang = useAppStore((s) => s.lang);
  // const lang = useAppStore((s) => s.lang);
  const hasRefetchedRef = useRef(false);
  const pollingActive = useAppStore((s) => s.pollingActive);

  // const [event, setEvent] = useState<ExtractionEvent>("get-list");
  // const [retryCount, setRetryCount] = useState(0);
  const [loadingRetry, setLoadingRetry] = useState(false);
  const { startPolling } = usePollDocumentStatus();
  const { current, goTo } = useStep();
  // const [hasRefetched, setHasRefetched] = useState(false);
  const isAnyProcessing =
    !!progress &&
    pollingActive &&
    Object.values(progress).some((s) => s === "processing");

  console.log(progress, pollingActive, "isAnyProcessing");

  const {
    data = { poNumber: [], data: [] },
    isLoading,
    error,
    refetch,
  } = useExtraction(fileId, fileName, "get-list");
  console.log(data);

  const handleRetry = async () => {
    setLoadingRetry(true);
    // setEvent("retry-process");
    // setHasRefetched(false);

    hasRefetchedRef.current = false;

    // await refetch();
    // await
    retryExtractionProcess(fileId, "extract", fileName, lang);

    startPolling(fileId, goTo, () => current);
    setLoadingRetry(false);
  };

  useEffect(() => {
    if (!pollingActive) return;

    if (progress?.extract === "completed" && !hasRefetchedRef.current) {
      hasRefetchedRef.current = true;
      refetch();
    }
  }, [progress?.extract, pollingActive]);

  return (
    <div className="w-full h-full flex flex-col bg-[#F7F9FB] overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-start items-center p-6 border-b bg-stepbgheader">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
          <File size={18} className="text-primary" />
          Extracted Data
        </h2>
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
          <div className="text-red-500 text-sm">
            <Alert
              message="Failed to load extracted data."
              type="error"
              showIcon
            />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {data?.poNumber?.length > 0 && (
              <Col span={24}>
                <div className="bg-[#E9EEF3] rounded-xl p-4 shadow-sm">
                  <Text className="text-xs text-gray-500">PO Numbers</Text>

                  <div className="mt-2 text-sm text-gray-800 break-words">
                    {data.poNumber.filter(Boolean).join(", ") || "--"}
                  </div>
                </div>
              </Col>
            )}

            {(data?.data ?? []).map((item) => {
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
      {/* FOOTER */}
      <div className="p-4 border-t bg-stepbgbody flex justify-end items-center">
        <Button
          icon={<RotateCcw size={16} />}
          loading={loadingRetry}
          onClick={handleRetry}
          disabled={isAnyProcessing}
          className="flex items-center gap-2 border border-borderer text-primary bg-white hover:!bg-secondary hover:!text-white hover:!border-secondary shadow-sm"
        >
          Retry Extraction
        </Button>

        {/* <ForwardButton
            label="Look Up"
            onClick={handleLookUp}
            disabled={isAnyProcessing}
          /> */}
      </div>
      {/* </div> */}
    </div>
  );
}
