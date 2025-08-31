import { useState, useEffect } from "react";
import { apiService } from "../../services/apiService";
import { DEFAULT_AVATAR } from "../../types/user";

interface UploaderInfoProps {
  username: string;
  className?: string;
}

interface UploaderData {
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
}

const UploaderInfo = ({ username, className = "" }: UploaderInfoProps) => {
  const [uploaderData, setUploaderData] = useState<UploaderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUploaderDetails = async () => {
      if (!username) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);
        const result = await apiService.getUploaderDetails(username);
        
        if (result.success && result.data) {
          setUploaderData(result.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch uploader details:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUploaderDetails();
  }, [username]);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
      </div>
    );
  }

  if (error || !uploaderData) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-xs text-gray-600">?</span>
        </div>
        <span className="text-sm text-gray-600">{username}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={uploaderData.avatarUrl || DEFAULT_AVATAR.male}
        alt={uploaderData.fullName || uploaderData.username}
        className="w-6 h-6 rounded-full object-cover border border-gray-200"
        onError={(e) => {
          (e.target as HTMLImageElement).src = DEFAULT_AVATAR.male;
        }}
      />
      <span className="text-sm text-gray-700 font-medium">
        {uploaderData.fullName || uploaderData.username}
      </span>
    </div>
  );
};

export default UploaderInfo;
