import React, { useState } from 'react';
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

const Profile = ({ profileData, currentUser, isDarkMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSkillChange = (index, value) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index] = value;
    setFormData({
      ...formData,
      skills: updatedSkills
    });
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, '']
    });
  };

  const removeSkill = (index) => {
    const updatedSkills = [...formData.skills];
    updatedSkills.splice(index, 1);
    setFormData({
      ...formData,
      skills: updatedSkills
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Update profile in Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        name: formData.name,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        graduationYear: formData.graduationYear,
        program: formData.program,
        currentPosition: formData.currentPosition,
        company: formData.company,
        skills: formData.skills.filter(skill => skill.trim() !== ''),
        bio: formData.bio
      });

      setSuccess(true);
      setIsEditing(false);
      // We would typically update the parent state here in a real application
    } catch (error) {
      console.error("Error updating profile:", error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-section space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Profile</h2>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className={`px-4 py-2 ${loading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg transition-colors`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
            Profile updated successfully!
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={isEditing ? formData.name : profileData.name}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className={`w-full p-2 border rounded-lg ${!isEditing ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} border-gray-300 dark:border-gray-600`}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  readOnly
                  className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={isEditing ? formData.phone : profileData.phone}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className={`w-full p-2 border rounded-lg ${!isEditing ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} border-gray-300 dark:border-gray-600`}
                />
              </div>
              
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={isEditing ? formData.dateOfBirth : profileData.dateOfBirth}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className={`w-full p-2 border rounded-lg ${!isEditing ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} border-gray-300 dark:border-gray-600`}
                />
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={isEditing ? formData.address : profileData.address}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  rows="2"
                  className={`w-full p-2 border rounded-lg ${!isEditing ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} border-gray-300 dark:border-gray-600`}
                ></textarea>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Graduation Year</label>
                <input
                  type="number"
                  id="graduationYear"
                  name="graduationYear"
                  value={isEditing ? formData.graduationYear : profileData.graduationYear}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className={`w-full p-2 border rounded-lg ${!isEditing ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} border-gray-300 dark:border-gray-600`}
                />
              </div>
              
              <div>
                <label htmlFor="program" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program/Degree</label>
                <input
                  type="text"
                  id="program"
                  name="program"
                  value={isEditing ? formData.program : profileData.program}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className={`w-full p-2 border rounded-lg ${!isEditing ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} border-gray-300 dark:border-gray-600`}
                />
              </div>
              
              <div>
                <label htmlFor="currentPosition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Position</label>
                <input
                  type="text"
                  id="currentPosition"
                  name="currentPosition"
                  value={isEditing ? formData.currentPosition : profileData.currentPosition}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className={`w-full p-2 border rounded-lg ${!isEditing ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} border-gray-300 dark:border-gray-600`}
                />
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company/Organization</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={isEditing ? formData.company : profileData.company}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className={`w-full p-2 border rounded-lg ${!isEditing ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} border-gray-300 dark:border-gray-600`}
                />
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={isEditing ? formData.bio : profileData.bio}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  rows="3"
                  className={`w-full p-2 border rounded-lg ${!isEditing ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} border-gray-300 dark:border-gray-600`}
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills</label>
            <div className="space-y-2">
              {(isEditing ? formData.skills : profileData.skills).map((skill, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => isEditing && handleSkillChange(index, e.target.value)}
                    readOnly={!isEditing}
                    className={`flex-1 p-2 border rounded-lg ${!isEditing ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} border-gray-300 dark:border-gray-600`}
                  />
                  {isEditing && (
                    <button 
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <button 
                  type="button"
                  onClick={addSkill}
                  className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
                >
                  Add Skill
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile; 