"use client";

import React, { useRef, useState, useEffect } from "react";
import { Camera, RefreshCw, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

interface WebcamCaptureProps {
  onCapture: (blob: Blob) => void;
  overlayType?: "face" | "body";
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  onCapture,
  overlayType = "face",
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isInitializing, setIsInitializing] = useState(true);

  const startCamera = async () => {
    setIsInitializing(true);
    setCameraError(null);

    // Stop existing stream if running
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera permission was denied. Please allow camera access in browser settings or use file upload."
          : `Failed to access camera: ${err.message || "Device unavailable"}`
      );
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCapture(blob);
        }
      },
      "image/jpeg",
      0.95
    );
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
      {/* Video Viewport */}
      <div className="relative aspect-[4/3] w-full flex items-center justify-center bg-slate-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
        />

        {/* Hidden Canvas for snapshot extraction */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Optical Alignment Guide Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {overlayType === "face" ? (
            <div className="w-56 h-72 rounded-[48%] border-2 border-dashed border-brand-400/80 shadow-[0_0_20px_rgba(20,184,166,0.3)] flex flex-col items-center justify-between py-6">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-300 bg-slate-950/60 px-2 py-0.5 rounded-full">
                Align Face Here
              </span>
              <span className="text-[10px] text-slate-300 bg-slate-950/60 px-2 py-0.5 rounded-full">
                Ensure Even Lighting
              </span>
            </div>
          ) : (
            <div className="w-52 h-[90%] border-2 border-dashed border-brand-400/70 rounded-2xl flex flex-col items-center justify-between py-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-300 bg-slate-950/60 px-2 py-0.5 rounded-full">
                Head to Toe
              </span>
              <span className="text-[10px] text-slate-300 bg-slate-950/60 px-2 py-0.5 rounded-full">
                Stand 6-8 Feet Away
              </span>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {isInitializing && (
          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-3 text-white">
            <RefreshCw className="w-8 h-8 animate-spin text-brand-400" />
            <p className="text-sm font-medium text-slate-300">Activating optical sensor...</p>
          </div>
        )}

        {/* Error State */}
        {cameraError && (
          <div className="absolute inset-0 bg-slate-950 p-6 flex flex-col items-center justify-center text-center gap-3">
            <ShieldAlert className="w-12 h-12 text-amber-500" />
            <h4 className="text-base font-semibold text-white">Camera Access Required</h4>
            <p className="text-xs text-slate-400 max-w-sm">{cameraError}</p>
            <button
              onClick={startCamera}
              className="mt-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold"
            >
              Retry Camera
            </button>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between px-6">
        <button
          type="button"
          onClick={toggleCamera}
          className="p-3 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors"
          title="Switch Camera"
        >
          <RefreshCw className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={captureFrame}
          disabled={!stream || !!cameraError}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 hover:from-brand-500 hover:to-accent-400 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Camera className="w-5 h-5" />
          <span>Capture Scan</span>
        </button>

        <div className="w-11" />
      </div>
    </div>
  );
};
