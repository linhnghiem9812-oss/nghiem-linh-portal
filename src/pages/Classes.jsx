import "../styles/pages/Classes.css";
import React, { useState, useEffect } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext"; // Kéo hàm thông báo vào
import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
});
function Classes() {
  const { classes, addClass, teachers, tas } = useData();
  const { currentUser, currentRole } = useAuth();
  const { addNotification } = useNotification(); // Khởi tạo hàm thông báo

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeSession, setActiveSession] = useState(1);
  const [allStudents, setAllStudents] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [editingClass, setEditingClass] = useState(null);
  const [originalClass, setOriginalClass] = useState(null); // Lưu bản gốc để so sánh

  const [sessionsData, setSessionsData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [collapsedMonths, setCollapsedMonths] = useState({});

  const toggleMonth = (monthLabel) => {
    setCollapsedMonths((prev) => ({
      ...prev,
      [monthLabel]: !prev[monthLabel],
    }));
  };
  
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [formClass, setFormClass] = useState({
    name: "",
    teacher: "",
    teacherId: "",
    ta: "",
    taId: "",
    padletUrl: "",
    classType: "",
    level: "",
    sessionFee: "",
    startDate: "",
    totalSessions: "",
    scheduleTime: "",
  });
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoadingStudents(true);
      try {
        const res = await api.get("/students/eligible-for-class");
        setAllStudents(res.data || []);
      } catch (error) {
        console.log("Lỗi đồng bộ dữ liệu", error);
        addNotification("Lỗi", "Không thể lấy danh sách học viên hợp lệ.", "error");
      } finally {
        setIsLoadingStudents(false);
      }
    };
    fetchAllData();
  }, []);
  useEffect(() => {
    if (selectedClass) {
      const studentsInThisClass = allStudents.filter(
        (s) => s && s.classCode === selectedClass.classCode,
      );
      setClassStudents(studentsInThisClass);
      setIsLoadingSessions(true);
      api
        .get(`/sessions/class/${selectedClass.id}/full`)
        .then((res) => {
          setSessionsData(res.data || []);
        })
        .catch(() => {
            setSessionsData([]);
            addNotification("Lỗi", "Không thể lấy danh sách buổi học.", "error");
        })
        .finally(() => setIsLoadingSessions(false));
    }
  }, [selectedClass, allStudents]);
  useEffect(() => {
    if (selectedClass && activeSession) {
      setIsLoadingAttendance(true);
      api
        .get(`/attendance/${selectedClass.id}/${activeSession}`)
        .then((res) => {
          setAttendanceData(res.data || []);
        })
        .catch(() => {
            setAttendanceData([]);
            addNotification("Lỗi", "Không thể lấy dữ liệu điểm danh.", "error");
        })
        .finally(() => setIsLoadingAttendance(false));
    }
  }, [selectedClass, activeSession]);
  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!formClass.name) return alert("Vui lòng điền Tên lớp học!");
    const newClassObj = {
      classCode: formClass.name,
      teacherId: formClass.teacherId ? parseInt(formClass.teacherId) : null,
      teacher: formClass.teacher,
      teacherName: formClass.teacher,
      taId: formClass.taId ? parseInt(formClass.taId) : null,
      ta: formClass.ta,
      teachingAssistant: formClass.ta,
      classType: formClass.classType,
      level: formClass.level,
      courseLevel: formClass.level,
      totalSessions: parseInt(formClass.totalSessions) || 0,
      sessionFee: parseInt(formClass.sessionFee) || 0,
      scheduleTime: formClass.scheduleTime || "Chưa rõ",
      startDate: formClass.startDate
        ? new Date(formClass.startDate).toISOString().split("T")[0]
        : null,
      padletUrl: formClass.padletUrl,
    };
    const result = await addClass(newClassObj);
    if (result && result.success) {
      // THÔNG BÁO TẠO MỚI CHI TIẾT
      addNotification(
        "Tạo Lớp Học",
        `Đã mở mới lớp ${formClass.name}`,
        "success",
        "classes",
        {
          "Mã lớp": formClass.name,
          "Giáo viên": formClass.teacher || "Chưa phân công",
          "Trợ giảng": formClass.ta || "Không có",
          "Ngày KG": formClass.startDate || "Dự kiến",
          "Học phí / Buổi": formClass.sessionFee + " VNĐ",
        },
      );
      setFormClass({
        name: "",
        teacher: "",
        teacherId: "",
        ta: "",
        taId: "",
        padletUrl: "",
        classType: "",
        level: "",
        sessionFee: "",
        startDate: "",
        totalSessions: "",
        scheduleTime: "",
      });
    } else {
      addNotification(
        "Lỗi",
        `Cơ sở dữ liệu từ chối lưu: ${result.message}`,
        "error",
      );
    }
  };
  const handleSaveEdit = async () => {
    try {
      await api.put(`/classes/${editingClass.id}`, editingClass);

      // TỪ ĐIỂN DỊCH TÊN BIẾN SANG TIẾNG VIỆT
      const fieldNames = {
        classCode: "Mã lớp",
        sessionFee: "Học phí/buổi",
        teacher: "Giáo viên",
        ta: "Trợ giảng",
        classType: "Loại hình",
        level: "Cấp độ",
        totalSessions: "Tổng số buổi",
        startDate: "Ngày KG",
        scheduleTime: "Giờ học",
        padletUrl: "Link tài nguyên",
      };
      let changes = {};
      Object.keys(editingClass).forEach((key) => {
        if (fieldNames[key] && editingClass[key] !== originalClass[key]) {
          changes[fieldNames[key]] =
            `Từ "${originalClass[key] || "Trống"}" thành "${editingClass[key] || "Trống"}"`;
        }
      });

      // THÔNG BÁO SỬA LỚP HỌC
      addNotification(
        "Cập nhật Lớp học",
        `Đã thay đổi thông tin lớp ${editingClass.classCode}`,
        "warning",
        "classes",
        changes,
      );
      setTimeout(() => window.location.reload(), 1500); // Đợi hiển thị thông báo rồi tải lại
    } catch (error) {
      addNotification("Lỗi", "Lỗi cập nhật CSDL.", "error");
    }
  };
  const handleDeleteClass = async (id) => {
    if (
      window.confirm(
        "Cảnh báo: Bạn có chắc chắn muốn xóa lớp học này không? Toàn bộ dữ liệu tiến trình sẽ bị mất!",
      )
    ) {
      try {
        const classToDelete = classes.find((c) => c.id === id);
        await api.delete(`/classes/${id}`);

        // THÔNG BÁO XÓA LỚP
        addNotification(
          "Xóa Lớp Học",
          `Đã giải tán lớp ${classToDelete?.classCode}`,
          "error",
          "classes",
          {
            "Mã lớp bị xóa": classToDelete?.classCode,
            "Giáo viên mất lớp": classToDelete?.teacher || "Không có",
            "ID Hệ thống": classToDelete?.id,
          },
        );
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        addNotification("Lỗi", "Lỗi khi xóa lớp học!", "error");
      }
    }
  };
  let displayClasses = classes ? [...classes] : [];
  if (currentRole === "teacher") {
    displayClasses = displayClasses.filter(
      (c) =>
        c.teacherId === currentUser.id ||
        (c.teacher &&
          currentUser.name &&
          c.teacher.toLowerCase().includes(currentUser.name.toLowerCase())),
    );
  }
  if (searchTerm) {
    displayClasses = displayClasses.filter(
      (c) =>
        c.classCode &&
        c.classCode.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }
  displayClasses.sort((a, b) => {
    if (!a.startDate) return 1;
    if (!b.startDate) return -1;
    return new Date(b.startDate) - new Date(a.startDate);
  });
  const groupedClasses = displayClasses.reduce((acc, c) => {
    const dateObj = c.startDate ? new Date(c.startDate) : null;
    const groupName =
      dateObj && !isNaN(dateObj.getTime())
        ? `Tháng ${dateObj.getMonth() + 1} / ${dateObj.getFullYear()}`
        : "Lớp chưa xác định ngày KG";
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(c);
    return acc;
  }, {});
  if (selectedClass) {
    const currentSession =
      sessionsData.find((s) => s.sessionNum === activeSession) || {};
    const completedSessions = sessionsData
      .filter((s) => s.status === "completed" || s.status === "cancelled")
      .sort((a, b) => b.sessionNum - a.sessionNum)
      .slice(0, 3);
    return (
      <div className="Classes-style-1">
        <div className="Classes-style-2">
          <button
            className="circular-btn Classes-style-3"
            onClick={() => setSelectedClass(null)}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <h2 className="Classes-style-4">{selectedClass.classCode}</h2>
            <span className="Classes-style-5">
              Chi tiết tiến trình giảng dạy và học viên (Chế độ xem)
            </span>
          </div>
        </div>

        <div className="my-portal-grid Classes-style-6">
          <div className="Classes-style-7">
            <div className="Classes-style-8">
              <h4 className="Classes-style-9">
                DANH SÁCH LỚP ({classStudents.length}) {isLoadingStudents && <i className="fa-solid fa-spinner fa-spin"></i>}
              </h4>
              <div className="Classes-style-10">
                {classStudents.length === 0 && (
                  <p className="Classes-style-11">Chưa có học viên nào.</p>
                )}
                {classStudents.map((st) => (
                  <div key={st.id} className="Classes-style-12">
                    <div className="Classes-style-13">
                      <div className="Classes-style-14">
                        {String(st.name || "H")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <span className="Classes-style-15">{st.name}</span>
                    </div>
                    <span className="Classes-style-16">Đã ĐK</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card Classes-style-17">
              <div className="Classes-style-18">
                <h4 className="Classes-style-19">
                  <i className="fa-solid fa-clock-rotate-left Classes-style-20"></i>{" "}
                  Lịch sử dạy
                </h4>
              </div>
              <div className="timeline-container">
                {completedSessions.length === 0 && (
                  <span className="Classes-style-21">
                    Chưa có buổi học nào hoàn thành.
                  </span>
                )}
                {completedSessions.map((sess) => (
                  <div className="timeline-node" key={sess.sessionNum}>
                    <div
                      className="timeline-dot"
                      style={{
                        backgroundColor:
                          sess.status === "cancelled"
                            ? "#ef4444"
                            : "var(--primary)",
                        left: "-25px",
                      }}
                    ></div>
                    <div className="timeline-header Classes-style-22">
                      <strong
                        style={{
                          color:
                            sess.status === "cancelled"
                              ? "#b91c1c"
                              : "var(--primary)",
                          fontSize: "0.85rem",
                          backgroundColor:
                            sess.status === "cancelled"
                              ? "#fee2e2"
                              : "var(--primary-light)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        Buổi {sess.sessionNum}
                      </strong>
                    </div>
                    <div className="timeline-content Classes-style-23">
                      <span className="Classes-style-24">
                        {sess.title || "Không có tiêu đề"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="Classes-style-25">
            <div className="card Classes-style-26">
              {isLoadingSessions ? <div style={{textAlign: 'center', padding: '20px'}}><i className="fa-solid fa-spinner fa-spin fa-2x"></i></div> : (
              <div className="session-grid-container Classes-style-27">
                {sessionsData.map((sess) => {
                  const num = sess.sessionNum;
                  const isSelected = activeSession === num;
                  const isCancelled = sess.status === "cancelled";
                  const isDone = sess.status === "completed";
                  let cardClass = "session-btn-card";
                  if (isCancelled) cardClass += " session-cancelled";
                  else if (isDone) cardClass += " session-submitted-ga";
                  if (isSelected && !isCancelled)
                    cardClass += " session-active-selected";
                  return (
                    <div
                      key={num}
                      className={cardClass}
                      onClick={() => setActiveSession(num)}
                    >
                      <strong className="Classes-style-28">BUỔI {num}</strong>
                      <span className="Classes-style-29">Xem</span>
                      {isDone && (
                        <span
                          className="session-submitted-ga-badge"
                          style={{
                            backgroundColor: isSelected
                              ? "rgba(255,255,255,0.2)"
                              : "#dcfce7",
                            color: isSelected ? "white" : "#166534",
                          }}
                        >
                          <i className="fa-solid fa-check"></i> Đã dạy
                        </span>
                      )}
                      {isCancelled && (
                        <div className="Classes-style-30">
                          <span className="session-cancelled-badge Classes-style-31">
                            <i className="fa-solid fa-ban"></i> NGHỈ
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              )}
            </div>

            <div className="card Classes-style-32">
              <div className="Classes-style-33">
                <div>
                  <h3 className="Classes-style-34">
                    Điểm Danh Học Viên: Buổi {activeSession}
                  </h3>
                  <p className="Classes-style-35">
                    Dữ liệu điểm danh được giáo viên lưu lại
                  </p>
                </div>
              </div>

              <div className="Classes-style-36">
                {isLoadingAttendance && <div style={{textAlign: 'center', padding: '20px'}}><i className="fa-solid fa-spinner fa-spin fa-2x"></i></div>}
                {!isLoadingAttendance && classStudents.length === 0 && (
                  <p className="Classes-style-37">Chưa có học viên.</p>
                )}
                {!isLoadingAttendance && classStudents.map((st) => {
                  const attRecord =
                    attendanceData.find((a) => a.studentId === st.id) || {};
                  const isPresent = attRecord.status === "present";
                  const isAbsent = attRecord.status === "absent";
                  return (
                    <div key={st.id} className="Classes-style-38">
                      <div className="Classes-style-39">
                        <div className="Classes-style-40">
                          {String(st.name || "H")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <strong className="Classes-style-41">
                            {st.name}
                          </strong>
                          <div className="Classes-style-42">
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                cursor: "not-allowed",
                                fontWeight: isPresent ? "600" : "normal",
                                color: isPresent ? "var(--primary)" : "gray",
                              }}
                            >
                              <input
                                type="radio"
                                checked={isPresent}
                                readOnly
                              />{" "}
                              Có mặt
                            </label>
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                cursor: "not-allowed",
                                fontWeight: isAbsent ? "600" : "normal",
                                color: isAbsent ? "#ef4444" : "gray",
                              }}
                            >
                              <input type="radio" checked={isAbsent} readOnly />{" "}
                              Vắng
                            </label>
                          </div>
                        </div>
                      </div>
                      <i
                        className={`fa-solid fa-flag ${attRecord.flag ? "flagged" : ""}`}
                        style={{
                          color: attRecord.flag ? "#f59e0b" : "#e2e8f0",
                        }}
                      ></i>
                    </div>
                  );
                })}
              </div>

              <div>
                <h4 className="Classes-style-43">
                  Nội dung bài dạy / Ghi chú (Chỉ xem)
                </h4>
                <textarea
                  className="form-control Classes-style-44"
                  rows="3"
                  value={currentSession.notes || ""}
                  readOnly
                  placeholder="Giáo viên chưa nhập ghi chú..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="Classes-style-45">
      {currentRole !== "teacher" && (
        <div className="card Classes-style-46">
          <h3 className="Classes-style-47">
            <i className="fa-regular fa-square-plus Classes-style-48"></i>Quản
            lý Lớp học
          </h3>
          <form onSubmit={handleCreateClass} className="Classes-style-49">
            <div className="Classes-style-50">
              <div>
                <label className="Classes-style-51">MÃ/TÊN LỚP</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="🏷 VD: HSK1-K35"
                  value={formClass.name}
                  onChange={(e) =>
                    setFormClass({
                      ...formClass,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="Classes-style-52">GIÁO VIÊN PHỤ TRÁCH</label>
                <select
                  className="form-control"
                  value={formClass.teacherId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedTeacher = teachers.find(
                      (t) => t.id.toString() === selectedId,
                    );
                    setFormClass({
                      ...formClass,
                      teacherId: selectedId,
                      teacher: selectedTeacher ? selectedTeacher.name : "",
                    });
                  }}
                >
                  <option value="">-- Chọn Giáo viên --</option>
                  {teachers &&
                    teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="Classes-style-53">TRỢ GIẢNG PHỤ TRÁCH</label>
                <select
                  className="form-control"
                  value={formClass.taId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedTA = tas.find(
                      (t) => t.id.toString() === selectedId,
                    );
                    setFormClass({
                      ...formClass,
                      taId: selectedId,
                      ta: selectedTA ? selectedTA.name : "",
                    });
                  }}
                >
                  <option value="">-- Chọn Trợ giảng --</option>
                  {tas &&
                    tas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="Classes-style-54">
                <i className="fa-solid fa-link"></i> Tài nguyên & Giáo trình
              </label>
              <input
                type="url"
                className="form-control Classes-style-55"
                placeholder="Dán link Padlet / Google Drive tài liệu vào đây..."
                value={formClass.padletUrl}
                onChange={(e) =>
                  setFormClass({
                    ...formClass,
                    padletUrl: e.target.value,
                  })
                }
              />
            </div>

            <div className="Classes-style-56">
              <h4 className="Classes-style-57">
                <i className="fa-regular fa-calendar-check Classes-style-58"></i>{" "}
                Cấu hình Lịch học
              </h4>
              <div className="Classes-style-59">
                <div>
                  <label className="Classes-style-60">LOẠI HÌNH LỚP (*)</label>
                  <input
                    type="text"
                    className="form-control Classes-style-61"
                    placeholder="VD: Lớp Nhóm, VIP..."
                    value={formClass.classType}
                    onChange={(e) =>
                      setFormClass({
                        ...formClass,
                        classType: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="Classes-style-62">CẤP ĐỘ LỚP (*)</label>
                  <input
                    type="text"
                    className="form-control Classes-style-63"
                    placeholder="VD: HSK 1, HSK 2..."
                    value={formClass.level}
                    onChange={(e) =>
                      setFormClass({
                        ...formClass,
                        level: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="Classes-style-64">HỌC PHÍ (VNĐ)</label>
                  <input
                    type="number"
                    className="form-control Classes-style-65"
                    placeholder="Ví dụ: 350000"
                    value={formClass.sessionFee}
                    onChange={(e) =>
                      setFormClass({
                        ...formClass,
                        sessionFee: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="Classes-style-66">NGÀY KHAI GIẢNG</label>
                  <input
                    type="date"
                    className="form-control Classes-style-67"
                    value={formClass.startDate}
                    onChange={(e) =>
                      setFormClass({
                        ...formClass,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="Classes-style-68">TỔNG SỐ BUỔI</label>
                  <input
                    type="number"
                    className="form-control Classes-style-69"
                    placeholder="Nhập..."
                    value={formClass.totalSessions}
                    onChange={(e) =>
                      setFormClass({
                        ...formClass,
                        totalSessions: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="Classes-style-70">GIỜ HỌC</label>
                  <input
                    type="text"
                    className="form-control Classes-style-71"
                    placeholder="VD: 19:30 - 21:00"
                    value={formClass.scheduleTime}
                    onChange={(e) =>
                      setFormClass({
                        ...formClass,
                        scheduleTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="Classes-style-72">
              <button
                type="submit"
                className="btn btn-primary Classes-style-73"
              >
                TẠO LỚP HỌC MỚI
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card Classes-style-74">
        <div className="Classes-style-75">
          <div>
            <h3 className="Classes-style-76">
              <i className="fa-solid fa-list Classes-style-48"></i>Danh sách Lớp học
            </h3>
            <div className="Classes-style-78">
              <i className="fa-solid fa-circle-info Classes-style-79"></i> Bấm tên lớp để xem chi tiết
            </div>
          </div>
          <div className="Classes-style-77">
            <input
              type="text"
              className="form-control Classes-style-80"
              placeholder="🔍 Lọc lớp học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table className="modal-table Classes-style-81">
          <thead>
            <tr className="Classes-style-82">
              <th className="Classes-style-83">THÔNG TIN LỚP</th>
              <th className="Classes-style-84">GIÁO TRÌNH & LỊCH</th>
              <th className="Classes-style-85">SĨ SỐ</th>
              {currentRole !== "teacher" && (
                <th className="Classes-style-86">THAO TÁC</th>
              )}
            </tr>
          </thead>
          <tbody>
            {Object.keys(groupedClasses).length === 0 && (
              <tr>
                <td colSpan="4" className="Classes-style-87">
                  Không tìm thấy lớp học nào khớp với dữ liệu.
                </td>
              </tr>
            )}

            {Object.keys(groupedClasses).map((monthLabel) => (
              <React.Fragment key={monthLabel}>
                <tr 
                  className="Classes-style-88" 
                  onClick={() => toggleMonth(monthLabel)} 
                  style={{ cursor: "pointer" }}
                >
                  <td colSpan="4" className="Classes-style-89">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      <span>
                        <i className="fa-regular fa-calendar Classes-style-90"></i>{" "}
                        {monthLabel}
                      </span>
                      <i className={`fa-solid ${collapsedMonths[monthLabel] ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
                    </div>
                  </td>
                </tr>

                {!collapsedMonths[monthLabel] && groupedClasses[monthLabel].map((c) => {
                  const count = allStudents.filter(
                    (s) => s.classId === c.classCode,
                  ).length;
                  return (
                    <tr
                      key={c.id}
                      className="Classes-style-91"
                      onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--bg-app)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "white")
                      }
                    >
                      <td className="Classes-style-92">
                        <strong
                          className="Classes-style-93"
                          onClick={() => setSelectedClass(c)}
                          title="Nhấn để xem chi tiết Lớp học"
                        >
                          {c.classCode}
                        </strong>
                        <span className="Classes-style-94">
                          <i className="fa-solid fa-chalkboard-user Classes-style-95"></i>{" "}
                          {c.teacher || "Chưa xếp giáo viên"}{" "}
                          {c.ta && `| TA: ${c.ta}`}
                        </span>
                      </td>
                      <td className="Classes-style-96">
                        <div>
                          <i className="fa-regular fa-clock Classes-style-97"></i>{" "}
                          {c.scheduleTime}
                        </div>
                        <div>
                          <i className="fa-regular fa-calendar Classes-style-98"></i>{" "}
                          KG:{" "}
                          {c.startDate
                            ? new Date(c.startDate).toLocaleDateString("vi-VN")
                            : "Dự kiến"}
                        </div>
                      </td>
                      <td className="Classes-style-99">
                        <span className="Classes-style-100">{count} HV</span>
                      </td>
                      {currentRole !== "teacher" && (
                        <td className="Classes-style-101">
                          <div className="Classes-style-102">
                            <button
                              title="Sửa"
                              onClick={() => {
                                setOriginalClass({
                                  ...c,
                                });
                                setEditingClass(c);
                              }}
                              className="Classes-style-103"
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button
                              title="Xóa"
                              onClick={() => handleDeleteClass(c.id)}
                              className="Classes-style-104"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {editingClass && (
        <div className="Classes-style-105">
          <div className="card Classes-style-106">
            <div className="Classes-style-107">
              <h3 className="Classes-style-108">
                <i className="fa-solid fa-pen-to-square"></i> Chỉnh sửa thông
                tin Lớp học
              </h3>
              <button
                onClick={() => setEditingClass(null)}
                className="Classes-style-109"
              >
                ✖
              </button>
            </div>

            <div className="Classes-style-110">
              <div>
                <label className="Classes-style-111">Mã/Tên Lớp</label>
                <input
                  className="form-control"
                  value={editingClass.classCode || ""}
                  onChange={(e) =>
                    setEditingClass({
                      ...editingClass,
                      classCode: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="Classes-style-112">Học phí</label>
                <input
                  type="number"
                  className="form-control"
                  value={editingClass.sessionFee || ""}
                  onChange={(e) =>
                    setEditingClass({
                      ...editingClass,
                      sessionFee: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="Classes-style-113">Giáo viên</label>
                <select
                  className="form-control"
                  value={editingClass.teacherId || ""}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedTeacher = teachers.find(
                      (t) => t.id.toString() === selectedId,
                    );
                    setEditingClass({
                      ...editingClass,
                      teacherId: selectedId,
                      teacher: selectedTeacher ? selectedTeacher.name : "",
                    });
                  }}
                >
                  <option value="">-- Chọn Giáo viên --</option>
                  {teachers &&
                    teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="Classes-style-114">Trợ giảng</label>
                <select
                  className="form-control"
                  value={editingClass.taId || ""}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedTA = tas.find(
                      (t) => t.id.toString() === selectedId,
                    );
                    setEditingClass({
                      ...editingClass,
                      taId: selectedId,
                      ta: selectedTA ? selectedTA.name : "",
                    });
                  }}
                >
                  <option value="">-- Chọn Trợ giảng --</option>
                  {tas &&
                    tas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="Classes-style-115">Loại hình</label>
                <input
                  className="form-control"
                  value={editingClass.classType || ""}
                  onChange={(e) =>
                    setEditingClass({
                      ...editingClass,
                      classType: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="Classes-style-116">Cấp độ</label>
                <input
                  className="form-control"
                  value={editingClass.level || ""}
                  onChange={(e) =>
                    setEditingClass({
                      ...editingClass,
                      level: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="Classes-style-117">Tổng số buổi</label>
                <input
                  type="number"
                  className="form-control"
                  value={editingClass.totalSessions || ""}
                  onChange={(e) =>
                    setEditingClass({
                      ...editingClass,
                      totalSessions: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="Classes-style-118">Ngày khai giảng</label>
                <input
                  type="date"
                  className="form-control"
                  value={editingClass.startDate || ""}
                  onChange={(e) =>
                    setEditingClass({
                      ...editingClass,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="Classes-style-119">Giờ học</label>
                <input
                  className="form-control"
                  value={editingClass.scheduleTime || ""}
                  onChange={(e) =>
                    setEditingClass({
                      ...editingClass,
                      scheduleTime: e.target.value,
                    })
                  }
                />
              </div>
              <div className="Classes-style-120">
                <label className="Classes-style-121">
                  Link tài nguyên (Padlet/Drive)
                </label>
                <input
                  type="url"
                  className="form-control"
                  value={editingClass.padletUrl || ""}
                  onChange={(e) =>
                    setEditingClass({
                      ...editingClass,
                      padletUrl: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="Classes-style-122">
              <button
                className="btn Classes-style-123"
                onClick={handleSaveEdit}
              >
                <i className="fa-solid fa-floppy-disk"></i> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Classes;
