import { Table, Tag, Input, Select, Tooltip } from "antd";
import { useState, useEffect, useRef } from "react";
import { Eye, RefreshCw, Upload, Copy, Download } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import {
  getTableData,
  getTableCount,
  exportExcel,
} from "../services/dashboardService";
import type { DataType } from "../services/dashboardService";
import ProcessingOverlay from "../components/ProcessingOverlay";
import toast from "react-hot-toast";

const { Option } = Select;

const PAGE_SIZE = 10;

export default function Dashboard() {
  const [data, setData] = useState<DataType[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    DataType["status"] | undefined
  >(undefined);
  const [stateFilter, setStateFilter] = useState<DataType["state"] | undefined>(
    undefined,
  );
  const [langFilter, setLangFilter] = useState<DataType["lang"] | undefined>(
    undefined,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copiedRow, setCopiedRow] = useState<string | null>(null);

  const openStepper = useAppStore((s) => s.openStepper);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleView = (record: DataType) => {
    console.log(record, "onclick record");
    openStepper(
      record.file_id,
      record.file_name,
      record.lang,
      record.state,
      true,
    );
  };

  const fetchAll = (
    search: string,
    status: DataType["status"] | undefined,
    state: DataType["state"] | undefined,
    lang: DataType["lang"] | undefined,
    page: number,
  ) => {
    const filters = {
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
      ...(state ? { state } : {}),
      ...(lang ? { lang } : {}),
    };

    setLoading(true);
    Promise.all([
      getTableData({ ...filters, page, pageSize: PAGE_SIZE }),
      getTableCount(filters),
    ])
      .then(([rows, count]) => {
        setData(rows);
        setTotal(count);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const scheduleFetch = (
    search: string,
    status: DataType["status"] | undefined,
    state: DataType["state"] | undefined,
    lang: DataType["lang"] | undefined,
    page: number,
  ) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchAll(search, status, state, lang, page);
    }, 400);
  };

  useEffect(() => {
    scheduleFetch(
      searchText,
      statusFilter,
      stateFilter,
      langFilter,
      currentPage,
    );
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText, statusFilter, stateFilter, langFilter, currentPage]);

  const handleSearchChange = (val: string) => {
    setSearchText(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: DataType["status"] | undefined) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleStateChange = (val: DataType["state"] | undefined) => {
    setStateFilter(val);
    setCurrentPage(1);
  };
  const handleLangChange = (val: DataType["lang"] | undefined) => {
    setLangFilter(val);
    setCurrentPage(1);
  };
  const handleCopy = async (value?: string, fileId?: string) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);

      setCopiedRow(fileId || null);
      toast.success("Copied");

      setTimeout(() => {
        setCopiedRow(null);
      }, 2000);
    } catch (error) {
      toast.error("Copy failed");
      console.log(error);
    }
  };
  const statusColorMap: Record<DataType["status"], string> = {
    pending: "default",
    processing: "blue",
    waiting: "orange",
    completed: "green",
    failed: "red",
  };

  const stateColorMap: Record<DataType["state"], string> = {
    extract: "purple",
    lookup: "cyan",
    sap: "geekblue",
    park: "magenta",
  };

  type LanguageValue = "english" | "apical-english" | "bahasa" | "mandarin";

  const languageOptions = [
    // { label: "English - WLNG - Canada", value: "english" },
    // { label: "Apical English", value: "apical-english" },
    // { label: "Bahasa - Apical / Asia Agri", value: "bahasa" },
    // { label: "Mandarin - Sateri / Asia Symbol", value: "mandarin" },
    { label: "WLNG - Canada", value: "english" },
    { label: "Apical English", value: "apical-english" },
    { label: "Apical / Asia Agri", value: "bahasa" },
    { label: "Sateri / Asia Symbol", value: "mandarin" },
  ] as const;

  const langColorMap: Record<LanguageValue, string> = {
    english: "blue",
    "apical-english": "purple",
    bahasa: "green",
    mandarin: "orange",
  };

  const langLabelMap = languageOptions.reduce<Record<LanguageValue, string>>(
    (acc, item) => {
      acc[item.value] = item.label;
      return acc;
    },
    {} as Record<LanguageValue, string>,
  );
  const handleRefresh = () => {
    fetchAll(searchText, statusFilter, stateFilter, langFilter, currentPage);
  };
  const handleExport = async () => {
    if (!langFilter) return;

    try {
      setLoading(true);

      const presignedUrl = await exportExcel({
        page: currentPage,
        lang: langFilter,
      });

      if (!presignedUrl) {
        toast.error("Export URL not found");
        return;
      }

      window.open(presignedUrl, "_blank");

      toast.success("Excel export started");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export excel");
    } finally {
      setLoading(false);
    }
  };
  const columns = [
    {
      title: "Created At",
      dataIndex: "created_at",
      render: (created_at: string) => {
        if (!created_at) return "-";

        const date = new Date(created_at.replace(" ", "T") + "Z");
        if (isNaN(date.getTime())) return "-";

        return new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Asia/Singapore",
        }).format(date);
      },
    },

    {
      title: "File Name",
      dataIndex: "file_name",
      render: (text: string) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
    },
    {
      title: "Business Group",
      dataIndex: "lang",
      render: (lang: DataType["lang"]) => (
        // <Tag
        //   color={langColorMap[lang]}
        //   className="capitalize px-3 py-1 rounded-full"
        //   variant={"outlined"}
        // >
        //   {lang}
        // </Tag>
        <Tag
          color={langColorMap[lang]}
          className="capitalize px-3 py-1 rounded-full"
          variant="outlined"
        >
          {langLabelMap[lang]}
        </Tag>
      ),
    },
    {
      title: "State",
      dataIndex: "state",
      render: (state: DataType["state"]) => (
        <Tag
          color={stateColorMap[state]}
          className="capitalize px-3 py-1 rounded-full"
          variant={"outlined"}
        >
          {state}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: DataType["status"]) => (
        <Tag
          color={statusColorMap[status]}
          className="capitalize px-3 py-1 rounded-full font-medium"
          variant={"outlined"}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Invoice Doc Number",
      dataIndex: "invoice_doc_number",
      render: (_: unknown, record: DataType) => {
        const value = record?.invoice_doc_number?.toString()?.trim();

        if (!value) {
          return <span className="text-gray-400">-</span>;
        }

        return (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800">{value}</span>

            <Tooltip title={copiedRow === record.file_id ? "Copied" : "Copy"}>
              <button
                type="button"
                // onClick={() => handleCopy(value)}
                onClick={() => handleCopy(value, record.file_id)}
                className="text-gray-500 hover:text-primary transition"
              >
                <Copy size={16} />
              </button>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: DataType) => {
        const isDisabled = record.status === "pending";

        return (
          <button
            disabled={isDisabled}
            onClick={() => handleView(record)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition
    ${
      isDisabled
        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
        : "bg-stepbgbody text-primary hover:bg-blue-100"
    }`}
          >
            <Eye size={16} />
            View
          </button>
        );
      },
    },
  ];

  return (
    <div className="h-full flex flex-col stepbgheader px-10 py-4">
      {/* HEADER */}
      <div className="mb-5 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-primary">
            Parking Data History
          </h2>
          <p className="text-gray-500 text-sm">
            Track file processing across all stages
          </p>
        </div>

        <button
          onClick={() => openStepper("", "", "", "upload")}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow hover:bg-blue-800 transition"
        >
          <Upload size={18} />
          Upload
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-4 flex flex-wrap gap-4">
        <Input
          placeholder="Search file name..."
          value={searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-64"
          allowClear
          onClear={() => handleSearchChange("")}
        />

        <Select
          placeholder="Status"
          allowClear
          className="w-44"
          onChange={handleStatusChange}
        >
          <Option value="pending">Pending</Option>
          <Option value="processing">Processing</Option>
          <Option value="waiting">Waiting</Option>
          <Option value="completed">Completed</Option>
          <Option value="failed">Failed</Option>
        </Select>

        <Select
          placeholder="State"
          allowClear
          className="w-44"
          onChange={handleStateChange}
        >
          <Option value="extract">Extract</Option>
          <Option value="lookup">Lookup</Option>
          <Option value="sap">SAP</Option>
          <Option value="park">Park</Option>
        </Select>
        <Select
          placeholder="Business Group"
          allowClear
          className="w-56"
          onChange={handleLangChange}
        >
          <Option value="english">WLNG - Canada</Option>
          <Option value="apical-english">Apical English</Option>
          <Option value="bahasa">Apical / Asia Agri</Option>
          <Option value="mandarin">Sateri / Asia Symbol</Option>
        </Select>
        {/* <button
          onClick={handleExport}
          disabled={!langFilter || loading}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition
      ${
        !langFilter || loading
          ? "bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-200 "
          : "bg-green-600 text-white hover:bg-green-700"
      }`}
        >
          <Download size={15} />
          Export Excel
        </button> */}
        <Tooltip
          title={
            !langFilter
              ? "Please choose the Business Group to export the data"
              : "You can export every 10 records based on the selected Business Group"
          }
        >
          <span>
            <button
              onClick={handleExport}
              disabled={!langFilter || loading}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition
      ${
        !langFilter || loading
          ? "bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-200"
          : "bg-green-600 text-white hover:bg-green-700"
      }`}
            >
              <Download size={15} />
              Export Excel
            </button>
          </span>
        </Tooltip>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex-1 min-h-0 overflow-auto">
        {loading ? (
          <ProcessingOverlay
            title="Loading your table data"
            description="Loading data, this may take a few seconds..."
          />
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            rowKey="file_id"
            pagination={{
              current: currentPage,
              pageSize: PAGE_SIZE,
              total,
              onChange: (page) => setCurrentPage(page),
              showSizeChanger: false,
            }}
            className="custom-ant-table rounded-lg h-full overflow-auto"
          />
        )}
      </div>
    </div>
  );
}
