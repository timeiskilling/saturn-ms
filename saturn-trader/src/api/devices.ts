export interface ConnectedDevice {
  public_id: string;
  // Additional fields returned by the backend can be added here
  [key: string]: any;
}

/**
 * Fetches the list of connected devices for the authenticated user.
 */
export async function getDevices(): Promise<ConnectedDevice[] | null> {
  try {
    const response = await fetch("http://localhost:3001/device", {
      method: "GET",
      credentials: "include",
    });

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch devices: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch devices error:", error);
    return null;
  }
}

/**
 * Disconnects a specific target device by its public ID.
 */
export async function disconnectDevice(publicId: string): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:3001/device/${publicId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to disconnect device: ${response.statusText}`);
    }

    window.dispatchEvent(new Event("saturn_device_disconnected"));
    return true;
  } catch (error) {
    console.error("Disconnect device error:", error);
    return false;
  }
}
