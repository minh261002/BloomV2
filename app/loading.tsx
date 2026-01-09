import React from "react";
import Image from "next/image";

const GlobalLoading = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="flex justify-center">
          <div className="relative w-48 h-24">
            <Image
              src="/images/logo.svg"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            Đang tải...
          </h1>
          <p className="text-sm text-muted-foreground">
            Vui lòng chờ trong giây lát
          </p>
        </div>

        {/* Animated Loading Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="bg-secondary rounded-full h-1">
            <div
              className="bg-primary h-1 rounded-full animate-pulse"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>

        <div className="flex justify-center space-x-3">
          <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-ping"></div>
          <div
            className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-ping"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-ping"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoading;
