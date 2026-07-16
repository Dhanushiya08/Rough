import { useState, useEffect } from "react";
import { Modal, Input, Button, Select, Typography, Popconfirm } from "antd";
import type { PromptVersion } from "../types";

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

interface PromptEditorModalProps {
  open: boolean;
  onClose: () => void;
  prompt: PromptVersion | null;
  onSaveDraft: (prompt: PromptVersion) => void;
  onPublish: (prompt: PromptVersion) => void;
}

export default function PromptEditorModal({ open, onClose, prompt, onSaveDraft, onPublish }: PromptEditorModalProps) {
  const [editedPrompt, setEditedPrompt] = useState<PromptVersion | null>(null);

  useEffect(() => {
    if (prompt) {
      setEditedPrompt({ ...prompt });
    } else {
      setEditedPrompt(null);
    }
  }, [prompt]);

  if (!editedPrompt) return null;

  // For visual styling mimicking the wireframes, we don't necessarily block edits entirely 
  // if they want to update a draft, but we can treat Active/Archived as read-only.
  const isReadOnly = editedPrompt.status === "Active" || editedPrompt.status === "Archived";
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedPrompt({ ...editedPrompt, content: e.target.value });
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedPrompt({ ...editedPrompt, description: e.target.value });
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedPrompt({ ...editedPrompt, name: e.target.value });
  };

  return (
    <Modal
      title={null} // custom title inside
      open={open}
      onCancel={onClose}
      width={1000}
      footer={null}
      destroyOnClose
      centered
      closable={false}
      bodyStyle={{ padding: 0 }}
      className="prompt-editor-modal"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-strong">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold text-primary m-0">Edit Prompt \u2014 {editedPrompt.name}</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-200"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-[600px]">
          {/* Left Panel */}
          <div className="w-full md:w-1/3 flex flex-col gap-5 border-r border-gray-200 p-6 bg-gray-50 overflow-y-auto">
            <div>
              <Text className="block text-sm text-gray-600 mb-1">Prompt Name</Text>
              <Input 
                value={editedPrompt.name} 
                onChange={handleNameChange}
                disabled={isReadOnly}
                className="rounded-lg border-gray-300 py-2 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              />
            </div>
            
            <div>
              <Text className="block text-sm text-gray-600 mb-1">Category</Text>
              <Select 
                value={editedPrompt.type} 
                disabled={true} 
                className="w-full shadow-sm"
              >
                <Option value={editedPrompt.type}>{editedPrompt.type}</Option>
              </Select>
            </div>
            
            <div>
              <Text className="block text-sm text-gray-600 mb-1">Version</Text>
              <Input 
                value={editedPrompt.version} 
                disabled={true} 
                className="rounded-lg border-gray-300 py-2 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              />
            </div>

            <div>
              <Text className="block text-sm text-gray-600 mb-1">Status</Text>
              <Select 
                value={editedPrompt.status} 
                disabled={true}
                className="w-full shadow-sm"
              >
                <Option value={editedPrompt.status}>{editedPrompt.status}</Option>
              </Select>
            </div>

            <div className="flex-1 flex flex-col">
              <Text className="block text-sm text-gray-600 mb-1">Description</Text>
              <TextArea 
                value={editedPrompt.description} 
                onChange={handleDescChange}
                disabled={isReadOnly}
                className="flex-1 rounded-lg border-gray-300 resize-none shadow-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                style={{ minHeight: "120px" }}
              />
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-full md:w-2/3 flex flex-col p-6">
            <Text className="block text-sm text-gray-600 mb-2">Prompt Template</Text>
            <TextArea
              value={editedPrompt.content}
              onChange={handleContentChange}
              disabled={isReadOnly}
              className="flex-1 font-mono text-sm resize-none border-gray-300 rounded-lg p-5 bg-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              placeholder="Enter prompt text here..."
            />
            {isReadOnly && (
              <Text type="secondary" className="text-xs mt-2 italic text-gray-500">
                This version is read-only. Create a new version to edit.
              </Text>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-4 bg-gray-50">
          <Button 
            onClick={onClose} 
            className="rounded-lg border border-gray-300 text-gray-700 px-6 py-2 h-auto font-medium hover:bg-gray-100 transition-all duration-200"
          >
            Cancel
          </Button>
          {!isReadOnly && (
            <Button 
              onClick={() => onSaveDraft(editedPrompt)}
              className="rounded-lg border border-gray-300 text-gray-700 px-6 py-2 h-auto font-medium hover:bg-gray-100 transition-all duration-200 shadow-button"
              icon={<span className="text-gray-500">\u21BA</span>}
            >
               Save Draft
            </Button>
          )}
          {editedPrompt.status !== "Active" && (
            <Popconfirm
              title="Publish this prompt?"
              description="This will replace the currently active version. Are you sure?"
              onConfirm={() => onPublish(editedPrompt)}
              okText="Yes, Publish"
              cancelText="Cancel"
            >
              <Button 
                type="primary" 
                className="bg-primary hover:bg-secondary text-white border-none rounded-lg px-6 py-2 h-auto font-medium shadow-button transition-all duration-200"
                icon={<span className="text-white">\u2191</span>}
              >
                Publish
              </Button>
            </Popconfirm>
          )}
        </div>
      </div>
    </Modal>
  );
}
