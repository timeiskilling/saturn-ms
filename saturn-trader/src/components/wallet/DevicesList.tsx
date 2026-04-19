import React, { useEffect, useState } from "react";
import {
  Monitor,
  Trash2,
  Smartphone,
  Laptop,
  Tablet,
  Loader2,
} from "lucide-react";
import {
  getDevices,
  disconnectDevice,
  type ConnectedDevice,
} from "../../api/devices";
import { UAParser } from "ua-parser-js";

/**
 * Utility function to extract OS and Browser names from a User Agent string.
 * Handles edge cases by providing fallbacks or returning a truncated original string.
 */
const parseUserAgent = (uaString: string) => {
  if (!uaString) return "Unknown Device";

  const parser = new UAParser(uaString);
  const os = parser.getOS().name;
  const browser = parser.getBrowser().name;

  if (!os && !browser) {
    // If parsing fails completely, return a truncated version of the original string
    return uaString.length > 30 ? uaString.substring(0, 27) + "..." : uaString;
  }

  return `${os || "Unknown OS"} (${browser || "Unknown Browser"})`;
};

export function DevicesList() {
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const fetchDevices = async () => {
    setIsLoading(true);
    const data = await getDevices();
    if (data) {
      setDevices(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDevices();

    const handleDisconnectEvent = () => {
      fetchDevices();
    };

    window.addEventListener(
      "saturn_device_disconnected",
      handleDisconnectEvent,
    );
    return () => {
      window.removeEventListener(
        "saturn_device_disconnected",
        handleDisconnectEvent,
      );
    };
  }, []);

  const handleDisconnect = async (publicId: string) => {
    setDisconnectingId(publicId);
    const success = await disconnectDevice(publicId);
    if (success) {
      // Local update in case event didn't trigger fast enough
      setDevices((prev) => prev.filter((d) => d.public_id !== publicId));
    }
    setDisconnectingId(null);
  };

  const getDeviceIcon = (deviceName: string) => {
    const name = deviceName.toLowerCase();
    if (
      name.includes("phone") ||
      name.includes("mobile") ||
      name.includes("iphone") ||
      name.includes("android")
    ) {
      return <Smartphone className="w-5 h-5" />;
    }
    if (name.includes("tablet") || name.includes("ipad")) {
      return <Tablet className="w-5 h-5" />;
    }
    if (name.includes("laptop") || name.includes("macbook")) {
      return <Laptop className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">Loading devices...</p>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="mt-4 py-12 flex flex-col items-center justify-center border border-dashed border-zinc-800/80 rounded-2xl bg-zinc-900/30">
        <Monitor className="w-10 h-10 text-zinc-700 mb-3" />
        <p className="text-sm text-zinc-500 font-medium">
          No connected devices.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-4">
      {devices.map((device) => (
        <div
          key={device.public_id}
          className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/30 transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors">
              {getDeviceIcon(device.device_name)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-zinc-200">
                {parseUserAgent(device.device_name)}
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                Created: {new Date(device.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => handleDisconnect(device.public_id)}
            disabled={disconnectingId === device.public_id}
            className="p-2.5 rounded-xl hover:bg-red-500/10 text-zinc-600 hover:text-red-500 transition-all duration-200 disabled:opacity-50"
            title="Disconnect Device"
          >
            {disconnectingId === device.public_id ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
