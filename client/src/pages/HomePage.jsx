import React, { useState, useEffect } from "react";
import Dashboard from "../components/Dashboard";
import ReceiverList from "../components/ReceiverList";
import BottomSheet from "../components/BottomSheet";
import EditReceiverForm from "../components/EditReceiverForm";
import SkeletonDashboard from "../components/SkeletonDashboard";
import YearSelector from "../components/YearSelector"; // Import
import axios from "axios";

const HomePage = () => {
  const [selectedYear, setSelectedYear] = useState(2026); // Default year
  const [receivers, setReceivers] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  // BottomSheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingReceiver, setEditingReceiver] = useState(null);

  const fetchData = async () => {
    setLoading(true); // Show loading state when switching years
    try {
      const [recRes, sumRes] = await Promise.all([
        axios.get(`/api/receivers?year=${selectedYear}`),
        axios.get(`/api/summary?year=${selectedYear}`),
      ]);
      setReceivers(recRes.data);
      setSummary(sumRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear]); // Re-fetch when year changes

  // Open sheet for adding new receiver
  const handleAddNew = () => {
    setEditingReceiver({
      name: "",
      children_count: 1,
      amount_per_packet: 10,
      cash_note: 10,
      is_eligible: true,
      year: selectedYear, // Default to selected year
    });
    setIsSheetOpen(true);
  };

  // Open sheet for editing existing receiver
  const handleEdit = (receiver) => {
    setEditingReceiver(receiver);
    setIsSheetOpen(true);
  };

  // Save receiver (add or update)
  const handleSave = async (receiverData) => {
    try {
      if (receiverData.id) {
        // Update existing
        await axios.put(`/api/receivers/${receiverData.id}`, receiverData);
      } else {
        // Create new
        await axios.post("/api/receivers", {
          ...receiverData,
          year: selectedYear,
        });
      }
      setIsSheetOpen(false);
      setEditingReceiver(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to save. Please try again.");
    }
  };

  // Delete receiver
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/receivers/${id}`);
      setIsSheetOpen(false);
      setEditingReceiver(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete. Please try again.");
    }
  };

  // Toggle received status
  const handleToggleReceived = async (id, newStatus) => {
    try {
      // Optimistic update
      setReceivers((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_received: newStatus } : r)),
      );

      await axios.put(`/api/receivers/${id}`, { is_received: newStatus });

      // Fetch summary to update totals
      const sumRes = await axios.get(`/api/summary?year=${selectedYear}`);
      setSummary(sumRes.data);
    } catch (err) {
      console.error(err);
      fetchData(); // Revert on error
    }
  };

  // Close sheet
  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingReceiver(null);
  };

  return (
    <div className="pb-24 relative flex flex-col gap-8 md:gap-10">
      {/* Year Selector */}
      <YearSelector
        selectedYear={selectedYear}
        onChange={setSelectedYear}
        availableYears={[2024, 2025, 2026]}
      />

      {loading ? (
        <SkeletonDashboard />
      ) : (
        <>
          {/* Dashboard Section */}
          <section className="opacity-0 animate-fade-in-up">
            <Dashboard summary={summary} selectedYear={selectedYear} />
          </section>

          {/* Receiver List Section */}
          <section className="opacity-0 animate-fade-in-up animation-delay-200">
            <ReceiverList
              receivers={receivers}
              onAdd={handleAddNew}
              onEdit={handleEdit}
              onToggleReceived={handleToggleReceived}
            />
          </section>
        </>
      )}

      {/* Bottom Sheet for Add/Edit */}

      {/* Bottom Sheet for Add/Edit */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        title={editingReceiver?.id ? "Edit Family" : "Add New Family"}
      >
        {editingReceiver && (
          <EditReceiverForm
            receiver={editingReceiver}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={handleCloseSheet}
          />
        )}
      </BottomSheet>
    </div>
  );
};

export default HomePage;
