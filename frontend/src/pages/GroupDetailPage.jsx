// frontend/src/pages/GroupDetailPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GroupHeader from '../components/GroupDetail/GroupDetailHeader';

function GroupDetailPage() {
  const { groupId } = useParams();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="text-center p-8 text-gray-600">
        Please log in to view group details.
      </div>
    );
  }

  // dummy data for now, you can replace with API call later
  const group = {
    id: groupId
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl">
      <GroupHeader group={group} />
    </div>
  );
}

export default GroupDetailPage;
