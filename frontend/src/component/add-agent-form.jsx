import React, { useState, useContext } from 'react';
import { AlertCircle } from 'lucide-react';
import context from '../contextApi/context';
function AddAgentForm({ token }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: {countryCode: '+1', number: ''},
    password: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {url}=useContext(context);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
const mobileAndCountryCode=(e)=>{
    setFormData({
      ...formData,
      mobile: { ...formData.mobile, [e.target.name]: e.target.value }
    });
}
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${url}/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Agent added successfully!');
        setFormData({ name: '', email: '', mobile: { countryCode: '+1', number: '' }, password: '' });
      } else {
        setError(data.message || 'Failed to add agent');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Agent</h2>

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
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="agent@example.com"
          />
        </div>

        <div>
          <label htmlFor="conuntryCode" className="block text-sm font-medium text-gray-700 mb-2">
            country code
          </label>
          <select name="countryCode" id="countryCode" onChange={mobileAndCountryCode} value={formData.mobile.countryCode} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="+1">+1 (USA)</option>
            <option value="+91">+91 (India)</option>
            <option value="+44">+44 (UK)</option>
          </select>
          </div>
        <div>
          <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2 mt-1">
            Mobile Number *
          </label>
          <input
            id="number"
            name="number"
            type="tel"
            value={formData.mobile.number}
            onChange={mobileAndCountryCode}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="234567890"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Minimum 6 characters"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Adding Agent...' : 'Add Agent'}
        </button>
      </form>
    </div>
  );
}
export default AddAgentForm;