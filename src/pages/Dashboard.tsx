import { Table, Tag, Input, Select } from "antd";
import { useState, useEffect, useRef } from "react";
import { Eye, Upload } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { getTableData, getTableCount } from "../services/dashboardService";
import type { DataType } from "../services/dashboardService";

const { Option } = Select;

const PAGE_SIZE = 8;

export default function Dashboard() {
  const [data, setData] = useState<DataType[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    DataType["status"] | undefined
  >(undefined);
  const [stateFilter, setStateFilter] = useState<DataType["state"] | undefined>(
    undefined,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const openStepper = useAppStore((s) => s.openStepper);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleView = (record: DataType) => {
    openStepper(record.file_id, record.file_name, record.state, true);
  };

  const fetchAll = (
    search: string,
    status: DataType["status"] | undefined,
    state: DataType["state"] | undefined,
    page: number,
  ) => {
    const filters = {
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
      ...(state ? { state } : {}),
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
    page: number,
  ) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchAll(search, status, state, page);
    }, 400);
  };

  useEffect(() => {
    scheduleFetch(searchText, statusFilter, stateFilter, currentPage);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText, statusFilter, stateFilter, currentPage]);

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
  const langColorMap = {
    english: "blue",
    bahasa: "green",
    mandarin: "orange",
  };

  const columns = [
    {
      title: "Created At",
      dataIndex: "created_at",
      render: (created_at: string) => {
        if (!created_at) return "-";
        const date = new Date(created_at.replace(" ", "T"));
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
      title: "Language",
      dataIndex: "lang",
      render: (lang: DataType["lang"]) => (
        <Tag
          color={langColorMap[lang]}
          className="capitalize px-3 py-1 rounded-full"
          variant={"outlined"}
        >
          {lang}
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
          onClick={() => openStepper("", "", "upload")}
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
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex-1 min-h-0 overflow-auto">
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="file_id"
          pagination={{
            current: currentPage,
            pageSize: PAGE_SIZE,
            total,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
          }}
          className="custom-ant-table rounded-lg h-full"
        />
      </div>
    </div>
  );
}
