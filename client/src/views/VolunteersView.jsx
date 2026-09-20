import React, { useState, useEffect } from "react";
import { VolunteerCard } from "../components/volunteers/VolunteerCard";
import { AddVolunteerModal } from "../components/volunteers/AddVolunteerModal";
import { dev1Service } from "../services/dev1Service";

export function VolunteersView({ user }) {
  const [volunteers, setVolunteers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);

  const clubId = user?.activeClubId || null;
  const isClubHead = user?.role === "club-head" || user?.role === "lead" || user?.role === "EVENT_MANAGER" || user?.role === "ADMIN";

  useEffect(() => {
    loadVolunteers();
  }, [clubId]);

  const loadVolunteers = async () => {
    setLoading(true);

    try {
      if (dev1Service && typeof dev1Service.getVolunteers === "function") {
        const response = await dev1Service.getVolunteers(clubId);
        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        setVolunteers(data);
      } else {
        setVolunteers([]);
      }
    } catch (error) {
      console.warn("Volunteer API error:", error);
      setVolunteers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingVolunteer(null);
    setShowModal(true);
  };

  const handleEdit = (volunteer) => {
    setEditingVolunteer(volunteer);
    setShowModal(true);
  };

  const handleSave = async (form) => {
    if (editingVolunteer) {
      const updatedVolunteer = {
        ...editingVolunteer,
        ...form,
        clubId: form.clubId || clubId,
      };

      setVolunteers((prev) =>
        prev.map((v) => (String(v.id) === String(editingVolunteer.id) ? updatedVolunteer : v))
      );

      try {
        if (dev1Service && typeof dev1Service.updateVolunteer === "function") {
          await dev1Service.updateVolunteer(editingVolunteer.id, updatedVolunteer);
          await loadVolunteers();
        }
      } catch (error) {
        console.warn("Volunteer backend update failed:", error);
      }
    } else {
      const newVolunteerPayload = {
        name: form.name?.trim() || "New Volunteer",
        email: form.email?.trim() || `${Date.now()}@clubops.ai`,
        skills: typeof form.skills === 'string' ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : (form.skills || []),
        capacity: Number(form.capacity) || 50,
        status: form.status || "active",
        clubId: form.clubId || clubId,
      };

      try {
        await dev1Service.createVolunteer(newVolunteerPayload);
        await loadVolunteers();
      } catch (error) {
        console.warn("Volunteer backend create failed:", error);
        setVolunteers((prev) => [...prev, { ...newVolunteerPayload, id: Date.now() }]);
      }
    }

    setShowModal(false);
    setEditingVolunteer(null);
  };

  const handleDelete = async (volunteer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${volunteer.name || "this volunteer"}?`
    );

    if (!confirmed) return;

    setVolunteers((prev) => prev.filter((item) => String(item.id) !== String(volunteer.id)));

    try {
      if (dev1Service && typeof dev1Service.deleteVolunteer === "function") {
        await dev1Service.deleteVolunteer(volunteer.id);
        await loadVolunteers();
      }
    } catch (error) {
      console.warn("Backend volunteer delete failed:", error);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Volunteers
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {user?.activeClubName ? `${user.activeClubName} · ` : ''}Manage volunteers
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
      {!loading && volunteers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {volunteers.map((volunteer, index) => (
            <VolunteerCard
              key={volunteer?.id || `volunteer-${index}`}
              volunteer={volunteer}
              canManage={isClubHead}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && volunteers.length === 0 && (
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
          clubs={user?.joinedClubs || (user?.activeClubId ? [{ id: user.activeClubId, name: user.activeClubName }] : [])}
          activeClubId={clubId}
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

export default VolunteersView;