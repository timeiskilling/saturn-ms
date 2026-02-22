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

export function AppTest() {
  // This is a React "State" variable. It stores data that can change and update the UI.
  const [name, setName] = useState("");

  const isValid = name.length <= 15;
  return (
    <div className="min-h-screen p-8">
      <div className="p-10 max-w-md mx-auto w-full">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>My Sandbox Page</CardTitle>
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

            {/* This part only shows up if you typed something in the input */}
            {name && (
              <div className="mt-4 p-4 bg-accent text-accent-foreground border rounded-md break-all">
                Welcome to Frontend development,{" "}
                <strong className="text-green-300">{name}</strong>!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
