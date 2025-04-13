"use client";

import dynamic from "next/dynamic";

const TerminalView = dynamic(() => import("./terminal-view"), { ssr: false });

export default TerminalView;
