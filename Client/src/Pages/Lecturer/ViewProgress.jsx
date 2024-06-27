import React, { useState, useEffect } from "react";
import { backendUrl } from "../../../config";
import SyncLoader from "react-spinners/ClipLoader";
import axios from "axios";
import GeneratePdf from "./GeneratePdf";



const ViewProgress = ({ contest, onClose }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  
const formatDuration = (minutes) => {
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = minutes % 60;

  let durationString = "";

  if (days > 0) {
    durationString += `${days}d `;
  }

  if (hours > 0 || days > 0) {
    durationString += `${hours}h `;
  }

  if (mins > 0 || (hours === 0 && days === 0)) {
    durationString += `${mins}m`;
  }

  return durationString.trim();
};

  const fetchStudents = async (page) => {
    try {
      const response = await axios.get(`${backendUrl}/api/enrollment/contest/${contest._id}/enrolled-students-grades`, {
        params: { page, limit: 5 },
      });
      const data = response.data;
      setStudents(data.studentsWithGrades);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStudents(currentPage);
    const interval = setInterval(() => fetchStudents(currentPage), 5000);
    return () => clearInterval(interval);
  }, [contest._id, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-100 opacity-50 flex justify-center items-center">
        <SyncLoader color="red" loading={true} size={120} cssOverride={{ display: "block", margin: "0 auto", borderColor: "red" }} />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  let currentTimestamp = new Date().getTime();

  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col items-center justify-center text-xs md:text-sm lg:text:md">
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white shadow-md rounded-lg">
      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold mb-4 text-center">Live Student Progress for the Contest {contest.name}</h2>
      <div className="flex justify-around items-center my-10 sm:my-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={onClose}
        >
          Cancel
        </button>
        <GeneratePdf contest={contest} />
      </div>
      <div className="mb-6">
        {/* <p className="text-sm md:text-md lg:text-lg"><strong>Contest Name:</strong> {contest.name}</p> */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3  justify-between sm:gap-2 gap-6 mt-4">
          <p className="text-sm md:text-md lg:text-lg">
            <strong>Start Date:</strong> {new Date(contest.startDate).toLocaleString([], { month: "2-digit", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
          </p>
          <p className="text-sm md:text-md lg:text-lg">
            <strong>Duration:</strong> {formatDuration(contest.duration)}
          </p>
          <p className="text-sm md:text-md lg:text-lg">
            <strong>End Date:</strong> {new Date(contest.endDate).toLocaleString([], { month: "2-digit", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
          </p>
        </div>
        <p className="text-sm md:text-md lg:text-lg text-center my-10">
          { currentTimestamp <= new Date(contest.endDate).getTime() ? (
            <span className="text-green-600">Contest is live</span>
          ) : (
            <span className="text-red-600">Contest has ended</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => (
          <div key={student.regNo} className="p-4 border rounded-lg shadow-sm bg-gray-50">
            <div className="flex flex-col justify-between h-full">
              <div>
                <h3 className="text-sm md:text-md lg:text-lg font-semibold">{student.username}</h3>
                <p className="text-gray-600">Reg No: {student.regNo}</p>
              </div>
              <div className="text-right mt-4">
                <p className="text-sm md:text-md lg:text-lg font-bold">{student.totalGrade}</p>
                <p className="text-gray-500">Total Grade</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <button
          className={`px-4 py-2 mx-1 ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold rounded focus:outline-none`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          className={`px-4 py-2 mx-1 ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold rounded focus:outline-none`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </button>
      </div>

    </div>
  </div>
  );
};

export default ViewProgress;
