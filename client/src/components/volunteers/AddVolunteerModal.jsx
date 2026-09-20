import React, { useEffect, useState } from "react";

export function AddVolunteerModal({
  volunteer,
  clubs = [],
  activeClubId = null,
  onClose,
  onAdd,
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Volunteer");
  const [team, setTeam] = useState("");
  const [selectedClub, setSelectedClub] = useState(activeClubId || (clubs.length > 0 ? clubs[0]._id || clubs[0].id : ""));

  const isEditing = Boolean(volunteer);

  // Fill form when editing
  useEffect(() => {
    if (volunteer) {
      setName(
        volunteer.name ||
        volunteer.fullName ||
        ""
      );

      setRole(
        volunteer.role ||
        volunteer.position ||
        "Volunteer"
      );

      setTeam(
        volunteer.team ||
        volunteer.field ||
        ""
      );
      setSelectedClub(volunteer.club?.id || volunteer.club || activeClubId || (clubs.length > 0 ? clubs[0]._id || clubs[0].id : ""));
    } else {
      setName("");
      setRole("Volunteer");
      setTeam("");
      setSelectedClub(activeClubId || (clubs.length > 0 ? clubs[0]._id || clubs[0].id : ""));
    }
  }, [volunteer, activeClubId, clubs]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    if (!team.trim()) {
      return;
    }

    onAdd({
      name: name.trim(),
      role: role.trim() || "Volunteer",
      team: team.trim(),
      clubId: selectedClub,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background: "rgba(0,0,0,0.7)",
      }}
    >

      <div
        className="w-full max-w-md rounded-2xl border p-6"
        style={{
          background: "#111118",
          borderColor: "#272733",
        }}
      >

        {/* Header */}
        <div className="flex items-center justify-between mb-6">

          <div>
            <h2 className="text-xl font-bold text-white">
              {isEditing
                ? "Edit Volunteer"
                : "Add Volunteer"}
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              {isEditing
                ? "Update volunteer details."
                : "Add a new volunteer to your club."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Name */}
          <div>

            <label className="block text-sm text-gray-300 mb-2">
              Volunteer Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter volunteer name"
              className="w-full px-3 py-2.5 rounded-lg text-white outline-none"
              style={{
                background: "#0a0a0f",
                border: "1px solid #272733",
              }}
            />

          </div>

          {/* Role */}
          <div>

            <label className="block text-sm text-gray-300 mb-2">
              Role
            </label>

            <input
              type="text"
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
              placeholder="e.g. Volunteer, Coordinator"
              className="w-full px-3 py-2.5 rounded-lg text-white outline-none"
              style={{
                background: "#0a0a0f",
                border: "1px solid #272733",
              }}
            />

          </div>

          {/* Team / Field */}
          <div>

            <label className="block text-sm text-gray-300 mb-2">
              Team / Field
            </label>

            <input
              type="text"
              value={team}
              onChange={(e) =>
                setTeam(e.target.value)
              }
              placeholder="e.g. Creative Team, Technical Team"
              className="w-full px-3 py-2.5 rounded-lg text-white outline-none"
              style={{
                background: "#0a0a0f",
                border: "1px solid #272733",
              }}
            />

          </div>

          {/* Club Selection */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Assign to Club
            </label>
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-white outline-none"
              style={{
                background: "#0a0a0f",
                border: "1px solid #272733",
              }}
            >
              {clubs.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white"
              style={{
                background: "#1b1b24",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm text-white font-semibold"
              style={{
                background: "#4f46e5",
              }}
            >
              {isEditing
                ? "Save Changes"
                : "Add Volunteer"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}