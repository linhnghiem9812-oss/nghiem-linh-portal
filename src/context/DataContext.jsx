import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const DataContext = createContext();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
});

export function DataProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [tas, setTas] = useState([]);
  const [classes, setClasses] = useState([]);

  // CHẶN LẶP: Chỉ gọi API đúng 1 lần duy nhất khi nạp ứng dụng nhờ dependency array []
  useEffect(() => {
    // Nạp khách hàng CRM
    api
      .get("/customers")
      .then((res) => setCustomers(res.data))
      .catch(() => console.log("Chưa thể nạp dữ liệu khách hàng."));

    // Nạp giáo viên
    api
      .get("/users/role/teacher")
      .then((res) => setTeachers(res.data))
      .catch(() => {
        api
          .get("/users")
          .then((res) =>
            setTeachers(res.data.filter((u) => u.role === "teacher")),
          )
          .catch(() => {});
      });

    // Nạp trợ giảng
    api
      .get("/users/role/ta")
      .then((res) => setTas(res.data))
      .catch(() => {});

    // Nạp lớp học
    api
      .get("/classes")
      .then((res) => setClasses(res.data))
      .catch(() => console.log("Chưa thể nạp dữ liệu lớp học."));
  }, []);

  const addCustomer = async (newCustomer) => {
    // Tránh ghi đè trùng lặp dữ liệu bằng callback state ngắn gọn
    setCustomers((prev) => [newCustomer, ...prev]);
    return { success: true };
  };

  const addTeacher = async (newTeacher) => {
    try {
      const res = await api.post("/auth/register", {
        ...newTeacher,
        username: newTeacher.phone,
        password: "123",
        role: "teacher",
      });
      setTeachers((prev) => [...prev, res.data]);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // NÂNG CẤP: Gửi dữ liệu lớp học thực tế lên Backend Render
  const addClass = async (classData) => {
    try {
      const res = await api.post("/classes", classData);
      setClasses((prev) => [res.data, ...prev]);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message };
    }
  };

  return (
    <DataContext.Provider
      value={{
        customers,
        setCustomers,
        addCustomer,
        teachers,
        setTeachers,
        addTeacher,
        classes,
        setClasses,
        addClass,
        tas,
        setTas,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData phải được đặt bên trong DataProvider");
  return context;
};
