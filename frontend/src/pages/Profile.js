import React, { useState } from 'react';

const EditProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    graduationYear: '',
    skills: '',
    education: [{ degree: '', institution: '', startYear: '', endYear: '' }],
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...profile.education];
    updatedEducation[index][field] = value;
    setProfile({ ...profile, education: updatedEducation });
  };

  const addEducation = () => {
    setProfile({
      ...profile,
      education: [...profile.education, { degree: '', institution: '', startYear: '', endYear: '' }],
    });
  };

  const removeEducation = (index) => {
    const updatedEducation = profile.education.filter((_, idx) => idx !== index);
    setProfile({ ...profile, education: updatedEducation });
  };

  const handleSave = () => {
    console.log('Saved profile:', profile);
    // Add your firebase/firestore save logic here
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6">Edit Profile</h2>

        <div className="space-y-4">
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full p-3 rounded-lg bg-gray-700 text-white"
          />

          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-gray-700 text-white"
            disabled
          />

          <input
            type="tel"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full p-3 rounded-lg bg-gray-700 text-white"
          />

          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            placeholder="About Me"
            rows="4"
            className="w-full p-3 rounded-lg bg-gray-700 text-white"
          />

          <input
            type="text"
            name="graduationYear"
            value={profile.graduationYear}
            onChange={handleChange}
            placeholder="Graduation Year (e.g., 2027)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white"
          />

          <input
            type="text"
            name="skills"
            value={profile.skills}
            onChange={handleChange}
            placeholder="Skills (comma-separated)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white"
          />

          <div className="mt-6">
            <h3 className="text-2xl font-semibold mb-4">Education History</h3>

            {profile.education.map((edu, index) => (
              <div key={index} className="space-y-2 mb-4 bg-gray-700 p-4 rounded-lg">
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                  placeholder="Degree"
                  className="w-full p-2 rounded-lg bg-gray-600 text-white"
                />
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                  placeholder="Institution"
                  className="w-full p-2 rounded-lg bg-gray-600 text-white"
                />
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={edu.startYear}
                    onChange={(e) => handleEducationChange(index, 'startYear', e.target.value)}
                    placeholder="Start Year"
                    className="w-full p-2 rounded-lg bg-gray-600 text-white"
                  />
                  <input
                    type="text"
                    value={edu.endYear}
                    onChange={(e) => handleEducationChange(index, 'endYear', e.target.value)}
                    placeholder="End Year"
                    className="w-full p-2 rounded-lg bg-gray-600 text-white"
                  />
                </div>
                <button
                  onClick={() => removeEducation(index)}
                  className="text-red-400 hover:text-red-600 text-sm mt-2"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              onClick={addEducation}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              + Add Education
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-8 w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
