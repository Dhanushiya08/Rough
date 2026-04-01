import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
// import { Document, Page, pdfjs } from "react-pdf";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash.debounce";
import apiClient from "../services/apiClient";
// import pdfFile from "../assets/1900000253.pdf";

//  Worker (IMPORTANT)
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.mjs",
//   import.meta.url,
// ).toString();

// styles
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// 🔹 Schema
const schema = z.object({
  companyCode: z.string(),
  supplier: z.string().optional(),
  reference: z.string().optional(),
  amount: z.string().optional(),
  currency: z.string().optional(),
  documentDate: z.string().optional(),
  text: z.string().optional(),
  headerText: z.string().optional(),
  assignment: z.string().optional(),
  baselineDate: z.string().optional(),
  cbs: z.string().optional(),
  internalOrder: z.string().optional(),
});

// type FormData = z.infer<typeof schema>;
type FormData = z.output<typeof schema>;

export default function Step3({ fileUrl }: { fileUrl?: string }) {
  console.log(fileUrl);
  const { register, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyCode: "8439",
      cbs: "",
    },
  });

  const [loadingCBS, setLoadingCBS] = useState(false);

  //  PDF states
  // const [numPages, setNumPages] = useState<number>(0);
  // const [scale, setScale] = useState(1);

  const cbsValue = watch("cbs");
  const reference = watch("reference");
  const documentDate = watch("documentDate");

  //  Debounced CBS lookup
  const debouncedFetch = useMemo(
    () =>
      debounce(async (cbs: string) => {
        if (!cbs) return;

        try {
          setLoadingCBS(true);

          const res = await apiClient.get(`/lookup/internal-order?cbs=${cbs}`);

          if (res.data?.orderNumber) {
            setValue("internalOrder", res.data.orderNumber);
          } else {
            setValue("internalOrder", "");
          }
        } catch (err) {
          console.log(err);
          setValue("internalOrder", "");
        } finally {
          setLoadingCBS(false);
        }
      }, 500),
    [setValue],
  );

  useEffect(() => {
    debouncedFetch(cbsValue ?? "");
    return () => debouncedFetch.cancel();
  }, [cbsValue]);

  useEffect(() => {
    setValue("assignment", reference || "");
  }, [reference, setValue]);

  useEffect(() => {
    setValue("baselineDate", documentDate || "");
  }, [documentDate, setValue]);

  //  PDF load success
  // const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
  //   console.log("Total pages:", numPages);
  //   setNumPages(numPages);
  // };

  return (
    <div className="flex gap-6 h-screen">
      {/* 🔹 LEFT - PDF VIEWER */}
      <div className="w-1/2 border rounded-xl bg-gray-100 overflow-auto p-3">
        {/* 🔹 Controls */}
        <div className="flex items-center justify-between mb-3">
          {/* <p className="text-sm">Total Pages: {numPages}</p> */}

          <div className="flex gap-2">
            <button
              // onClick={() => setScale((prev) => Math.max(prev - 0.2, 0.5))}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              ➖
            </button>

            <button
              // onClick={() => setScale((prev) => Math.min(prev + 0.2, 3))}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              ➕
            </button>
          </div>
        </div>

        {/* 🔹 PDF */}
        {/*  <Document
          file={fileUrl || pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => console.error("PDF error:", err)}
        >
          {Array.from(new Array(numPages), (_, index) => (
            <Page
              key={index}
              pageNumber={index + 1}
              scale={scale}
              className="mb-4"
            />
          ))}
        </Document>*/}
      </div>

      {/* 🔹 RIGHT - FORM */}
      <div className="w-1/2 border rounded-xl p-6 overflow-auto">
        <h2 className="text-lg font-semibold mb-6">
          Extracted Fields (Editable)
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Company Code</label>
            <input
              {...register("companyCode")}
              disabled
              className="w-full border rounded-md p-2 bg-gray-100"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Supplier</label>
            <input {...register("supplier")} className="w-full border p-2" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Reference</label>
            <input {...register("reference")} className="w-full border p-2" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Amount</label>
            <input {...register("amount")} className="w-full border p-2" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Currency</label>
            <input {...register("currency")} className="w-full border p-2" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Document Date</label>
            <input
              type="date"
              {...register("documentDate")}
              className="w-full border p-2"
            />
          </div>

          <div className="col-span-2">
            <label className="text-sm text-gray-600">Text</label>
            <input {...register("text")} className="w-full border p-2" />
          </div>

          <div className="col-span-2">
            <label className="text-sm text-gray-600">Header Text</label>
            <input {...register("headerText")} className="w-full border p-2" />
          </div>

          <div>
            <label className="text-sm text-gray-600">Assignment</label>
            <input {...register("assignment")} className="w-full border p-2" />
          </div>

          <div>
            <label className="text-sm text-gray-600">Baseline Date</label>
            <input
              type="date"
              {...register("baselineDate")}
              className="w-full border p-2"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">CBS</label>
            <input {...register("cbs")} className="w-full border p-2" />
            {loadingCBS && (
              <span className="text-xs text-gray-400">Checking CBS...</span>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600">Internal Order</label>
            <input
              {...register("internalOrder")}
              disabled
              className="w-full border p-2 bg-gray-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
