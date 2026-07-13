import "../styles/pages/MyClassActive.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useNotification } from "../context/NotificationContext"; // Kéo hàm thông báo vào

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
});
function MyClassActive() {
  const { currentUser, currentRole } = useAuth();
  const { classes } = useData();
  const { addNotification } = useNotification(); // Khởi tạo hàm thông báo

  const [allStudents, setAllStudents] = useState([]);
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [studentsRes, customersRes] = await Promise.all([
          api.get("/students").catch(() => ({ data: [] })),
          api.get("/customers").catch(() => ({ data: [] })),
        ]);

        // Hàm Regex siêu việt: Xóa mọi khoảng trắng thừa và chuẩn hóa chuỗi
        const normalizeStr = (str) => String(str || "").trim().toLowerCase().replace(/\s+/g, ' ');

        const studentsList = (studentsRes.data || []).filter(Boolean).map((s) => ({
          id: `ST-${s.id}`,
          name: String(s.name || "Học viên ẩn danh"),
          classCode: s.classId || s.class,
        }));

        // Áp dụng chuẩn hóa Regex vào lưới bảo vệ
        const studentNamesSet = new Set(
          studentsList.map((s) => normalizeStr(s.name))
        );

        const customersList = (customersRes.data || [])
          .filter((c) => c && c.status === "Đã ĐK" && c.assignClass)
          .filter((c) => {
            const cName = normalizeStr(c.name || c.fbName);
            return !studentNamesSet.has(cName);
          })
          .map((c) => ({
            id: `CUS-${c.id}`,
            name: String(c.name || c.fbName || "Khách hàng ẩn danh"),
            classCode: c.assignClass,
          }));

        setAllStudents([...studentsList, ...customersList]);
      } catch (error) {
        console.log("Lỗi đồng bộ dữ liệu");
      }
    };
    fetchAllData();
  }, []);
  let myClasses = classes.filter((c) => {
    if (currentRole === "admin" || currentRole === "manager") return true;
    if (currentRole === "teacher") {
      return (
        c.teacherId === currentUser.id ||
        (c.teacher &&
          currentUser.name &&
          c.teacher.toLowerCase().includes(currentUser.name.toLowerCase()))
      );
    }
    if (currentRole === "ta") {
      return (
        c.taId === currentUser.id ||
        (c.ta &&
          currentUser.name &&
          c.ta.toLowerCase().includes(currentUser.name.toLowerCase()))
      );
    }
    return false;
  });
  myClasses.sort((a, b) => {
    if (!a.startDate) return 1;
    if (!b.startDate) return -1;
    return new Date(b.startDate) - new Date(a.startDate);
  });
  const groupedMyClasses = myClasses.reduce((acc, c) => {
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
  const [activeClassId, setActiveClassId] = useState(null);
  useEffect(() => {
    if (myClasses.length > 0) {
      const isValid = myClasses.some((c) => c.id === activeClassId);
      if (!isValid) setActiveClassId(myClasses[0].id);
    } else {
      setActiveClassId(null);
    }
  }, [myClasses, activeClassId]);
  const activeClass = myClasses.find((c) => c.id === activeClassId);
  const [sessionsData, setSessionsData] = useState([]);
  const [selectedSessionNum, setSelectedSessionNum] = useState(1);
  const currentSession =
    sessionsData.find((s) => s.sessionNum === selectedSessionNum) || {};
  useEffect(() => {
    if (!activeClass) return;
    const fetchSessions = async () => {
      try {
        const res = await api.get(`/sessions/class/${activeClass.id}`);
        const dbSessions = res.data || [];
        const total = Math.max(1, parseInt(activeClass.totalSessions) || 19);
        const fullSessions = Array.from(
          {
            length: total,
          },
          (_, i) => ({
            classId: activeClass.id,
            sessionNum: i + 1,
            title: `BÀI ${i + 1}`,
            status: "draft",
            notes: "",
            hasLessonPlan: false,
            lessonPlanUrl: "",
          }),
        );
        dbSessions.forEach((dbS) => {
          if (
            dbS &&
            dbS.sessionNum &&
            dbS.sessionNum >= 1 &&
            dbS.sessionNum <= total
          ) {
            fullSessions[dbS.sessionNum - 1] = {
              ...fullSessions[dbS.sessionNum - 1],
              ...dbS,
            };
          }
        });
        setSessionsData(fullSessions);
      } catch (e) {
        const total = Math.max(1, parseInt(activeClass.totalSessions) || 19);
        const initialSessions = Array.from(
          {
            length: total,
          },
          (_, i) => ({
            classId: activeClass.id,
            sessionNum: i + 1,
            title: `BÀI ${i + 1}`,
            status: "draft",
            notes: "",
            hasLessonPlan: false,
            lessonPlanUrl: "",
          }),
        );
        setSessionsData(initialSessions);
      }
    };
    fetchSessions();
    setSelectedSessionNum(1);
  }, [activeClass]);
  const [studentsAttendance, setStudentsAttendance] = useState([]);
  const [isFetchingAttendance, setIsFetchingAttendance] = useState(false);
  useEffect(() => {
    if (!activeClass) return;
    setIsFetchingAttendance(true);
    const classRoster = allStudents.filter(
      (s) => s && s.classCode === activeClass.classCode,
    );
    const defaultStudents = classRoster.map((st) => ({
      id: st.id,
      name: String(st.name || "Học viên ẩn danh"),
      status: "present",
      flag: false,
    }));
    const fetchAttendance = async () => {
      try {
        const res = await api.get(
          `/attendance/${activeClass.id}/${selectedSessionNum}`,
        );
        if (res.data && res.data.length > 0) {
          const dbStatusMap = new Map();
          res.data.forEach((r) => {
            if (r && r.studentId) {
              dbStatusMap.set(r.studentId, {
                status: r.status,
                flag: r.flag,
              });
            }
          });
          const mergedAttendance = defaultStudents.map((st) => {
            if (dbStatusMap.has(st.id)) {
              return {
                ...st,
                status: dbStatusMap.get(st.id).status,
                flag: dbStatusMap.get(st.id).flag,
              };
            }
            return st;
          });
          setStudentsAttendance(mergedAttendance);
        } else {
          setStudentsAttendance(defaultStudents);
        }
      } catch (error) {
        setStudentsAttendance(defaultStudents);
      } finally {
        setIsFetchingAttendance(false);
      }
    };
    fetchAttendance();
  }, [activeClass, selectedSessionNum, allStudents]);
  const handleUpdateSessionField = (field, value) => {
    setSessionsData((prev) =>
      prev.map((s) =>
        s.sessionNum === selectedSessionNum
          ? {
            ...s,
            [field]: value,
          }
          : s,
      ),
    );

    if (field === "status" && value === "cancelled") {
      setStudentsAttendance((prev) =>
        prev.map((s) => ({
          ...s,
          status: "absent",
        }))
      );
    }
  };
  const handleToggleLessonPlan = (e) => {
    e.preventDefault();
    const updatedStatus = !currentSession.hasLessonPlan;
    handleUpdateSessionField("hasLessonPlan", updatedStatus);
    alert(
      `Hệ thống: ${updatedStatus ? "Đã nộp" : "Đã hủy nộp"} giáo án thành công! Vui lòng ấn "Lưu Nhật Ký" để ghi nhận thay đổi.`,
    );
  };
  const handleAttendanceChange = (id, newStatus) => {
    setStudentsAttendance((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
            ...s,
            status: newStatus,
          }
          : s,
      ),
    );
  };
  const handleToggleFlag = (id) => {
    setStudentsAttendance((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
            ...s,
            flag: !s.flag,
          }
          : s,
      ),
    );
  };
  const markAllPresent = () => {
    setStudentsAttendance((prev) =>
      prev.map((s) => ({
        ...s,
        status: "present",
      })),
    );
  };
  const handleSaveAllData = async () => {
    if (isFetchingAttendance) return;
    try {
      await api.post(`/sessions`, {
        ...currentSession,
        classId: activeClass.id,
      });


      const mappedAttendance = studentsAttendance.map((st) => ({
        id: st.id,         // Đổi từ studentId -> id
        name: st.name,     // Đổi từ studentName -> name
        status: st.status,
        flag: st.flag,
      }));

      await api.post(`/attendance/save`, {
        classId: activeClass.id,
        sessionNum: selectedSessionNum,
        records: mappedAttendance,
      });


      // TẠO BÁO CÁO CHI TIẾT KHI GIÁO VIÊN LƯU
      const presentCount = studentsAttendance.filter(
        (s) => s.status === "present",
      ).length;
      const totalCount = studentsAttendance.length;
      const statusText =
        currentSession.status === "completed"
          ? "Đã hoàn thành"
          : currentSession.status === "cancelled"
            ? "Nghỉ"
            : "Chưa diễn ra";
      addNotification(
        "Lưu Nhật ký Giảng dạy",
        `Giáo viên ${currentUser.name} đã cập nhật Buổi ${selectedSessionNum} của lớp ${activeClass.classCode}`,
        "success",
        "reports",
        // Bấm vào sẽ bay sang trang Báo Cáo để xem lại
        {
          "Sĩ số điểm danh": `${presentCount} / ${totalCount} có mặt`,
          "Trạng thái buổi học": statusText,
          "Tình trạng Giáo án": currentSession.hasLessonPlan
            ? "Đã nộp"
            : "Chưa nộp",
          "Bài tập / Ghi chú": currentSession.notes || "Không có ghi chú",
        },
      );
      const res = await api.get(`/sessions/class/${activeClass.id}`);
      if (res.data && res.data.length > 0) {
        const total = Math.max(1, parseInt(activeClass.totalSessions) || 19);
        const fullSessions = Array.from(
          {
            length: total,
          },
          (_, i) => ({
            classId: activeClass.id,
            sessionNum: i + 1,
            title: `BÀI ${i + 1}`,
            status: "draft",
            notes: "",
            hasLessonPlan: false,
            lessonPlanUrl: "",
          }),
        );
        res.data.forEach((dbS) => {
          if (
            dbS &&
            dbS.sessionNum &&
            dbS.sessionNum >= 1 &&
            dbS.sessionNum <= total
          ) {
            fullSessions[dbS.sessionNum - 1] = {
              ...fullSessions[dbS.sessionNum - 1],
              ...dbS,
            };
          }
        });
        setSessionsData(fullSessions);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      addNotification("Lỗi", `Không thể lưu tiến độ: ${errorMsg}`, "error");
    }
  };
  return (
    <div className="MyClassActive-style-1">
      <div className="card MyClassActive-style-2">
        <div className="MyClassActive-style-3">
          <div>
            <span className="badge-studying MyClassActive-style-4">
              LỚP ĐANG DẠY
            </span>

            <select
              className="form-control"
              value={activeClassId || ""}
              onChange={(e) =>
                setActiveClassId(parseInt(e.target.value) || e.target.value)
              }
              disabled={!activeClass}
              style={{
                fontSize: "1.4rem",
                fontWeight: "800",
                color: !activeClass ? "#94a3b8" : "#1e3a8a",
                border: "1px solid var(--primary)",
                padding: "6px 12px",
                borderRadius: "8px",
                cursor: !activeClass ? "not-allowed" : "pointer",
                display: "block",
                maxWidth: "400px",
                backgroundColor: !activeClass ? "#f1f5f9" : "white",
              }}
            >
              {!activeClass ? (
                <option value="">Giáo viên chưa có lớp</option>
              ) : (
                Object.keys(groupedMyClasses).map((monthLabel) => (
                  <optgroup
                    key={monthLabel}
                    label={`--- ${monthLabel} ---`}
                    className="MyClassActive-style-5"
                  >
                    {groupedMyClasses[monthLabel].map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                        className="MyClassActive-style-6"
                      >
                        {c.classCode || "Lớp chưa có tên"}
                      </option>
                    ))}
                  </optgroup>
                ))
              )}
            </select>

            <p className="MyClassActive-style-7">
              <i className="fa-solid fa-clock MyClassActive-style-8"></i> Giờ
              học: {activeClass?.scheduleTime || "Chưa xếp"} |
              <i className="fa-solid fa-user-tie MyClassActive-style-9"></i>{" "}
              Giáo viên: {activeClass?.teacher || "Chưa xếp"} |
              <i className="fa-solid fa-user-graduate MyClassActive-style-10"></i>{" "}
              Trợ giảng: {activeClass?.ta ? activeClass.ta : "Không có"}
            </p>
          </div>
          {currentRole !== "teacher" && (
            <div className="MyClassActive-style-11">
              <span className="MyClassActive-style-12">Học phí / Buổi dạy</span>
              <strong className="MyClassActive-style-13">
                {activeClass?.sessionFee
                  ? Number(activeClass.sessionFee).toLocaleString("vi-VN")
                  : "0"}{" "}
                VNĐ
              </strong>
            </div>
          )}
        </div>
      </div>

      {!activeClass ? (
        <div className="MyClassActive-style-14">
          <div className="MyClassActive-style-15">
            <i className="fa-solid fa-folder-open MyClassActive-style-16"></i>
          </div>
          <h3 className="MyClassActive-style-17">Giáo viên chưa có lớp</h3>
          <p className="MyClassActive-style-18">
            Hiện tại hệ thống chưa ghi nhận lớp học nào thuộc quyền phụ trách
            giảng dạy của bạn. Hãy liên hệ với Quản lý để được xếp lớp.
          </p>
        </div>
      ) : (
        <>
          <div className="card MyClassActive-style-19">
            <h3 className="MyClassActive-style-20">
              <i className="fa-solid fa-calendar-days MyClassActive-style-21"></i>
              Lộ trình & Nhật ký tiến độ giảng dạy{" "}
              <span className="MyClassActive-style-22">
                (Nhấp vào hộp để chỉnh sửa)
              </span>
            </h3>
            <div className="MyClassActive-style-23">
              {sessionsData.map((session) => {
                const isSelected = selectedSessionNum === session.sessionNum;
                let borderStyle = "1px solid #e2e8f0";
                if (session.status === "completed")
                  borderStyle = "2px solid #10b981";
                if (session.status === "cancelled")
                  borderStyle = "2px solid #ef4444";
                if (isSelected) borderStyle = "2px solid #2563eb";
                const bgStyle = isSelected ? "#eff6ff" : "#ffffff";
                return (
                  <div
                    key={session.sessionNum}
                    onClick={() => setSelectedSessionNum(session.sessionNum)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "14px 10px",
                      borderRadius: "12px",
                      backgroundColor: bgStyle,
                      border: borderStyle,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: isSelected
                        ? "0 4px 12px rgba(37, 99, 235, 0.12)"
                        : "0 1px 3px rgba(0,0,0,0.02)",
                      textAlign: "center",
                      minHeight: "110px",
                    }}
                  >
                    <strong
                      style={{
                        fontSize: "0.85rem",
                        color: isSelected ? "#1e40af" : "#1e293b",
                      }}
                    >
                      Buổi {session.sessionNum}
                    </strong>
                    <span className="MyClassActive-style-24">
                      {session.title || "Chưa có tiêu đề"}
                    </span>

                    <div className="MyClassActive-style-25">
                      {session.status === "completed" && (
                        <span className="MyClassActive-style-26">
                          Đã hoàn thành
                        </span>
                      )}
                      {session.status === "cancelled" && (
                        <span className="MyClassActive-style-27">Nghỉ</span>
                      )}
                      {session.hasLessonPlan && (
                        <span className="MyClassActive-style-28">
                          <i className="fa-solid fa-file-shield MyClassActive-style-29"></i>{" "}
                          Đã nộp giáo án
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="my-portal-grid MyClassActive-style-30">
            <div className="card MyClassActive-style-31">
              <h3 className="MyClassActive-style-32">
                <i className="fa-solid fa-pen-to-square MyClassActive-style-33"></i>{" "}
                Chỉnh sửa Nội dung: Buổi {selectedSessionNum}
              </h3>

              <div className="MyClassActive-style-34">
                <div>
                  <label className="MyClassActive-style-35">
                    TÊN / TIÊU ĐỀ BUỔI HỌC
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={currentSession.title || ""}
                    onChange={(e) =>
                      handleUpdateSessionField(
                        "title",
                        e.target.value.toUpperCase(),
                      )
                    }
                    placeholder="Ví dụ: BÀI 1 / ÔN TẬP NGỮ PHÁP..."
                  />
                </div>
                <div>
                  <label className="MyClassActive-style-36">
                    TRẠNG THÁI BUỔI HỌC
                  </label>
                  <select
                    className="form-control"
                    value={currentSession.status || "draft"}
                    onChange={(e) =>
                      handleUpdateSessionField("status", e.target.value)
                    }
                  >
                    <option value="draft">
                      🆕 Chưa diễn ra / Đang soạn giáo án
                    </option>
                    <option value="completed">
                      ✅ Đã hoàn thành giảng dạy
                    </option>
                    <option value="cancelled">❌ Hủy ca học / Nghỉ lễ</option>
                  </select>
                </div>
                <div className="MyClassActive-style-37">
                  <label className="MyClassActive-style-38">
                    <i className="fa-solid fa-file-arrow-up MyClassActive-style-39"></i>{" "}
                    TÀI LIỆU GIÁO ÁN
                  </label>
                  <div className="MyClassActive-style-40">
                    <input
                      type="text"
                      className="form-control MyClassActive-style-41"
                      value={currentSession.lessonPlanUrl || ""}
                      onChange={(e) =>
                        handleUpdateSessionField(
                          "lessonPlanUrl",
                          e.target.value,
                        )
                      }
                      placeholder="Dán link Drive/Docs tài liệu giáo án (nếu có)..."
                    />
                    <button
                      className="btn"
                      style={{
                        padding: "10px 16px",
                        borderRadius: "6px",
                        fontWeight: "800",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.2s",
                        backgroundColor: currentSession.hasLessonPlan
                          ? "var(--success)"
                          : "#e2e8f0",
                        color: currentSession.hasLessonPlan
                          ? "white"
                          : "var(--text-muted)",
                        border: currentSession.hasLessonPlan
                          ? "none"
                          : "1px solid #cbd5e1",
                      }}
                      onClick={handleToggleLessonPlan}
                    >
                      {currentSession.hasLessonPlan ? (
                        <>
                          <i className="fa-solid fa-check"></i> Đã nộp GA
                        </>
                      ) : (
                        "Nộp Giáo Án"
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="MyClassActive-style-42">
                    TÓM TẮT NỘI DUNG & BÀI TẬP VỀ NHÀ
                  </label>
                  <textarea
                    className="form-control MyClassActive-style-43"
                    rows="3"
                    value={currentSession.notes || ""}
                    onChange={(e) =>
                      handleUpdateSessionField("notes", e.target.value)
                    }
                    placeholder="Nhập tóm tắt bài học..."
                  />
                </div>
              </div>
            </div>

            <div className="card MyClassActive-style-44">
              <div className="attendance-header-row">
                <h3 className="MyClassActive-style-45">
                  <i className="fa-solid fa-user-check MyClassActive-style-46"></i>
                  Điểm danh: Buổi {selectedSessionNum}
                </h3>
                <button className="btn-all-present" onClick={markAllPresent}>
                  TẤT CẢ CÓ MẶT
                </button>
              </div>

              <div className="attendance-students-grid MyClassActive-style-47">
                {studentsAttendance.length === 0 && (
                  <p className="MyClassActive-style-48">
                    Lớp chưa có học viên. Hãy kiểm tra lại Mã lớp bên bảng Chăm
                    sóc Học viên.
                  </p>
                )}
                {studentsAttendance.map((student) => (
                  <div
                    className="attendance-student-card MyClassActive-style-49"
                    key={student.id}
                  >
                    <div className="student-card-left">
                      <div className="student-avatar-letter">
                        {String(student.name || "H")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className="student-card-info">
                        <h5 className="MyClassActive-style-50">
                          {student.name || "Học viên chưa có tên"}
                        </h5>
                        <div className="student-attendance-radio-group">
                          <label className="attendance-radio-label">
                            <input
                              type="radio"
                              name={`att-${student.id}`}
                              checked={student.status === "present"}
                              onChange={() =>
                                handleAttendanceChange(student.id, "present")
                              }
                            />{" "}
                            Có mặt
                          </label>
                          <label className="attendance-radio-label">
                            <input
                              type="radio"
                              name={`att-${student.id}`}
                              checked={student.status === "absent"}
                              onChange={() =>
                                handleAttendanceChange(student.id, "absent")
                              }
                            />{" "}
                            Vắng
                          </label>
                        </div>
                      </div>
                    </div>
                    <i
                      className={`fa-solid fa-flag attendance-flag-icon ${student.flag ? "flagged" : ""}`}
                      onClick={() => handleToggleFlag(student.id)}
                    ></i>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="MyClassActive-style-51">
            <button
              className="btn btn-primary"
              onClick={handleSaveAllData}
              disabled={isFetchingAttendance}
              style={{
                padding: "14px 40px",
                fontWeight: "700",
                backgroundColor: isFetchingAttendance
                  ? "#94a3b8"
                  : "var(--primary)",
                color: "white",
                borderRadius: "8px",
                cursor: isFetchingAttendance ? "not-allowed" : "pointer",
                fontSize: "0.95rem",
              }}
            >
              <i
                className={`${isFetchingAttendance ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-floppy-disk"} MyClassActive-style-52`}
              ></i>
              {isFetchingAttendance
                ? "ĐANG KẾT NỐI MÁY CHỦ..."
                : `LƯU NHẬT KÝ BUỔI ${selectedSessionNum}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
export default MyClassActive;
