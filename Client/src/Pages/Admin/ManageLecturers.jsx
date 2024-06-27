import React, { useState, useEffect } from "react";
import Header from "../../Sections/Header";
import SidebarAdmin from "../../Sections/SidebarAdmin";
import { FaSearch, FaEdit, FaTrash, FaAdjust, FaToggleOff, FaToggleOn } from "react-icons/fa"; 
import ClipLoader from "react-spinners/ClipLoader";
import {  CSSProperties } from "react";
import { backendUrl } from "../../../config";


const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

const ManageLecturers = () => {
  
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lecturerToDelete, setLecturerToDelete] = useState(null);

  useEffect(() => {
    fetchLecturers();
  }, []);

  const fetchLecturers = async () => {
    setLoading(true); // Set loading to true when fetching data
    try {
      const response = await fetch(`${backendUrl}/api/lecturer`);
      if (response.ok) {
        const data = await response.json();
        setLecturers(data);
      } else {
        throw new Error('Failed to fetch lecturers');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Set loading to false when data fetching is done
    }
  };

  const toggleApprovalStatus = async (id, isApproved, email) => {
    setLoading(true); // Set loading to true when updating data
    try {
      const response = await fetch(`${backendUrl}/api/lecturer/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, isApproved: !isApproved }),
      });
      if (response.ok) {
        // If successful, update the local state
        fetchLecturers();
      } else {
        throw new Error('Failed to update approval status');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Set loading to false when data updating is done
    }
  };
  const deleteLecturer = async (lecturerId) => {
    try {
      const response = await fetch(`${backendUrl}/api/lecturer/${lecturerId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete lecturer");
      }
      // Remove the deleted lecturer from the state
      setLecturers((prevLecturers) =>
        prevLecturers.filter((lecturer) => lecturer._id !== lecturerId)
      );
    } catch (error) {
      console.error("Error deleting lecturer:", error);
    }
  };

  const handleDeleteConfirmation = (lecturerId) => {
    setLecturerToDelete(lecturerId);
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (lecturerToDelete) {
      deleteLecturer(lecturerToDelete);
      setLecturerToDelete(null);
      setShowConfirmation(false);
    }
  };

  const handleCancelDelete = () => {
    setLecturerToDelete(null);
    setShowConfirmation(false);
  };


  return (
    <main className="w-full h-screen flex justify-between items-start bg-green-100">
      <SidebarAdmin />
 {  
      loading ?   (
      
        <div className="w-full flex justify-center items-center h-screen">
              <ClipLoader
                color="green"
                loading={true}
                size={150}
                css={override}
              />
            </div>
      
      )
      :

    <section className="w-4/5 grow bg-green-100 h-screen overflow-y-auto flex flex-col justify-start items-center gap-4 p-4">
        <Header bgColor="green" />
        <div className="w-full max-w-screen-lg mx-auto flex items-center mt-6">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-full border rounded-md"
            />
            <FaSearch className="absolute top-3 left-3 text-gray-400" />
          </div>
        </div>
        <div className="w-full p-6 bg-green-100 rounded-xl shadow-lg flex flex-col items-center mt-8">
          <div className="overflow-x-auto w-full">
            <table className="w-full">
              <thead>
                <tr className="bg-green-200">
                  <th className="px-6 py-3 text-left text-green-800">Name</th>
                  <th className="px-6 py-3 text-left text-green-800">Status</th>
                  <th className="px-6 py-3 text-left text-green-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lecturers.map((lecturer, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-green-800" : "bg-green-700"}>
                    <td className="px-6 py-4 text-green-200">{lecturer.username}</td>
                    <td className="px-6 py-4 text-green-200">{lecturer.isApproved ? "Active" : "Inactive"}</td>
                    <td className="px-6 py-4 flex">
                   :
                         {lecturer.isApproved ? 
                          <FaToggleOn
                            className="mr-4 text-green-500 hover:text-green-600 cursor-pointer"
                            onClick={() => toggleApprovalStatus(lecturer._id, lecturer.isApproved, lecturer.email)}
                            disabled={loading}
                            title="Click to deactivate"
                          /> : 
                          <FaToggleOff
                            className="mr-4 text-green-500 hover:text-green-600 cursor-pointer"
                            onClick={() => toggleApprovalStatus(lecturer._id, lecturer.isApproved, lecturer.email)}
                            disabled={loading}
                            title="Click to activate"

                          />}
                     
                      
                      <FaTrash
                        className="text-red-500 hover:text-red-600 cursor-pointer"
                        onClick={() => handleDeleteConfirmation(lecturer._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>}
      {showConfirmation && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow">
            <p className="mb-4">Are you sure you want to delete this lecturer?</p>
            <div className="flex justify-end">
              <button className="bg-red-500 text-white px-4 py-2 mr-2 rounded" onClick={handleConfirmDelete}>Delete</button>
              <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded" onClick={handleCancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ManageLecturers;
