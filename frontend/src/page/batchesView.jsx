import React, { useEffect, useState, useContext } from 'react';
import { AlertCircle, FileSpreadsheet, Eye, Trash2, RefreshCw } from 'lucide-react';
import context from '../contextApi/context';
function BatchesView({ token }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [distributionDetails, setDistributionDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
    const {url}=useContext(context);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${url}/upload/batches`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        const temp=[];
        data.data.forEach(batch=>{
            temp.push(batch);
        })
        setBatches(temp);
      } else {
        setError(data.message || 'Failed to fetch batches');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchDistributionDetails = async (batchId) => {
    try {
      const response = await fetch(`${url}/upload/distribution/${batchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setDistributionDetails(data.data);
        setSelectedBatch(batchId);
        setShowModal(true);
      }
    } catch (err) {
      alert('Unable to fetch distribution details');
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm('Are you sure you want to delete this batch? This will delete all associated records.')) {
      return;
    }

    try {
      const response = await fetch(`${url}/upload/batch/${batchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        fetchBatches();
      } else {
        alert(data.message || 'Failed to delete batch');
      }
    } catch (err) {
      alert('Unable to delete batch');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading batches...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Upload Batches</h2>
        <button
          onClick={fetchBatches}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {batches.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileSpreadsheet size={48} className="mx-auto mb-4 text-gray-400" />
          <p>No batches found. Upload a CSV file to create a batch.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <div key={batch.uploadBatch} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Batch #{batch.uploadBatch.substring(0, 8)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(batch.uploadDate).toLocaleDateString()} at {new Date(batch.uploadDate).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-semibold text-gray-900">{batch.totalItems}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Uploaded By:</span>
                  <span className="font-semibold text-gray-900">{batch.uploaderEmail}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => fetchDistributionDetails(batch.uploadBatch)}
                  className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                >
                  <Eye size={16} />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => handleDeleteBatch(batch.uploadBatch)}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Distribution Details Modal */}
      {showModal && distributionDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                Distribution Details - Batch #{selectedBatch?.substring(0, 8)}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setDistributionDetails(null);
                  setSelectedBatch(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600">Total Records</p>
                    <p className="text-2xl font-bold text-gray-900">{distributionDetails.totalRecords}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600">Agents</p>
                    <p className="text-2xl font-bold text-gray-900">{distributionDetails.distribution?.length || 0}</p>
                  </div>
                </div>
              </div>

              <h4 className="text-lg font-semibold text-gray-900 mb-4">Distribution by Agent</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agent Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Records Assigned
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {distributionDetails.distribution?.map((dist, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {dist.agentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dist.agentEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dist.itemCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setDistributionDetails(null);
                  setSelectedBatch(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default BatchesView;