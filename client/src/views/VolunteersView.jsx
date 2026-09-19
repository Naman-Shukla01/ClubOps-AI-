import React, { useState, useEffect } from "react";
import { VolunteerCard } from "../components/volunteers/VolunteerCard";
import { AddVolunteerModal } from "../components/volunteers/AddVolunteerModal";
import { dev1Service } from "../services/dev1Service";

export function VolunteersView({ user }) {
  const [volunteers, setVolunteers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVolunteer, setEditingVolunteer] =
    useState(null);
  const [loading, setLoading] = useState(true);

  const clubId =
    user?.activeClubId || "default";

  const isClubHead =
    user?.role === "club-head";

  useEffect(() => {
    loadVolunteers();
  }, [clubId]);

  // -----------------------------------------
  // Load Volunteers
  // -----------------------------------------
  const loadVolunteers = async () => {
    setLoading(true);

    const storageKey =
      `volunteers_${clubId}`;

    // 1. LocalStorage
    try {
      const stored =
        localStorage.getItem(storageKey);

      if (stored) {
        const parsed =
          JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setVolunteers(parsed);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error(
        "Error reading volunteers:",
        error
      );

      localStorage.removeItem(storageKey);
    }

    // 2. Backend
    let data = [];

    try {
      if (
        dev1Service &&
        typeof dev1Service.getVolunteers ===
        "function"
      ) {
        const response =
          await dev1Service.getVolunteers();

        data = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        data = data.filter(
          (volunteer) =>
            !volunteer.clubId ||
            String(volunteer.clubId) ===
            String(clubId)
        );
      }
    } catch (error) {
      console.warn(
        "Volunteer API unavailable:",
        error
      );

      data = [];
    }

    // 3. Demo fallback
    if (data.length === 0) {
      data = [
        {
          id: `${clubId}-vol-1`,
          name: "Club Volunteer",
          role: "Volunteer",
          team: "General",
          status: "active",
          clubId: clubId,
        },
      ];
    }

    setVolunteers(data);

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error(
        "Could not save volunteers:",
        error
      );
    }

    setLoading(false);
  };

  // -----------------------------------------
  // Open Add Modal
  // -----------------------------------------
  const handleOpenAdd = () => {
    setEditingVolunteer(null);
    setShowModal(true);
  };

  // -----------------------------------------
  // Open Edit Modal
  // -----------------------------------------
  const handleEdit = (volunteer) => {
    setEditingVolunteer(volunteer);
    setShowModal(true);
  };

  // -----------------------------------------
  // Add / Update Volunteer
  // -----------------------------------------
  const handleSave = async (form) => {
    let updatedVolunteers;

    // EDIT
    if (editingVolunteer) {
      const updatedVolunteer = {
        ...editingVolunteer,
        ...form,
        clubId: clubId,
      };

      updatedVolunteers =
        volunteers.map((volunteer) =>
          String(volunteer.id) ===
            String(editingVolunteer.id)
            ? updatedVolunteer
            : volunteer
        );

      // Try backend update
      try {
        if (
          dev1Service &&
          typeof dev1Service.updateVolunteer ===
          "function"
        ) {
          await dev1Service.updateVolunteer(
            editingVolunteer.id,
            updatedVolunteer
          );
        }
      } catch (error) {
        console.warn(
          "Volunteer updated locally, but backend update failed:",
          error
        );
      }
    }

    // ADD
    else {
      const newVolunteer = {
        ...form,
        id: Date.now(),
        status: "active",
        clubId: clubId,
      };

      updatedVolunteers = [
        ...volunteers,
        newVolunteer,
      ];

      // Try backend create
      try {
        if (
          dev1Service &&
          typeof dev1Service.createVolunteer ===
          "function"
        ) {
          await dev1Service.createVolunteer(
            newVolunteer
          );
        }
      } catch (error) {
        console.warn(
          "Volunteer saved locally, but backend save failed:",
          error
        );
      }
    }

    // Update UI
    setVolunteers(updatedVolunteers);

    // Save locally
    try {
      localStorage.setItem(
        `volunteers_${clubId}`,
        JSON.stringify(updatedVolunteers)
      );
    } catch (error) {
      console.error(
        "Could not save volunteers:",
        error
      );
    }

    setShowModal(false);
    setEditingVolunteer(null);
  };

  // -----------------------------------------
  // Delete Volunteer
  // -----------------------------------------
  const handleDelete = async (volunteer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${volunteer.name || "this volunteer"}?`
    );

    if (!confirmed) {
      return;
    }

    const updatedVolunteers =
      volunteers.filter(
        (item) =>
          String(item.id) !==
          String(volunteer.id)
      );

    setVolunteers(updatedVolunteers);

    // Save locally
    try {
      localStorage.setItem(
        `volunteers_${clubId}`,
        JSON.stringify(updatedVolunteers)
      );
    } catch (error) {
      console.error(
        "Could not update localStorage:",
        error
      );
    }

    // Try backend delete
    try {
      if (
        dev1Service &&
        typeof dev1Service.deleteVolunteer ===
        "function"
      ) {
        await dev1Service.deleteVolunteer(
          volunteer.id
        );
      }
    } catch (error) {
      console.warn(
        "Volunteer deleted locally, but backend delete failed:",
        error
      );
    }
  };

  return (
    <div className="w-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h2 className="text-2xl font-bold text-white">
            Volunteers
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Manage volunteers for the active club
          </p>
        </div>

        {isClubHead && (
          <button
            onClick={handleOpenAdd}
            className="bg-accent hover:bg-accentHover text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            + Add Volunteer
          </button>
        )}

      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-400">
            Loading volunteers...
          </p>
        </div>
      )}

      {/* Volunteer Cards */}
      {!loading &&
        volunteers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {volunteers.map(
              (volunteer, index) => (
                <VolunteerCard
                  key={
                    volunteer?.id ||
                    `volunteer-${index}`
                  }
                  volunteer={volunteer}
                  canManage={isClubHead}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )
            )}

          </div>
        )}

      {/* Empty State */}
      {!loading &&
        volunteers.length === 0 && (
          <div className="text-center py-12">

            <div className="text-5xl mb-3">
              👥
            </div>

            <p className="text-gray-400">
              No volunteers yet
            </p>

            {isClubHead && (
              <button
                onClick={handleOpenAdd}
                className="mt-4 bg-accent hover:bg-accentHover text-white px-4 py-2 rounded-xl text-sm font-semibold"
              >
                + Add Volunteer
              </button>
            )}

          </div>
        )}

      {/* Add / Edit Modal */}
      {showModal && (
        <AddVolunteerModal
          volunteer={editingVolunteer}
          onClose={() => {
            setShowModal(false);
            setEditingVolunteer(null);
          }}
          onAdd={handleSave}
        />
      )}

    </div>
  );
}