import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";

type CustomNodeProps = {
  selected: boolean;
  data: {
    name: string;
    job: string;
    emoji: string;
    note: string;
  };
};

function CustomNode({ data, selected = false }: CustomNodeProps) {
  return (
    <div
      className={cn(
        `px-4 py-2 rounded-md border border-stone-700 transition-all ${selected ? "border-primary shadow-[0_0_30px] shadow-primary" : ""} `,
        "bg-gradient-to-t from-[#17171b] to-card dark:bg-card",
      )}
    >
      <div className="flex">
        <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
          {data.emoji}
        </div>
        <div className="ml-2">
          <div className="text-lg text-primary font-bold">{data.name}</div>
          <div className="text-gray-500">{data.job}</div>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-teal-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-teal-500"
      />
    </div>
  );
}

export default memo(CustomNode);
