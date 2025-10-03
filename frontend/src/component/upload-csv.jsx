import React, { useState, useContext } from 'react';
import { AlertCircle } from 'lucide-react';
import context from '../contextApi/context';

function UploadCSV({ token }) {
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState([]);
  const {url}=useContext(context);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      const validExtensions = ['csv', 'xlsx', 'xls'];
      
      if (!validExtensions.includes(fileExtension)) {
        setError('Invalid file format. Please upload CSV, XLSX, or XLS files only.');
        setFile(null);
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
      setError('');
      setPreview([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${url}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`File uploaded successfully! ${data.totalRecords} records distributed among ${data.agentsCount} agents.`);
        setFile(null);
        setPreview(data.preview || []);
        document.getElementById('fileInput').value = '';
      } else {
        setError(data.message || 'Failed to upload file');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload CSV File</h2>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-semibold text-blue-900 mb-2">File Format Requirements:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• File types: CSV, XLSX, or XLS</li>
          <li>• Required columns: FirstName, Phone, Notes</li>
          <li>• FirstName: Text field</li>
          <li>• Phone: Numeric field</li>
          <li>• Notes: Text field</li>
        </ul>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <span className="text-sm text-green-700">{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fileInput" className="block text-sm font-medium text-gray-700 mb-2">
            Select File *
          </label>
          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            accept=".csv,.xlsx,.xls"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Uploading...' : 'Upload and Distribute'}
        </button>
      </form>

      {preview.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution Preview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Agent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Records Assigned
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.agentName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.recordCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
export default UploadCSV;