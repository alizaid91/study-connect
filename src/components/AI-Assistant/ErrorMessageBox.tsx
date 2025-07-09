import { AlertTriangle } from "lucide-react";
import { SlClose } from "react-icons/sl";

interface ErrorMessageBoxProps {
    message: string;
}

const ErrorMessageBox: React.FC<ErrorMessageBoxProps> = ({ message }) => {
    return (
        <div className="w-full bg-red-100 border border-red-300 text-red-800 rounded-xl p-4 mt-4 shadow-sm flex items-center gap-3 max-w-[300px] sm:max-w-sm md:max-w-md  mx-auto">
            <AlertTriangle className="w-6 h-6 shrink-0 text-red-500" />
            <div className="flex-1 text-sm font-medium">{message}</div>
        </div>
    );
};

export default ErrorMessageBox;
