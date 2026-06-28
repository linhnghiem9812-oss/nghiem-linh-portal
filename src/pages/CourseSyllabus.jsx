import "../styles/pages/CourseSyllabus.css";
import React, { useState, useEffect } from "react";
import { useData } from "../context/DataContext";
import axios from "axios";
import { useNotification } from "../context/NotificationContext";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
});
function CourseSyllabus() {
  const { addNotification } = useNotification();
  const { addCourse } = useData();
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCourseData, setNewCourseData] = useState({
    name: "",
    duration: "",
    price: "",
  });

  // Đồng bộ trực tiếp danh sách chương trình đào tạo từ PostgreSQL
  useEffect(() => {
    api
      .get("/courses")
      .then((res) => setCourses(res.data))
      .catch(() => {
        // Dự phòng bản ghi mẫu chuẩn của trung tâm nếu bảng trống
        setCourses([
          {
            id: "DEFAULT-1",
            name: "HSK 1 Tiêu chuẩn",
            duration: 19,
            price: 3500000,
          },
        ]);
      });
  }, []);
  const handleAddCourseSubmit = async (e) => {
    e.preventDefault();
    if (
      !newCourseData.name ||
      !newCourseData.duration ||
      !newCourseData.price
    ) {
      addNotification(
        "Vui lòng hoàn tất biểu mẫu thông tin khóa học!",
        "error",
        "classes",
      );
      return;
    }
    const newObj = {
      name: newCourseData.name,
      duration: parseInt(newCourseData.duration),
      price: parseInt(newCourseData.price),
    };
    try {
      const res = await api.post("/courses", newObj);
      setCourses((prev) => [...prev, res.data]);
      if (addCourse) addCourse(res.data);
      addNotification(
        `Hệ thống: Bổ sung chương trình đào tạo thành công: ${newCourseData.name}`,
        "success",
        "classes",
      );
      setNewCourseData({
        name: "",
        duration: "",
        price: "",
      });
      setShowModal(false);
    } catch (err) {
      addNotification(
        "Có lỗi xảy ra khi lưu khóa học vào CSDL.",
        "error",
        "classes",
      );
    }
  };
  return (
    <div className="CourseSyllabus-style-1">
      <div className="CourseSyllabus-style-2">
        <div>
          <h3 className="CourseSyllabus-style-3">
            Chương trình học & Syllabus đào tạo
          </h3>
          <p className="CourseSyllabus-style-4">
            Khung giáo án giảng dạy tiêu chuẩn tại Ngoại Ngữ Nghiêm Linh
          </p>
        </div>
        <button
          className="btn btn-primary CourseSyllabus-style-5"
          onClick={() => setShowModal(true)}
        >
          <i className="fa-solid fa-plus CourseSyllabus-style-6"></i> Thêm Khóa
          Học
        </button>
      </div>

      <div className="curriculum-grid-container CourseSyllabus-style-7">
        {courses.map((course) => (
          <div className="card" key={course.id}>
            <h4 className="CourseSyllabus-style-8">{course.name}</h4>
            <div className="CourseSyllabus-style-9">
              <span>
                <i className="fa-solid fa-calendar CourseSyllabus-style-10"></i>{" "}
                Thời lượng: <strong>{course.duration} buổi</strong>
              </span>
              <span>
                <i className="fa-solid fa-sack-dollar CourseSyllabus-style-11"></i>{" "}
                Học phí:{" "}
                <strong className="CourseSyllabus-style-12">
                  {course.price?.toLocaleString("vi-VN")} VND
                </strong>
              </span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal CourseSyllabus-style-13">
          <div className="modal-content CourseSyllabus-style-14">
            <div className="CourseSyllabus-style-15">
              <h3 className="CourseSyllabus-style-16">Thêm Khóa Học Mới</h3>
              <div
                className="CourseSyllabus-style-17"
                onClick={() => setShowModal(false)}
              >
                &times;
              </div>
            </div>
            <form onSubmit={handleAddCourseSubmit}>
              <div className="CourseSyllabus-style-18">
                <label className="CourseSyllabus-style-19">
                  Tên khóa học chính thức
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={newCourseData.name}
                  onChange={(e) =>
                    setNewCourseData({
                      ...newCourseData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Ví dụ: HSK 2 Cấp tốc"
                  required
                />
              </div>
              <div className="CourseSyllabus-style-20">
                <label className="CourseSyllabus-style-21">
                  Tổng số buổi học
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={newCourseData.duration}
                  onChange={(e) =>
                    setNewCourseData({
                      ...newCourseData,
                      duration: e.target.value,
                    })
                  }
                  placeholder="19"
                  required
                />
              </div>
              <div className="CourseSyllabus-style-22">
                <label className="CourseSyllabus-style-23">
                  Mức học phí trọn gói (VND)
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={newCourseData.price}
                  onChange={(e) =>
                    setNewCourseData({
                      ...newCourseData,
                      price: e.target.value,
                    })
                  }
                  placeholder="3500000"
                  required
                />
              </div>
              <div className="CourseSyllabus-style-24">
                <button
                  type="button"
                  className="btn CourseSyllabus-style-25"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary CourseSyllabus-style-26"
                >
                  Thêm khóa học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default CourseSyllabus;
