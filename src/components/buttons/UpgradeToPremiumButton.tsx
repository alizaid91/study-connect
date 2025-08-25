import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { openPremiumComingSoon } from "../../store/slices/globalPopups";
import { useLocation, useNavigate } from "react-router-dom";

interface UpgradeToPremiumButtonProps {
  text?: string;
  extraClasses?: string;
}

export const UpgradeToPremiumButton = ({
  text,
  extraClasses,
}: UpgradeToPremiumButtonProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, profile } = useSelector((state: RootState) => state.auth);

  const handleClick = async () => {
    if (!user || !user.uid || !profile) {
      navigate("/auth#login");
      return;
    }

    if (profile.subscriptionProcessing) {
      dispatch(openPremiumComingSoon());
      return;
    }

    if(pathname === "/pricing"){
      navigate("/checkout");
    }else{
      navigate("/pricing");
    }
  };
  return (
    <div className={`${extraClasses}`}>
      <button
        onClick={handleClick}
        className="w-full rounded-3xl text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 font-medium text-center"
      >
        {text || "Upgrade to Pro"}
      </button>
    </div>
  );
};
