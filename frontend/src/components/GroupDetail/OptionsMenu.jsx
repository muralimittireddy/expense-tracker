import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

function OptionsMenu({ toggleOptionsMenu, groupId, groupDetails }) {
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [message, setMessage] = useState("");

  // 🔎 Fetch matching users when typing
  useEffect(() => {
    if (query.length >= 3) {
      const fetchUsers = async () => {
        try {
          const res = await axiosInstance.get("/users/search", {
            params: { email: query },
          });
          setResults(res.data);
        } catch (err) {
          console.error("Error searching users:", err);
        }
      };
      fetchUsers();
    } else {
      setResults([]);
    }
  }, [query]);

  // ✅ Add new member
  const handleAddMember = async () => {
    setMessage("");
    if (!email) {
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      await axiosInstance.post(`/splits/groups/addMember`, {
        id: groupId,
        email,
      });

      setMessage("✅ Member added successfully!");
      setEmail("");
      setQuery("");
      setIsAddingMember(false);
      setResults([]);
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.detail || "Failed to add"}`);
    }
  };

  // 🚪 Leave group
  const handleLeaveGroup = async () => {
    setMessage("");
    try {
      const response = await axiosInstance.delete(
        `/splits/groups/leaveGroup/${groupId}`
      );
      setMessage(response.data.message);
      toggleOptionsMenu();
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.detail || "Failed to leave"}`);
    }
  };

  return (
    <div className="w-96 bg-white rounded-lg shadow-xl p-6 relative">
      {/* Close button */}
      <button
        onClick={toggleOptionsMenu}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>

      {/* Feedback message */}
      {message && (
        <div
          className={`p-2 mb-2 rounded-md ${
            message.startsWith("Error")
              ? "text-red-500 bg-red-100"
              : "text-green-600 bg-green-100"
          }`}
        >
          {message}
        </div>
      )}

      <ul className="space-y-3">
        {/* Add Member Section */}
        {!isAddingMember ? (
          <li
            className="p-2 hover:bg-gray-100 rounded-md cursor-pointer"
            onClick={() => setIsAddingMember(true)}
          >
            ➕ Add Member
          </li>
        ) : (
          <>
            <li>
              <input
                type="email"
                placeholder="Enter member's email"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setEmail(""); // reset final email until chosen
                }}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {/* Suggestions dropdown */}
              {results.length > 0 && (
                <ul className="border rounded mt-2 bg-white shadow max-h-40 overflow-y-auto">
                  {results.map((user, idx) => (
                    <li
                      key={idx}
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setEmail(user.email);
                        setQuery(user.email); // fill selected email
                        setResults([]);
                      }}
                    >
                      {user.email}
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li
              className="p-2 bg-indigo-500 text-white text-center rounded-md cursor-pointer hover:bg-indigo-600"
              onClick={handleAddMember}
            >
              Confirm
            </li>
          </>
        )}

        {/* Leave group */}
        <li
          className="p-2 hover:bg-gray-100 rounded-md cursor-pointer text-red-500"
          onClick={handleLeaveGroup}
        >
          🚪 Leave Group
        </li>

        {/* Members list */}
        <li>
          <p className="font-bold text-sm text-gray-500 mb-1">Group Members</p>
          <ul className="space-y-1 max-h-40 overflow-y-auto">
            {groupDetails?.users?.map((user, index) => (
              <li key={index} className="text-gray-700">
                {user.username}
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </div>
  );
}

export default OptionsMenu;
