import './AdminTabs.css';

export default function AdminTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="admin-tabs">
      {tabs.map(t => (
        <div 
          key={t.id} 
          className={`admin-tab${activeTab === t.id ? ' active' : ''}`} 
          onClick={() => onTabChange(t.id)}
        >
          {t.label}
        </div>
      ))}
    </div>
  );
}
