"use client";
import React, { useState, useEffect, useRef } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

// Country list mapping with flags and labels
const COUNTRIES = [
  { code: "Local", name: "Local Sri Lanka", flag: "🇱🇰" },
  { code: "Australia", name: "Australia", flag: "🇦🇺" },
  { code: "United Kingdom", name: "United Kingdom", flag: "🇬🇧" },
  { code: "United States", name: "United States", flag: "🇺🇸" },
  { code: "Canada", name: "Canada", flag: "🇨🇦" },
  { code: "New Zealand", name: "New Zealand", flag: "🇳🇿" },
  { code: "UAE (Dubai)", name: "UAE (Dubai)", flag: "🇦🇪" },
  { code: "Singapore", name: "Singapore", flag: "🇸🇬" },
  { code: "Italy", name: "Italy", flag: "🇮🇹" },
  { code: "France", name: "France", flag: "🇫🇷" },
  { code: "Japan", name: "Japan", flag: "🇯🇵" },
  { code: "Qatar", name: "Qatar", flag: "🇶🇦" },
  { code: "Oman", name: "Qatar", flag: "🇴🇲" },
  { code: "Saudi Arabia", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "China", name: "China", flag: "🇨🇳" },
  { code: "Bahrain", name: "Bahrain", flag: "🇧🇭" },
  { code: "Iran", name: "Iran", flag: "🇮🇷" },
  { code: "Iraq", name: "Iraq", flag: "🇮🇶" },
  { code: "Israel", name: "Israel", flag: "🇮🇱" },
  { code: "Kuwait", name: "Kuwait", flag: "🇰🇼" },
  { code: "Lebanon", name: "Lebanon", flag: "🇱🇧" },
  { code: "Yemen", name: "Yemen", flag: "🇾🇪" },
];

const WindowsFlagFix = () => (
  <style jsx global>{`
    .calendar-premium .rbc-calendar {
  font-family: inherit;
}

.calendar-premium .rbc-toolbar {
  margin-bottom: 16px;
  gap: 10px;
  flex-wrap: wrap;
}

.calendar-premium .rbc-toolbar button {
  border: 1px solid #d1fae5;
  background: #ecfdf5;
  color: #047857;
  border-radius: 12px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 800;
  transition: all 0.2s ease;
}

.calendar-premium .rbc-toolbar button:hover,
.calendar-premium .rbc-toolbar button.rbc-active {
  background: #059669;
  color: white;
  border-color: #059669;
}

.calendar-premium .rbc-toolbar-label {
  font-size: 18px;
  font-weight: 900;
  color: #064e3b;
}

.calendar-premium .rbc-month-view,
.calendar-premium .rbc-time-view,
.calendar-premium .rbc-agenda-view {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
}

.calendar-premium .rbc-header {
  padding: 10px;
  font-size: 12px;
  font-weight: 900;
  color: #065f46;
  background: #ecfdf5;
}

.calendar-premium .rbc-date-cell {
  padding: 6px;
  font-size: 12px;
  font-weight: 700;
}

.calendar-premium .rbc-today {
  background: #ecfdf5;
}

.calendar-premium .rbc-event {
  background: linear-gradient(135deg, #059669, #10b981);
  border: none;
  border-radius: 10px;
  padding: 3px 7px;
  font-size: 11px;
  font-weight: 800;
  box-shadow: 0 4px 10px rgba(5, 150, 105, 0.25);
}

.calendar-premium .rbc-event:hover {
  filter: brightness(1.05);
  transform: scale(1.01);
}

.calendar-premium .rbc-off-range-bg {
  background: #f9fafb;
}
  @media (max-width: 768px) {
  .calendar-premium {
    overflow-x: auto;
    overflow-y: auto;
  }

  .calendar-premium .rbc-toolbar {
    align-items: stretch;
  }

  .calendar-premium .rbc-toolbar-label {
    width: 100%;
    text-align: center;
    font-size: 15px;
    margin: 6px 0;
  }

  .calendar-premium .rbc-btn-group {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .calendar-premium .rbc-toolbar button {
    padding: 7px 10px;
    font-size: 11px;
  }

  .calendar-premium .rbc-event {
    font-size: 10px;
    padding: 2px 5px;
  }
}
  `}</style>
);

