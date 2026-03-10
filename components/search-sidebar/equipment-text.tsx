export default function EquipmentText({ data, subSection = 0 }) {
  return (
    <div
      className={subSection > 0 ? "pl-4 border-l-2 border-l-red-200 mt-2" : ""}
    >
      {Object.entries(data).map(([key, value], i) => {
        return (
          key !== "index" && (
            <div key={`${key}-${i}`} className="mb-2 text-sm">
              <p className="text-xs font-semibold text-muted-foreground capitalize">
                {key.replaceAll("_", " ")}
              </p>
              {typeof value === "object" &&
              !Array.isArray(value) &&
              value !== null ? (
                <EquipmentText data={value} subSection={subSection + 1} />
              ) : Array.isArray(value) && value !== null ? (
                value.map((val, j) => {
                  return typeof val === "object" &&
                    !Array.isArray(val) &&
                    value !== null ? (
                    <EquipmentText
                      key={`${val}-${j}`}
                      data={val}
                      subSection={subSection + 1}
                    />
                  ) : (
                    <p key={`${val}-${j}`} className="mb-2">
                      {val}
                    </p>
                  );
                })
              ) : (
                <p>{String(value)}</p>
              )}
            </div>
          )
        );
      })}
    </div>
  );
}
