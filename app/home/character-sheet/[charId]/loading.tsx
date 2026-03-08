import { LoaderPinwheel } from "lucide-react";

const quotes = [
  "Lost Grace Discovered",
  "Legend Felled",
  "Victory Achieved",
  "You Died",
  "Demigod Felled",
];

export default function CharSheetLoading() {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  return (
    <div className="flex flex-col justify-center items-center h-[100dvh] gap-8 animate-pulse">
      <p className="text-3xl font-bold">{quote}...</p>
      <LoaderPinwheel className="w-8 h-8 animate-spin" />
    </div>
  );
}
