import React from 'react';
import './ClientsTable.css';

const ClientsTable = ({ clients, onView, onEdit, onDelete }) => {
  if (clients.length === 0) {
    return (
      <div className="clients-table-empty">
        <p>No accounts found.</p>
      </div>
    );
  }

  return (
    <div className="clients-table-container">
      <table className="clients-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Title</th>
            <th>Email</th>
            <th>Country</th>
            <th>Account State</th>
            <th>Proxy Timeline</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr
              key={client.id}
              onClick={() => onView(client)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onView(client)}
            >
              <td>
                <div className="client-name-cell">
                  <div className="client-avatar-sm">
                    {client.image_url ? (
                      <img src={client.image_url} alt="" />
                    ) : (
                      <span>{(client.full_name || client.email || '?')[0].toUpperCase()}</span>
                    )}
                  </div>
                  <span className="client-name-text">{client.full_name || 'No name'}</span>
                </div>
              </td>
              <td>{client.title || '-'}</td>
              <td>{client.email || '-'}</td>
              <td>{client.country || '-'}</td>
              <td>
                {client.account_state ? (
                  <span className={`account-state-badge state-${(client.account_state || '').toLowerCase().replace(/\s+/g, '-')}`}>
                    {client.account_state}
                  </span>
                ) : '-'}
              </td>
              <td>{client.proxy_info?.timeline || '-'}</td>
              <td className="table-actions" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="btn-action btn-action-view" onClick={() => onView(client)} title="View">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
                <button type="button" className="btn-action btn-action-edit" onClick={() => onEdit(client)} title="Edit">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button type="button" className="btn-action btn-action-delete" onClick={() => onDelete(client.id)} title="Delete">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientsTable;
