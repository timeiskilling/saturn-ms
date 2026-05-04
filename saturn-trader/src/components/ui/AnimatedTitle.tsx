import { useScrambleText } from "@/hooks/useScrambleText";

export function AnimatedTitle() {
  const animatedWord = useScrambleText("Saturn Thanks", true);

  return (
    <h1 className="font-mono text-2xl font-bold text-green-500 tracking-wider">
      {animatedWord}
    </h1>
  );
}
