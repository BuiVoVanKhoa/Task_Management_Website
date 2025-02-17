import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const useTeamData = () => {
  const [team, setTeam] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTeam = async () => {
    try {
      const response = await axios.get("/api/teams");
      setTeam(response.data.data);
    } catch (error) {
      setError(error.message);
      toast.error("Fetch error: " + error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  return {
    team,
    error,
    loading,
    refetch: fetchTeam
  };
};

export default useTeamData;
