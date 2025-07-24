import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const TypingIndicator = () => {
  return (
    <div className="relative w-[80px] h-[36px] overflow-hidden flex items-center justify-center">
      <div className="absolute scale-[2] -top-[22px]">
        <DotLottieReact
          src="https://lottie.host/1bea38f5-281d-4637-a40b-d72f6d33fb72/7X4zLkcUxE.lottie"
          loop
          autoplay
          style={{ width: "80px", height: "80px" }}
        />
      </div>
    </div>
  );
};

export default TypingIndicator;
