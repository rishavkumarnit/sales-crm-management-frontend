import React, { useState, useEffect, useContext } from "react";
import "./employees.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { Data } from "../../App";

const Employees = () => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const { setSelected } = useContext(Data);
  useEffect(() => {
    setSelected("employees");
  }, []);

  const [addPopup, setAddPopup] = useState(false);
  const [editPopup, setEditPopup] = useState("");
  const [employees, setEmployees] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const getEmployees = async (page = 1, search = "") => {
    const res = await axios.get("https://finalprojectbackend-u5cq.onrender.com/api/employees", {
      params: {
        page,
        limit: recordsPerPage,
        search,
      },
    });
    setEmployees(res.data.data);
    setTotalEmployees(res.data.total);
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getEmployees(currentPage, searchTerm);
  }, [currentPage]);

  const [employee, setEmployee] = useState({
    initials: "",
    firstname: "",
    lastname: "",
    email: "",
    location: "",
    preferredlanguage: "",
    password: "",
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getEmployees(currentPage, searchTerm);
  }, []);

  // pagination
  const npage = Math.ceil(totalEmployees / recordsPerPage);
  const prePage = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const nextPage = () => currentPage < npage && setCurrentPage((p) => p + 1);
  const getPageNumbers = () => {
    if (npage <= 7) {
      return Array.from({ length: npage }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, "...", npage - 2, npage - 1, npage];
    }
    if (currentPage >= npage - 2) {
      return [npage - 4, npage - 3, npage - 2, npage - 1, npage];
    }
    return [
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      npage - 2,
      npage - 1,
      npage,
    ];
  };

  const handleAddPopup = (value) => {
    setAddPopup(value);
  };
  const handleEditPopup = (value) => {
    if (!value) {
      setEditPopup("");
      return;
    }
    const record = employees.filter((item) => item._id === value);

    setEmployee({
      firstname: record[0].firstname,
      lastname: record[0].lastname,
      email: record[0].email,
      location: record[0].location,
      preferredlanguage: record[0].preferredlanguage,
    });
    setEditPopup(value);
  };

  const handleSaveEdited = async () => {

    await axios.put("https://finalprojectbackend-u5cq.onrender.com/api/employees/", {
      initials: employee.initials,
      firstname: employee.firstname,
      lastname: employee.lastname,
      email: employee.email,
      location: employee.location,
      preferredlanguage: employee.preferredlanguage,
    });
    setEmployee({
      firstname: "",
      lastname: "",
      email: "",
      location: "",
      preferredlanguage: "",
      password: "",
    });
    getEmployees(currentPage, searchTerm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
 
  };

  const getInitials = (word) => {
    let first = "";
    let second = "";
    let findSecond = false;
    word = word.trim();
    for (let i = 0; i < word.length; i++) {
      if (!first) {
        first = word[i];
      } else if (word[i] === " ") {
        findSecond = true;
      } else if (findSecond && word[i] != " ") {
        second = word[i];
      }
      if (first && second) {
        break;
      }
    }
    return first + second;
  };

  const handleSaveEmployee = async () => {
 
    if (!employee.firstname) {
      alert("firstname cannot be empty");
      return;
    }
    if (!employee.lastname) {
      alert("lastname cant empty");
      return;
    }
    if (!employee.email) {
      alert("email cant empty");
      return;
    }
    if (!regex.test(employee.email)) {
      alert("Please enter a valid email address");
      return;
    }
    if (!employee.location) {
      alert("location cant empty");
      return;
    }
    if (!employee.preferredlanguage) {
      alert("preferredlanguage cant empty");
      return;
    }

    let initials = getInitials(employee.firstname + " " + employee.lastname);

    try {
      await axios.post("https://finalprojectbackend-u5cq.onrender.com/api/employees/", {
        initials: initials.toUpperCase(),
        firstname: employee.firstname,
        lastname: employee.lastname,
        email: employee.email,
        location: employee.location,
        preferredlanguage: employee.preferredlanguage,
        password: employee.email,
      });
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Something went wrong";
      alert(message);
      return;
    }
    setEmployee({
      firstname: "",
      lastname: "",
      email: "",
      location: "",
      preferredlanguage: "",
      password: "",
    });

    getEmployees(1, searchTerm);
  };

  const handleToggleMenu = () => {
    setOpenMenuId(null);
  };

  // delete
  const handleDelete = async (id) => {
    if (selectedIds.length > 0) {
      handleBulkDelete();
      return;
    }
    if (!window.confirm("Delete this employee?")) {
      return;
    }
    await axios.delete(`https://finalprojectbackend-u5cq.onrender.com/api/employees/${id}`);
    setEmployees(employees.filter((emp) => emp._id !== id));
    setOpenMenuId(null);
  };
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert("No employees selected");
      return;
    }

    if (!window.confirm(`Delete ${selectedIds.length} employees?`)) {
      return;
    }
    await Promise.all(
      selectedIds.map((id) =>
        axios.delete(`https://finalprojectbackend-u5cq.onrender.com/api/employees/${id}`)
      )
    );
    setEmployees(employees.filter((emp) => !selectedIds.includes(emp._id)));
    setSelectedIds([]);
  };

  const handleSearch = async () => {
    setCurrentPage(1);
    getEmployees(1, searchTerm);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      getEmployees(1, searchTerm);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  return (
    <div onClick={handleToggleMenu} className="board">
      <div className="board-top">
        <div className="searchbar">
          <img
            onClick={handleSearch}
            className="lens"
            src="./lens.png"
            alt=""
          />
          <input
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="board-input"
            type="text"
            placeholder="Search here..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="board-hr"></div>
      <div className={`${addPopup && "black-body"}`}></div>
      <div className="employees-body">
        {addPopup && (
          <div className="add-new-employee">
            <div className="add-text">
              <span>Add New Employee </span>
              <span>
                <img
                  onClick={() => {
                    handleAddPopup(false);
                  }}
                  className="close"
                  src="./close.png"
                  alt=""
                />
              </span>
            </div>
            <div className="employee-input-section">
              <div>
                <div className="label poppins">First name</div>
                <input
                  className="employee-input"
                  name="firstname"
                  value={employee.firstname}
                  onChange={handleChange}
                  type="text"
                />
              </div>
              <div>
                <div className="label poppins">Last Name</div>
                <input
                  className="employee-input"
                  name="lastname"
                  value={employee.lastname}
                  onChange={handleChange}
                  type="text"
                />
              </div>
              <div>
                <div className="label poppins">Email</div>
                <input
                  className="employee-input"
                  name="email"
                  value={employee.email}
                  onChange={handleChange}
                  type="text"
                />
              </div>
              <div>
                <div className="label poppins">Location</div>
                <input
                  className="employee-input"
                  name="location"
                  value={employee.location}
                  onChange={handleChange}
                  type="text"
                />
              </div>
              <div>
                <div className="label poppins">Preferred Language</div>
                <input
                  className="employee-input"
                  name="preferredlanguage"
                  value={employee.preferredlanguage}
                  onChange={handleChange}
                  type="text"
                />
              </div>
            </div>
            <div onClick={handleSaveEmployee} className="save-btn poppins">
              Save
            </div>
          </div>
        )}

        {editPopup && (
          <div className="add-new-employee">
            <div className="add-text">
              <span>Edit Employee </span>
              <span>
                <img
                  onClick={() => {
                    handleEditPopup("");
                  }}
                  className="close"
                  src="./close.png"
                  alt=""
                />
              </span>
            </div>
            <div className="employee-input-section">
              <div>
                <div className="label poppins">First name</div>
                <input
                  className="employee-input"
                  name="firstname"
                  value={employee.firstname}
                  onChange={handleChange}
                  type="text"
                />
              </div>
              <div>
                <div className="label poppins">Last Name</div>
                <input
                  className="employee-input"
                  name="lastname"
                  value={employee.lastname}
                  onChange={handleChange}
                  type="text"
                />
              </div>
              <div>
                <div className="label poppins">Email</div>
                <input
                  className="employee-input"
                  name="email"
                  value={employee.email}
                  readOnly
                  type="text"
                />
              </div>
              <div>
                <div className="label poppins">Location</div>
                <input
                  className="employee-input"
                  name="location"
                  value={employee.location}
                  onChange={handleChange}
                  type="text"
                />
              </div>
              <div>
                <div className="label poppins">Preferred Language</div>
                <input
                  className="employee-input"
                  name="preferredlanguage"
                  value={employee.preferredlanguage}
                  readOnly
                  type="text"
                />
              </div>
            </div>
            <div onClick={handleSaveEdited} className="save-btn poppins">
              Save
            </div>
          </div>
        )}

        <div className="employees-section">
          <div className="rem">
            <Link to="/dashboard">Home</Link>
            <span> {">"} </span>Employees
          </div>

          <div className="poppins  add-section">
            <span onClick={() => handleAddPopup(true)} className="add-butoon">
              Add Employees
            </span>
          </div>
        </div>

        <div className="employees-table">
          <div className="employees-table-head">
            <input
              type="checkbox"
              ref={(el) => {
                if (!el) return;
                el.indeterminate =
                  selectedIds.length > 0 &&
                  selectedIds.length < employees.length;
              }}
              checked={
                employees.length > 0 &&
                employees.every((emp) => selectedIds.includes(emp._id))
              }
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds(employees.map((emp) => emp._id));
                } else {
                  setSelectedIds([]);
                }
              }}
            />
            <span></span>
            <span>Name</span>
            <span className="employees-email">Employee ID</span>
            <span>Assigned Leads</span>
            <span>Closed Leads</span>
            <span>Status</span>
            <span></span>
          </div>
          <div className="empl-container">
            {employees &&
              employees.map((item) => (
                <div
                  key={item._id}
                  className={`employee-lines ${
                    selectedIds.includes(item._id) ? "gray-bg" : ""
                  }`}
                >
                  <span>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, item._id]);
                        } else {
                          setSelectedIds(
                            selectedIds.filter((id) => id !== item._id)
                          );
                        }
                      }}
                    />
                  </span>

                  <div className="initials">{item.initials}</div>

                  <div className="employee-name">
                    <div className="name">
                      {item.firstname} {item.lastname}
                    </div>
                    <div className="email">{item.email}</div>
                  </div>

                  <div className="employees-id">
                    #{item._id ? item._id.slice(-10).toUpperCase() : "N/A"}
                  </div>

                  <div>{item.assignedleads || 0}</div>

                  <div>{item.closedleads || 0}</div>

                  <div>
                    <span
                      className={`status ${
                        item.status === "inactive" ? "inactive" : "active"
                      }`}
                    >
                      <span style={{ marginRight: "4px" }}>●</span>
                      {item.status || "Active"}
                    </span>
                  </div>

                  {/* menu */}
                  <div className="menu-wrapper">
                    <div
                      className="menu"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(
                          openMenuId === item._id ? null : item._id
                        );
                      }}
                    >
                      ⋮
                    </div>

                    {openMenuId === item._id && (
                      <div className="menu-popup">
                        <div
                          className="menu-item"
                          onClick={() => handleEditPopup(item._id)}
                        >
                          <span className="icon-container">
                            <img
                              className="edit-icons"
                              src="./edit.png"
                              alt=""
                            />
                          </span>
                          Edit
                        </div>
                        <div
                          className="menu-item delete"
                          onClick={() => handleDelete(item._id)}
                        >
                          <span className="icon-container">
                            <img
                              className="edit-icons"
                              src="./delete.png"
                              alt=""
                            />
                          </span>{" "}
                          Delete
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="item-hr"></div>
                </div>
              ))}
          </div>
        </div>

        {/* pagination */}
        <div className="pagination-container">
          <button className="pagi-btn" onClick={prePage}>
            <img className="arrow" src="./arrow-left.png" alt="" />
            Previous
          </button>
          <div className="page-numbers">
            {getPageNumbers().map((n, i) =>
              n === "..." ? (
                <span key={`dots-${i}`} className="page-dots">
                  ...
                </span>
              ) : (
                <span
                  key={`page-${n}-${i}`}
                  className={`page-item ${
                    currentPage === n ? "active-page" : ""
                  }`}
                  onClick={() => setCurrentPage(n)}
                >
                  {n}
                </span>
              )
            )}
          </div>
          <button className="pagi-btn" onClick={nextPage}>
            Next
            <img className="arrow" src="./arrow-right.png" alt="" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Employees;