// High-End Premium Custom Interactive Popover Dropdown
const StatusDropdown = ({ currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const buttonRef = useRef(null);
  const localizer = momentLocalizer(moment);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;

      // Calculate if there is space below, if not, open upwards
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < 160;

      setMenuStyle({
        position: "fixed",
        top: openUpward ? rect.top - 165 : rect.bottom + 5,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statuses = [
    {
      value: "Inquiry",
      label: "Inquiry",
      icon: "📋",
      dotColor: "bg-blue-500",
      hoverStyle: "hover:bg-blue-50/60 text-blue-900",
    },
    {
      value: "Confirmed",
      label: "Confirmed",
      icon: "💍",
      dotColor: "bg-amber-500",
      hoverStyle: "hover:bg-amber-50/60 text-amber-900",
    },
    {
      value: "Completed",
      label: "Completed",
      icon: "✨",
      dotColor: "bg-emerald-500",
      hoverStyle: "hover:bg-emerald-50/60 text-emerald-900",
    },
  ];

  const getBadgeStyle = () => {
    switch (currentStatus) {
      case "Confirmed":
        return "bg-amber-50 text-amber-800 border-amber-200/70 hover:bg-amber-100/60";
      case "Completed":
        return "bg-emerald-50 text-emerald-800 border-emerald-200/70 hover:bg-emerald-100/60";
      default:
        return "bg-blue-50 text-blue-800 border-blue-200/70 hover:bg-blue-100/60";
    }
  };

  return (
    <div className="relative inline-block text-left" ref={buttonRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center justify-between gap-2 shadow-sm transition-all duration-200 min-w-[108px] active:scale-95 ${getBadgeStyle()}`}
      >
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${statuses.find((s) => s.value === currentStatus)?.dotColor}`}
          />
          <span>{currentStatus}</span>
        </div>
      </button>

      {isOpen && (
        <div
          className="w-40 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.12)] border border-gray-100/80 p-1.5 space-y-0.5 animate-menu-up"
          style={menuStyle}
        >
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2.5 py-1 select-none">
            Change Status
          </div>
          {statuses.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => {
                onStatusChange(s.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-2 text-xs font-semibold rounded-xl transition-all duration-150 flex items-center justify-between ${s.hoverStyle}`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${s.dotColor}`} />
                <span>{s.label}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const localizer = momentLocalizer(moment);

const SERVICE_TYPE_OPTIONS = [
  "Full wedding planning",
  "Partial wedding planning",
  "Wedding day coordination",
  "Wedding agenda making",
];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [data, setData] = useState([]);
  const [deletedRecords, setDeletedRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tappedCountry, setTappedCountry] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [manualCalendarDate, setManualCalendarDate] = useState("");
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [isFilterServiceDropdownOpen, setIsFilterServiceDropdownOpen] =
  useState(false);

  const [searchTerm, setSearchTerm] = useState("");

const [filters, setFilters] = useState({
  weddingDate: "",
  serviceType: [],
  weddingType: "",
  status: "",
});

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    id: null,
    name: "",
    type: "soft",
  });

  const [formData, setFormData] = useState({
    id: null,
    couple_name: "",
    wedding_date: "",
    hotel: "",
    service_type: [],
    wedding_type: "One day",
    guest_count: "",
    contact_no: "",
    bridesmaid_option: "",
    agreed_price: 0,
    advance_paid: 0,
    status: "Inquiry",
    remarks: "",
    country: "Local",
    advance_paid_date: ""
  });

  const API_URL = "/api/inquiries"

  useEffect(() => {
    setMounted(true);
    const savedTrash = localStorage.getItem("chathu_trash_bin");
    if (savedTrash) {
      setDeletedRecords(JSON.parse(savedTrash));
    }
  }, []);

  const saveTrashToStorage = (updatedTrash) => {
    setDeletedRecords(updatedTrash);
    localStorage.setItem("chathu_trash_bin", JSON.stringify(updatedTrash));
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}?tab=all`);
      const json = await res.json();

      const trashIds = deletedRecords.map((item) => item.id);
      const nonDeletedData = json.filter((item) => !trashIds.includes(item.id));

      if (activeTab === "all") {
        setData(nonDeletedData.filter((item) => item.status !== "Completed"));
      } else if (activeTab === "completed") {
        setData(nonDeletedData.filter((item) => item.status === "Completed"));
      } else {
        setData(nonDeletedData);
      }
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchData();
    }
  }, [activeTab, mounted, deletedRecords.length]);

  const triggerNotification = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      4500,
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStatusChange = async (item, newStatus) => {
  const updatedRecord = { ...item, status: newStatus };

  try {
    const res = await fetch(`${API_URL}?id=${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedRecord),
    });

    const json = await res.json();

    if (!res.ok || json.success === false) {
      console.error("Status update failed:", json);
      triggerNotification("Status update failed. Please try again.", "delete");
      return;
    }

    let moveMessage = `Status updated to "${newStatus}"!`;

    if (newStatus === "Completed" && activeTab === "all") {
      moveMessage = `File for ${item.couple_name} marked Completed & moved to Completed Weddings! ✨`;
    } else if (newStatus !== "Completed" && activeTab === "completed") {
      moveMessage = `File for ${item.couple_name} moved back into Active Wedding Inquiries! 📋`;
    }

    triggerNotification(moveMessage, "success");
    fetchData();
  } catch (err) {
    console.error("Error updating status", err);
    triggerNotification("Status update failed. Please try again.", "delete");
  }
};

  const initiateDelete = (item, type = "soft") => {
  setDeleteModal({
    show: true,
    id: item.id,
    name: item.couple_name,
    type,
    rawItem: item,
  });
};

  const confirmDeleteAction = async () => {
    const { id, name, type, rawItem } = deleteModal;

    if (type === "soft") {
      const newTrashList = [...deletedRecords, rawItem];
      saveTrashToStorage(newTrashList);
      triggerNotification(
        `Moved ${name}'s files into the Deleted Records tab.`,
        "delete",
      );
    } else if (type === "permanent") {
      try {
        const res = await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          const filteredTrash = deletedRecords.filter((item) => item.id !== id);
          saveTrashToStorage(filteredTrash);
          triggerNotification(
            `Permanently scrubbed database records for ${name}.`,
            "delete",
          );
        }
      } catch (err) {
        console.error("Error performing ultimate wipe deletion:", err);
      }
    } else if (type === "all") {
      try {
        for (const item of deletedRecords) {
          await fetch(`${API_URL}?id=${item.id}`, { method: "DELETE" });
        }
        saveTrashToStorage([]);
        triggerNotification(
          "Completely emptied and purged the entire Recycle Trash tab contents.",
          "delete",
        );
        setActiveTab("all");
      } catch (err) {
        console.error("Error executing wholesale database purge:", err);
      }
    }

    setDeleteModal({ show: false, id: null, name: "", type: "soft" });
  };

  const handleRecoverRecord = (item) => {
    const updatedTrash = deletedRecords.filter((t) => t.id !== item.id);
    saveTrashToStorage(updatedTrash);
    triggerNotification(
      `Successfully restored ${item.couple_name} back to the active tracking dashboard! 🔄✨`,
      "success",
    );
  };

  const openEditModal = (item) => {
  setFormData({
    ...item,
    service_type: item.service_type
      ? item.service_type.split(",").map((s) => s.trim())
      : [],
    bridesmaid_option:
      item.bridesmaid_option && item.bridesmaid_option !== "-"
        ? item.bridesmaid_option
        : "",
    country: item.country || "Local",
  });

  setIsModalOpen(true);
};

  const openAddModal = () => {
    setFormData({
      id: null,
      couple_name: "",
      wedding_date: "",
      hotel: "",
      service_type: [],
      wedding_type: "One day",
      guest_count: "",
      contact_no: "",
      bridesmaid_option: "",
      agreed_price: 0,
      advance_paid: 0,
      status: "Inquiry",
      remarks: "",
      country: "Local",
      advance_paid_date: ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = formData.id ? "PUT" : "POST";
    const url = formData.id ? `${API_URL}?id=${formData.id}` : API_URL;

    const adjustedData = {
  ...formData,
  service_type: Array.isArray(formData.service_type)
    ? formData.service_type.join(", ")
    : formData.service_type,
  guest_count:
    formData.guest_count === "" ? null : parseInt(formData.guest_count, 10),
  bridesmaid_option: formData.bridesmaid_option || "-",
};

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adjustedData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
        triggerNotification(
          formData.id
            ? `Changes applied to ${formData.couple_name}'s booking file.`
            : `Hooray! New wedding inquiry for ${formData.couple_name} has been recorded! 🥂✨`,
          "success",
        );
      }
    } catch (err) {
      console.error("Error saving data", err);
    }
  };

  const getCountryDisplay = (code) => {
    const match = COUNTRIES.find((c) => c.code == code);
    return match
      ? { flag: match.flag, name: match.name }
      : { flag: "🇱🇰", name: "Local Sri Lanka" };
  };

  const activeRecordsDisplay =
  activeTab === "trash" ? deletedRecords : data;

const filteredRecordsDisplay = activeRecordsDisplay.filter((item) => {

  const search = searchTerm.toLowerCase().trim();

  const matchesSearch =
    !search ||
    item.couple_name?.toLowerCase().includes(search) ||
    item.wedding_date?.toLowerCase().includes(search) ||
    item.contact_no?.toLowerCase().includes(search);

  const matchesWeddingDate =
    !filters.weddingDate ||
    item.wedding_date === filters.weddingDate;

  const matchesServiceType =
  !filters.serviceType?.length ||
  filters.serviceType.some((service) =>
    item.service_type?.includes(service)
  );

  const matchesWeddingType =
    !filters.weddingType ||
    item.wedding_type === filters.weddingType;

  const matchesStatus =
    !filters.status ||
    item.status === filters.status;

  return (
    matchesSearch &&
    matchesWeddingDate &&
    matchesServiceType &&
    matchesWeddingType &&
    matchesStatus
  );
});

const calendarEvents = activeRecordsDisplay
  .filter((item) => item.wedding_date)
  .map((item) => {
    const startDate = moment(item.wedding_date, "YYYY-MM-DD").toDate();

    return {
      id: item.id,
      title: item.couple_name || "Unnamed Inquiry",
      start: startDate,
      end: startDate,
      allDay: true,
      resource: item,
    };
  });

const clearSearchAndFilters = () => {
  setSearchTerm("");

  setFilters({
    weddingDate: "",
    serviceType: [],
    weddingType: "",
    status: "",
  });
};

  if (!mounted) return <div className="min-h-screen bg-gray-50" />;

  return (
    <div
  className="min-h-screen text-gray-800 font-sans pb-10 relative"
  style={{
    backgroundImage: "url('/background_img_1.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    backgroundRepeat: "no-repeat",
  }}
>
  <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] pointer-events-none"></div>

<div className="relative z-10">
      {/* HIGH VISIBILITY FLOATING INTERACTIVE TOAST BARS */}
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-auto">
          <div
            className={`border backdrop-blur-xl p-4 rounded-2xl flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all animate-notification ${
              toast.type === "delete"
                ? "bg-rose-950/95 border-rose-500/40 text-rose-50"
                : "bg-emerald-950/95 border-emerald-500/40 text-emerald-50"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 relative overflow-hidden ${
                toast.type === "delete"
                  ? "bg-rose-500/20 text-rose-400"
                  : "bg-emerald-500/20 text-emerald-400"
              }`}
            >
              <span className="absolute inset-0 opacity-20 blur-sm animate-pulse-glow bg-current" />
              <span className="relative z-10">
                {toast.type === "delete" ? "🗑️" : "✨"}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="text-xs uppercase tracking-widest font-black opacity-60">
                {toast.type === "delete"
                  ? "System Notice"
                  : "Success Operation"}
              </h4>
              <p className="text-sm font-medium mt-0.5 leading-relaxed tracking-wide">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() =>
                setToast({ show: false, message: "", type: "success" })
              }
              className="text-white/40 hover:text-white/90 p-1 text-xs font-bold font-mono"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <header
  className="text-emerald-950 shadow-xl backdrop-blur-xl p-4 sticky top-0 z-10 flex justify-between items-center border-b border-white/30"
  style={{
    backgroundImage: "url('/header-nav-img.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
  <div className="flex items-center gap-3">
  <img
    src="/official Logo.png"
    alt="Chathu Wedding Planners"
    className="w-12 h-12 object-contain rounded-full shadow-sm"
  />

  <div>
    <h1 className="text-xl font-bold tracking-wide text-emerald-950">
      Chathu Wedding Planners
    </h1>

    <p className="text-xs text-emerald-900 mt-0.5 uppercase tracking-wider">
      {activeTab === "all"
        ? "ACTIVE WEDDING INQUIRIES"
        : activeTab === "completed"
          ? "OUR WEDDING ENQUIRIES"
          : "RECYCLE TRACK STORAGE"}
    </p>
  </div>
</div>
</header>

      <div className="max-w-[98%] mx-auto mt-4 bg-white border border-gray-100 rounded-2xl shadow-sm p-4">

  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">

    <input
      type="text"
      placeholder="Search by couple name, wedding date or contact no..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="md:col-span-2 w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
    />

    <input
      type="date"
      value={filters.weddingDate}
      onChange={(e) =>
        setFilters({
          ...filters,
          weddingDate: e.target.value,
        })
      }
      className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
    />

    <div className="relative">
  <button
    type="button"
    onClick={() => setIsFilterServiceDropdownOpen(!isFilterServiceDropdownOpen)}
    className="w-full p-2.5 bg-white border rounded-xl text-sm outline-none text-left flex items-center justify-between focus:ring-2 focus:ring-emerald-500"
  >
    <span className="truncate">
      {filters.serviceType?.length > 0
        ? `${filters.serviceType.length} service type(s) selected`
        : "All Service Types"}
    </span>
    <span className="text-gray-400">▾</span>
  </button>

  {isFilterServiceDropdownOpen && (
    <div className="absolute z-[1000] mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl p-2 space-y-1">
      {SERVICE_TYPE_OPTIONS.map((service) => (
        <label
          key={service}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-50 cursor-pointer text-sm"
        >
          <input
            type="checkbox"
            checked={filters.serviceType?.includes(service)}
            onChange={(e) => {
              const current = filters.serviceType || [];

              if (e.target.checked) {
                setFilters({
                  ...filters,
                  serviceType: [...current, service],
                });
              } else {
                setFilters({
                  ...filters,
                  serviceType: current.filter((s) => s !== service),
                });
              }
            }}
            className="accent-emerald-600"
          />

          <span className="font-medium text-gray-700">{service}</span>
        </label>
      ))}
    </div>
  )}
</div>

    <select
      value={filters.weddingType}
      onChange={(e) =>
        setFilters({
          ...filters,
          weddingType: e.target.value,
        })
      }
      className="w-full p-2.5 bg-white border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
    >
      <option value="">All Wedding Types</option>
      <option value="One day">One day</option>
      <option value="Two days">Two days</option>
    </select>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-3">

    <select
      value={filters.status}
      onChange={(e) =>
        setFilters({
          ...filters,
          status: e.target.value,
        })
      }
      className="w-full p-2.5 bg-white border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
    >
      <option value="">All Status</option>
      <option value="Inquiry">Inquiry</option>
      <option value="Confirmed">Confirmed</option>
      <option value="Completed">Completed</option>
    </select>

    <button
      type="button"
      onClick={clearSearchAndFilters}
      className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition"
    >
      Clear Filters
    </button>

    <div className="md:col-span-3 flex items-center justify-end text-xs font-bold text-gray-400">
      Showing {filteredRecordsDisplay.length} of {activeRecordsDisplay.length} records
    </div>

  </div>

</div>

<div className="max-w-[98%] mx-auto mt-4 flex justify-start gap-2 bg-white/30 backdrop-blur-lg border border-white/30 rounded-2xl p-3 shadow-lg">
  <button
    onClick={openAddModal}
    className="bg-white text-emerald-700 border border-emerald-200 font-semibold px-4 py-2 rounded-lg shadow hover:bg-emerald-50 transition text-sm"
  >
    + New Inquiry
  </button>

  <button
    onClick={() => setIsCalendarOpen(true)}
    className="bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-emerald-800 transition text-sm"
  >
    📅 Calendar
  </button>
</div>

      {/* DASHBOARD TAB SEGMENT CONSOLE NAVIGATION BAR */}
      <div className="max-w-[98%] mx-auto mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200">
        <div className="flex flex-wrap">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-3 px-5 font-semibold text-sm transition-all border-b-2 ${activeTab === "all" ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            💚 Active Wedding Inquiries
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`py-3 px-5 font-semibold text-sm transition-all border-b-2 ${activeTab === "completed" ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            ✨ Completed Weddings
          </button>
          <button
            onClick={() => setActiveTab("trash")}
            className={`py-3 px-5 font-semibold text-sm transition-all border-b-2 flex items-center gap-1.5 ${activeTab === "trash" ? "border-amber-600 text-amber-700 font-bold bg-amber-50/40" : "border-transparent text-gray-400 hover:text-gray-600"}`}
          >
            🗑️ Deleted Records
            {deletedRecords.length > 0 && (
              <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                {deletedRecords.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "trash" && deletedRecords.length > 0 && (
          <button
            onClick={() =>
              setDeleteModal({
                show: true,
                id: null,
                name: "All Trash Folders",
                type: "all",
              })
            }
            className="mb-2 md:mb-0 bg-gradient-to-r from-red-600 to-rose-700 text-white text-xs font-black px-4 py-2 rounded-xl shadow-md shadow-red-100 hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 self-start"
          >
            💥 Clear All Deleted Records
          </button>
        )}
      </div>

      <main className="max-w-[98%] mx-auto mt-4">
        {filteredRecordsDisplay.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">
              {activeTab === "trash"
                ? "Your Deleted Records folder is completely empty."
                : "No wedding records found in this segment."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View Container - Patched Layout constraints */}
            <div className="hidden lg:block bg-white shadow-md rounded-xl border border-gray-100 overflow-x-auto w-full clear-both">
              <table className="w-full text-left border-collapse min-w-max table-auto bg-white rounded-xl">
                <thead>
                  <tr
                    className={`${activeTab === "trash" ? "bg-amber-50 text-amber-950" : "bg-emerald-50 text-emerald-900"} text-xs uppercase font-bold border-b border-gray-200`}
                  >
                    <th className="p-3 text-center w-12 bg-inherit">#</th>
                    <th className="p-3 bg-inherit">Couple Name</th>
                    <th className="p-3 bg-inherit">Wedding Date</th>
                    <th className="p-3 bg-inherit">Hotel</th>
                    <th className="p-3 bg-inherit">Service Type</th>
                    <th className="p-3 bg-inherit">Wedding Type</th>
                    {activeTab !== "completed" && (
                      <>
                        <th className="p-3 text-center bg-inherit">
                          Guests
                        </th>
                        <th className="p-3 bg-inherit">
                          Bridesmaid
                        </th>
                      </>
                    )}
                    <th className="p-3 bg-inherit">Contact No.</th>
                    <th className="p-3 text-right bg-inherit">Agreed Price</th>
                    <th className="p-3 text-right bg-inherit">Advance Paid</th>
                    <th className="p-3 text-right bg-inherit">
                      Pending Balance
                    </th>
                    <th className="p-3 text-center bg-inherit">Status</th>
                    <th className="p-3 bg-inherit">Remarks</th>
                    <th className="p-3 text-center w-36 bg-inherit">
                      {activeTab === "trash" ? "Restore / Wipe" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs bg-white">
                  {filteredRecordsDisplay.map((item, index) => {
                    const countryInfo = getCountryDisplay(item.country);
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50/80 transition bg-white"
                      >
                        <td className="p-3 text-center font-medium text-gray-400">
                          {index + 1}
                        </td>
                        <td className="p-3 font-bold text-gray-900">
                          <div className="flex items-center gap-2">
                            <span
                              className="emoji-flag text-base select-none"
                              title={countryInfo.name}
                            >
                              {countryInfo.flag}
                            </span>
                            <span>{item.couple_name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-600 font-medium">
                          {item.wedding_date || "—"}
                        </td>
                        <td className="p-3 text-gray-700 font-medium">
                          {item.hotel || "—"}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded font-medium">
                            {item.service_type}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">
                          {item.wedding_type}
                        </td>
                        {activeTab !== "completed" && (
                          <>
                            <td className="p-3 text-center font-semibold">
                              {item.guest_count || "—"}
                            </td>
                            <td className="p-3 text-gray-600">
                              {!item.bridesmaid_option ||
                              item.bridesmaid_option === "-"
                                ? "—"
                                : item.bridesmaid_option}
                            </td>
                          </>
                        )}
                        <td className="p-3 font-mono text-gray-700">
                          {item.contact_no || "—"}
                        </td>

                        <td className="p-3 text-right font-mono font-semibold text-gray-900">
                          {item.agreed_price
                            ? item.agreed_price.toLocaleString("en-LK", {
                                minimumFractionDigits: 2,
                              })
                            : "0.00"}
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-amber-700">
  <div>
    {item.advance_paid
      ? Number(item.advance_paid).toLocaleString("en-LK", {
          minimumFractionDigits: 2,
        })
      : "0.00"}
  </div>

  {item.advance_paid_date && (
    <div className="text-[10px] text-gray-400 font-sans mt-0.5">
      ({item.advance_paid_date})
    </div>
  )}
</td>
                        <td className="p-3 text-right font-mono font-bold text-red-600">
                          {item.pending_payment
                            ? item.pending_payment.toLocaleString("en-LK", {
                                minimumFractionDigits: 2,
                              })
                            : "0.00"}
                        </td>

                        <td className="p-3 text-center">
                          {activeTab === "trash" ? (
                            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-gray-100 text-gray-500">
                              {item.status}
                            </span>
                          ) : (
                            <StatusDropdown
                              currentStatus={item.status}
                              onStatusChange={(newStatus) =>
                                handleStatusChange(item, newStatus)
                              }
                            />
                          )}
                        </td>
                        <td
                          className="p-3 text-gray-500 max-w-xs truncate"
                          title={item.remarks}
                        >
                          {item.remarks || "—"}
                        </td>

                        <td className="p-3 text-center">
                          {activeTab === "trash" ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleRecoverRecord(item)}
                                className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold hover:bg-emerald-100 transition text-[11px]"
                              >
                                Recovery
                              </button>
                              <button
                                onClick={() =>
                                  initiateDelete(item, "permanent")
                                }
                                className="bg-rose-50 text-rose-600 border border-rose-100 p-1 rounded-lg hover:bg-rose-100 transition"
                                title="Delete Permanently"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() => openEditModal(item)}
                                className="text-emerald-600 font-bold hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => initiateDelete(item, "soft")}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  className="w-4 h-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                  />
                                </svg>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View Layout Block */}
            <div className="block lg:hidden space-y-4">
              {filteredRecordsDisplay.map((item, index) => {
                const countryInfo = getCountryDisplay(item.country);
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl p-4 shadow border space-y-3 ${activeTab === "trash" ? "border-amber-200" : "border-gray-100"}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">
                          Record #{index + 1}
                        </span>
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
  <span className="emoji-flag text-base select-none">
    {countryInfo.flag}
  </span>
  <span>{item.couple_name}</span>
</h3>

<p className="text-xs font-semibold text-gray-500 mt-0.5">
  {item.service_type || "Service type pending"}
</p>
                        <p className="text-xs font-semibold text-emerald-700">
                          {item.wedding_date || "Date Pending"}
                        </p>
                      </div>

                      {activeTab === "trash" ? (
                        <span className="px-2.5 py-0.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-500">
                          {item.status}
                        </span>
                      ) : (
                        <StatusDropdown
                          currentStatus={item.status}
                          onStatusChange={(newStatus) =>
                            handleStatusChange(item, newStatus)
                          }
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs border-t border-b border-gray-50 py-2.5">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                          Origin:
                        </span>{" "}
                        <span className="font-semibold text-gray-800">
                          {countryInfo.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                          Venue:
                        </span>{" "}
                        <span className="font-medium text-gray-800">
                          {item.hotel || "—"}
                        </span>
                      </div>
                      <div className="col-span-2 grid grid-cols-3 gap-1 bg-gray-50 p-2 rounded-lg mt-1 border border-gray-100 font-mono">
                        <div>
                          <span className="text-[9px] text-gray-400 block uppercase font-bold">
                            Agreed:
                          </span>
                          <span className="text-xs font-bold text-gray-900">
                            {item.agreed_price
                              ? item.agreed_price.toLocaleString("en-LK")
                              : "0"}
                          </span>
                        </div>
                        <div>
  <span className="text-[9px] text-gray-400 block uppercase font-bold">
    Paid:
  </span>

  <span className="text-xs font-bold text-amber-800 block">
    {item.advance_paid
      ? item.advance_paid.toLocaleString("en-LK")
      : "0"}
  </span>

  {item.advance_paid_date && (
    <span className="block text-[9px] text-gray-400 font-sans mt-0.5">
      ({item.advance_paid_date})
    </span>
  )}
</div>
                        <div>
                          <span className="text-[9px] text-gray-400 block uppercase font-bold">
                            Pending:
                          </span>
                          <span className="text-xs font-bold text-red-600">
                            {item.pending_payment
                              ? item.pending_payment.toLocaleString("en-LK")
                              : "0"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-0.5">
                      <span className="text-xs text-gray-400 italic truncate max-w-[45%]">
                        💡 {item.remarks || "No remarks"}
                      </span>

                      {activeTab === "trash" ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleRecoverRecord(item)}
                            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-black shadow transition"
                          >
                            Recovery
                          </button>
                          <button
                            onClick={() => initiateDelete(item, "permanent")}
                            className="p-1.5 border border-rose-200 text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition text-xs font-bold"
                          >
                            Wipe
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => initiateDelete(item, "soft")}
                            className="p-2 border border-red-100 text-red-500 bg-red-50/50 rounded-lg hover:bg-red-50 transition"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 transition"
                          >
                            Modify
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* INPUT / EDIT DIALOG FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start md:items-center justify-center p-3 md:p-4 z-[9999] overflow-y-auto">
    <div className="bg-white rounded-2xl w-full max-w-lg p-4 md:p-6 shadow-2xl space-y-4 my-4 md:my-8 border border-gray-100 max-h-[92vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">
              {formData.id ? "Modify Wedding File" : "Add New Wedding Record"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Couple Name *
                  </label>
                  <input
                    type="text"
                    name="couple_name"
                    required
                    value={formData.couple_name}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-white border rounded-lg text-sm outline-none font-medium text-gray-700"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Wedding Date
                  </label>
                  <input
                    type="date"
                    name="wedding_date"
                    value={formData.wedding_date}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Guest Count
                  </label>
                  <div className="flex gap-1">
                    <select
                      name="guest_count"
                      value={
                        [100, 150, 200, 250, 300, 350, 400].includes(
                          Number(formData.guest_count),
                        )
                          ? formData.guest_count
                          : ""
                      }
                      onChange={handleInputChange}
                      className="w-1/2 p-2.5 bg-white border rounded-lg text-sm outline-none"
                    >
                      <option value="">Select count</option>
                      <option value="100">100</option>
                      <option value="150">150</option>
                      <option value="200">200</option>
                      <option value="250">250</option>
                      <option value="300">300</option>
                      <option value="350">350</option>
                      <option value="400">400</option>
                    </select>
                    <input
                      type="number"
                      name="guest_count"
                      placeholder="Or type..."
                      value={formData.guest_count}
                      onChange={handleInputChange}
                      className="w-1/2 p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Hotel / Venue
                </label>
                <input
                  type="text"
                  name="hotel"
                  value={formData.hotel}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
    Service Type
  </label>

  <button
    type="button"
    onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
    className="w-full p-2.5 bg-white border rounded-lg text-sm outline-none text-left flex items-center justify-between"
  >
    <span className="truncate">
      {Array.isArray(formData.service_type) &&
      formData.service_type.length > 0
        ? formData.service_type.join(", ")
        : "Please select service type"}
    </span>

    <span className="text-gray-400">▾</span>
  </button>

  {isServiceDropdownOpen && (
    <div className="absolute z-[10000] mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl p-2 space-y-1">
      {SERVICE_TYPE_OPTIONS.map((service) => (
        <label
          key={service}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-50 cursor-pointer text-sm"
        >
          <input
            type="checkbox"
            checked={
              Array.isArray(formData.service_type) &&
              formData.service_type.includes(service)
            }
            onChange={(e) => {
              const current = Array.isArray(formData.service_type)
                ? formData.service_type
                : [];

              if (e.target.checked) {
                setFormData({
                  ...formData,
                  service_type: [...current, service],
                });
              } else {
                setFormData({
                  ...formData,
                  service_type: current.filter(
                    (s) => s !== service
                  ),
                });
              }
            }}
            className="accent-emerald-600"
          />

          <span className="font-medium text-gray-700">
            {service}
          </span>
        </label>
      ))}
    </div>
  )}
</div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Wedding Type
                  </label>
                  <select
                    name="wedding_type"
                    value={formData.wedding_type}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-white border rounded-lg text-sm outline-none"
                  >
                    <option value="One day">One day</option>
                    <option value="Two days">Two days</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Bridesmaid
                  </label>
                  <select
                    name="bridesmaid_option"
                    value={formData.bridesmaid_option}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-white border rounded-lg text-sm outline-none"
                  >
                    <option value="">Please select</option>
                    <option value="Without bridesmaid">
                      Without bridesmaid
                    </option>
                    <option value="With bridesmaid">With bridesmaid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-white border rounded-lg text-sm outline-none"
                  >
                    <option value="Inquiry">Inquiry</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                    Agreed Price (LKR)
                  </label>
                  <input
                    type="number"
                    name="agreed_price"
                    value={formData.agreed_price}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                    Advance Paid (LKR)
                  </label>
                  <input
                    type="number"
                    name="advance_paid"
                    value={formData.advance_paid}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>
                <div>
  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
    Advance Paid Date
  </label>
  <input
    type="date"
    name="advance_paid_date"
    value={formData.advance_paid_date || ""}
    onChange={handleInputChange}
    className="w-full p-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
  />
</div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Contact No.
                </label>
                <input
                  type="text"
                  name="contact_no"
                  value={formData.contact_no}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  rows="2"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 text-sm"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DYNAMIC CONFIRMATION DIALOG MODAL */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl text-center space-y-4 border border-rose-100">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold relative ${
                deleteModal.type === "soft"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-2xl bg-current opacity-10" />
              {deleteModal.type === "soft" ? "📁" : "⚠️"}
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-wide">
                {deleteModal.type === "soft"
                  ? "Move to Deleted Records?"
                  : deleteModal.type === "all"
                    ? "Empty Entire Trash Bin?"
                    : "Confirm Permanent Deletion"}
              </h3>
              <p className="text-sm text-gray-500 mt-2 px-2 leading-relaxed">
                {deleteModal.type === "soft" && (
                  <>
                    Are you sure you want to remove{" "}
                    <strong>"{deleteModal.name}"</strong> from your tracking
                    screens? You can restore them anytime from the Deleted
                    Records tab.
                  </>
                )}
                {deleteModal.type === "permanent" && (
                  <>
                    This will permanently scrub the database files for{" "}
                    <strong>"{deleteModal.name}"</strong>. This action is
                    irreversible.
                  </>
                )}
                {deleteModal.type === "all" && (
                  <>
                    This will instantly wipe and erase{" "}
                    <strong>all {deletedRecords.length} files</strong> inside
                    your trash database list completely. This cannot be undone.
                  </>
                )}
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() =>
                  setDeleteModal({
                    show: false,
                    id: null,
                    name: "",
                    type: "soft",
                  })
                }
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs tracking-wider uppercase transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAction}
                className={`px-6 py-2.5 text-white font-black rounded-xl text-xs tracking-wider uppercase shadow-lg transition ${
                  deleteModal.type === "soft"
                    ? "bg-amber-600 shadow-amber-100 hover:bg-amber-700"
                    : "bg-rose-600 shadow-rose-100 hover:bg-rose-700"
                }`}
              >
                {deleteModal.type === "soft"
                  ? "Yes, Move to Trash"
                  : deleteModal.type === "all"
                    ? "Yes, Purge Everything"
                    : "Yes, Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCalendarOpen && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl w-full max-w-6xl h-[92vh] p-3 md:p-5 shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Wedding Inquiry Calendar
          </h2>
          <p className="text-xs text-gray-500">
            Showing inquiries with wedding dates only
          </p>
        </div>

        <button
          onClick={() => setIsCalendarOpen(false)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold text-gray-700"
        >
          Close
        </button>
      </div>

      <div className="flex-1 min-h-[520px] md:min-h-0 rounded-2xl overflow-auto border border-gray-100 shadow-inner bg-white p-2 md:p-3 calendar-premium">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
  <div className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 rounded-2xl p-4 mb-4 shadow-sm">
  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
    <div>
      <h3 className="text-sm font-black text-emerald-800 uppercase tracking-wider">
        Calendar Navigator
      </h3>
      <p className="text-xs text-gray-500 mt-1">
        Jump quickly to future wedding enquiry dates.
      </p>
    </div>

    <div className="flex flex-col md:flex-row gap-3">
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">
          Date Picker
        </label>
        <input
          type="date"
          value={moment(calendarDate).format("YYYY-MM-DD")}
          onChange={(e) => {
            const value = e.target.value;
            if (!value) return;

            const selectedDate = moment(value, "YYYY-MM-DD", true);

            if (selectedDate.isValid()) {
              setCalendarDate(selectedDate.toDate());
              setManualCalendarDate(selectedDate.format("YYYY-MM-DD"));
            }
          }}
          className="w-full md:w-44 p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">
          Type Date Manually
        </label>
        <input
          type="text"
          placeholder="YYYY-MM-DD"
          value={manualCalendarDate}
          onChange={(e) => setManualCalendarDate(e.target.value)}
          className="w-full md:w-44 p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />
      </div>

      <button
        type="button"
        onClick={() => {
          const selectedDate = moment(manualCalendarDate, "YYYY-MM-DD", true);

          if (selectedDate.isValid()) {
            setCalendarDate(selectedDate.toDate());
          } else {
            triggerNotification("Please enter date as YYYY-MM-DD", "delete");
          }
        }}
        className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-700 transition"
      >
        Go
      </button>

      <button
        type="button"
        onClick={() => {
          const today = new Date();
          setCalendarDate(today);
          setManualCalendarDate(moment(today).format("YYYY-MM-DD"));
        }}
        className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-black hover:bg-gray-200 transition"
      >
        Today
      </button>
    </div>
  </div>
</div>

  <button
    type="button"
    onClick={() => setCalendarDate(new Date())}
    className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold hover:bg-emerald-100 transition"
  >
    Today
  </button>
</div>
        <Calendar
  localizer={localizer}
  events={calendarEvents}
  startAccessor="start"
  endAccessor="end"
  titleAccessor="title"
  views={["month", "week", "day", "agenda"]}
  defaultView="month"
  date={
    calendarDate instanceof Date && !isNaN(calendarDate)
      ? calendarDate
      : new Date()
  }
  onNavigate={(date) => {
    if (date instanceof Date && !isNaN(date)) {
      setCalendarDate(date);
    }
  }}
  selectable
  onSelectSlot={(slotInfo) => {
    const selectedDate = moment(slotInfo.start).format("YYYY-MM-DD");

    setFormData({
      id: null,
      couple_name: "",
      wedding_date: selectedDate,
      hotel: "",
      service_type: [],
      wedding_type: "One day",
      guest_count: "",
      contact_no: "",
      bridesmaid_option: "",
      agreed_price: 0,
      advance_paid: 0,
      status: "Inquiry",
      remarks: "",
      country: "Local",
    });

    setIsModalOpen(true);
  }}
  popup
  style={{ height: "520px", minWidth: "720px" }}
  onSelectEvent={(event) => {
    setSelectedCalendarEvent(event.resource);
  }}
/>
      </div>
      {selectedCalendarEvent && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">

    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">

      <div className="bg-emerald-700 px-5 py-4 text-white">
        <h2 className="text-xl font-bold">
          {selectedCalendarEvent.couple_name}
        </h2>

        <p className="text-emerald-100 text-sm mt-1">
          Wedding Details
        </p>
      </div>

      <div className="p-5 space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <p className="text-xs text-gray-400 font-semibold">
              Wedding Date
            </p>

            <p className="font-semibold text-gray-800">
              {selectedCalendarEvent.wedding_date || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-semibold">
              Guest Count
            </p>

            <p className="font-semibold text-gray-800">
              {selectedCalendarEvent.guest_count || "-"}
            </p>
          </div>

        </div>

        <div>
          <p className="text-xs text-gray-400 font-semibold">
            Hotel
          </p>

          <p className="font-semibold text-gray-800">
            {selectedCalendarEvent.hotel || "-"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <p className="text-xs text-gray-400 font-semibold">
              Service Type
            </p>

            <p className="font-semibold text-gray-800">
              {selectedCalendarEvent.service_type || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-semibold">
              Wedding Type
            </p>

            <p className="font-semibold text-gray-800">
              {selectedCalendarEvent.wedding_type || "-"}
            </p>
          </div>

        </div>

        <div>
          <p className="text-xs text-gray-400 font-semibold">
            Contact Number
          </p>

          <p className="font-semibold text-gray-800">
            {selectedCalendarEvent.contact_no || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400 font-semibold">
            Status
          </p>

          <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 mt-1">
            {selectedCalendarEvent.status || "-"}
          </span>
        </div>

      </div>

      <div className="border-t p-4 flex justify-end">
        <button
          onClick={() => setSelectedCalendarEvent(null)}
          className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm"
        >
          Close
        </button>
      </div>

    </div>

  </div>
)}
    </div>
  </div>
)}

      <WindowsFlagFix />
    </div>
    </div>
  );
}
