import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import AutoSizeInput from "../auto-size-input";

type CustomEdgeData = {
  onUpdateLabel?: (value: string) => void;
};

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  selected,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const labelText = typeof label === "string" ? label : "";
  const edgeData = (data ?? {}) as CustomEdgeData;

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan absolute"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          {selected ? (
            <AutoSizeInput
              value={labelText}
              onChange={(value) => edgeData.onUpdateLabel?.(value)}
              className="nodrag nopan rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground outline-none"
              minWidthPx={24}
            />
          ) : labelText === "" ? (
            <></>
          ) : (
            <span className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground">
              {labelText || ""}
            </span>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
