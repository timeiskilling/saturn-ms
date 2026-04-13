export async function logout(): Promise<boolean> {
  try {
    const response = await fetch("http://localhost:3001/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to logout: ${response.statusText}`);
    }

    window.dispatchEvent(new Event("saturn_wallet_logout"));
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}
