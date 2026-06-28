import "../styles/pages/ClassReports.css";
import React, { useState, useEffect } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
});
function ClassReports() {
  const { classes } = useData();
  const { currentUser, currentRole } = useAuth();
  const [selectedReport, setSelectedReport] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [reportStudents, setReportStudents] = useState([]);
  const [reportSessions, setReportSessions] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [attendanceMap, setAttendanceMap] = useState({});
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [studentsRes, customersRes] = await Promise.all([
          api.get("/students").catch(() => ({
            data: [],
          })),
          api.get("/customers").catch(() => ({
            data: [],
          })),
        ]);
        const studentsList = (studentsRes.data || [])
          .filter(Boolean)
          .map((s) => ({
            id: `ST-${s.id}`,
            name: String(s.name || "Học viên ẩn danh"),
            classCode: s.classId || s.class,
          }));

        // LƯỚI BẢO VỆ 1: Chặn học viên trùng lặp giữa CRM và Danh sách chính thức
        const studentNamesSet = new Set(
          studentsList.map((s) => s.name.trim().toLowerCase()),
        );
        const customersList = (customersRes.data || [])
          .filter((c) => c && c.status === "Đã ĐK" && c.assignClass)
          .filter((c) => {
            const cName = String(c.name || c.fbName || "")
              .trim()
              .toLowerCase();
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
  useEffect(() => {
    if (classes && classes.length > 0) {
      classes.forEach((c) => {
        api
          .get(`/sessions/class/${c.id}`)
          .then((res) => {
            const rawSessions = (res.data || []).filter(Boolean);
            const uniqueMap = new Map();
            rawSessions.forEach((s) => {
              if (s && s.sessionNum) uniqueMap.set(s.sessionNum, s);
            });
            const sessions = Array.from(uniqueMap.values());
            const completedCount = sessions.filter(
              (s) =>
                s && (s.status === "completed" || s.status === "cancelled"),
            ).length;
            setProgressMap((prev) => ({
              ...prev,
              [c.id]: completedCount,
            }));
          })
          .catch(() => {});
      });
    }
  }, [classes]);
  useEffect(() => {
    if (selectedReport) {
      const studentsInReport = allStudents.filter(
        (s) => s && s.classCode === selectedReport.classCode,
      );
      setReportStudents(studentsInReport);
      api
        .get(`/sessions/class/${selectedReport.id}`)
        .then((res) => {
          const rawSessions = (res.data || []).filter(Boolean);
          const uniqueSessionsMap = new Map();
          rawSessions.forEach((s) => {
            if (s && s.sessionNum) {
              uniqueSessionsMap.set(s.sessionNum, s);
            }
          });
          const sessions = Array.from(uniqueSessionsMap.values());
          setReportSessions(sessions);
          sessions.forEach((session) => {
            if (
              session &&
              (session.status === "completed" || session.status === "cancelled")
            ) {
              api
                .get(`/attendance/${selectedReport.id}/${session.sessionNum}`)
                .then((attRes) => {
                  const records = attRes.data || [];
                  // LƯỚI BẢO VỆ 2: Loại bỏ bản ghi điểm danh trùng lặp bị kẹt trong DB cũ
                  const presentIds = new Set();
                  records.forEach((r) => {
                    if (r && r.status === "present" && r.studentId) {
                      presentIds.add(r.studentId);
                    }
                  });
                  setAttendanceMap((prev) => ({
                    ...prev,
                    [session.sessionNum]: presentIds.size,
                  }));
                })
                .catch(() => {});
            }
          });
        })
        .catch(() => setReportSessions([]));
    }
  }, [selectedReport, allStudents]);
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
  const currentProgress = reportSessions.filter(
    (s) => s && (s.status === "completed" || s.status === "cancelled"),
  ).length;
  return (
    <div className="ClassReports-style-1">
      {Object.keys(groupedClasses).length === 0 && (
        <p className="ClassReports-style-2">
          Chưa có dữ liệu lớp học trên hệ thống.
        </p>
      )}

      {Object.keys(groupedClasses).map((monthLabel) => (
        <div key={monthLabel} className="ClassReports-style-3">
          <h3 className="ClassReports-style-4">
            <i className="fa-regular fa-calendar ClassReports-style-5"></i>
            {monthLabel}
          </h3>

          <div className="ClassReports-style-6">
            {groupedClasses[monthLabel].map((c) => {
              const count = allStudents.filter(
                (s) => s && s.classCode === c.classCode,
              ).length;
              const totalSessSafe = Math.max(
                1,
                parseInt(c.totalSessions) || 19,
              );
              return (
                <div
                  key={c.id}
                  className="ClassReports-style-7"
                  onClick={() => setSelectedReport(c)}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.transform = "translateY(-4px)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <div className="ClassReports-style-8">
                    <h4 className="ClassReports-style-9">
                      {c.classCode || "Chưa có tên lớp"}
                    </h4>
                    <span className="ClassReports-style-10">{count} HV</span>
                  </div>

                  <div className="ClassReports-style-11">
                    <span>
                      <i className="fa-solid fa-user-tie ClassReports-style-12"></i>{" "}
                      GV:{" "}
                      <strong className="ClassReports-style-13">
                        {c.teacher || "Chưa xếp"}
                      </strong>
                    </span>

                    {c.ta && (
                      <span>
                        <i className="fa-solid fa-user-graduate ClassReports-style-14"></i>{" "}
                        TA:{" "}
                        <strong className="ClassReports-style-15">
                          {c.ta}
                        </strong>
                      </span>
                    )}

                    <span>
                      <i className="fa-regular fa-calendar-check ClassReports-style-16"></i>{" "}
                      Ngày KG:{" "}
                      <strong className="ClassReports-style-17">
                        {c.startDate
                          ? new Date(c.startDate).toLocaleDateString("vi-VN")
                          : "Chưa có"}
                      </strong>
                    </span>
                    <span>
                      <i className="fa-solid fa-clock ClassReports-style-18"></i>{" "}
                      Lịch học:{" "}
                      <strong className="ClassReports-style-19">
                        {c.scheduleTime || "Chưa xếp"}
                      </strong>
                    </span>
                    <span>
                      <i className="fa-solid fa-list-check ClassReports-style-20"></i>{" "}
                      Tiến độ:{" "}
                      <strong className="ClassReports-style-21">
                        {progressMap[c.id] || 0}/{totalSessSafe} buổi
                      </strong>
                    </span>
                  </div>

                  <div className="ClassReports-style-22">
                    <span className="ClassReports-style-23">
                      Xem báo cáo chi tiết
                    </span>
                    <i className="fa-solid fa-arrow-right ClassReports-style-24"></i>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {selectedReport && (
        <div className="ClassReports-style-25">
          <div className="ClassReports-style-26">
            <div className="ClassReports-style-27">
              <h3 className="ClassReports-style-28">
                Chi tiết Báo cáo Lớp học
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="ClassReports-style-29"
              >
                ✖
              </button>
            </div>

            <div className="ClassReports-style-30">
              <div className="ClassReports-style-31">
                <span className="ClassReports-style-32">Giáo viên</span>
                <strong className="ClassReports-style-33">
                  {selectedReport.teacher || "Chưa xếp"}
                </strong>
              </div>
              <div className="ClassReports-style-34">
                <span className="ClassReports-style-35">Trợ giảng</span>
                <strong className="ClassReports-style-36">
                  {selectedReport.ta || "Không có"}
                </strong>
              </div>
              <div className="ClassReports-style-37">
                <span className="ClassReports-style-38">Mã lớp</span>
                <strong className="ClassReports-style-39">
                  {selectedReport.classCode || "Chưa có tên"}
                </strong>
              </div>
              <div className="ClassReports-style-40">
                <span className="ClassReports-style-41">Sĩ số</span>
                <strong className="ClassReports-style-42">
                  {reportStudents.length} Học viên
                </strong>
              </div>
              <div className="ClassReports-style-43">
                <span className="ClassReports-style-44">Lịch học</span>
                <strong className="ClassReports-style-45">
                  {selectedReport.scheduleTime || "Chưa xếp"}
                </strong>
              </div>
              <div className="ClassReports-style-46">
                <span className="ClassReports-style-47">Tiến độ</span>
                <strong className="ClassReports-style-48">
                  {currentProgress}/
                  {Math.max(1, parseInt(selectedReport.totalSessions) || 19)}{" "}
                  buổi
                </strong>
              </div>
            </div>

            <div className="ClassReports-style-49">
              <div className="ClassReports-style-50">
                <div className="ClassReports-style-51">Danh sách Học viên</div>
                <div className="ClassReports-style-52">
                  {reportStudents.length === 0 && (
                    <p className="ClassReports-style-53">
                      Lớp chưa có học viên đăng ký.
                    </p>
                  )}
                  {reportStudents.map((st, i) => (
                    <div key={st.id || i} className="ClassReports-style-54">
                      <span className="ClassReports-style-55">{st.name}</span>
                      <span className="ClassReports-style-56">Đang học</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ClassReports-style-57">
                <div className="ClassReports-style-58">
                  Lịch sử Dạy & Điểm danh
                </div>
                <div className="ClassReports-style-59">
                  {reportSessions.filter(
                    (s) =>
                      s &&
                      (s.status === "completed" || s.status === "cancelled"),
                  ).length === 0 && (
                    <p className="ClassReports-style-60">
                      Chưa có lịch sử dạy được ghi nhận từ Giáo viên.
                    </p>
                  )}

                  {reportSessions
                    .filter(
                      (s) =>
                        s &&
                        (s.status === "completed" || s.status === "cancelled"),
                    )
                    .sort((a, b) => b.sessionNum - a.sessionNum)
                    .map((session) => (
                      <div
                        key={session.sessionNum}
                        style={{
                          border: `1px solid ${session.status === "completed" ? "#10b981" : "#ef4444"}`,
                          borderRadius: "8px",
                          padding: "12px",
                          backgroundColor: "var(--bg-card)",
                        }}
                      >
                        <div className="ClassReports-style-61">
                          <strong className="ClassReports-style-62">
                            BUỔI {session.sessionNum}
                          </strong>

                          <div className="ClassReports-style-63">
                            <span className="ClassReports-style-64">
                              {/* LƯỚI BẢO VỆ 3: Ép tổng số có mặt không bao giờ vượt quá sĩ số */}
                              {Math.min(
                                attendanceMap[session.sessionNum] || 0,
                                reportStudents.length,
                              )}
                              /{reportStudents.length} HV đi học
                            </span>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: "800",
                                color:
                                  session.status === "completed"
                                    ? "var(--success)"
                                    : "var(--danger-text)",
                                backgroundColor:
                                  session.status === "completed"
                                    ? "var(--success-light)"
                                    : "var(--danger-light)",
                                padding: "2px 8px",
                                borderRadius: "4px",
                              }}
                            >
                              {session.status === "completed"
                                ? "Đã hoàn thành"
                                : "Nghỉ"}
                            </span>
                          </div>
                        </div>
                        <p className="ClassReports-style-65">
                          {session.title || "Chưa có tiêu đề"} -{" "}
                          {session.notes || "Không có ghi chú"}
                        </p>

                        {session.hasLessonPlan && (
                          <span className="ClassReports-style-66">
                            <i className="fa-solid fa-file-shield"></i> Đã nộp
                            giáo án
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ClassReports;
