import { useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
// You don't need the Input import for the hidden field
// import { Input } from "../../../components/ui/input"; 
import { Upload } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const MAX_FILE_SIZE_MB = 50;
const ALLOWED_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export function FileUpload({ onFileSelect }: FileUploadProps) {
  // Explicitly type the ref as HTMLInputElement
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert("File size exceeds 50MB limit");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Invalid file type. Upload CSV, XLS, or XLSX only.");
      return;
    }

    onFileSelect(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Helper to trigger click safely
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop bubbling to the parent div
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Data File</CardTitle>
        <CardDescription>
          Upload a CSV, XLS, or XLSX file to begin deduplication
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div
          className={`border-2 rounded-lg p-12 text-center transition-colors cursor-pointer
            ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-dashed hover:border-primary/50"
            }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          // Only trigger if the click wasn't on the button itself (though stopPropagation handles this)
          onClick={() => fileInputRef.current?.click()} 
        >
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />

          <p className="font-medium mb-2">
            Click to upload or drag and drop
          </p>

          <p className="text-sm text-muted-foreground mb-4">
            Supports CSV, XLS, XLSX (Max 50MB)
          </p>

          <Button
            type="button"
            onClick={handleButtonClick}
          >
            Select File
          </Button>

          {/* CHANGE HERE: Used native <input> instead of custom <Input> component */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileChange}
            className="hidden" // Ensure 'hidden' class exists in your CSS or Tailwind
            style={{ display: 'none' }} // Fallback inline style to ensure it's hidden
          />
        </div>
      </CardContent>
    </Card>
  );
}