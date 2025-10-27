import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabaseClient";

const Profile: React.FC = () => {
    const { profile, user } = useAuth();
    
    const [profileData, setProfileData] = useState({
        firstName: profile ? `${profile.first_name}` : "",
        lastName: profile ? `${profile.last_name}` : "",
        email: user?.email || "",
        role: profile?.role || "",
        department: "",
        position: ""
    });

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const getUserInitials = () => {
        if (profile?.first_name && profile?.last_name) {
            return (profile.first_name[0] + profile.last_name[0]).toUpperCase();
        }
        return "U";
    };

    const getRoleLabel = () => {
        return profileData.role === "internal-employee" ? "Internal Employee" : "Partner";
    };

    const handleProfileChange = (field: keyof typeof profileData, value: string) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePasswordChange = (field: keyof typeof passwords, value: string) => {
        setPasswords(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveChangesProfile = () => {
        console.log("Profile changes: ", profileData);
        // TODO: API UPDATE PROFILE
    };

    const handleSaveChangesPassword = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert("Password do not match!");
            return;
        }

        if (passwords.newPassword.length < 8) {
            alert("Password must be at least 8 characters long!");
            return;
        }

        console.log("Password change request");
        
        try {
            // First, verify the current password by attempting to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user?.email || "",
                password: passwords.currentPassword
            });
            if (signInError) {
                alert("Current password is incorrect!");
                return;
            }

            // Update password
            const { error: updateError } = await supabase.auth.updateUser({
                password: passwords.newPassword
            });
            if (updateError) {
                alert(`Error updating password: ${updateError.message}`);
                return;
            }
            alert("Password updated successfully!");

            // Clear the form
            setPasswords({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
            setShowPasswordForm(false);
        } catch (error) {
            console.error("Error changing password:", error);
            alert("An error occured while updating your password. Please try again.");
        }
    };

    const handleCancelChangePassword = () => {
        setPasswords({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });
        setShowPasswordForm(false);
    };

    return (
        <div className="space-y-8">
            {/* Profile Information card */}
            <div className="space-y-4 bg-white border rounded-lg pb-4">
                {/* Card header */}
                <div className="bg-els-cardheaderbackground rounded-t-lg border-b py-2 px-4">
                    <h2 className="text-lg font-bold">Profile Information</h2>
                </div>

                {/* Avatar Section */}
                <div className="flex items-center gap-3 py-2 px-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                        {getUserInitials()}
                    </div>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        profileData.role === "internal-employee"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                    }`}>
                        {getRoleLabel()}
                    </span>
                </div>

                {/* Form fields */}
                <div className="px-4 pb-4 space-y-4 ">
                    {/* First row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                            <input
                                type="text"
                                value={profileData.firstName}
                                onChange={(e) => handleProfileChange("firstName", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                            <input
                                type="text"
                                value={profileData.lastName}
                                onChange={(e) => handleProfileChange("lastName", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Second row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                            <input
                                type="text"
                                value={profileData.department}
                                onChange={(e) => handleProfileChange("department", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                            <input
                                type="text"
                                value={profileData.position}
                                onChange={(e) => handleProfileChange("position", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end px-4 pb-4">
                    <button
                        onClick={handleSaveChangesProfile}
                        className="bg-els-primarybutton text-sm font-semibold py-2 px-5 text-white rounded-lg hover:bg-els-primarybuttonhover cursor-pointer"
                    >
                        Save Profile Changes
                    </button>
                </div>
            </div>

            {/* Account Setting card */}
            <div className="space-y-4 bg-white border rounded-lg pb-4">
                {/* Card header */}
                <div className="bg-els-cardheaderbackground rounded-t-lg border-b py-2 px-4">
                    <h2 className="text-lg font-bold">Account Settings</h2>
                </div>

                {/* Email and Change Password button */}
                <div className="pt-2 px-4 pb-4">
                    <div className="flex gap-8 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={profileData.email}
                                disabled
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        {!showPasswordForm && (
                            <button
                                onClick={() => setShowPasswordForm(true)}
                                className="bg-els-primarybutton text-sm font-semibold py-2 px-5 text-white rounded-lg hover:bg-els-primarybuttonhover cursor-pointer"
                            >
                                Change Password
                            </button>
                        )}
                    </div>
                </div>

                {/* Password Form (show when 'Change Password' button is clicked) */}
                {showPasswordForm && (
                    <>
                        {/* Password inputs */}
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                                <input
                                    type="password"
                                    value={passwords.currentPassword}
                                    onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={passwords.newPassword}
                                    onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwords.confirmPassword}
                                    onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>

                        {/* Cancel or Save new password */}
                        <div className="flex justify-end gap-3 px-4 pb-4">
                            <button
                                onClick={handleCancelChangePassword}
                                className="border border-gray-300 text-sm font-semibold py-2 px-5 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveChangesPassword}
                                className="bg-els-primarybutton text-sm font-semibold py-2 px-5 text-white rounded-lg hover:bg-els-primarybuttonhover cursor-pointer"
                            >
                                Save Password Change
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;