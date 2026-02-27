import {
  PhantomProvider,
  useModal,
  darkTheme,
  usePhantom,
} from "@phantom/react-sdk";
import { AddressType } from "@phantom/browser-sdk";

export function PhantomTestApp() {
  return (
    <PhantomProvider
      config={{
        providers: ["google", "apple", "injected", "deeplink"], // Enabled auth methods
        appId: "your-app-id", // Get your app ID from phantom.com/portal
        addressTypes: [AddressType.solana, AddressType.ethereum],
        authOptions: {
          redirectUrl: "https://yourapp.com/auth/callback", // Must be whitelisted in Phantom Portal
        },
      }}
      theme={darkTheme}
      appIcon="https://your-app.com/icon.png"
      appName="Your App Name"
    >
      <WalletComponent />
    </PhantomProvider>
  );
}

function WalletComponent() {
  const { open, close, isOpened } = useModal();
  const { isConnected, user } = usePhantom();

  if (isConnected) {
    return (
      <div>
        <p>Connected</p>
      </div>
    );
  }

  return <button onClick={open}>Connect Wallet</button>;
}
