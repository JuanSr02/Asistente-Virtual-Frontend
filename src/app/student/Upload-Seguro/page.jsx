import { useRef } from "react";
import { Upload } from "lucide-react";

export default function UploadSeguro({
  isUpdate = false,
  onFileReady,
  disabled,
}) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const files = e.target.files;
    if (files?.length > 0) {
      onFileReady(Array.from(files), isUpdate);
    }
  };

  return (
    <div className="w-full sm:w-auto">
      <label
        className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-white text-sm cursor-pointer ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        <Upload className="w-4 h-4" />
        {isUpdate ? "Actualizar" : "Subir Historia"}
        <input
          type="file"
          accept=".pdf,.xls,.xlsx"
          ref={inputRef}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />
      </label>
    </div>
  );
}
