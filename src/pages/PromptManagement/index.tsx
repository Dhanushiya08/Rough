import { useState } from "react";
import { Typography, Table, Button, Input, Select } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import type { PromptType, PromptVersion } from "./types";
import { MOCK_PROMPTS } from "./mockData";
import PromptEditorModal from "./components/PromptEditorModal";
import toast from "react-hot-toast";

const { Title, Text } = Typography;
const { Option } = Select;

export default function PromptManagement() {
  const [selectedType, setSelectedType] = useState<PromptType>("Base Prompt");
  const [prompts, setPrompts] = useState<PromptVersion[]>(MOCK_PROMPTS);
  const [globalSearch, setGlobalSearch] = useState("");
  const [innerSearch, setInnerSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptVersion | null>(null);

  const filteredPrompts = prompts.filter(p => {
    const matchesType = p.type === selectedType;
    const matchesGlobal = p.name.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesInner = innerSearch ? 
      (p.business?.toLowerCase().includes(innerSearch.toLowerCase()) || p.name.toLowerCase().includes(innerSearch.toLowerCase())) 
      : true;
    const matchesStatus = statusFilter === "All Statuses" || p.status === statusFilter;
    
    return matchesType && matchesGlobal && matchesInner && matchesStatus;
  });

  const handleEdit = (prompt: PromptVersion) => {
    setEditingPrompt(prompt);
    setIsModalOpen(true);
  };

  const handleCreateNewVersion = () => {
    // Basic template for a new prompt
    const newPrompt: PromptVersion = {
      id: `new-${Date.now()}`,
      name: `New ${selectedType}`,
      type: selectedType,
      business: selectedType === "Main Prompt" ? "Apical" : "Global",
      version: 1.0,
      status: "Draft",
      description: "",
      content: "",
      createdAt: new Date().toISOString(),
      createdBy: "Current User",
    };

    setEditingPrompt(newPrompt);
    setIsModalOpen(true);
  };

  const handleSaveDraft = (updatedPrompt: PromptVersion) => {
    setPrompts(prev => {
      const exists = prev.find(p => p.id === updatedPrompt.id);
      if (exists) {
        return prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p);
      } else {
        return [updatedPrompt, ...prev];
      }
    });
    toast.success("Draft saved successfully");
    setIsModalOpen(false);
  };

  const handlePublish = (updatedPrompt: PromptVersion) => {
    const promptToPublish = { ...updatedPrompt, status: "Active" as const };
    
    setPrompts(prev => {
      // Deactivate current active for this group
      let newPrompts = prev.map(p => {
        if (p.type === promptToPublish.type && p.business === promptToPublish.business && p.status === "Active") {
          return { ...p, status: "Archived" as const };
        }
        return p;
      });

      // Add or update the published one
      const exists = newPrompts.find(p => p.id === promptToPublish.id);
      if (exists) {
        newPrompts = newPrompts.map(p => p.id === promptToPublish.id ? promptToPublish : p);
      } else {
        newPrompts = [promptToPublish, ...newPrompts];
      }

      return newPrompts;
    });

    toast.success("Prompt published and activated successfully");
    setIsModalOpen(false);
  };

  const tabs: PromptType[] = [
    "Base Prompt", 
    "Consolidation Prompt", 
    "Classification Prompt", 
    "Main Prompt"
  ];

  const globalColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Version",
      dataIndex: "version",
      key: "version",
      render: (v: number) => <span className="text-gray-700">v{v}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span className={`px-3 py-1 rounded-full border text-xs ${
          status === "Active" ? "border-green-300 text-green-600" :
          status === "Draft" ? "border-orange-300 text-orange-600" :
          "border-gray-300 text-gray-500"
        }`}>
          {status}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: PromptVersion) => (
        <Button 
          type="default" 
          size="small" 
          onClick={() => handleEdit(record)} 
          className="border-gray-300 rounded-md text-xs"
        >
          {record.status === "Draft" ? "Edit \u2192" : "View \u2192"}
        </Button>
      ),
    },
  ];

  const mainPromptColumns = [
    {
      title: "Business Group",
      dataIndex: "business",
      key: "business",
      render: (text: string) => <span className="font-medium text-gray-800">{text}</span>
    },
    {
      title: "Active Prompt",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Version",
      dataIndex: "version",
      key: "version",
      render: (v: number) => <span className="text-gray-700">v{v}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span className={`px-3 py-1 rounded-full border text-xs ${
          status === "Active" ? "border-gray-800 text-gray-800" :
          "border-gray-300 text-gray-500"
        }`}>
          {status}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: PromptVersion) => (
        <Button 
          type="default" 
          size="small" 
          onClick={() => handleEdit(record)} 
          className="border-gray-400 rounded-md text-xs"
        >
          {record.status === "Draft" ? "Edit \u2192" : "View \u2192"}
        </Button>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col bg-stepbgbody overflow-hidden">

      <div className="p-6 flex-1 flex flex-col min-h-0">
        {/* Horizontal Tabs */}
        <div className="flex gap-3 mb-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => {
                setSelectedType(tab);
                setInnerSearch("");
              }}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                selectedType === tab 
                  ? "bg-heplercolor border-primary text-primary shadow-sm" 
                  : "bg-white border-borderer text-gray-600 hover:bg-stepbgheader hover:-translate-y-[1px]"
              }`}
            >
              {tab === "Main Prompt" ? "Main Prompts" : tab}
            </button>
          ))}
        </div>

        {/* Inner Content Area */}
        <div className="bg-white border border-borderer rounded-2xl flex-1 flex flex-col min-h-0 shadow-soft overflow-hidden">
          {/* Inner Header/Filters */}
          <div className="p-5 border-b border-borderer flex justify-between items-center bg-white">
            <div className="flex items-center gap-3">
              <Input
                placeholder={selectedType === "Main Prompt" ? "Search business..." : "Search..."}
                prefix={<SearchOutlined className="text-gray-400 mr-2" />}
                className="rounded-lg w-72 py-1.5"
                value={innerSearch}
                onChange={(e) => setInnerSearch(e.target.value)}
              />
              <Select 
                defaultValue="All Statuses" 
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-40"
              >
                <Option value="All Statuses">All Statuses</Option>
                <Option value="Active">Active</Option>
                <Option value="Draft">Draft</Option>
                <Option value="Archived">Archived</Option>
              </Select>
            </div>

            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              className="bg-primary hover:bg-secondary rounded-lg border-none text-white px-5 shadow-button transition-all duration-200"
              onClick={handleCreateNewVersion}
            >
              Create {selectedType === "Main Prompt" ? "Main Prompt" : "Prompt"}
            </Button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto bg-white">
            <Table 
              dataSource={filteredPrompts}
              columns={selectedType === "Main Prompt" ? mainPromptColumns : globalColumns}
              rowKey="id"
              pagination={false}
              className="custom-ant-table [&_.ant-table-thead_th]:bg-stepbgheader [&_.ant-table-thead_th]:text-xs [&_.ant-table-thead_th]:uppercase [&_.ant-table-row]:bg-white"
            />
          </div>
        </div>
      </div>

      <PromptEditorModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        prompt={editingPrompt}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />
    </div>
  );
}
