"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
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

const DRAFT_KEY = "chathu_inquiry_draft";

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
  const [currentSLTime, setCurrentSLTime] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [vendorForm, setVendorForm] = useState({
    id: null,
    name: "",
    service: "",
    contact_number: "",
    location: "",
    remarks: "",
  });
  const [vendorLoading, setVendorLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerRecord, setSelectedCustomerRecord] = useState(null);
  const [vendorSearch, setVendorSearch] = useState("");
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [paymentTransactions, setPaymentTransactions] = useState([]);
  const [highlightedRecordId, setHighlightedRecordId] = useState(null);

  const [statusPopup, setStatusPopup] = useState({
    show: false,
    status: "",
    message: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [isWeddingAlertModalOpen, setIsWeddingAlertModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState({
    weddingDate: "",
    weddingDateFrom: "",
    weddingDateTo: "",
    weddingMonth: "",
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

  const handleTabChange = (tab) => {
    setTabLoading(true);

    setTimeout(() => {
      setActiveTab(tab);
      setTabLoading(false);
    }, 350);
  };

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
    package_price: 0,
    discount_rate: 0,
    agreed_price: 0,
    advance_paid: 0,
    status: "Inquiry",
    remarks: "",
    country: "Local",
    advance_paid_date: "",
    paid_amount: 0,
    paid_date: "",
    new_payment: "",
    discount_type: "percentage",
    transport_cost: "",
  });

  const API_URL = "/api/inquiries";

  useEffect(() => {
    setMounted(true);

    fetchVendors();

    const savedLogin = localStorage.getItem("chathu_admin_logged_in");
    const loginTime = localStorage.getItem("chathu_admin_login_time");
    const ONE_HOUR = 60 * 60 * 1000;

    if (
      savedLogin === "true" &&
      loginTime &&
      Date.now() - Number(loginTime) < ONE_HOUR
    ) {
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem("chathu_admin_logged_in");
      localStorage.removeItem("chathu_admin_login_time");
    }

    const savedTrash = localStorage.getItem("chathu_trash_bin");

    if (savedTrash) {
      setDeletedRecords(JSON.parse(savedTrash));
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const AUTO_LOGOUT_TIME = 60 * 60 * 1000;

    const logoutTimer = setTimeout(() => {
      localStorage.removeItem("chathu_admin_logged_in");
      localStorage.removeItem("chathu_admin_login_time");

      setLoginData({
        username: "",
        password: "",
      });

      setLoginError("");
      setIsLoggedIn(false);
    }, AUTO_LOGOUT_TIME);

    return () => clearTimeout(logoutTimer);
  }, [isLoggedIn]);

  useEffect(() => {
    const updateSLTime = () => {
      const now = new Date();

      const isMobile = window.innerWidth < 768;

      const sriLankaTime = now.toLocaleString("en-LK", {
        timeZone: "Asia/Colombo",
        year: isMobile ? undefined : "numeric",
        month: "short",
        day: "numeric",
        weekday: isMobile ? undefined : "short",
        hour: "2-digit",
        minute: "2-digit",
        second: isMobile ? undefined : "2-digit",
        hour12: true,
      });

      setCurrentSLTime(sriLankaTime);
    };

    updateSLTime();

    const interval = setInterval(updateSLTime, 1000);

    return () => clearInterval(interval);
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

      if (activeTab === "allRecords") {
        setData(nonDeletedData);
      } else if (activeTab === "all") {
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

  const fetchPaymentTransactions = async () => {
    try {
      const res = await fetch("/api/payments");
      const json = await res.json();

      if (Array.isArray(json)) {
        setPaymentTransactions(json);
      }
    } catch (err) {
      console.error("Error fetching payment transactions", err);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchData();
      fetchPaymentTransactions();
    }
  }, [activeTab, mounted, deletedRecords.length]);

  const triggerNotification = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      4500,
    );
  };

  const toggleRecordHighlight = (id) => {
    setHighlightedRecordId((currentId) =>
      Number(currentId) === Number(id) ? null : id,
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const updatedForm = {
      ...formData,
      [name]: value,
    };

    if (
      name === "package_price" ||
      name === "discount_rate" ||
      name === "discount_type" ||
      name === "transport_cost"
    ) {
      const packagePrice = parseFloat(updatedForm.package_price) || 0;
      const discountValue = parseFloat(updatedForm.discount_rate) || 0;
      const transportCost = parseFloat(updatedForm.transport_cost) || 0;

      let agreedPrice = packagePrice;

      if (updatedForm.discount_type === "percentage") {
        agreedPrice = packagePrice - (packagePrice * discountValue) / 100;
      } else {
        agreedPrice = packagePrice - discountValue;
      }

      updatedForm.agreed_price = Math.max(agreedPrice, 0) + transportCost;
    }

    if (name === "advance_paid") {
      const advancePaid = parseFloat(updatedForm.advance_paid) || 0;
      const currentPaid = parseFloat(updatedForm.paid_amount) || 0;

      if (currentPaid === 0 || currentPaid < advancePaid) {
        updatedForm.paid_amount = advancePaid;
      }
    }

    if (name === "new_payment") {
      const previousNewPayment = parseFloat(formData.new_payment) || 0;
      const currentPaid = parseFloat(formData.paid_amount) || 0;
      const newPayment = parseFloat(value) || 0;

      updatedForm.paid_amount = currentPaid - previousNewPayment + newPayment;
    }

    const agreedPrice = parseFloat(updatedForm.agreed_price) || 0;
    const paidAmount = parseFloat(updatedForm.paid_amount) || 0;

    updatedForm.pending_payment = Math.max(agreedPrice - paidAmount, 0);

    setFormData(updatedForm);

    if (!updatedForm.id) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(updatedForm));
    }
  };

  const openCustomerInDashboard = (item) => {
    setSelectedCustomerRecord(item);
    setActivePage("dashboard");
    setActiveTab("allRecords");
    setSearchTerm("");
    clearSearchAndFilters();

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
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
        triggerNotification(
          "Status update failed. Please try again.",
          "delete",
        );
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
    } else if (type === "vendor") {
      try {
        await axios.delete(`/api/vendors?id=${id}`);

        await fetchVendors();

        triggerNotification(`${name} vendor removed successfully.`, "delete");
      } catch (error) {
        console.error(error);

        triggerNotification(
          "Vendor delete failed. Please try again.",
          "delete",
        );
      }
    } else if (type === "vendor") {
      try {
        await axios.delete(`/api/vendors?id=${id}`);

        await fetchVendors();

        triggerNotification(`${name} vendor removed successfully.`, "delete");
      } catch (error) {
        console.error(error);

        triggerNotification(
          "Vendor delete failed. Please try again.",
          "delete",
        );
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

  const openCustomerStatusPopup = (item) => {
    let message = "";

    if (item.status === "Completed") {
      message = "This Wedding is completed !!";
    } else if (item.status === "Confirmed") {
      message = `Congratulations ${item.couple_name} !!\n Your Booking is Confirmed for ${
        item.wedding_date || "the selected wedding date"
      }\nService type : ${item.service_type}`;
    } else {
      message = "This booking is still pending.";
    }

    setStatusPopup({
      show: true,
      status: item.status,
      message,
    });
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
      new_payment: "",
    });

    setIsModalOpen(true);
  };

  const openAddModal = () => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);

    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    } else {
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
        package_price: "",
        discount_rate: "",
        agreed_price: "",
        advance_paid: "",
        status: "Inquiry",
        remarks: "",
        country: "Local",
        advance_paid_date: "",
        paid_amount: "",
        paid_date: "",
        new_payment: "",
        discount_type: "percentage",
        transport_cost: "",
      });
    }

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
        const json = await res.json();

        if (formData.id && Number(formData.new_payment || 0) > 0) {
          const paymentRes = await fetch("/api/payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              inquiry_id: formData.id,
              amount: Number(formData.new_payment || 0),
              payment_date:
                formData.paid_date || new Date().toISOString().slice(0, 10),
              payment_type: "Partial",
            }),
          });

          const paymentJson = await paymentRes.json();

          if (!paymentRes.ok || paymentJson.success === false) {
            console.error("Payment save failed:", paymentJson);
            triggerNotification("Payment history save failed.", "delete");
            return;
          }
        }

        if (!formData.id) {
          localStorage.removeItem(DRAFT_KEY);
        }

        setIsModalOpen(false);
        fetchData();
        fetchPaymentTransactions();
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

  const clearPriceFields = () => {
    const updatedForm = {
      ...formData,
      package_price: "",
      discount_rate: "",
      agreed_price: "",
      advance_paid: "",
      advance_paid_date: "",
      paid_amount: "",
      paid_date: "",
      new_payment: "",
      pending_payment: "",
      transport_cost: "",
    };

    setFormData(updatedForm);

    if (!updatedForm.id) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(updatedForm));
    }
  };

  const getCountryDisplay = (code) => {
    const match = COUNTRIES.find((c) => c.code == code);
    return match
      ? { flag: match.flag, name: match.name }
      : { flag: "🇱🇰", name: "Local Sri Lanka" };
  };

  const activeRecordsDisplay = activeTab === "trash" ? deletedRecords : data;

  const dashboardRecordsDisplay = selectedCustomerRecord
    ? activeRecordsDisplay.filter(
        (item) => Number(item.id) === Number(selectedCustomerRecord.id),
      )
    : activeRecordsDisplay;

  const filteredRecordsDisplay = dashboardRecordsDisplay.filter((item) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      item.couple_name?.toLowerCase().includes(search) ||
      item.wedding_date?.toLowerCase().includes(search) ||
      item.contact_no?.toLowerCase().includes(search);

    const itemWeddingDate = item.wedding_date || "";

    const matchesWeddingDate =
      !filters.weddingDate || itemWeddingDate === filters.weddingDate;

    const matchesWeddingDateRange =
      (!filters.weddingDateFrom ||
        itemWeddingDate >= filters.weddingDateFrom) &&
      (!filters.weddingDateTo || itemWeddingDate <= filters.weddingDateTo);

    const matchesWeddingMonth =
      !filters.weddingMonth ||
      itemWeddingDate.slice(0, 7) === filters.weddingMonth;

    const matchesServiceType =
      !filters.serviceType?.length ||
      filters.serviceType.some((service) =>
        item.service_type?.includes(service),
      );

    const matchesWeddingType =
      !filters.weddingType || item.wedding_type === filters.weddingType;

    const matchesStatus = !filters.status || item.status === filters.status;

    return (
      matchesSearch &&
      matchesWeddingDate &&
      matchesWeddingDateRange &&
      matchesWeddingMonth &&
      matchesServiceType &&
      matchesWeddingType &&
      matchesStatus
    );
  });

  const totalPages = Math.ceil(filteredRecordsDisplay.length / recordsPerPage);

  const paginatedRecordsDisplay = filteredRecordsDisplay.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, activeTab, activePage, selectedCustomerRecord]);

  const upcomingWeddings = data.filter((item) => {
    if (item.status !== "Confirmed" || !item.wedding_date) {
      return false;
    }

    const weddingDate = moment(item.wedding_date);
    const today = moment();

    const daysLeft = weddingDate.diff(today, "days");

    return daysLeft >= 0 && daysLeft <= 14;
  });

  const urgentUpcomingWeddings = data.filter((item) => {
    if (item.status !== "Confirmed" || !item.wedding_date) {
      return false;
    }

    const weddingDate = moment(item.wedding_date, "YYYY-MM-DD").startOf("day");
    const today = moment().startOf("day");

    const daysLeft = weddingDate.diff(today, "days");

    return daysLeft >= 0 && daysLeft <= 7;
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
      weddingDateFrom: "",
      weddingDateTo: "",
      weddingMonth: "",
      serviceType: [],
      weddingType: "",
      status: "",
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    setLoginLoading(true);
    setLoginError("");

    setTimeout(() => {
      const ADMIN_USERNAME = "a";
      const ADMIN_PASSWORD = "a";

      if (
        loginData.username === ADMIN_USERNAME &&
        loginData.password === ADMIN_PASSWORD
      ) {
        localStorage.setItem("chathu_admin_logged_in", "true");
        localStorage.setItem("chathu_admin_login_time", Date.now().toString());
        setIsLoggedIn(true);
        setLoginData({ username: "", password: "" });
      } else {
        setLoginError("Invalid username or password");
      }

      setLoginLoading(false);
    }, 900);
  };

  const handleLogout = () => {
    localStorage.removeItem("chathu_admin_logged_in");

    setLoginData({
      username: "",
      password: "",
    });

    setLoginError("");

    setIsLoggedIn(false);
  };

  const openVendorModal = (vendor = null) => {
    if (vendor) {
      setVendorForm(vendor);
    } else {
      setVendorForm({
        id: null,
        name: "",
        service: "",
        contact_number: "",
        location: "",
        remarks: "",
      });
    }

    setIsVendorModalOpen(true);
  };

  const handleVendorChange = (e) => {
    const { name, value } = e.target;

    setVendorForm({
      ...vendorForm,
      [name]: value,
    });
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();

    if (!vendorForm.name.trim()) {
      triggerNotification("Vendor name is required.", "delete");
      return;
    }

    const isUpdate = Boolean(vendorForm.id);

    try {
      if (isUpdate) {
        await axios.put(`/api/vendors?id=${vendorForm.id}`, vendorForm);
      } else {
        await axios.post("/api/vendors", vendorForm);
      }

      await fetchVendors();

      triggerNotification(
        isUpdate
          ? `Changes applied to ${vendorForm.name}'s vendor file.`
          : `New vendor ${vendorForm.name} has been added successfully! ✨`,
        "success",
      );

      setIsVendorModalOpen(false);

      setVendorForm({
        id: null,
        name: "",
        service: "",
        contact_number: "",
        location: "",
        remarks: "",
      });
    } catch (error) {
      console.error("Vendor save error:", error);
      triggerNotification("Vendor save failed. Please try again.", "delete");
    }
  };

  const deleteVendor = (vendor) => {
    setDeleteModal({
      show: true,
      id: vendor.id,
      name: vendor.name,
      type: "vendor",
    });
  };

  const fetchVendors = async () => {
    setVendorLoading(true);

    try {
      const response = await axios.get("/api/vendors");
      setVendors(response.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      triggerNotification("Failed to load vendors.", "delete");
    } finally {
      setVendorLoading(false);
    }
  };

  const filteredCustomers = data.filter((item) =>
    item.couple_name
      ?.toLowerCase()
      .includes(customerSearch.toLowerCase().trim()),
  );

  const filteredVendors = vendors.filter((vendor) => {
    const search = vendorSearch.toLowerCase().trim();

    return (
      !search ||
      vendor.name?.toLowerCase().includes(search) ||
      vendor.service?.toLowerCase().includes(search) ||
      vendor.contact_number?.toLowerCase().includes(search)
    );
  });

  const paymentRecords = data.filter(
    (item) => Number(item.agreed_price || 0) > 0,
  );

  const totalReceived = paymentRecords.reduce(
    (sum, item) => sum + Number(item.paid_amount || 0),
    0,
  );

  const totalPending = paymentRecords.reduce(
    (sum, item) => sum + Number(item.pending_payment || 0),
    0,
  );

  const totalBusiness = totalReceived + totalPending;

  const fullyPaidRecords = paymentRecords.filter(
    (item) => Number(item.pending_payment || 0) <= 0,
  );

  const partiallyPaidRecords = paymentRecords.filter((item) => {
    const totalPaid = Number(item.paid_amount || 0);

    return totalPaid > 0 && Number(item.pending_payment || 0) > 0;
  });

  const pendingPaymentRecords = paymentRecords.filter((item) => {
    const totalPaid = Number(item.paid_amount || 0);

    return totalPaid === 0;
  });

  const filteredPayments = paymentRecords.filter((item) => {
    const search = paymentSearch.toLowerCase().trim();

    const totalPaid = Number(item.paid_amount || 0);

    const paymentStatus =
      Number(item.pending_payment || 0) <= 0
        ? "Fully Paid"
        : totalPaid > 0
          ? "Partially Paid"
          : "Pending";

    const matchesSearch =
      !search ||
      item.couple_name?.toLowerCase().includes(search) ||
      item.contact_no?.toLowerCase().includes(search) ||
      item.wedding_date?.toLowerCase().includes(search);

    const matchesStatus =
      !paymentStatusFilter || paymentStatus === paymentStatusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!mounted) return <div className="min-h-screen bg-gray-50" />;

  if (!isLoggedIn) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden"
        style={{
          backgroundImage: "url('/background_img_1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white/55 backdrop-blur-[3px]" />

        <div className="relative z-10 w-full max-w-sm">
          <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/50 p-6 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-fuchsia-200/50 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-rose-200/50 rounded-full blur-3xl" />

            <div className="relative text-center mb-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-white/80 shadow-xl border border-white/60 flex items-center justify-center mb-4">
                <img
                  src="/official Logo.png"
                  alt="Chathu Wedding Planners"
                  className="w-20 h-20 object-contain"
                />
              </div>

              <h1 className="text-2xl font-black text-fuchsia-950">
                Welcome Back
              </h1>

              <p className="text-xs text-gray-500 mt-1 font-semibold">
                Chathu Wedding Planners Admin Panel
              </p>
            </div>

            <form onSubmit={handleLogin} className="relative space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={loginData.username}
                disabled={loginLoading}
                onChange={(e) =>
                  setLoginData({ ...loginData, username: e.target.value })
                }
                className="w-full p-3.5 text-black rounded-2xl bg-white/80 border border-fuchsia-200 outline-none focus:ring-2 focus:ring-fuchsia-300 text-sm font-semibold disabled:opacity-60"
              />

              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                disabled={loginLoading}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                className="w-full p-3.5 text-black rounded-2xl bg-white/80 border border-fuchsia-200 outline-none focus:ring-2 focus:ring-fuchsia-300 text-sm font-semibold disabled:opacity-60"
              />

              {loginError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl p-3">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full p-3.5 rounded-2xl bg-fuchsia-300 hover:bg-fuchsia-400 text-black font-black transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loginLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex text-gray-800 font-sans relative"
      style={{
        backgroundImage: "url('/background_img_1.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] pointer-events-none"></div>
      <div className="relative z-10 flex flex-col w-full">
        <header
          className="w-full text-emerald-950 shadow-xl backdrop-blur-xl p-4 sticky top-0 z-[999] flex items-center justify-between border-b border-white/30"
          style={{
            backgroundImage: "url('/header-nav-img.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden w-10 h-10 rounded-2xl bg-white/50 border border-white/40 shadow-sm flex items-center justify-center text-fuchsia-950 font-black active:scale-95 transition"
            >
              ☰
            </button>
            <img
              src="/official Logo.png"
              alt="Chathu Wedding Planners"
              className="w-12 h-12 object-contain rounded-full shadow-sm"
            />

            <div>
              <h1 className="text-xl font-bold tracking-wide text-fuchsia-950">
                Chathu Wedding Planners
              </h1>

              <p className="text-xs text-fuchsia-900 mt-0.5 uppercase tracking-wider">
                {activeTab === "allRecords"
                  ? "ALL WEDDING RECORDS"
                  : activeTab === "all"
                    ? "ACTIVE WEDDING INQUIRIES"
                    : activeTab === "completed"
                      ? "OUR WEDDING ENQUIRIES"
                      : "RECYCLE TRACK STORAGE"}
              </p>
              {upcomingWeddings.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWeddingAlertModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-rose-100/90 backdrop-blur-md text-rose-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-black animate-pulse shadow-sm border border-rose-200 hover:bg-rose-200 hover:scale-105 active:scale-95 transition"
                  >
                    🔔 {upcomingWeddings.length} Within 14 Days
                  </button>

                  {urgentUpcomingWeddings.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsWeddingAlertModalOpen(true)}
                      className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] md:text-xs font-black animate-pulse shadow-sm border border-red-700 hover:bg-red-700 hover:scale-105 active:scale-95 transition"
                    >
                      🚨 {urgentUpcomingWeddings.length} Within 7 Days
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-2">
            <div className="text-right leading-tight max-w-[105px] md:max-w-none">
              <p className="text-[8px] md:text-[10px] uppercase tracking-wider font-bold text-fuchsia-900">
                Sri Lanka
              </p>

              <p className="text-[9px] md:text-sm font-bold text-fuchsia-950 whitespace-nowrap">
                {currentSLTime}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="px-2 md:px-3 py-2 rounded-xl bg-white/40 hover:bg-white/60 text-fuchsia-900 text-[10px] md:text-xs font-bold border border-white/40"
            >
              Logout
            </button>
          </div>
        </header>

        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-[999999] md:hidden">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
              onClick={() => setIsMobileSidebarOpen(false)}
            />

            <div className="absolute left-0 top-0 h-full w-[82%] max-w-sm bg-white/90 backdrop-blur-2xl shadow-2xl border-r border-white/50 p-5 animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src="/official Logo.png"
                    alt="Chathu Wedding Planners"
                    className="w-12 h-12 object-contain rounded-full shadow-sm"
                  />

                  <div>
                    <h2 className="text-sm font-black text-fuchsia-950">
                      Chathu Wedding
                    </h2>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">
                      Admin Menu
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 font-black"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { key: "dashboard", label: "Dashboard", icon: "🏠" },
                  { key: "customers", label: "Customers", icon: "👰" },
                  { key: "vendors", label: "Vendors", icon: "🤝" },
                  { key: "payments", label: "Payments", icon: "💳" },
                  { key: "packages", label: "Our Packages", icon: "📦" },
                ].map((nav) => (
                  <button
                    key={nav.key}
                    type="button"
                    onClick={() => {
                      setActivePage(nav.key);

                      if (nav.key === "customers" || nav.key === "payments") {
                        setActiveTab("allRecords");
                      }

                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black transition ${
                      activePage === nav.key
                        ? "bg-emerald-100 text-emerald-800 shadow-sm"
                        : "bg-white/60 text-gray-700 hover:bg-white"
                    }`}
                  >
                    <span className="text-lg">{nav.icon}</span>
                    <span>{nav.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-1 min-h-0">
          <div className="hidden md:flex w-72 h-[calc(100vh-88px)] sticky top-[88px] bg-white/70 backdrop-blur-2xl border-r border-white/40 flex-col p-5 shadow-xl overflow-y-auto">
            <div className="mb-10"></div>

            <div className="space-y-2">
              <button
                onClick={() => setActivePage("dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition ${activePage === "dashboard" ? "bg-emerald-100 text-emerald-800" : "hover:bg-white/60 text-gray-700"}`}
              >
                🏠 Dashboard
              </button>

              <button
                onClick={() => {
                  setActivePage("customers");
                  setActiveTab("allRecords");
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition ${activePage === "customers" ? "bg-emerald-100 text-emerald-800" : "hover:bg-white/60 text-gray-700"}`}
              >
                👰 Customers
              </button>

              <button
                onClick={() => setActivePage("vendors")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition ${activePage === "vendors" ? "bg-emerald-100 text-emerald-800" : "hover:bg-white/60 text-gray-700"}`}
              >
                🤝 Vendors
              </button>

              <button
                onClick={() => {
                  setActivePage("payments");
                  setActiveTab("allRecords");
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition ${
                  activePage === "payments"
                    ? "bg-emerald-100 text-emerald-800"
                    : "hover:bg-white/60 text-gray-700"
                }`}
              >
                💳 Payments
              </button>

              <button
                onClick={() => setActivePage("packages")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition ${activePage === "packages" ? "bg-emerald-100 text-emerald-800" : "hover:bg-white/60 text-gray-700"}`}
              >
                📦 Our Packages
              </button>
            </div>
          </div>

          <div className="relative z-10 flex-1 overflow-x-hidden pb-10">
            {/* HIGH VISIBILITY FLOATING INTERACTIVE TOAST BARS */}
            {toast.show && (
              <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[99999] w-full max-w-md px-4 pointer-events-auto">
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
            {activePage === "dashboard" && (
              <>
                <div className="hidden md:block relative z-[100] max-w-[98%] mx-auto mt-4 bg-white/90 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-sm p-3 overflow-visible">
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-[1.8] min-w-[260px]">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 px-1">
                        Search
                      </label>

                      <input
                        type="text"
                        placeholder="Search by couple name, wedding date or contact no..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-fuchsia-300"
                      />
                    </div>

                    <div className="w-[150px]">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 px-1">
                        Wedding Date From
                      </label>

                      <input
                        type="date"
                        value={filters.weddingDateFrom}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            weddingDateFrom: e.target.value,
                          })
                        }
                        className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-fuchsia-300"
                      />
                    </div>

                    <div className="w-[150px]">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 px-1">
                        Wedding Date To
                      </label>

                      <input
                        type="date"
                        value={filters.weddingDateTo}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            weddingDateTo: e.target.value,
                          })
                        }
                        className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-fuchsia-300"
                      />
                    </div>

                    <div className="w-[150px]">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 px-1">
                        Search By Month
                      </label>

                      <input
                        type="month"
                        value={filters.weddingMonth}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            weddingMonth: e.target.value,
                          })
                        }
                        className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-fuchsia-300"
                      />
                    </div>

                    <div className="relative w-[190px]">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 px-1">
                        Service Types
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setIsFilterServiceDropdownOpen(
                            !isFilterServiceDropdownOpen,
                          )
                        }
                        className="w-full p-2.5 bg-white border rounded-xl text-sm outline-none text-left flex items-center justify-between focus:ring-2 focus:ring-fuchsia-300"
                      >
                        <span className="truncate">
                          {filters.serviceType?.length > 0
                            ? `${filters.serviceType.length} service(s)`
                            : "All Service Types"}
                        </span>
                        <span className="text-gray-400">▾</span>
                      </button>

                      {isFilterServiceDropdownOpen && (
                        <div className="absolute left-0 top-full z-[99999] mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl p-2 space-y-1">
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

                                  setFilters({
                                    ...filters,
                                    serviceType: e.target.checked
                                      ? [...current, service]
                                      : current.filter((s) => s !== service),
                                  });
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

                    <div className="w-[160px]">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 px-1">
                        Wedding Types
                      </label>
                      <select
                        value={filters.weddingType}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            weddingType: e.target.value,
                          })
                        }
                        className="w-[160px] p-2.5 bg-white border rounded-xl text-sm outline-none focus:ring-2 focus:ring-fuchsia-300"
                      >
                        <option value="">All Wedding Types</option>
                        <option value="One day">One day</option>
                        <option value="Two days">Two days</option>
                      </select>
                    </div>

                    <div className="w-[135px]">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 px-1">
                        Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            status: e.target.value,
                          })
                        }
                        className="w-[135px] p-2.5 bg-white border rounded-xl text-sm outline-none focus:ring-2 focus:ring-fuchsia-300"
                      >
                        <option value="">All Status</option>
                        <option value="Inquiry">Inquiry</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={clearSearchAndFilters}
                      className="w-[130px] px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition mt-5"
                    >
                      Clear
                    </button>

                    {/* <div className="ml-auto whitespace-nowrap text-xs font-bold text-gray-400">
                      Showing {filteredRecordsDisplay.length} of{" "}
                      {activeRecordsDisplay.length}
                    </div> */}
                  </div>
                </div>

                <div className="md:hidden max-w-[94%] mx-auto mt-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search by name, date or contact..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 p-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-sm text-sm outline-none focus:ring-2 focus:ring-fuchsia-300"
                    />

                    <button
                      type="button"
                      onClick={() => setIsMobileFilterOpen(true)}
                      className="w-12 h-12 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/50 shadow-sm flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 text-gray-700"
                      >
                        <line x1="4" y1="21" x2="4" y2="14"></line>
                        <line x1="4" y1="10" x2="4" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12" y2="3"></line>
                        <line x1="20" y1="21" x2="20" y2="16"></line>
                        <line x1="20" y1="12" x2="20" y2="3"></line>

                        <line x1="1" y1="14" x2="7" y2="14"></line>
                        <line x1="9" y1="8" x2="15" y2="8"></line>
                        <line x1="17" y1="16" x2="23" y2="16"></line>
                      </svg>
                    </button>
                  </div>

                  <div className="mt-3">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 px-1">
                      Search by wedding date(mm/dd/yyyy)
                    </label>

                    <input
                      type="date"
                      value={filters.weddingDate}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          weddingDate: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-sm text-sm outline-none focus:ring-2 focus:ring-fuchsia-300"
                    />
                  </div>
                </div>

                <div className="max-w-[98%] mx-auto mt-4 flex justify-start gap-2 bg-white/30 backdrop-blur-lg border border-white/30 rounded-2xl p-3 shadow-lg">
                  <button
                    onClick={openAddModal}
                    className="bg-white text-fuchsia-500 border border-fuchsia-200 font-semibold px-4 py-2 rounded-lg shadow hover:bg-fuchsia-50 transition text-sm"
                  >
                    + New Inquiry
                  </button>

                  <button
                    onClick={() => setIsCalendarOpen(true)}
                    className="bg-fuchsia-200 text-black font-semibold px-4 py-2 rounded-lg shadow hover:bg-fuchsia-300 transition text-sm"
                  >
                    📅 Calendar
                  </button>
                </div>

                {tabLoading && (
                  <div className="fixed inset-0 z-[99999] bg-black/20 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl px-8 py-6 shadow-2xl border border-white/40 flex flex-col items-center gap-4">
                      <div className="w-14 h-14 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />

                      <div className="text-center">
                        <p className="text-base font-bold text-gray-800">
                          Loading Wedding Records
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          Please wait a moment...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {upcomingWeddings.length > 0 && (
                  <div className="max-w-[98%] mx-auto mt-5 bg-gradient-to-r from-rose-500/10 to-pink-500/10 backdrop-blur-xl border border-rose-200 rounded-3xl shadow-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-rose-200/50 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-black text-rose-700 flex items-center gap-2">
                          🔔 Upcoming Weddings
                        </h3>

                        <p className="text-xs text-rose-500 mt-1">
                          Weddings happening within next 14 days
                        </p>
                      </div>

                      <div className="bg-rose-600 text-white text-sm font-black px-3 py-1 rounded-full animate-pulse">
                        {upcomingWeddings.length}
                      </div>
                    </div>

                    <div className="divide-y divide-rose-100">
                      {upcomingWeddings.map((item) => {
                        const daysLeft = moment(item.wedding_date).diff(
                          moment(),
                          "days",
                        );

                        return (
                          <div
                            key={item.id}
                            className="p-4 hover:bg-white/30 transition"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="font-black text-gray-900 text-sm md:text-base">
                                  {item.couple_name}
                                </h4>

                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-600">
                                  <span>
                                    📅{" "}
                                    {moment(item.wedding_date).format(
                                      "MMMM D, YYYY",
                                    )}
                                  </span>

                                  <span>•</span>

                                  <span>
                                    🏨 {item.hotel || "Venue not added"}
                                  </span>
                                </div>
                              </div>

                              <div
                                className={`px-3 py-1 rounded-full text-xs font-black shrink-0 ${
                                  daysLeft <= 3
                                    ? "bg-red-600 text-white animate-pulse"
                                    : "bg-rose-100 text-rose-700"
                                }`}
                              >
                                {daysLeft === 0
                                  ? "TODAY"
                                  : `${daysLeft} DAYS LEFT`}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* DASHBOARD TAB SEGMENT CONSOLE NAVIGATION BAR */}
                <div className="max-w-[98%] mx-auto mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 md:border-b bg-white/50 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none rounded-3xl md:rounded-none p-3 md:p-0 shadow-xl md:shadow-none border border-white/40 md:border-0">
                  <div className="grid grid-cols-1 gap-2 w-full md:flex md:flex-wrap">
                    <button
                      onClick={() => handleTabChange("all")}
                      className={`py-3 px-4 rounded-2xl md:rounded-none font-bold text-xs md:text-lg transition-all border md:border-0 md:border-b-2 flex items-center gap-2 ${
                        activeTab === "all"
                          ? "bg-fuchsia-200 text-white border-fuchsia-200 shadow-lg md:bg-transparent md:text-fuchsia-500 md:border-fuchsia-200 md:shadow-none"
                          : "bg-white/60 text-gray-500 border-white/40 hover:bg-white/80 md:bg-transparent md:border-transparent md:hover:text-gray-700"
                      }`}
                    >
                      ❤️ Active Wedding Inquiries
                    </button>

                    <button
                      onClick={() => handleTabChange("completed")}
                      className={`py-3 px-4 rounded-2xl md:rounded-none font-bold text-xs md:text-lg transition-all border md:border-0 md:border-b-2 flex items-center gap-2 ${
                        activeTab === "completed"
                          ? "bg-fuchsia-200 text-white border-fuchsia-200 shadow-lg md:bg-transparent md:text-fuchsia-500 md:border-fuchsia-200 md:shadow-none"
                          : "bg-white/60 text-gray-500 border-white/40 hover:bg-white/80 md:bg-transparent md:border-transparent md:hover:text-gray-700"
                      }`}
                    >
                      ✨ Completed Weddings
                    </button>

                    <button
                      onClick={() => handleTabChange("allRecords")}
                      className={`py-3 px-4 rounded-2xl md:rounded-none font-bold text-xs md:text-lg transition-all border md:border-0 md:border-b-2 flex items-center gap-2 ${
                        activeTab === "allRecords"
                          ? "bg-fuchsia-200 text-white border-fuchsia-200 shadow-lg md:bg-transparent md:text-fuchsia-500 md:border-fuchsia-200 md:shadow-none"
                          : "bg-white/60 text-gray-500 border-white/40 hover:bg-white/80 md:bg-transparent md:border-transparent md:hover:text-gray-700"
                      }`}
                    >
                      📁 All Records
                    </button>

                    <button
                      onClick={() => handleTabChange("trash")}
                      className={`py-3 px-4 rounded-2xl md:rounded-none font-bold text-xs md:text-lg transition-all border md:border-0 md:border-b-2 flex items-center gap-2 ${
                        activeTab === "trash"
                          ? "bg-fuchsia-200 text-white border-fuchsia-200 shadow-lg md:bg-amber-50/40 md:text-fuchsia-500 md:border-fuchsia-200 md:shadow-none"
                          : "bg-white/60 text-gray-400 border-white/40 hover:bg-white/80 md:bg-transparent md:border-transparent md:hover:text-gray-600"
                      }`}
                    >
                      🗑️ Deleted Records
                      {deletedRecords.length > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse ${
                            activeTab === "trash"
                              ? "bg-white text-amber-700 md:bg-amber-600 md:text-white"
                              : "bg-amber-600 text-white"
                          }`}
                        >
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
                      className="w-full md:w-auto mb-0 md:mb-0 bg-gradient-to-r from-red-600 to-rose-700 text-white text-xs font-black px-4 py-3 md:py-2 rounded-2xl md:rounded-xl shadow-md shadow-red-100 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5"
                    >
                      💥 Clear All Deleted Records
                    </button>
                  )}
                </div>

                {selectedCustomerRecord && (
                  <div className="max-w-[98%] mx-auto mt-4 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-xs font-black uppercase text-emerald-700">
                        Showing selected customer
                      </p>
                      <p className="text-sm font-bold text-gray-800">
                        {selectedCustomerRecord.couple_name}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCustomerRecord(null)}
                      className="px-4 py-2 rounded-xl bg-white text-emerald-700 border border-emerald-200 text-xs font-black hover:bg-emerald-100 transition"
                    >
                      Show All Records
                    </button>
                  </div>
                )}

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
                      <div className="hidden lg:block bg-white shadow-md rounded-xl border border-gray-100 w-full clear-both overflow-hidden">
                        <div className="max-h-[68vh] overflow-auto">
                          <table className="w-full text-left border-collapse min-w-max table-auto bg-white rounded-xl">
                            <thead className="sticky top-0 z-30">
                              <tr
                                className={`${activeTab === "trash" ? "bg-fuchsia-50 text-fuchsia-950" : "bg-fuchsia-50 text-fuchsia-900"} md:text-[15px] uppercase font-bold border-b border-gray-200`}
                              >
                                <th className="p-3 text-center w-12 bg-inherit">
                                  #
                                </th>
                                <th className="sticky left-0 z-40 p-3 bg-fuchsia-50 shadow-sm">
                                  Couple Name
                                </th>
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
                                <th className="p-3 text-right bg-inherit">
                                  Package Price
                                </th>
                                <th className="p-3 text-right bg-inherit">
                                  Discount
                                </th>
                                <th className="p-3 text-right bg-inherit">
                                  Transport Cost
                                </th>
                                <th className="p-3 text-right bg-inherit">
                                  Agreed Price
                                </th>
                                <th className="p-3 text-right bg-inherit">
                                  Advance Paid
                                </th>
                                <th className="p-3 text-right bg-inherit">
                                  Pending Balance
                                </th>
                                <th className="p-3 text-right bg-inherit">
                                  Paid Amount
                                </th>
                                <th className="p-3 text-center bg-inherit">
                                  Status
                                </th>
                                <th className="p-3 bg-inherit">Remarks</th>
                                <th className="sticky right-0 z-40 p-3 text-center w-36 bg-fuchsia-50 shadow-sm">
                                  {activeTab === "trash"
                                    ? "Restore / Wipe"
                                    : "Actions"}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 md:text-sm bg-white">
                              {paginatedRecordsDisplay.map((item, index) => {
                                const countryInfo = getCountryDisplay(
                                  item.country,
                                );
                                return (
                                  <tr
                                    key={item.id}
                                    onClick={() =>
                                      toggleRecordHighlight(item.id)
                                    }
                                    className={`cursor-pointer transition ${
                                      Number(highlightedRecordId) ===
                                      Number(item.id)
                                        ? "bg-amber-100 ring-2 ring-amber-300 shadow-inner"
                                        : "bg-white hover:bg-gray-50/80"
                                    }`}
                                  >
                                    <td className="p-3 text-center font-medium text-gray-400">
                                      {(currentPage - 1) * recordsPerPage +
                                        index +
                                        1}
                                    </td>
                                    <td className="sticky left-0 z-20 p-3 font-bold text-gray-900 bg-white shadow-sm">
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
                                    <td className="p-3 max-w-[220px]">
                                      <div className="whitespace-normal break-words leading-snug">
                                        {item.hotel || "-"}
                                      </div>
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

                                    <td className="p-3 text-right font-mono font-semibold text-gray-800">
                                      {item.package_price
                                        ? Number(
                                            item.package_price,
                                          ).toLocaleString("en-LK", {
                                            minimumFractionDigits: 2,
                                          })
                                        : "0.00"}
                                    </td>

                                    <td className="p-3 text-right font-mono font-semibold text-purple-700">
                                      {item.discount_type === "percentage"
                                        ? `${item.discount_rate}%`
                                        : `LKR ${Number(item.discount_rate).toLocaleString("en-LK")}`}
                                    </td>

                                    <td className="p-3 text-right font-mono font-semibold">
                                      <span
                                        className={
                                          Number(item.transport_cost || 0) > 0
                                            ? "text-cyan-700"
                                            : "text-gray-300"
                                        }
                                      >
                                        {Number(
                                          item.transport_cost || 0,
                                        ).toLocaleString("en-LK", {
                                          minimumFractionDigits: 2,
                                        })}
                                      </span>
                                    </td>

                                    <td className="p-3 text-right font-mono font-semibold text-gray-900">
                                      {item.agreed_price
                                        ? item.agreed_price.toLocaleString(
                                            "en-LK",
                                            {
                                              minimumFractionDigits: 2,
                                            },
                                          )
                                        : "0.00"}
                                    </td>
                                    <td className="p-3 text-right font-mono font-semibold text-amber-700">
                                      <div>
                                        {item.advance_paid
                                          ? Number(
                                              item.advance_paid,
                                            ).toLocaleString("en-LK", {
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
                                        ? item.pending_payment.toLocaleString(
                                            "en-LK",
                                            {
                                              minimumFractionDigits: 2,
                                            },
                                          )
                                        : "0.00"}
                                    </td>

                                    <td className="p-3 text-right font-mono font-bold text-emerald-700">
                                      <div>
                                        {item.paid_amount
                                          ? Number(
                                              item.paid_amount,
                                            ).toLocaleString("en-LK", {
                                              minimumFractionDigits: 2,
                                            })
                                          : "0.00"}
                                      </div>

                                      {item.paid_date && (
                                        <div className="text-[10px] text-gray-400 font-sans mt-0.5">
                                          ({item.paid_date})
                                        </div>
                                      )}
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
                                    <td className="p-3 text-gray-500 max-w-xs">
                                      {item.remarks ? (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setSelectedRemark(item.remarks)
                                          }
                                          className="max-w-xs truncate text-left text-gray-500 hover:text-fuchsia-600 hover:underline transition"
                                          title="Click to view full remarks"
                                        >
                                          {item.remarks}
                                        </button>
                                      ) : (
                                        "—"
                                      )}
                                    </td>

                                    <td className="sticky right-0 z-20 p-3 text-center bg-white shadow-sm">
                                      {activeTab === "trash" ? (
                                        <div className="flex items-center justify-center gap-2">
                                          <button
                                            onClick={() =>
                                              handleRecoverRecord(item)
                                            }
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
                                            className="text-fuchsia-600 font-bold hover:underline"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={() =>
                                              initiateDelete(item, "soft")
                                            }
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
                      </div>

                      {/* Pagination buttons */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between gap-3 mt-4 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl p-3 shadow-sm">
                          <p className="text-xs font-bold text-gray-500">
                            Page {currentPage} of {totalPages}
                          </p>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={currentPage === 1}
                              onClick={() =>
                                setCurrentPage((p) => Math.max(p - 1, 1))
                              }
                              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition"
                            >
                              ← Previous
                            </button>

                            <button
                              type="button"
                              disabled={currentPage === totalPages}
                              onClick={() =>
                                setCurrentPage((p) =>
                                  Math.min(p + 1, totalPages),
                                )
                              }
                              className="px-4 py-2 rounded-xl bg-fuchsia-200 text-fuchsia-900 text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-fuchsia-300 transition"
                            >
                              Next →
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Mobile Cards View Layout Block */}
                      <div className="block lg:hidden space-y-4">
                        {paginatedRecordsDisplay.map((item, index) => {
                          const countryInfo = getCountryDisplay(item.country);

                          return (
                            <div
                              key={item.id}
                              onClick={() => toggleRecordHighlight(item.id)}
                              className={`rounded-3xl p-4 shadow-lg border space-y-4 transition active:scale-[0.99] ${
                                Number(highlightedRecordId) === Number(item.id)
                                  ? "bg-amber-50 border-amber-300 ring-2 ring-amber-300"
                                  : activeTab === "trash"
                                    ? "bg-amber-50 border-amber-100"
                                    : "bg-white/90 border-white/50"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="text-base font-black text-fuchsia-950">
                                    {(currentPage - 1) * recordsPerPage +
                                      index +
                                      1}
                                    . {countryInfo.flag} {item.couple_name}
                                  </h3>

                                  <p className="text-xs font-semibold text-gray-500 mt-1">
                                    📅{" "}
                                    {item.wedding_date ||
                                      "Wedding date not added"}
                                  </p>

                                  <p className="text-xs font-semibold text-gray-500">
                                    🏨 {item.hotel || "Hotel not added"}
                                  </p>

                                  <p className="text-xs font-semibold text-gray-500">
                                    📞 {item.contact_no || "Contact not added"}
                                  </p>
                                </div>

                                {activeTab !== "trash" && (
                                  <StatusDropdown
                                    currentStatus={item.status}
                                    onStatusChange={(newStatus) =>
                                      handleStatusChange(item, newStatus)
                                    }
                                  />
                                )}
                              </div>

                              <div className="rounded-2xl bg-gray-50 p-3">
                                <p className="text-[10px] uppercase font-black text-gray-400">
                                  Service Type
                                </p>
                                <p className="text-sm font-bold text-gray-800">
                                  {item.service_type || "—"}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl bg-gray-50 p-3">
                                  <p className="text-[10px] uppercase font-black text-gray-400">
                                    Package
                                  </p>
                                  <p className="text-sm font-black text-gray-800">
                                    Rs.{" "}
                                    {Number(
                                      item.package_price || 0,
                                    ).toLocaleString("en-LK")}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-purple-50 p-3">
                                  <p className="text-[10px] uppercase font-black text-purple-600">
                                    Discount
                                  </p>
                                  <p className="text-sm font-black text-purple-700">
                                    {Number(item.discount_rate || 0) > 0
                                      ? item.discount_type === "percentage"
                                        ? `${item.discount_rate}%`
                                        : `Rs. ${Number(item.discount_rate || 0).toLocaleString("en-LK")}`
                                      : "No discount"}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-cyan-50 p-3">
                                  <p className="text-[10px] uppercase font-black text-cyan-600">
                                    Transport
                                  </p>
                                  <p className="text-sm font-black text-cyan-700">
                                    Rs.{" "}
                                    {Number(
                                      item.transport_cost || 0,
                                    ).toLocaleString("en-LK")}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-fuchsia-50 p-3">
                                  <p className="text-[10px] uppercase font-black text-fuchsia-600">
                                    Agreed
                                  </p>
                                  <p className="text-sm font-black text-fuchsia-900">
                                    Rs.{" "}
                                    {Number(
                                      item.agreed_price || 0,
                                    ).toLocaleString("en-LK")}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-emerald-50 p-3">
                                  <p className="text-[10px] uppercase font-black text-emerald-600">
                                    Paid
                                  </p>
                                  <p className="text-sm font-black text-emerald-700">
                                    Rs.{" "}
                                    {Number(
                                      item.paid_amount || 0,
                                    ).toLocaleString("en-LK")}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-rose-50 p-3">
                                  <p className="text-[10px] uppercase font-black text-rose-600">
                                    Pending
                                  </p>
                                  <p className="text-sm font-black text-rose-700">
                                    Rs.{" "}
                                    {Number(
                                      item.pending_payment || 0,
                                    ).toLocaleString("en-LK")}
                                  </p>
                                </div>
                              </div>

                              {Number(item.advance_paid || 0) > 0 && (
                                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3">
                                  <p className="text-xs font-black text-amber-700">
                                    Booking Advance: Rs.{" "}
                                    {Number(
                                      item.advance_paid || 0,
                                    ).toLocaleString("en-LK")}
                                  </p>
                                  <p className="text-[10px] font-semibold text-gray-400 mt-1">
                                    {item.advance_paid_date ||
                                      "No advance date"}
                                  </p>
                                </div>
                              )}

                              {item.remarks && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRemark(item.remarks);
                                  }}
                                  className="w-full text-left rounded-2xl bg-white/70 border border-gray-100 p-3 text-xs font-semibold text-gray-600"
                                >
                                  📝 Tap to view remarks
                                </button>
                              )}

                              <div className="grid grid-cols-2 gap-3">
                                {activeTab === "trash" ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRecoverRecord(item);
                                      }}
                                      className="rounded-2xl bg-emerald-50 text-emerald-700 p-3 text-xs font-black border border-emerald-100"
                                    >
                                      Restore
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        initiateDelete(item, "permanent");
                                      }}
                                      className="rounded-2xl bg-red-50 text-red-600 p-3 text-xs font-black border border-red-100"
                                    >
                                      Wipe
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditModal(item);
                                      }}
                                      className="rounded-2xl bg-fuchsia-50 text-fuchsia-700 p-3 text-xs font-black border border-fuchsia-100"
                                    >
                                      Edit
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        initiateDelete(item, "soft");
                                      }}
                                      className="rounded-2xl bg-red-50 text-red-600 p-3 text-xs font-black border border-red-100"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </main>

                {isMobileFilterOpen && (
                  <div className="md:hidden fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm flex items-end">
                    <div className="w-full bg-white rounded-t-[2rem] p-5 shadow-2xl max-h-[82vh] overflow-y-auto">
                      <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-5" />

                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-gray-900">
                          Filters
                        </h3>

                        <button
                          type="button"
                          onClick={() => setIsMobileFilterOpen(false)}
                          className="text-gray-400 font-bold text-xl"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                            Date From
                          </label>
                          <input
                            type="date"
                            value={filters.weddingDateFrom}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                weddingDateFrom: e.target.value,
                              })
                            }
                            className="w-full p-3 rounded-2xl bg-gray-50 border border-gray-100 text-sm outline-none focus:ring-2 focus:ring-fuchsia-300"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                            Date To
                          </label>
                          <input
                            type="date"
                            value={filters.weddingDateTo}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                weddingDateTo: e.target.value,
                              })
                            }
                            className="w-full p-3 rounded-2xl bg-gray-50 border border-gray-100 text-sm outline-none focus:ring-2 focus:ring-fuchsia-300"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                            Month
                          </label>
                          <input
                            type="month"
                            value={filters.weddingMonth}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                weddingMonth: e.target.value,
                              })
                            }
                            className="w-full p-3 rounded-2xl bg-gray-50 border border-gray-100 text-sm outline-none focus:ring-2 focus:ring-fuchsia-300"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                            Service Types
                          </label>

                          <div className="flex flex-wrap gap-2">
                            {SERVICE_TYPE_OPTIONS.map((service) => (
                              <label
                                key={service}
                                className={`px-3 py-2 rounded-2xl text-xs font-bold border cursor-pointer ${
                                  filters.serviceType?.includes(service)
                                    ? "bg-emerald-600 text-white border-emerald-600"
                                    : "bg-gray-50 text-gray-600 border-gray-100"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={filters.serviceType?.includes(
                                    service,
                                  )}
                                  onChange={(e) => {
                                    const current = filters.serviceType || [];

                                    setFilters({
                                      ...filters,
                                      serviceType: e.target.checked
                                        ? [...current, service]
                                        : current.filter((s) => s !== service),
                                    });
                                  }}
                                />
                                {service}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                            Wedding Type
                          </label>
                          <select
                            value={filters.weddingType}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                weddingType: e.target.value,
                              })
                            }
                            className="w-full p-3 rounded-2xl bg-gray-50 border border-gray-100 text-sm outline-none focus:ring-2 focus:ring-fuchsia-300"
                          >
                            <option value="">All Wedding Types</option>
                            <option value="One day">One day</option>
                            <option value="Two days">Two days</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                            Status
                          </label>
                          <select
                            value={filters.status}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                status: e.target.value,
                              })
                            }
                            className="w-full p-3 rounded-2xl bg-gray-50 border border-gray-100 text-sm outline-none focus:ring-2 focus:ring-fuchsia-300"
                          >
                            <option value="">All Status</option>
                            <option value="Inquiry">Inquiry</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-6">
                        <button
                          type="button"
                          onClick={clearSearchAndFilters}
                          className="p-3 rounded-2xl border border-gray-300 text-gray-700 font-bold"
                        >
                          Reset
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsMobileFilterOpen(false)}
                          className="p-3 rounded-2xl bg-fuchsia-200 text-black font-bold"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activePage === "customers" && (
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-fuchsia-950">
                      👰 Customers
                    </h1>
                    <p className="text-sm text-fuchsia-900/70 mt-1 font-semibold">
                      All wedding customers from inquiries, confirmed and
                      completed records
                    </p>
                  </div>

                  <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl px-4 py-2 shadow text-sm font-black text-fuchsia-700">
                    Total Customers: {filteredCustomers.length}
                  </div>
                </div>
                <div className="mb-4 bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-3 shadow">
                  <input
                    type="text"
                    placeholder="Search by couple name..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full p-3 rounded-xl border border-fuchsia-100 outline-none focus:ring-2 focus:ring-fuchsia-300 text-sm font-semibold"
                  />
                </div>

                <div className="hidden md:block bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 overflow-hidden">
                  {filteredCustomers.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-4xl mb-3">👰</div>
                      <p className="text-gray-400 text-sm font-bold">
                        No customers found yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                          <tr className="bg-fuchsia-50 text-fuchsia-900 uppercase text-xs md:text-[15px] font-black border-b border-gray-200">
                            <th className="p-4 text-center w-12">#</th>
                            <th className="p-4">Couple Name</th>
                            <th className="p-4">Wedding Date</th>
                            <th className="p-4">Contact Number</th>
                            <th className="p-4">Service Type</th>
                            <th className="p-4 text-center">Status</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 bg-white md:text-sm">
                          {filteredCustomers.map((item, index) => {
                            const countryInfo = getCountryDisplay(item.country);

                            return (
                              <tr
                                key={item.id}
                                className="hover:bg-fuchsia-50/40 transition"
                              >
                                <td className="p-4 text-center font-medium text-gray-400">
                                  {index + 1}
                                </td>

                                <td className="p-4 font-bold text-gray-900">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="emoji-flag text-base select-none"
                                      title={countryInfo.name}
                                    >
                                      {countryInfo.flag}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openCustomerInDashboard(item)
                                      }
                                      className="font-black text-fuchsia-700 hover:text-fuchsia-900 hover:underline transition"
                                    >
                                      {item.couple_name}
                                    </button>
                                  </div>
                                </td>

                                <td className="p-4 text-gray-700 font-medium">
                                  {item.wedding_date || "—"}
                                </td>

                                <td className="p-4 font-mono text-gray-700">
                                  {item.contact_no || "—"}
                                </td>

                                <td className="p-4">
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded font-medium">
                                    {item.service_type || "—"}
                                  </span>
                                </td>

                                <td className="p-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openCustomerStatusPopup(item)
                                    }
                                    className={`px-3 py-1.5 rounded-xl text-xs font-black border shadow-sm hover:scale-105 active:scale-95 transition ${
                                      item.status === "Completed"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : item.status === "Confirmed"
                                          ? "bg-amber-50 text-amber-700 border-amber-200"
                                          : "bg-blue-50 text-blue-700 border-blue-200"
                                    }`}
                                  >
                                    {item.status}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="md:hidden space-y-4">
                  {filteredCustomers.length === 0 ? (
                    <div className="bg-white/85 rounded-3xl p-6 text-center border border-white/50 shadow">
                      <p className="text-sm font-bold text-gray-500">
                        No customers found yet.
                      </p>
                    </div>
                  ) : (
                    filteredCustomers.map((item) => {
                      const countryInfo = getCountryDisplay(item.country);

                      return (
                        <div
                          key={item.id}
                          className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/50 shadow-lg p-4 space-y-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <button
                                type="button"
                                onClick={() => openCustomerInDashboard(item)}
                                className="text-left text-base font-black text-fuchsia-800 hover:underline"
                              >
                                {countryInfo.flag} {item.couple_name}
                              </button>

                              <p className="text-xs font-semibold text-gray-500 mt-1">
                                📅{" "}
                                {item.wedding_date || "Wedding date not added"}
                              </p>

                              <p className="text-xs font-semibold text-gray-500">
                                📞 {item.contact_no || "Contact not added"}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => openCustomerStatusPopup(item)}
                              className={`px-3 py-1 rounded-full text-[10px] font-black border shadow-sm active:scale-95 transition ${
                                item.status === "Completed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : item.status === "Confirmed"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              {item.status}
                            </button>
                          </div>

                          <div className="rounded-2xl bg-gray-50 p-3">
                            <p className="text-[10px] uppercase font-black text-gray-400">
                              Service Type
                            </p>
                            <p className="text-sm font-bold text-gray-800">
                              {item.service_type || "—"}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => openCustomerInDashboard(item)}
                              className="rounded-2xl bg-fuchsia-50 text-fuchsia-700 p-3 text-xs font-black border border-fuchsia-100 active:scale-95 transition"
                            >
                              View Record
                            </button>

                            <button
                              type="button"
                              onClick={() => openCustomerStatusPopup(item)}
                              className="rounded-2xl bg-emerald-50 text-emerald-700 p-3 text-xs font-black border border-emerald-100 active:scale-95 transition"
                            >
                              View Status
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activePage === "vendors" && (
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-fuchsia-950">
                      🤝 Vendors
                    </h1>
                    <p className="text-sm text-fuchsia-900/70 mt-1 font-semibold">
                      Manage wedding vendors and service providers
                    </p>
                  </div>

                  <button
                    onClick={() => openVendorModal()}
                    className="bg-white text-fuchsia-500 border border-fuchsia-200 font-semibold px-4 py-2 rounded-xl shadow hover:bg-fuchsia-50 transition text-sm"
                  >
                    + Add Vendor
                  </button>
                </div>

                <div className="mb-4 bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-3 shadow">
                  <input
                    type="text"
                    placeholder="Search by name, service or contact number..."
                    value={vendorSearch}
                    onChange={(e) => setVendorSearch(e.target.value)}
                    className="w-full p-3 rounded-xl border border-fuchsia-100 outline-none focus:ring-2 focus:ring-fuchsia-300 text-sm font-semibold"
                  />
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 overflow-hidden">
                  {vendorLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-4">
                      <div className="w-14 h-14 border-4 border-fuchsia-100 border-t-fuchsia-400 rounded-full animate-spin" />
                      <p className="text-sm font-bold text-gray-500">
                        Loading Vendors...
                      </p>
                    </div>
                  ) : filteredVendors.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-4xl mb-3">🤝</div>
                      <p className="text-gray-400 text-sm font-bold">
                        No vendors added yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                          <tr className="bg-fuchsia-50 text-fuchsia-900 uppercase text-xs md:text-[15px] font-black border-b border-gray-200">
                            <th className="p-4">Name</th>
                            <th className="p-4">Service</th>
                            <th className="p-4">Contact Number</th>
                            <th className="p-4">Location</th>
                            <th className="p-4">Remarks</th>
                            <th className="p-4 text-center">Actions</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 bg-white md:text-sm">
                          {filteredVendors.map((vendor) => (
                            <tr
                              key={vendor.id}
                              className="hover:bg-fuchsia-50/40 transition"
                            >
                              <td className="p-4 font-bold text-gray-900">
                                🧾 {vendor.name}
                              </td>
                              <td className="p-4 text-gray-700 font-medium">
                                {vendor.service || "—"}
                              </td>
                              <td className="p-4 font-mono text-gray-700">
                                {vendor.contact_number || "—"}
                              </td>
                              <td className="p-4 text-gray-700">
                                {vendor.location || "—"}
                              </td>
                              <td className="p-4 text-gray-500 max-w-xs truncate">
                                {vendor.remarks ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedRemark(vendor.remarks)
                                    }
                                    className="max-w-[220px] truncate text-left hover:text-fuchsia-600 hover:underline transition"
                                    title="Click to view full remarks"
                                  >
                                    {vendor.remarks}
                                  </button>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-3">
                                  <button
                                    onClick={() => openVendorModal(vendor)}
                                    className="text-fuchsia-600 font-bold hover:underline"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    onClick={() => deleteVendor(vendor)}
                                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                                    title="Delete Vendor"
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
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activePage === "payments" && (
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-fuchsia-950">
                      💳 Payments
                    </h1>
                    <p className="text-sm text-fuchsia-900/70 mt-1 font-semibold">
                      View received, pending, partially paid and fully paid
                      wedding payments
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-5">
                  <div className="bg-fuchsia-50/80 border border-fuchsia-100 rounded-3xl p-5 shadow">
                    <p className="text-xs font-black uppercase text-fuchsia-700">
                      Total Business
                    </p>

                    <h2 className="text-2xl font-black text-fuchsia-700 mt-2">
                      LKR {totalBusiness.toLocaleString("en-LK")}
                    </h2>

                    <p className="text-xs text-gray-500 mt-1">
                      Received + pending payments
                    </p>
                  </div>
                  <div className="bg-emerald-50/80 border border-emerald-100 rounded-3xl p-5 shadow">
                    <p className="text-xs font-black uppercase text-emerald-700">
                      Total Received
                    </p>
                    <h2 className="text-2xl font-black text-emerald-700 mt-2">
                      LKR {totalReceived.toLocaleString("en-LK")}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {paymentRecords.length} payment records
                    </p>
                  </div>

                  <div className="bg-orange-50/80 border border-orange-100 rounded-3xl p-5 shadow">
                    <p className="text-xs font-black uppercase text-orange-700">
                      Pending Payments
                    </p>
                    <h2 className="text-2xl font-black text-orange-700 mt-2">
                      LKR {totalPending.toLocaleString("en-LK")}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {pendingPaymentRecords.length} pending
                    </p>
                  </div>

                  <div className="bg-blue-50/80 border border-blue-100 rounded-3xl p-5 shadow">
                    <p className="text-xs font-black uppercase text-blue-700">
                      Partially Paid
                    </p>
                    <h2 className="text-2xl font-black text-blue-700 mt-2">
                      {partiallyPaidRecords.length}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Advance received, balance pending
                    </p>
                  </div>

                  <div className="bg-fuchsia-50/80 border border-fuchsia-100 rounded-3xl p-5 shadow">
                    <p className="text-xs font-black uppercase text-fuchsia-700">
                      Fully Paid
                    </p>
                    <h2 className="text-2xl font-black text-fuchsia-700 mt-2">
                      {fullyPaidRecords.length}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Completed payments
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-4 mb-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Search by couple name, contact number or wedding date..."
                      value={paymentSearch}
                      onChange={(e) => setPaymentSearch(e.target.value)}
                      className="md:col-span-2 w-full p-3 rounded-xl border border-fuchsia-100 outline-none focus:ring-2 focus:ring-fuchsia-300 text-sm font-semibold"
                    />

                    <select
                      value={paymentStatusFilter}
                      onChange={(e) => setPaymentStatusFilter(e.target.value)}
                      className="w-full p-3 bg-white border border-fuchsia-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-fuchsia-300 font-semibold"
                    >
                      <option value="">All Payment Status</option>
                      <option value="Fully Paid">Fully Paid</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="hidden md:block bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 overflow-hidden">
                  {filteredPayments.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-4xl mb-3">💳</div>
                      <p className="text-gray-400 text-sm font-bold">
                        No payment records found.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                          <tr className="bg-fuchsia-50 text-fuchsia-900 uppercase text-xs md:text-[15px] font-black border-b border-gray-200">
                            <th className="p-4">#</th>
                            <th className="p-4">Couple</th>
                            <th className="p-4">Wedding Date</th>
                            <th className="p-4 text-right">Package</th>
                            <th className="p-4 text-right">Transport</th>
                            <th className="p-4 text-right">Agreed</th>
                            <th className="p-4 text-right">Paid</th>
                            <th className="p-4 text-right">Pending</th>
                            <th className="p-4 text-center">Payment Status</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 bg-white md:text-sm">
                          {filteredPayments.map((item, index) => {
                            const pending = Number(item.pending_payment || 0);

                            const paid = Number(item.paid_amount || 0);

                            const paymentStatus =
                              pending <= 0
                                ? "Fully Paid"
                                : paid > 0
                                  ? "Partially Paid"
                                  : "Pending";
                            const transactions = paymentTransactions.filter(
                              (p) => Number(p.inquiry_id) === Number(item.id),
                            );

                            return (
                              <tr
                                key={item.id}
                                className="hover:bg-fuchsia-50/40 transition"
                              >
                                <td className="p-4 text-gray-400 font-bold">
                                  {index + 1}
                                </td>

                                <td className="p-4">
                                  <p className="font-black text-gray-900">
                                    {item.couple_name}
                                  </p>
                                  <p className="text-xs text-gray-400 font-semibold">
                                    {item.contact_no || "No contact"}
                                  </p>
                                </td>

                                <td className="p-4 font-semibold text-gray-700">
                                  {item.wedding_date || "—"}
                                </td>

                                <td className="p-4 text-right font-mono font-bold">
                                  {Number(
                                    item.package_price || 0,
                                  ).toLocaleString("en-LK")}
                                </td>

                                <td className="p-4 text-right font-mono font-black">
                                  <span
                                    className={
                                      Number(item.transport_cost || 0) > 0
                                        ? "text-cyan-700"
                                        : "text-gray-300"
                                    }
                                  >
                                    Rs.{" "}
                                    {Number(
                                      item.transport_cost || 0,
                                    ).toLocaleString("en-LK")}
                                  </span>
                                </td>

                                <td className="p-4 text-right">
                                  <div className="font-mono font-black text-gray-900">
                                    Rs.{" "}
                                    {Number(
                                      item.agreed_price || 0,
                                    ).toLocaleString("en-LK")}
                                  </div>

                                  <div className="mt-2 space-y-1 text-[10px]">
                                    {Number(item.discount_rate || 0) > 0 ? (
                                      <div className="rounded-lg bg-purple-50 border border-purple-100 px-2 py-1 text-left">
                                        <div className="font-black text-purple-700">
                                          Discount:{" "}
                                          {item.discount_type === "percentage"
                                            ? `${item.discount_rate}%`
                                            : `Rs. ${Number(item.discount_rate || 0).toLocaleString("en-LK")}`}
                                        </div>

                                        <div className="text-gray-400 font-semibold">
                                          Package: Rs.{" "}
                                          {Number(
                                            item.package_price || 0,
                                          ).toLocaleString("en-LK")}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-[10px] text-gray-300 font-semibold">
                                        No discount
                                      </div>
                                    )}
                                  </div>
                                </td>

                                <td className="p-4 text-right">
                                  <div className="font-mono font-black text-emerald-700 text-base">
                                    Rs.{" "}
                                    {Number(
                                      item.paid_amount || 0,
                                    ).toLocaleString("en-LK")}
                                  </div>

                                  <div className="mt-2 space-y-1 text-[10px]">
                                    {Number(item.advance_paid || 0) > 0 && (
                                      <div className="rounded-lg bg-amber-50 border border-amber-100 px-2 py-1 text-left">
                                        <div className="font-black text-amber-700">
                                          Booking Advance: Rs.{" "}
                                          {Number(
                                            item.advance_paid || 0,
                                          ).toLocaleString("en-LK")}
                                        </div>

                                        <div className="text-gray-400 font-semibold">
                                          {item.advance_paid_date || "No date"}
                                        </div>
                                      </div>
                                    )}

                                    {transactions.map((payment) => (
                                      <div
                                        key={payment.id}
                                        className="rounded-lg bg-emerald-50 border border-emerald-100 px-2 py-1 text-left"
                                      >
                                        <div className="font-black text-emerald-700">
                                          Partial Payment: Rs.{" "}
                                          {Number(
                                            payment.amount || 0,
                                          ).toLocaleString("en-LK")}
                                        </div>

                                        <div className="text-gray-400 font-semibold">
                                          {payment.payment_date || "No date"}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </td>

                                <td className="p-4 text-right font-mono font-bold text-red-600">
                                  {pending.toLocaleString("en-LK")}
                                </td>

                                <td className="p-4 text-center">
                                  <span
                                    className={`px-3 py-1 rounded-xl text-xs font-black border ${
                                      paymentStatus === "Fully Paid"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : paymentStatus === "Partially Paid"
                                          ? "bg-orange-50 text-orange-700 border-orange-200"
                                          : "bg-red-50 text-red-700 border-red-200"
                                    }`}
                                  >
                                    {paymentStatus}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="md:hidden space-y-4">
                  {filteredPayments.length === 0 ? (
                    <div className="bg-white/85 rounded-3xl p-6 text-center border border-white/50 shadow">
                      <p className="text-sm font-bold text-gray-500">
                        No payment records found.
                      </p>
                    </div>
                  ) : (
                    filteredPayments.map((item) => {
                      const transactions = paymentTransactions.filter(
                        (p) => Number(p.inquiry_id) === Number(item.id),
                      );

                      const totalPaid = Number(item.paid_amount || 0);
                      const pending = Number(item.pending_payment || 0);

                      const paymentStatus =
                        pending <= 0
                          ? "Fully Paid"
                          : totalPaid > 0
                            ? "Partially Paid"
                            : "Pending";

                      return (
                        <div
                          key={item.id}
                          className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/50 shadow-lg p-4 space-y-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-base font-black text-fuchsia-950">
                                {item.couple_name}
                              </h3>

                              <p className="text-xs font-semibold text-gray-500 mt-1">
                                📅{" "}
                                {item.wedding_date || "Wedding date not added"}
                              </p>

                              <p className="text-xs font-semibold text-gray-500">
                                📞 {item.contact_no || "Contact not added"}
                              </p>
                            </div>

                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black ${
                                paymentStatus === "Fully Paid"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : paymentStatus === "Partially Paid"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {paymentStatus}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl bg-gray-50 p-3">
                              <p className="text-[10px] uppercase font-black text-gray-400">
                                Package
                              </p>
                              <p className="text-sm font-black text-gray-800">
                                Rs.{" "}
                                {Number(item.package_price || 0).toLocaleString(
                                  "en-LK",
                                )}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-cyan-50 p-3">
                              <p className="text-[10px] uppercase font-black text-cyan-600">
                                Transport
                              </p>
                              <p className="text-sm font-black text-cyan-700">
                                Rs.{" "}
                                {Number(
                                  item.transport_cost || 0,
                                ).toLocaleString("en-LK")}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-fuchsia-50 p-3">
                              <p className="text-[10px] uppercase font-black text-fuchsia-600">
                                Agreed
                              </p>
                              <p className="text-sm font-black text-fuchsia-900">
                                Rs.{" "}
                                {Number(item.agreed_price || 0).toLocaleString(
                                  "en-LK",
                                )}
                              </p>

                              <p className="text-[10px] font-bold text-purple-600 mt-1">
                                Discount:{" "}
                                {Number(item.discount_rate || 0) > 0
                                  ? item.discount_type === "percentage"
                                    ? `${item.discount_rate}%`
                                    : `Rs. ${Number(item.discount_rate || 0).toLocaleString("en-LK")}`
                                  : "No discount"}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-rose-50 p-3">
                              <p className="text-[10px] uppercase font-black text-rose-600">
                                Pending
                              </p>
                              <p className="text-sm font-black text-rose-700">
                                Rs. {pending.toLocaleString("en-LK")}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] uppercase font-black text-emerald-600">
                                Total Paid
                              </p>
                              <p className="text-base font-black text-emerald-700">
                                Rs. {totalPaid.toLocaleString("en-LK")}
                              </p>
                            </div>

                            <div className="mt-3 space-y-2">
                              {Number(item.advance_paid || 0) > 0 && (
                                <div className="rounded-xl bg-white/70 p-2">
                                  <p className="text-xs font-black text-amber-700">
                                    Booking Advance: Rs.{" "}
                                    {Number(
                                      item.advance_paid || 0,
                                    ).toLocaleString("en-LK")}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-semibold">
                                    {item.advance_paid_date || "No date"}
                                  </p>
                                </div>
                              )}

                              {transactions.map((payment) => (
                                <div
                                  key={payment.id}
                                  className="rounded-xl bg-white/70 p-2"
                                >
                                  <p className="text-xs font-black text-emerald-700">
                                    Partial Payment: Rs.{" "}
                                    {Number(payment.amount || 0).toLocaleString(
                                      "en-LK",
                                    )}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-semibold">
                                    {payment.payment_date || "No date"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activePage === "packages" && (
              <div className="p-6">
                <h1 className="text-3xl font-black text-fuchsia-950 mb-6">
                  Our Packages
                </h1>

                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40">
                  <p className="text-gray-500">
                    Package PDF storage section will be added here.
                  </p>
                </div>
              </div>
            )}

            <WindowsFlagFix />
          </div>
        </div>
      </div>
      {/* INPUT / EDIT DIALOG FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-md flex items-start md:items-center justify-center p-3 md:p-4 z-[999999] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
          <div className="relative z-[1000000] bg-white rounded-2xl w-full max-w-lg p-4 md:p-6 shadow-2xl space-y-4 my-4 md:my-8 border border-gray-100 max-h-[92vh] overflow-y-auto pb-28 md:pb-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                {formData.id ? "Modify Wedding File" : "Add New Wedding Record"}
              </h2>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition flex items-center justify-center text-lg font-bold active:scale-95"
              >
                ✕
              </button>
            </div>
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
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-fuchsia-300 outline-none text-sm"
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
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-fuchsia-300 outline-none text-sm bg-white"
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
                      className="w-1/2 p-2.5 border rounded-lg focus:ring-2 focus:ring-fuchsia-300 outline-none text-sm"
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
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-fuchsia-300 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Service Type
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setIsServiceDropdownOpen(!isServiceDropdownOpen)
                    }
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
                              const current = Array.isArray(
                                formData.service_type,
                              )
                                ? formData.service_type
                                : [];

                              if (e.target.checked) {
                                const updatedForm = {
                                  ...formData,
                                  service_type: [...current, service],
                                };

                                setFormData(updatedForm);

                                if (!updatedForm.id) {
                                  localStorage.setItem(
                                    DRAFT_KEY,
                                    JSON.stringify(updatedForm),
                                  );
                                }
                              } else {
                                const updatedForm = {
                                  ...formData,
                                  service_type: current.filter(
                                    (s) => s !== service,
                                  ),
                                };

                                setFormData(updatedForm);

                                if (!updatedForm.id) {
                                  localStorage.setItem(
                                    DRAFT_KEY,
                                    JSON.stringify(updatedForm),
                                  );
                                }
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-fuchsia-50/50 p-3 rounded-xl border border-fuchsia-100">
                <div className="flex items-center justify-between col-span-2 mb-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-fuchsia-700">
                    Price Details
                  </h3>

                  <button
                    type="button"
                    onClick={clearPriceFields}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 text-[11px] font-black hover:bg-rose-100 transition"
                  >
                    Clear Prices
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-fuchsia-800 mb-1">
                    Package Price (LKR)
                  </label>
                  <input
                    type="number"
                    name="package_price"
                    placeholder="Enter package price"
                    value={formData.package_price}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-fuchsia-300 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-fuchsia-800 mb-1">
                    {formData.discount_type === "fixed"
                      ? "Discount Amount"
                      : "Discount Rate"}
                  </label>

                  <div className="flex">
                    <input
                      type="number"
                      name="discount_rate"
                      value={formData.discount_rate}
                      onChange={handleInputChange}
                      placeholder={
                        formData.discount_type === "fixed"
                          ? "Enter LKR amount"
                          : "Enter % amount"
                      }
                      className="w-full p-2.5 bg-white border rounded-l-lg focus:ring-2 focus:ring-fuchsia-300 outline-none text-sm"
                    />

                    <select
                      name="discount_type"
                      value={formData.discount_type}
                      onChange={handleInputChange}
                      className="w-[50px] p-2.5 border rounded-r-xl bg-fuchsia-50 text-fuchsia-800 font-black outline-none focus:ring-2 focus:ring-fuchsia-300 text-xs"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed" className="text-[12px]">
                        LKR
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-fuchsia-800 mb-1">
                    Transport Cost
                  </label>

                  <input
                    type="number"
                    name="transport_cost"
                    value={formData.transport_cost}
                    onChange={handleInputChange}
                    placeholder="Enter transport cost"
                    className="w-full p-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-fuchsia-300 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-fuchsia-800 mb-1">
                    Agreed Price (LKR)
                  </label>
                  <input
                    type="number"
                    name="agreed_price"
                    placeholder="Final agreed price"
                    value={formData.agreed_price}
                    readOnly
                    className="w-full p-2.5 bg-gray-100 border rounded-lg outline-none text-sm font-bold text-fuchsia-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-fuchsia-800 mb-1">
                    Advance Paid (LKR)
                  </label>
                  <input
                    type="number"
                    name="advance_paid"
                    placeholder="Booking advance"
                    value={formData.advance_paid}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-fuchsia-300 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-fuchsia-800 mb-1">
                    Advance Paid Date
                  </label>
                  <input
                    type="date"
                    name="advance_paid_date"
                    value={formData.advance_paid_date || ""}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-fuchsia-300 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Paid Amount (LKR)
                  </label>
                  <input
                    type="number"
                    name="paid_amount"
                    placeholder="Total received"
                    value={formData.paid_amount}
                    readOnly
                    className="w-full p-3 border rounded-xl bg-gray-50 text-gray-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Paid Date
                  </label>
                  <input
                    type="date"
                    name="paid_date"
                    value={formData.paid_date}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-fuchsia-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    New Payment Amount
                  </label>
                  <input
                    type="number"
                    name="new_payment"
                    value={formData.new_payment}
                    onChange={handleInputChange}
                    placeholder="Enter latest payment only"
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-fuchsia-300"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Enter only the amount customer paid now. System will add it
                    to total paid.
                  </p>
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
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-fuchsia-300 outline-none text-sm"
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
                  className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-fuchsia-300 outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 pb-6 md:pb-0 border-t">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem(DRAFT_KEY);

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
                      package_price: "",
                      discount_rate: "",
                      agreed_price: "",
                      advance_paid: "",
                      status: "Inquiry",
                      remarks: "",
                      country: "Local",
                      advance_paid_date: "",
                      paid_amount: "",
                      paid_date: "",
                      new_payment: "",
                      discount_type: "percentage",
                    });

                    triggerNotification(
                      "All inquiry fields cleared successfully.",
                      "delete",
                    );
                  }}
                  className="px-4 py-2 border border-rose-200 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 text-sm font-semibold transition"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-fuchsia-200 text-black rounded-lg font-bold hover:bg-fuchsia-300 text-sm"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isWeddingAlertModalOpen && (
        <div className="fixed inset-0 z-[999999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/60 overflow-hidden animate-scale-in">
            <div className="absolute -top-20 -right-20 w-44 h-44 bg-rose-200/60 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-fuchsia-200/60 rounded-full blur-3xl" />

            <div className="relative z-10 p-5 border-b border-rose-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-rose-700 flex items-center gap-2">
                  🔔 Wedding Alerts
                </h3>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  Upcoming confirmed weddings within 14 days
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsWeddingAlertModalOpen(false)}
                className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 font-black hover:bg-rose-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="relative z-10 max-h-[60vh] overflow-y-auto divide-y divide-rose-100">
              {upcomingWeddings.map((item) => {
                const daysLeft = moment(item.wedding_date, "YYYY-MM-DD")
                  .startOf("day")
                  .diff(moment().startOf("day"), "days");

                return (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-rose-50/60 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-black text-gray-900 text-sm">
                          {item.couple_name}
                        </h4>

                        <div className="mt-1 space-y-1 text-xs text-gray-600 font-semibold">
                          <div>
                            📅{" "}
                            {moment(item.wedding_date).format("MMMM D, YYYY")}
                          </div>
                          <div>🏨 {item.hotel || "Venue not added"}</div>
                          <div>
                            💐 {item.service_type || "Service type not added"}
                          </div>
                          <div>📞 {item.contact_no || "Contact not added"}</div>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black shrink-0 ${
                          daysLeft <= 3
                            ? "bg-red-600 text-white animate-pulse"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {daysLeft === 0 ? "TODAY" : `${daysLeft} DAYS LEFT`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {statusPopup.show && (
        <div className="fixed inset-0 z-[999999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/50 p-6 text-center animate-scale-in overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-fuchsia-200/60 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-200/60 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-xl flex items-center justify-center text-3xl mb-4">
                {statusPopup.status === "Completed"
                  ? "✨"
                  : statusPopup.status === "Confirmed"
                    ? "💍"
                    : "📋"}
              </div>

              <h3 className="text-xl font-black text-gray-900">
                {statusPopup.status}
              </h3>

              <p className="text-sm font-semibold text-gray-600 mt-3 leading-relaxed whitespace-pre-line">
                {statusPopup.message}
              </p>

              <button
                type="button"
                onClick={() =>
                  setStatusPopup({
                    show: false,
                    status: "",
                    message: "",
                  })
                }
                className="mt-6 px-6 py-3 rounded-2xl bg-fuchsia-300 hover:bg-fuchsia-400 text-black font-black shadow-lg hover:scale-105 active:scale-95 transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {isVendorModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start md:items-center justify-center p-4 z-[9999] overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg p-5 shadow-2xl border border-gray-100 my-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-xl font-black text-gray-900">
                {vendorForm.id ? "Edit Vendor" : "Add Vendor"}
              </h2>

              <button
                type="button"
                onClick={() => setIsVendorModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVendorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={vendorForm.name}
                  onChange={handleVendorChange}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-fuchsia-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Service
                </label>
                <input
                  type="text"
                  name="service"
                  value={vendorForm.service}
                  onChange={handleVendorChange}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-fuchsia-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  name="contact_number"
                  value={vendorForm.contact_number}
                  onChange={handleVendorChange}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-fuchsia-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={vendorForm.location}
                  onChange={handleVendorChange}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-fuchsia-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  rows="3"
                  value={vendorForm.remarks}
                  onChange={handleVendorChange}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-fuchsia-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-gray-600 font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-fuchsia-300 hover:bg-fuchsia-400 text-black font-black"
                >
                  {vendorForm.id ? "Update Vendor" : "Save Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    : deleteModal.type === "vendor"
                      ? "Delete Vendor?"
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
                    : deleteModal.type === "vendor"
                      ? "Yes, Delete Vendor"
                      : "Yes, Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedRemark && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="relative z-[1000000] bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-3">Remarks</h3>

            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {selectedRemark}
            </p>

            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={() => setSelectedRemark(null)}
                className="px-4 py-2 rounded-xl bg-fuchsia-200 text-white text-sm font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* DYNAMIC CONFIRMATION DIALOG MODAL */}

      {isCalendarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative z-[1000000] bg-white rounded-2xl w-full max-w-6xl h-[92vh] p-3 md:p-5 shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
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

                            const selectedDate = moment(
                              value,
                              "YYYY-MM-DD",
                              true,
                            );

                            if (selectedDate.isValid()) {
                              setCalendarDate(selectedDate.toDate());
                              setManualCalendarDate(
                                selectedDate.format("YYYY-MM-DD"),
                              );
                            }
                          }}
                          className="w-full md:w-44 p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-fuchsia-300 bg-white"
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
                          onChange={(e) =>
                            setManualCalendarDate(e.target.value)
                          }
                          className="w-full md:w-44 p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-fuchsia-300 bg-white"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const selectedDate = moment(
                            manualCalendarDate,
                            "YYYY-MM-DD",
                            true,
                          );

                          if (selectedDate.isValid()) {
                            setCalendarDate(selectedDate.toDate());
                          } else {
                            triggerNotification(
                              "Please enter date as YYYY-MM-DD",
                              "delete",
                            );
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
                          setManualCalendarDate(
                            moment(today).format("YYYY-MM-DD"),
                          );
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
                  const selectedDate = moment(slotInfo.start).format(
                    "YYYY-MM-DD",
                  );

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
                    package_price: 0,
                    discount_rate: 0,
                    agreed_price: 0,
                    advance_paid: 0,
                    status: "Inquiry",
                    remarks: "",
                    country: "Local",
                  });
                  localStorage.setItem(DRAFT_KEY, JSON.stringify(updatedForm));

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
                <div className="relative z-[1000000] bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
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
    </div>
  );
}
