import { useState, useRef } from 'react';
import { Upload, FileText, XCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from './ui/Card';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        // Validar tipo (PDF ou Excel no futuro)
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf') ||
            file.name.endsWith('.xlsx')) {
            setSelectedFile(file);
            onFileSelect(file);
        } else {
            alert('Por favor, envie um arquivo PDF ou Excel.');
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <Card className={`border-dashed border-2 transition-all duration-300 ${dragActive
            ? 'border-gold-500 bg-gold-500/10 scale-[1.02]'
            : 'border-gray-300 dark:border-chumbo-700 bg-gray-50 dark:bg-chumbo-900/30'
            }`}>
            <CardContent className="p-6">
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.xlsx,.xls"
                    onChange={handleChange}
                />

                {!selectedFile ? (
                    <div
                        className="flex flex-col items-center justify-center text-center cursor-pointer group"
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                    >
                        <div className={`p-4 rounded-full mb-3 transition-colors ${dragActive
                            ? 'bg-gold-500/20'
                            : 'bg-gray-200 dark:bg-chumbo-800 group-hover:bg-gray-300 dark:group-hover:bg-chumbo-700'
                            }`}>
                            <Upload className={`w-6 h-6 transition-colors ${dragActive
                                ? 'text-gold-500'
                                : 'text-gray-600 dark:text-chumbo-400 group-hover:text-gray-800 dark:group-hover:text-chumbo-200'
                                }`} />
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-chumbo-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                            Arraste seu Balancete (PDF/Excel)
                        </p>
                        <p className="text-xs text-gray-500 dark:text-chumbo-500 mt-1">
                            ou clique para selecionar
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-100 dark:bg-chumbo-800/50 border-gray-300 dark:border-chumbo-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium text-gray-900 dark:text-chumbo-200 truncate max-w-[200px]">
                                    {selectedFile.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-gray-600 dark:text-chumbo-500">
                                        {(selectedFile.size / 1024).toFixed(0)} KB
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/30 border-green-300 dark:border-green-900/50 px-1.5 py-0.5 rounded border">
                                        <CheckCircle className="w-3 h-3" /> Pronto
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={removeFile}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-chumbo-700 rounded-full text-gray-600 dark:text-chumbo-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Remover arquivo"
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
