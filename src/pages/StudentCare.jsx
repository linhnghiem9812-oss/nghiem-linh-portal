import "../styles/pages/StudentCare.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNotification } from "../context/NotificationContext";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
});
function StudentCare() {
  const { addNotification } = useNotification();
  const [students, setStudents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [classes, setClasses] = useState([]);
  const [newTicket, setNewTicket] = useState({
    studentName: "",
    details: "",
    priority: "Tạo mới",
  });
  const [editingTicket, setEditingTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    email: false,
    birthday: false,
    province: false,
    country: false,
    course: true,
    teacher: true,
    notes: false,
  });
  const optionalColumnsConfig = [
    {
      key: "email",
      label: "Email cá nhân",
      icon: "fa-envelope",
    },
    {
      key: "birthday",
      label: "Ngày sinh",
      icon: "fa-cake-candles",
    },
    {
      key: "province",
      label: "Tỉnh/Thành",
      icon: "fa-map-location-dot",
    },
    {
      key: "country",
      label: "Quốc gia",
      icon: "fa-globe",
    },
    {
      key: "course",
      label: "Khóa học",
      icon: "fa-book",
    },
    {
      key: "teacher",
      label: "Giáo viên",
      icon: "fa-chalkboard-user",
    },
    {
      key: "notes",
      label: "Ghi chú",
      icon: "fa-note-sticky",
    },
  ];
  const toggleColumn = (columnKey) =>
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentStudent, setCurrentStudent] = useState({
    name: "",
    phone: "",
    email: "",
    course: "",
    classId: "",
    teacher: "",
    status: "Đang học",
    birthday: "",
    province: "",
    country: "Việt Nam",
    notes: "",
  });
  useEffect(() => {
    api
      .get("/students")
      .then((res) => setStudents(res.data))
      .catch(() => console.log("Chưa có học viên trên CSDL."));
    api
      .get("/tickets")
      .then((res) => {
        const sortedTickets = res.data.sort((a, b) => b.id - a.id);
        setTickets(sortedTickets);
      })
      .catch(() => console.log("Chưa có ticket trên CSDL."));
    api
      .get("/classes")
      .then((res) => setClasses(res.data))
      .catch(() => console.log("Chưa có dữ liệu lớp."));
  }, []);

  // --- CẬP NHẬT LOGIC LỌC ĐỂ KHỚP VỚI CÁC THẺ KPI ---
  const filteredStudents = students.filter((s) => {
    const matchName =
      s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase());
    let matchStatus = false;
    if (statusFilter === "all") matchStatus = true;
    else if (statusFilter === "problem")
      matchStatus = s.status === "Nghỉ học" || s.status === "Bảo lưu";
    else matchStatus = s.status === statusFilter;
    return matchName && matchStatus;
  });
  const sortedClasses = [...classes].sort((a, b) => {
    if (!a.startDate) return 1;
    if (!b.startDate) return -1;
    return new Date(b.startDate) - new Date(a.startDate);
  });
  const groupedClassesForForm = sortedClasses.reduce((acc, c) => {
    const dateObj = c.startDate ? new Date(c.startDate) : null;
    const groupName =
      dateObj && !isNaN(dateObj.getTime())
        ? `Tháng ${dateObj.getMonth() + 1} / ${dateObj.getFullYear()}`
        : "Lớp chưa xác định ngày KG";
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(c);
    return acc;
  }, {});
  const openModal = (mode, student = null) => {
    setModalMode(mode);
    if (student) {
      setCurrentStudent({
        ...student,
      });
      setOriginalStudent({
        ...student,
      }); // Lưu bản nháp gốc
    } else {
      setCurrentStudent({
        name: "",
        phone: "",
        email: "",
        course: "",
        classId: "",
        teacher: "",
        status: "Đang học",
        birthday: "",
        province: "",
        country: "Việt Nam",
        notes: "",
      });
      setOriginalStudent(null);
    }
    setShowModal(true);
  };
  const handleClassChange = (e) => {
    const selectedClassCode = e.target.value;
    if (!selectedClassCode) {
      setCurrentStudent({
        ...currentStudent,
        classId: "",
        course: "Đang chờ xếp lớp",
        teacher: "Chưa phân công",
      });
      return;
    }
    const selectedClassObj = classes.find(
      (c) => c.classCode === selectedClassCode,
    );
    if (selectedClassObj) {
      setCurrentStudent({
        ...currentStudent,
        classId: selectedClassCode,
        course: selectedClassObj.level || "Chưa rõ",
        teacher: selectedClassObj.teacher || "Chưa phân công",
      });
    }
  };

  // Thêm State để lưu lại bản gốc trước khi sửa
  const [originalStudent, setOriginalStudent] = useState(null);
  const handleSaveStudent = async () => {
    if (modalMode === "add") {
      try {
        const res = await api.post("/students", currentStudent);
        setStudents([res.data, ...students]);

        // THÔNG BÁO TẠO MỚI CHI TIẾT
        addNotification(
          "Thêm học viên mới",
          `Đã thêm học viên ${currentStudent.name} vào hệ thống`,
          "success",
          "care",
          {
            "Họ tên": currentStudent.name,
            SĐT: currentStudent.phone,
            "Xếp lớp": currentStudent.classId || "Đang chờ xếp",
          },
        );
        setShowModal(false);
      } catch (error) {
        addNotification(
          "Lỗi",
          "CSDL không phản hồi khi thêm học viên.",
          "error",
        );
      }
    } else if (modalMode === "edit") {
      try {
        const res = await api.put(
          `/students/${currentStudent.id}`,
          currentStudent,
        );
        setStudents(
          students.map((s) => (s.id === currentStudent.id ? res.data : s)),
        );

        // THUẬT TOÁN TÌM SỰ THAY ĐỔI
        let changes = {};
        Object.keys(currentStudent).forEach((key) => {
          if (currentStudent[key] !== originalStudent[key] && key !== "id") {
            // Viết hoa chữ cái đầu của key cho đẹp
            const fieldName = key.charAt(0).toUpperCase() + key.slice(1);
            changes[fieldName] =
              `Từ "${originalStudent[key] || "Trống"}" thành "${currentStudent[key] || "Trống"}"`;
          }
        });
        addNotification(
          "Cập nhật học viên",
          `Đã sửa thông tin của học viên ${currentStudent.name}`,
          "warning",
          "care",
          changes,
        );
        setModalMode("view");
      } catch (error) {
        addNotification("Lỗi", "Lỗi cập nhật CSDL.", "error");
      }
    }
  };
  const handleDelete = async (id) => {
    if (
      window.confirm("Cảnh báo: Bạn có chắc chắn muốn xóa hồ sơ học viên này?")
    ) {
      try {
        const studentToDelete = students.find((s) => s.id === id);
        await api.delete(`/students/${id}`);
        setStudents(students.filter((s) => s.id !== id));

        // THÔNG BÁO XÓA CHI TIẾT
        addNotification(
          "Xóa học viên",
          `Đã xóa học viên ${studentToDelete.name} khỏi hệ thống`,
          "error",
          "care",
          {
            "Mã hệ thống": studentToDelete.id,
            "SĐT bị xóa": studentToDelete.phone,
          },
        );
        setShowModal(false);
      } catch (error) {
        addNotification("Lỗi", "Lỗi xóa CSDL.", "error");
      }
    }
  };
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newTicket,
        status: "Đang xử lý",
        createdAt: new Date().toISOString(),
      };
      const res = await api.post("/tickets", payload);
      setTickets([res.data, ...tickets]);
      setNewTicket({
        studentName: "",
        details: "",
        priority: "Tạo mới",
      });
      addNotification("Hệ thống: Tạo phản ánh thành công!", "success", "care");
    } catch (error) {
      addNotification("Lỗi tạo phản ánh!", "error", "care");
    }
  };
  const handleResolveTicket = async (ticket) => {
    try {
      const payload = {
        ...ticket,
        status: "Đã xử lý",
        resolvedAt: new Date().toISOString(),
      };
      const res = await api.put(`/tickets/${ticket.id}`, payload);
      setTickets(tickets.map((t) => (t.id === ticket.id ? res.data : t)));
    } catch (error) {
      addNotification("Lỗi cập nhật trạng thái phản ánh!", "error", "care");
    }
  };
  const handleReopenTicket = async (ticket) => {
    try {
      const payload = {
        ...ticket,
        status: "Đang xử lý",
        priority: "Xem xét lại",
        resolvedAt: null,
      };
      const res = await api.put(`/tickets/${ticket.id}`, payload);
      setTickets(tickets.map((t) => (t.id === ticket.id ? res.data : t)));
    } catch (error) {
      addNotification("Lỗi khi mở lại phản ánh!", "error", "care");
    }
  };
  const handleDeleteTicket = async (id) => {
    if (
      window.confirm(
        "Hành động này sẽ xóa vĩnh viễn dữ liệu phản ánh. Xác nhận xóa?",
      )
    ) {
      try {
        await api.delete(`/tickets/${id}`);
        setTickets(tickets.filter((t) => t.id !== id));
      } catch (error) {
        addNotification("Lỗi khi xóa phản ánh!", "error", "care");
      }
    }
  };
  const handleSaveEditTicket = async () => {
    try {
      const res = await api.put(`/tickets/${editingTicket.id}`, editingTicket);
      setTickets(
        tickets.map((t) => (t.id === editingTicket.id ? res.data : t)),
      );
      setEditingTicket(null);
      addNotification(
        "Cập nhật thông tin phản ánh thành công!",
        "success",
        "care",
      );
    } catch (error) {
      addNotification("Lỗi khi cập nhật phản ánh!", "error", "care");
    }
  };
  const parseToLocalDatetime = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };
  const handleDatetimeChange = (e) => {
    const local = e.target.value;
    if (local) {
      const iso = new Date(local).toISOString();
      setEditingTicket({
        ...editingTicket,
        createdAt: iso,
      });
    }
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case "Đang học":
        return {
          bg: "#dcfce7",
          color: "#166534",
        };
      case "Bảo lưu":
        return {
          bg: "#fef3c7",
          color: "#b45309",
        };
      case "Học lại":
        return {
          bg: "#e0e7ff",
          color: "#3730a3",
        };
      case "Đổi lớp":
        return {
          bg: "#f3e8ff",
          color: "#7e22ce",
        };
      case "Nghỉ học":
        return {
          bg: "#fee2e2",
          color: "#b91c1c",
        };
      default:
        return {
          bg: "#f1f5f9",
          color: "#475569",
        };
    }
  };
  const pendingTickets = tickets.filter((t) => t.status === "Đang xử lý");
  const resolvedTickets = tickets.filter((t) => t.status === "Đã xử lý");
  return (
    <div className="StudentCare-style-1">
      {/* THẺ KPI ĐƯỢC CHIA LÀM 4 VÀ THÊM TÍNH NĂNG CLICK ĐỂ LỌC */}
      <div className="kpi-row StudentCare-style-2">
        <div
          className="card kpi-card-simple"
          onClick={() => setStatusFilter("all")}
          style={{
            cursor: "pointer",
            border:
              statusFilter === "all"
                ? "2px solid var(--primary)"
                : "1px solid transparent",
            transition: "all 0.2s",
            padding: "20px",
          }}
        >
          <div>
            <div className="kpi-card-label">Tổng học viên</div>
            <div className="kpi-card-number">{students.length}</div>
          </div>
          <div className="kpi-card-circle-icon purple">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
        </div>
        <div
          className="card kpi-card-simple"
          onClick={() => setStatusFilter("Đang học")}
          style={{
            cursor: "pointer",
            border:
              statusFilter === "Đang học"
                ? "2px solid var(--success)"
                : "1px solid transparent",
            transition: "all 0.2s",
            padding: "20px",
          }}
        >
          <div>
            <div className="kpi-card-label">Đang học</div>
            <div className="kpi-card-number StudentCare-style-3">
              {students.filter((s) => s.status === "Đang học").length}
            </div>
          </div>
          <div className="kpi-card-circle-icon success StudentCare-style-4">
            <i className="fa-solid fa-user-check"></i>
          </div>
        </div>
        <div
          className="card kpi-card-simple"
          onClick={() => setStatusFilter("Đổi lớp")}
          style={{
            cursor: "pointer",
            border:
              statusFilter === "Đổi lớp"
                ? "2px solid #8b5cf6"
                : "1px solid transparent",
            transition: "all 0.2s",
            padding: "20px",
          }}
        >
          <div>
            <div className="kpi-card-label">Đổi lớp</div>
            <div className="kpi-card-number StudentCare-style-5">
              {students.filter((s) => s.status === "Đổi lớp").length}
            </div>
          </div>
          <div className="kpi-card-circle-icon StudentCare-style-6">
            <i className="fa-solid fa-right-left"></i>
          </div>
        </div>
        <div
          className="card kpi-card-simple"
          onClick={() => setStatusFilter("problem")}
          style={{
            cursor: "pointer",
            border:
              statusFilter === "problem"
                ? "2px solid var(--danger-text)"
                : "1px solid transparent",
            transition: "all 0.2s",
            padding: "20px",
          }}
        >
          <div>
            <div className="kpi-card-label">Có vấn đề (Nghỉ/Bảo lưu)</div>
            <div className="kpi-card-number StudentCare-style-7">
              {
                students.filter(
                  (s) => s.status === "Nghỉ học" || s.status === "Bảo lưu",
                ).length
              }
            </div>
          </div>
          <div className="kpi-card-circle-icon danger StudentCare-style-8">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
        </div>
      </div>

      <div className="card StudentCare-style-9">
        <div className="StudentCare-style-10">
          <div className="StudentCare-style-11">
            <button
              type="button"
              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
              style={{
                background: isPanelExpanded ? "var(--primary)" : "#ffffff",
                color: isPanelExpanded ? "white" : "var(--primary)",
                border: "1px solid var(--primary)",
                padding: "6px 16px",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <i
                className={`fa-solid ${isPanelExpanded ? "fa-cog" : "fa-list-ul"}`}
              ></i>
              <span>
                {isPanelExpanded ? "Đóng bảng chọn" : "Tùy chỉnh cột"}
              </span>
            </button>
            <button
              className="btn StudentCare-style-12"
              onClick={() => openModal("add")}
            >
              <i className="fa-solid fa-plus StudentCare-style-13"></i> Thêm học
              viên
            </button>
          </div>
          {isPanelExpanded && (
            <div className="StudentCare-style-14">
              {optionalColumnsConfig.map((col) => (
                <label
                  key={col.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 10px",
                    backgroundColor: visibleColumns[col.key]
                      ? "#eef2ff"
                      : "#f8fafc",
                    border: visibleColumns[col.key]
                      ? "1px solid var(--primary)"
                      : "1px solid #e2e8f0",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: visibleColumns[col.key]
                      ? "var(--primary)"
                      : "#475569",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns[col.key]}
                    onChange={() => toggleColumn(col.key)}
                  />
                  <i className={`fa-solid ${col.icon}`}></i> {col.label}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="StudentCare-style-15">
          <h3 className="StudentCare-style-16">
            <i className="fa-solid fa-graduation-cap StudentCare-style-17"></i>{" "}
            Danh sách Học viên đang quản lý
          </h3>
          <div className="StudentCare-style-18">
            <select
              className="form-control StudentCare-style-19"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Đang học">Đang học</option>
              <option value="Bảo lưu">Bảo lưu</option>
              <option value="Học lại">Học lại</option>
              <option value="Đổi lớp">Đổi lớp</option>
              <option value="Nghỉ học">Nghỉ học</option>
              <option value="problem">Nghỉ / Bảo lưu</option>
            </select>
            <input
              type="text"
              className="form-control StudentCare-style-20"
              placeholder="🔍 Tìm kiếm tên, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-table-container StudentCare-style-21">
          <table className="modal-table StudentCare-style-22">
            <thead>
              <tr className="StudentCare-style-23">
                <th className="StudentCare-style-24">STT</th>
                <th className="StudentCare-style-25">HỌ TÊN</th>
                <th className="StudentCare-style-26">SĐT (ZALO)</th>
                {visibleColumns.email && (
                  <th className="StudentCare-style-27">EMAIL</th>
                )}
                {visibleColumns.birthday && (
                  <th className="StudentCare-style-28">NGÀY SINH</th>
                )}
                {visibleColumns.province && (
                  <th className="StudentCare-style-29">TỈNH/THÀNH</th>
                )}
                {visibleColumns.country && (
                  <th className="StudentCare-style-30">QUỐC GIA</th>
                )}
                <th className="StudentCare-style-31">MÃ LỚP</th>
                {visibleColumns.course && (
                  <th className="StudentCare-style-32">KHÓA HỌC</th>
                )}
                {visibleColumns.teacher && (
                  <th className="StudentCare-style-33">GIÁO VIÊN</th>
                )}
                {visibleColumns.notes && (
                  <th className="StudentCare-style-34">GHI CHÚ</th>
                )}
                <th className="StudentCare-style-35">TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody className="StudentCare-style-36">
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="12" className="StudentCare-style-37">
                    Chưa có học viên nào trong CSDL.
                  </td>
                </tr>
              )}
              {filteredStudents.map((s, index) => {
                const badgeStyle = getStatusBadge(s.status);
                return (
                  <tr key={s.id} className="StudentCare-style-38">
                    <td className="StudentCare-style-39">{index + 1}</td>
                    <td className="StudentCare-style-40">
                      <span
                        className="StudentCare-style-41"
                        onClick={() => openModal("view", s)}
                      >
                        {s.name || "---"}
                      </span>
                    </td>
                    <td className="StudentCare-style-42">{s.phone || "---"}</td>
                    {visibleColumns.email && (
                      <td className="StudentCare-style-43">
                        {s.email || "---"}
                      </td>
                    )}
                    {visibleColumns.birthday && (
                      <td className="StudentCare-style-44">
                        {s.birthday
                          ? new Date(s.birthday).toLocaleDateString("vi-VN")
                          : "---"}
                      </td>
                    )}
                    {visibleColumns.province && (
                      <td className="StudentCare-style-45">
                        {s.province || "---"}
                      </td>
                    )}
                    {visibleColumns.country && (
                      <td className="StudentCare-style-46">
                        {s.country || "---"}
                      </td>
                    )}
                    <td className="StudentCare-style-47">
                      {s.classId || s.class || "---"}
                    </td>
                    {visibleColumns.course && (
                      <td className="StudentCare-style-48">
                        {s.course || "---"}
                      </td>
                    )}
                    {visibleColumns.teacher && (
                      <td className="StudentCare-style-49">
                        {s.teacher || "---"}
                      </td>
                    )}
                    {visibleColumns.notes && (
                      <td className="StudentCare-style-50" title={s.notes}>
                        {s.notes || "---"}
                      </td>
                    )}
                    <td className="StudentCare-style-51">
                      <span
                        className="badge-studying"
                        style={{
                          backgroundColor: badgeStyle.bg,
                          color: badgeStyle.color,
                          fontWeight: "800",
                          padding: "4px 10px",
                          borderRadius: "50px",
                          fontSize: "0.75rem",
                        }}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card StudentCare-style-52">
        <h3 className="StudentCare-style-53">
          <i className="fa-solid fa-ticket-alt StudentCare-style-54"></i>
          Phản ánh & Yêu cầu từ Học viên
        </h3>

        <div className="StudentCare-style-55">
          <h4 className="StudentCare-style-56">
            1. Tạo Phản ánh / Yêu cầu mới
          </h4>
          <form onSubmit={handleCreateTicket} className="StudentCare-style-57">
            <div className="StudentCare-style-58">
              <input
                type="text"
                className="form-control StudentCare-style-59"
                placeholder="Tên học viên gửi yêu cầu..."
                value={newTicket.studentName}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    studentName: e.target.value,
                  })
                }
                required
              />
              <textarea
                className="form-control StudentCare-style-60"
                placeholder="Mô tả chi tiết nội dung phản ánh..."
                rows="2"
                value={newTicket.details}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    details: e.target.value,
                  })
                }
                required
              ></textarea>
            </div>
            <div className="StudentCare-style-61">
              <select
                className="form-control StudentCare-style-62"
                value={newTicket.priority}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    priority: e.target.value,
                  })
                }
              >
                <option value="Tạo mới">Tạo mới</option>
                <option value="Xem xét lại">Xem xét lại</option>
                <option value="Gấp">Cần xử lý Gấp</option>
              </select>
              <button
                type="submit"
                className="btn btn-primary StudentCare-style-63"
              >
                <i className="fa-solid fa-paper-plane StudentCare-style-64"></i>{" "}
                Gửi Yêu Cầu
              </button>
            </div>
          </form>
        </div>

        <div className="StudentCare-style-65">
          <div className="StudentCare-style-66">
            <div className="StudentCare-style-67">
              <h4 className="StudentCare-style-68">
                <i className="fa-solid fa-spinner fa-spin-pulse StudentCare-style-69"></i>{" "}
                2. Đang Xử Lý
              </h4>
              <span className="StudentCare-style-70">
                {pendingTickets.length}
              </span>
            </div>

            <div className="StudentCare-style-71">
              {pendingTickets.length === 0 && (
                <span className="StudentCare-style-72">
                  Không có yêu cầu nào đang chờ.
                </span>
              )}
              {pendingTickets.map((t) => (
                <div key={t.id} className="StudentCare-style-73">
                  <div className="StudentCare-style-74">
                    <div>
                      <span className="StudentCare-style-75">
                        {t.studentName}
                      </span>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontWeight: "800",
                          backgroundColor:
                            t.priority === "Xem xét lại" || t.priority === "Gấp"
                              ? "#ef4444"
                              : "#3b82f6",
                          color: "white",
                        }}
                      >
                        {t.priority || "Tạo mới"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleResolveTicket(t)}
                      className="btn StudentCare-style-76"
                    >
                      <i className="fa-solid fa-check"></i> Đã xử lý xong
                    </button>
                  </div>
                  <p className="StudentCare-style-77">{t.details}</p>

                  <div className="StudentCare-style-78">
                    <span className="StudentCare-style-79">
                      <i className="fa-regular fa-clock"></i> Tạo:{" "}
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleString("vi-VN")
                        : "Không rõ"}
                    </span>
                    <div className="StudentCare-style-80">
                      <button
                        onClick={() => setEditingTicket(t)}
                        className="StudentCare-style-81"
                      >
                        <i className="fa-solid fa-pen"></i> Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteTicket(t.id)}
                        className="StudentCare-style-82"
                      >
                        <i className="fa-solid fa-trash"></i> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="StudentCare-style-83">
            <div className="StudentCare-style-84">
              <h4 className="StudentCare-style-85">
                <i className="fa-solid fa-check-circle StudentCare-style-86"></i>{" "}
                3. Đã Xử Lý Xong
              </h4>
              <span className="StudentCare-style-87">
                {resolvedTickets.length}
              </span>
            </div>

            <div className="StudentCare-style-88">
              {resolvedTickets.length === 0 && (
                <span className="StudentCare-style-89">
                  Chưa có yêu cầu nào hoàn thành.
                </span>
              )}
              {resolvedTickets.map((t) => (
                <div key={t.id} className="StudentCare-style-90">
                  <div className="StudentCare-style-91">
                    <span className="StudentCare-style-92">
                      {t.studentName}
                    </span>
                    <span className="StudentCare-style-93">
                      {t.priority || "Tạo mới"}
                    </span>
                  </div>
                  <p className="StudentCare-style-94">{t.details}</p>

                  <div className="StudentCare-style-95">
                    <span>
                      <i className="fa-regular fa-clock StudentCare-style-96"></i>{" "}
                      Gửi lúc:{" "}
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleString("vi-VN")
                        : "Không rõ"}
                    </span>
                    <span className="StudentCare-style-97">
                      <i className="fa-solid fa-check StudentCare-style-98"></i>{" "}
                      Xong lúc:{" "}
                      {t.resolvedAt
                        ? new Date(t.resolvedAt).toLocaleString("vi-VN")
                        : "Không rõ"}
                    </span>
                  </div>

                  <div className="StudentCare-style-99">
                    <button
                      onClick={() => handleReopenTicket(t)}
                      className="StudentCare-style-100"
                    >
                      <i className="fa-solid fa-rotate-left"></i> Xem xét lại
                    </button>
                    <button
                      onClick={() => handleDeleteTicket(t.id)}
                      className="StudentCare-style-101"
                    >
                      <i className="fa-solid fa-trash"></i> Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="StudentCare-style-102">
          <div className="card StudentCare-style-103">
            <div className="StudentCare-style-104">
              <h3 className="StudentCare-style-105">
                <i className="fa-solid fa-user-graduate StudentCare-style-106"></i>
                {modalMode === "add"
                  ? "Tiếp nhận học viên mới"
                  : modalMode === "edit"
                    ? "Chỉnh sửa hồ sơ học viên"
                    : "Hồ sơ học viên chi tiết"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="StudentCare-style-107"
              >
                ✖
              </button>
            </div>

            <div className="StudentCare-style-108">
              <div>
                <label className="StudentCare-style-109">
                  Họ và tên học viên
                </label>
                {modalMode !== "view" ? (
                  <input
                    className="form-control"
                    value={currentStudent.name || ""}
                    onChange={(e) =>
                      setCurrentStudent({
                        ...currentStudent,
                        name: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="StudentCare-style-110">
                    {currentStudent.name || "---"}
                  </div>
                )}
              </div>
              <div>
                <label className="StudentCare-style-111">Số điện thoại</label>
                {modalMode !== "view" ? (
                  <input
                    className="form-control"
                    value={currentStudent.phone || ""}
                    onChange={(e) =>
                      setCurrentStudent({
                        ...currentStudent,
                        phone: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="StudentCare-style-112">
                    {currentStudent.phone || "---"}
                  </div>
                )}
              </div>
              <div>
                <label className="StudentCare-style-113">Ngày sinh</label>
                {modalMode !== "view" ? (
                  <input
                    type="date"
                    className="form-control"
                    value={currentStudent.birthday || ""}
                    onChange={(e) =>
                      setCurrentStudent({
                        ...currentStudent,
                        birthday: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="StudentCare-style-114">
                    {currentStudent.birthday
                      ? new Date(currentStudent.birthday).toLocaleDateString(
                        "vi-VN",
                      )
                      : "---"}
                  </div>
                )}
              </div>
              <div>
                <label className="StudentCare-style-115">Email cá nhân</label>
                {modalMode !== "view" ? (
                  <input
                    type="email"
                    className="form-control"
                    value={currentStudent.email || ""}
                    onChange={(e) =>
                      setCurrentStudent({
                        ...currentStudent,
                        email: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="StudentCare-style-116">
                    {currentStudent.email || "---"}
                  </div>
                )}
              </div>

              <div>
                <label className="StudentCare-style-117">
                  Tỉnh / Thành phố
                </label>
                {modalMode !== "view" ? (
                  <input
                    className="form-control"
                    value={currentStudent.province || ""}
                    onChange={(e) =>
                      setCurrentStudent({
                        ...currentStudent,
                        province: e.target.value,
                      })
                    }
                    placeholder="VD: Hà Nội..."
                  />
                ) : (
                  <div className="StudentCare-style-118">
                    {currentStudent.province || "---"}
                  </div>
                )}
              </div>
              <div>
                <label className="StudentCare-style-119">Quốc gia</label>
                {modalMode !== "view" ? (
                  <input
                    className="form-control"
                    value={currentStudent.country || ""}
                    onChange={(e) =>
                      setCurrentStudent({
                        ...currentStudent,
                        country: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="StudentCare-style-120">
                    {currentStudent.country || "---"}
                  </div>
                )}
              </div>

              <div
                style={{
                  gridColumn: "span 2",
                  backgroundColor:
                    currentStudent.status === "Đổi lớp" ? "#fffbeb" : "#f8fafc",
                  padding: "16px",
                  borderRadius: "12px",
                  border:
                    currentStudent.status === "Đổi lớp"
                      ? "1px dashed #f59e0b"
                      : "1px solid var(--border-color)",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginTop: "8px",
                  transition: "all 0.3s",
                }}
              >
                <label className="StudentCare-style-121">
                  Trạng thái học tập
                </label>
                {modalMode !== "view" ? (
                  <select
                    className="form-control"
                    value={currentStudent.status || "Đang học"}
                    onChange={(e) => {
                      const newStatus = e.target.value;

                      // LOGIC MỚI: Nếu chọn Nghỉ học, Bảo lưu hoặc Đổi lớp -> Lập tức xóa mã lớp cũ
                      if (newStatus === "Đổi lớp" || newStatus === "Nghỉ học" || newStatus === "Bảo lưu") {
                        setCurrentStudent({
                          ...currentStudent,
                          status: newStatus,
                          classId: "", // Xóa trắng mã lớp
                          course: newStatus === "Đổi lớp" ? "Đang chờ xếp lớp" : "Đã ngừng học",
                          teacher: "Chưa phân công",
                        });
                      } else {
                        setCurrentStudent({
                          ...currentStudent,
                          status: newStatus,
                        });
                      }
                    }}
                  >
                    {/* Giữ nguyên toàn bộ option value như bạn yêu cầu */}
                    <option value="Đang học">Đang học</option>
                    <option value="Bảo lưu">Bảo lưu</option>
                    <option value="Học lại">Học lại</option>
                    <option value="Đổi lớp">Đổi lớp</option>
                    <option value="Nghỉ học">Nghỉ học</option>
                  </select>
                ) : (
                  <div className="StudentCare-style-122">
                    <span
                      style={{
                        backgroundColor: getStatusBadge(currentStudent.status).bg,
                        color: getStatusBadge(currentStudent.status).color,
                        padding: "4px 10px",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                      }}
                    >
                      {currentStudent.status || "---"}
                    </span>
                  </div>
                )}

                <div>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "800",
                      color:
                        currentStudent.status === "Đổi lớp"
                          ? "#d97706"
                          : "var(--primary)",
                    }}
                  >
                    {currentStudent.status === "Đổi lớp"
                      ? "LỚP MỚI (Có thể chọn sau)"
                      : "Xếp vào Lớp học"}
                  </label>
                  {modalMode !== "view" ? (
                    <select
                      className="form-control"
                      value={currentStudent.classId || ""}
                      onChange={handleClassChange}
                      style={{
                        border:
                          currentStudent.status === "Đổi lớp"
                            ? "2px solid #f59e0b"
                            : "1px solid var(--primary)",
                        backgroundColor:
                          currentStudent.status === "Đổi lớp"
                            ? "white"
                            : "var(--primary-light)",
                      }}
                    >
                      <option value="">-- Chọn lớp học --</option>
                      {Object.keys(groupedClassesForForm).map((monthLabel) => (
                        <optgroup
                          key={monthLabel}
                          label={`--- ${monthLabel} ---`}
                          className="StudentCare-style-123"
                        >
                          {groupedClassesForForm[monthLabel].map((c) => (
                            <option
                              key={c.id}
                              value={c.classCode}
                              className="StudentCare-style-124"
                            >
                              {c.classCode} - Khóa: {c.level}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  ) : (
                    <div className="StudentCare-style-125">
                      {currentStudent.classId || "Chưa xếp lớp"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="StudentCare-style-126">
                    Khóa học / Trình độ
                  </label>
                  {modalMode !== "view" ? (
                    <input
                      className="form-control StudentCare-style-127"
                      value={currentStudent.course || ""}
                      disabled
                      placeholder="Tự động hiển thị..."
                    />
                  ) : (
                    <div className="StudentCare-style-128">
                      {currentStudent.course || "---"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="StudentCare-style-129">
                    Giáo viên phụ trách
                  </label>
                  {modalMode !== "view" ? (
                    <input
                      className="form-control StudentCare-style-130"
                      value={currentStudent.teacher || ""}
                      disabled
                      placeholder="Tự động hiển thị..."
                    />
                  ) : (
                    <div className="StudentCare-style-131">
                      {currentStudent.teacher || "---"}
                    </div>
                  )}
                </div>
              </div>

              <div className="StudentCare-style-132">
                <label className="StudentCare-style-133">
                  Ghi chú / Yêu cầu thêm
                </label>
                {modalMode !== "view" ? (
                  <textarea
                    className="form-control StudentCare-style-134"
                    rows="2"
                    value={currentStudent.notes || ""}
                    onChange={(e) =>
                      setCurrentStudent({
                        ...currentStudent,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Nội dung cần lưu ý..."
                  />
                ) : (
                  <div className="StudentCare-style-135">
                    {currentStudent.notes || "Không có ghi chú"}
                  </div>
                )}
              </div>
            </div>

            <div className="StudentCare-style-136">
              {modalMode !== "add" ? (
                <button
                  className="btn StudentCare-style-137"
                  onClick={() => handleDelete(currentStudent.id)}
                >
                  <i className="fa-solid fa-trash"></i> Xóa hồ sơ
                </button>
              ) : (
                <div></div>
              )}

              <div className="StudentCare-style-138">
                {modalMode === "view" ? (
                  <button
                    className="btn StudentCare-style-139"
                    onClick={() => setModalMode("edit")}
                  >
                    <i className="fa-solid fa-pen"></i> Sửa thông tin
                  </button>
                ) : (
                  <button
                    className="btn StudentCare-style-140"
                    onClick={handleSaveStudent}
                  >
                    <i className="fa-solid fa-floppy-disk"></i> Lưu hồ sơ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {editingTicket && (
        <div className="StudentCare-style-141">
          <div className="card StudentCare-style-142">
            <div className="StudentCare-style-143">
              <h3 className="StudentCare-style-144">
                <i className="fa-solid fa-pen"></i> Chỉnh sửa Phản ánh
              </h3>
              <button
                onClick={() => setEditingTicket(null)}
                className="StudentCare-style-145"
              >
                ✖
              </button>
            </div>
            <div className="StudentCare-style-146">
              <div>
                <label className="StudentCare-style-147">Tên Học viên</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingTicket.studentName || ""}
                  onChange={(e) =>
                    setEditingTicket({
                      ...editingTicket,
                      studentName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="StudentCare-style-148">
                  Nội dung phản ánh
                </label>
                <textarea
                  className="form-control StudentCare-style-149"
                  rows="4"
                  value={editingTicket.details || ""}
                  onChange={(e) =>
                    setEditingTicket({
                      ...editingTicket,
                      details: e.target.value,
                    })
                  }
                ></textarea>
              </div>
              <div className="StudentCare-style-150">
                <div className="StudentCare-style-151">
                  <label className="StudentCare-style-152">
                    Mức độ / Nhãn dán
                  </label>
                  <select
                    className="form-control"
                    value={editingTicket.priority || "Tạo mới"}
                    onChange={(e) =>
                      setEditingTicket({
                        ...editingTicket,
                        priority: e.target.value,
                      })
                    }
                  >
                    <option value="Tạo mới">Tạo mới</option>
                    <option value="Xem xét lại">Xem xét lại</option>
                    <option value="Gấp">Cần xử lý Gấp</option>
                  </select>
                </div>
                <div className="StudentCare-style-153">
                  <label className="StudentCare-style-154">
                    Chỉnh sửa thời gian tạo
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={parseToLocalDatetime(editingTicket.createdAt)}
                    onChange={handleDatetimeChange}
                  />
                </div>
              </div>
            </div>
            <div className="StudentCare-style-155">
              <button
                className="btn StudentCare-style-156"
                onClick={handleSaveEditTicket}
              >
                <i className="fa-solid fa-floppy-disk StudentCare-style-157"></i>{" "}
                LƯU THAY ĐỔI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default StudentCare;
