import { useSelector } from "react-redux";
import { useMemo } from "react";
import { Crown } from "lucide-react";
import { RootState } from "../../store";
import { DEFAULT_AVATAR } from "../../types/user";

const AvatarWithProgress = ({ onClick }: { onClick: () => void }) => {
  const { profile } = useSelector((state: RootState) => state.auth);

  const completionPercentage = useMemo(() => {
    if (!profile) return 0;

    const fields = [
      "email",
      "fullName",
      "username",
      "avatarUrl",
      "gender",
      "branch",
      "pattern",
      "semester",
      "collegeName",
    ];

    // If not FE, also include year
    if (profile.branch !== "FE") fields.push("year");

    const filled = fields.filter((field) => {
      const value = profile[field as keyof typeof profile];
      return value !== undefined && value !== null && value !== "";
    });

    return Math.round((filled.length / fields.length) * 100);
  }, [profile]);

  const degree = (completionPercentage / 100) * 360;

  return (
    <button
      onClick={onClick}
      className="relative w-10 h-10 group focus:outline-none"
    >
      <div
        className="w-full h-full rounded-full p-[2px]"
        style={{
          background: `conic-gradient(#10b981 ${degree}deg, #e5e7eb ${degree}deg)`,
        }}
      >
        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
          <img
            src={profile?.avatarUrl || DEFAULT_AVATAR.male}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>
      </div>

      {profile?.role === "premium" && (
        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 shadow-md shadow-yellow-500/30">
          <Crown className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  );
};

export default AvatarWithProgress;
