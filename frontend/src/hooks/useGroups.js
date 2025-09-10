// frontend/src/hooks/useGroups.js
import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

export const useGroups = (isAuthenticated) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupDetails,setGroupDetails]=useState(null);

  const fetchGroups = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/splits/groups");
      setGroups(response.data);
    } catch (err) {
      console.error("Failed to fetch groups:", err.response?.data || err.message);
      setError("Failed to load groups. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addGroup = async (groupData) => {
    try {
      await axiosInstance.post("/splits/groups", groupData);
      fetchGroups();
    } catch (err) {
      throw new Error(err.response?.data || "Failed to add group");
    }
  };

  const fetchGroup = async (groupId) =>
  {
    try{
      const response=await axiosInstance.get(`/splits/groups/getGroupDetail/${groupId}`);
      setGroupDetails(response.data);
    } catch(err){
      throw new Error(err.response?.data || "Failed to get group detail");
    }

  };

  useEffect(() => {
    fetchGroups();
  }, [isAuthenticated]);

  return { groups, loading, error,groupDetails, addGroup, fetchGroups ,fetchGroup};
};
