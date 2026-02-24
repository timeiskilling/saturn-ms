import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { BasicCard } from "./saturnComponents/card";
import { BasicInput } from "./saturnComponents/input";
import { TradingViewWidget } from "./saturnComponents/tradingView";

export function AppTest() {
  const [name, setName] = useState("");

  const isValid = name.length <= 15;
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <div className="shrink-0">
        <BasicCard
          title="Some text"
          className="flex rounded-none border-t-0 border-x-0 border-y-0"
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <BasicCard
          title="Account Settings"
          description="Manage your account details and preferences."
          footer={<button className="">Save Changes</button>}
          className="w-64 md:w-60 h-full rounded-none border-y-0 border-l-0 shadow-none overflow-y-auto shrink-0" // Custom styling for the main Card wrapper
          classNames={{
            title: "text-blue-600 text-xl", // Custom styling for the Title
            content: "flex flex-col gap-4", // Custom styling for the Content body
            description: "",
          }}
        >
          {/* The children are automatically rendered inside CardContent */}
          <BasicInput
            placeholder="Enter your Username..."
            value={name}
            onChange={(e) => {
              if (e.target.value.length <= 15) {
                setName(e.target.value);
              }
            }}
            maxLength={15}
          />
          <BasicInput
            placeholder="Enter your Password..."
            value={name}
            onChange={(e) => {
              if (e.target.value.length <= 15) {
                setName(e.target.value);
              }
            }}
            maxLength={15}
          />

          <Button
            variant={"link"}
            className="bg-zinc-100 text-zinc-900 hover:bg-zinc-300 font-semibold"
          >
            Some
          </Button>
        </BasicCard>
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 min-h-0">
            <TradingViewWidget />
          </div>
          <div className="h-12 border-t border-zinc-800 bg-zinc-950 p-4 shrink-0">
            <h3 className="text-zinc-400 text-sm font-semibold mb-4">
              Bottom Panel (Orders, History, etc.)
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

{
  /* <Card className="shadow-xl w-full max-w-md bg-zinc-900 border-zinc-800">
  <CardHeader>
    <CardTitle>My Sandbox Page</CardTitle>
    <CardContent className=""></CardContent>
  </CardHeader>
  <CardContent className="flex flex-col gap-4">
    <p className="text-zinc-400">
      Type your name below to see React in action!
    </p>

    <Input
      placeholder="Enter your name..."
      value={name}
      onChange={(e) => {
        if (e.target.value.length <= 15) {
          setName(e.target.value);
        }
      }}
      maxLength={15}
      className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500"
    />

    <Button
      variant="secondary"
      className="bg-zinc-100 text-zinc-900 hover:bg-zinc-300 font-semibold"
      onClick={() => alert(`Hello, ${name}!`)}
    >
      Say Hello
    </Button>

    {/* This part only shows up if you typed something in the input */
}
{
  /*
  {
    name && (
      <div className="mt-4 p-4 bg-accent text-accent-foreground border rounded-md break-all">
        Welcome to Frontend development,{" "}
        <strong className="text-green-300">{name}</strong>!
      </div>
    )
  }
  </CardContent >
</Card >
*/
}
