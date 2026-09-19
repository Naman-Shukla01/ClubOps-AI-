import React from "react";

export function VolunteerCard({
  volunteer,
  canManage = false,
  onEdit,
  onDelete,
}) {
  if (!volunteer) {
    return null;
  }

  const name =
    volunteer.name ||
    volunteer.fullName ||
    "Volunteer";

  const role =
    volunteer.role ||
    volunteer.position ||
    "Volunteer";

  const team =
    volunteer.team ||
    volunteer.field ||
    "General";

  const status =
    volunteer.status ||
    "active";

  return (
    <div
      className="rounded-xl p-5 border transition hover:border-indigo-500/40"
      style={{
        background: "#111118",
        borderColor: "#272733",
      }}
    >

      {/* Header */}
      <div className="flex items-center gap-4">

        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
          style={{
            background:
              "rgba(79,70,229,0.18)",
          }}
        >
          👤
        </div>

        <div className="min-w-0 flex-1">

          <h3 className="text-white font-semibold truncate">
            {name}
          </h3>

          <p className="text-gray-400 text-sm">
            {role}
          </p>

        </div>

      </div>

      {/* Team */}
      <div className="mt-5 flex items-center justify-between">

        <span className="text-gray-400 text-sm">
          Team / Field
        </span>

        <span className="text-white text-sm text-right ml-4">
          {team}
        </span>

      </div>

      {/* Status */}
      <div className="mt-3 flex items-center justify-between">

        <span className="text-gray-400 text-sm">
          Status
        </span>

        <span
          className={`px-2 py-1 rounded-md text-xs ${String(status).toLowerCase() === "active"
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-gray-500/10 text-gray-400"
            }`}
        >
          {status}
        </span>

      </div>

      {/* Actions */}
      {canManage && (
        <div className="mt-5 pt-4 border-t border-gray-800 flex gap-2">

          <button
            onClick={() =>
              onEdit?.(volunteer)
            }
            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-white transition"
            style={{
              background: "#252535",
            }}
          >
            Edit
          </button>

          <button
            onClick={() =>
              onDelete?.(volunteer)
            }
            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-red-400 transition hover:bg-red-500/10"
          >
            Delete
          </button>

        </div>
      )}

    </div>
  );
}