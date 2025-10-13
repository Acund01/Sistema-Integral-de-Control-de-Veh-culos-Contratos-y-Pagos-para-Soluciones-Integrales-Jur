import React from 'react';
import '../styles/ActivityList.css';
import type { Activity } from '../types';

interface ActivityListProps {
  activities: Activity[];
}

const ActivityList: React.FC<ActivityListProps> = ({ activities }) => {
  return (
    <div className="activity-list">
      <h3 className="activity-title">Actividad Reciente</h3>
      <div className="activity-items">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className="activity-dot"></div>
            <div className="activity-content">
              <p className="activity-description">{activity.description}</p>
              <span className="activity-time">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityList;
