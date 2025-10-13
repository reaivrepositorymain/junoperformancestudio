"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(false);
      setTimeout(() => {
        router.replace('/auth/2.0/login');
      }, 700); // Wait for fade-down animation before redirect
    }, 2000); // 2 second delay for welcome message

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Animated Shapes Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Image
          src="/resources/shapes/RECURSOS GRAFICOS-1.png"
          alt=""
          width={280}
          height={280}
          className="absolute top-4 left-4 animate-shape1 opacity-70"
          style={{ zIndex: 1 }}
        />
        <Image
          src="/resources/shapes/RECURSOS GRAFICOS-2.png"
          alt=""
          width={200}
          height={200}
          className="absolute top-1/2 left-0 animate-shape2 opacity-60"
          style={{ zIndex: 1 }}
        />
        <Image
          src="/resources/shapes/RECURSOS GRAFICOS-3.png"
          alt=""
          width={240}
          height={240}
          className="absolute bottom-6 right-6 animate-shape3 opacity-60"
          style={{ zIndex: 1 }}
        />
        <Image
          src="/resources/shapes/RECURSOS GRAFICOS-4.png"
          alt=""
          width={180}
          height={180}
          className="absolute bottom-1/3 left-1/2 animate-shape4 opacity-50"
          style={{ zIndex: 1 }}
        />
        <Image
          src="/resources/shapes/RECURSOS GRAFICOS-5.png"
          alt=""
          width={160}
          height={160}
          className="absolute top-1/4 right-1/4 animate-shape5 opacity-50"
          style={{ zIndex: 1 }}
        />
        <Image
          src="/resources/shapes/RECURSOS GRAFICOS-6.png"
          alt=""
          width={200}
          height={200}
          className="absolute bottom-0 left-1/4 animate-shape6 opacity-40"
          style={{ zIndex: 1 }}
        />
      </div>

      {/* Main Content */}
      <div className={`text-center space-y-12 px-8 relative z-10 transition-all duration-700 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}>
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image
            src="/resources/images/juno login-logo.svg"
            alt="Juno logo"
            width={180}
            height={90}
            className="drop-shadow-2xl animate-pulse"
            priority
          />
        </div>

        {/* Welcome Message */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-black/90 mb-5 text-center animate-fade-in-delay">
            Proposal Management Portal
          </h2>
          <p className="text-black/80 text-center mb-6 text-base lg:text-lg leading-relaxed max-w-md mx-auto animate-fade-in-delay">
            Access proposals, track progress, and collaborate seamlessly with your team.
          </p>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center items-center space-x-3 mt-12">
          <div className="w-4 h-4 bg-[#E84912] rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-[#F6A100] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-4 h-4 bg-[#53B36A] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>

        <p className="text-lg text-black/60 animate-pulse">
          Initializing your workspace...
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.3s both;
        }
        @keyframes shape1 {
          0% { transform: translateY(0) scale(1) rotate(0deg);}
          50% { transform: translateY(-30px) scale(1.05) rotate(10deg);}
          100% { transform: translateY(0) scale(1) rotate(0deg);}
        }
        @keyframes shape2 {
          0% { transform: translateX(0) scale(1);}
          50% { transform: translateX(40px) scale(1.1);}
          100% { transform: translateX(0) scale(1);}
        }
        @keyframes shape3 {
          0% { transform: translateY(0) scale(1);}
          50% { transform: translateY(30px) scale(0.95);}
          100% { transform: translateY(0) scale(1);}
        }
        @keyframes shape4 {
          0% { transform: translateX(0) rotate(0deg);}
          50% { transform: translateX(-30px) rotate(8deg);}
          100% { transform: translateX(0) rotate(0deg);}
        }
        @keyframes shape5 {
          0% { transform: scale(1);}
          50% { transform: scale(1.15);}
          100% { transform: scale(1);}
        }
        @keyframes shape6 {
          0% { transform: translateY(0);}
          50% { transform: translateY(-25px);}
          100% { transform: translateY(0);}
        }
        .animate-shape1 { animation: shape1 6s ease-in-out infinite; }
        .animate-shape2 { animation: shape2 7s ease-in-out infinite; }
        .animate-shape3 { animation: shape3 5.5s ease-in-out infinite; }
        .animate-shape4 { animation: shape4 8s ease-in-out infinite; }
        .animate-shape5 { animation: shape5 6.5s ease-in-out infinite; }
        .animate-shape6 { animation: shape6 7.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}