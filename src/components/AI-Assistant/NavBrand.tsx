import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

type NavBrandProps = {
  role?: "free" | "premium" | undefined;
};

const NavBrand = ({ role }: NavBrandProps) => {
  const isPremium = role === "premium";

  return (
    <Link to="/" className="flex items-center gap-2 group">
      {/* Logo */}
      <img
        src={logo}
        alt="Logo"
        className="h-9 w-auto object-cover mb-2 md:mb-1 transition-all group-hover:scale-105"
      />

      {/* Name + Badge */}
      <div className="flex flex-col leading-tight">
        {/* Stylish App Name */}
        <span
          className="text-[1.3rem] font-bold text-[#1f2937] tracking-tight"
          style={{
            letterSpacing: "-0.5px",
            textShadow: "0 1px 1px rgba(0,0,0,0.1)",
          }}
        >
          Study Connect
        </span>

        {/* Badge */}
        {role && (
          <div className="mt-[-1px] md:mt-[1px] ml-[1px]">
            {isPremium ? (
              <span className="relative inline-block text-[11px] font-extrabold px-2.5 py-[2px] rounded-md uppercase tracking-wider text-[#0a2540] overflow-hidden border border-yellow-300 bg-yellow-500 shadow-md shimmer-bg">
                <span className="relative z-10">PRO</span>
                <span className="absolute top-0 left-[-150%] w-[250%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-30 shimmer-glow"></span>
              </span>
            ) : (
              <span className="inline-block text-[11px] font-bold px-2.5 py-[2px] rounded-md bg-sky-800 text-gray-100 shadow-sm border border-gray-300 uppercase tracking-wider">
                Free
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default NavBrand;
