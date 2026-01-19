"use client";

import dynamic from "next/dynamic";
import React from "react";

const FlagGallery = dynamic(() => import("@/components/FlagGallery"), {
  ssr: false,
});

const page = () => {
  return (
    <div className="w-screen h-screen">
      <FlagGallery />
    </div>
  );
};

export default page;
