import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEye,
    faEyeSlash
} from "@fortawesome/free-solid-svg-icons";

const Profile: React.FC = () => {
    const { profile, user, refreshProfile } = useAuth();
    
    const [profileData, setProfileData] = useState({
        firstName: profile ? `${profile.first_name}` : "",
        lastName: profile ? `${profile.last_name}` : "",
        email: user?.email || "",
        role: profile?.role || "",
        department: "",
        position: ""
    });

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    
    useEffect(() => {
        if (profile) {
            setProfileData(prev => ({
                ...prev,
                firstName: profile.first_name || "",
                lastName: profile.last_name || "",
                role: profile.role || "",
                department: profile.department || "",
                position: profile.position || "",
            }));
        }
        if (user?.email) {
            setProfileData(prev => ({
                ...prev,
                email: user.email || "",
            }));
        }
    }, [profile, user]);

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const [showPasswords, setShowPasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });

    const getUserInitials = () => {
        if (profile?.first_name && profile?.last_name) {
            return (profile.first_name[0] + profile.last_name[0]).toUpperCase();
        }
        return "U";
    };

    const getRoleLabel = () => {
        const role = profile?.role;

        if (!role) return "User";
        
        switch (role) {
            case "admin":
                return "Admin";
            case "internal-employee":
                return "Internal Employee";
            case "partner":
                return "Partner";
            default:
                return "User";
        }
    };

    const roleColors: Record<string, string> = {
        admin: "bg-red-100 text-red-800",
        "internal-employee": "bg-yellow-100 text-yellow-800",
        partner: "bg-blue-100 text-blue-800"
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

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSaveChangesProfile = async () => {
        if (!user?.id) {
            alert("User not found. Please log in again.");
            return;
        }

        if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
            alert("First name and last name are required!");
            return;
        }

        console.log("Profile changes: ", profileData);
        
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    first_name: profileData.firstName.trim(),
                    last_name: profileData.lastName.trim(),
                    department: profileData.department.trim() || null,
                    position: profileData.position.trim() || null,
                    updated_at: new Date().toISOString()
                })
                .eq("id", user.id);
            
                if (error) {
                    console.error("Error updating profile:", error);
                    alert(`Error updating profile: ${error.message}`);
                    return;
                }

                alert("Profile updated successfully!");
                await refreshProfile();
                setIsEditingProfile(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("An error occurred while updating your profile. Please try again.");
        }
    };

    const handleCancelProfileEdit = () => {
        if (profile) {
            setProfileData({
                firstName: profile.first_name || "",
                lastName: profile.last_name || "",
                email: user?.email || "",
                role: profile.role || "",
                department: profile.department || "",
                position: profile.position || ""
            });
        }
        setIsEditingProfile(false);
    };

    const handleSaveChangesPassword = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert("Passwords do not match!");
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

            setPasswords({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
            setShowPasswords({
                currentPassword: false,
                newPassword: false,
                confirmPassword: false
            });
            setShowPasswordForm(false);
        } catch (error) {
            console.error("Error changing password:", error);
            alert("An error occurred while updating your password. Please try again.");
        }
    };

    const handleCancelChangePassword = () => {
        setPasswords({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });
        setShowPasswords({
            currentPassword: false,
            newPassword: false,
            confirmPassword: false
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
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${roleColors[profileData.role] || "bg-gray-100 text-gray-800"}`}>
                        {getRoleLabel()}
                    </span>
                </div>

                {/* Form fields */}
                <div className="px-4 pb-4 space-y-4 ">
                    {/* First Name and Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                            <input
                                type="text"
                                value={profileData.firstName}
                                onChange={(e) => handleProfileChange("firstName", e.target.value)}
                                disabled={!isEditingProfile}
                                className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                                    !isEditingProfile ? "bg-gray-50 text-gray-600" : ""
                                }`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                            <input
                                type="text"
                                value={profileData.lastName}
                                onChange={(e) => handleProfileChange("lastName", e.target.value)}
                                disabled={!isEditingProfile}
                                className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                                    !isEditingProfile ? "bg-gray-50 text-gray-600" : ""
                                }`}
                            />
                        </div>
                    </div>

                    {/* Department and Position */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                            <input
                                type="text"
                                value={profileData.department}
                                onChange={(e) => handleProfileChange("department", e.target.value)}
                                disabled={!isEditingProfile}
                                className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                                    !isEditingProfile ? "bg-gray-50 text-gray-600" : ""
                                }`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                            <input
                                type="text"
                                value={profileData.position}
                                onChange={(e) => handleProfileChange("position", e.target.value)}
                                disabled={!isEditingProfile}
                                className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                                    !isEditingProfile ? "bg-gray-50 text-gray-600" : ""
                                }`}
                            />
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-3 px-4 pb-4">
                    {!isEditingProfile ? (
                        <button
                            onClick={() => setIsEditingProfile(true)}
                            className="bg-els-primarybutton text-sm font-semibold py-2 px-5 text-white rounded-lg hover:bg-els-primarybuttonhover cursor-pointer"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleCancelProfileEdit}
                                className="border border-gray-300 text-sm font-semibold py-2 px-5 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveChangesProfile}
                                className="bg-els-primarybutton text-sm font-semibold py-2 px-5 text-white rounded-lg hover:bg-els-primarybuttonhover cursor-pointer"
                            >
                                Save Changes
                            </button>
                        </>
                    )}
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
                            {/* Current Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.currentPassword ? "text" : "password"}
                                        value={passwords.currentPassword}
                                        onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                                        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg"
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility("currentPassword")}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <FontAwesomeIcon icon={showPasswords.currentPassword ? faEyeSlash : faEye} />
                                    </button>
                                </div>
                            </div>
                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.newPassword ? "text" : "password"}
                                        value={passwords.newPassword}
                                        onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                                        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg"
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility("newPassword")}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <FontAwesomeIcon icon={showPasswords.newPassword ? faEyeSlash : faEye} />
                                    </button>
                                </div>
                            </div>
                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirmPassword ? "text" : "password"}
                                        value={passwords.confirmPassword}
                                        onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                                        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg"
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility("confirmPassword")}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <FontAwesomeIcon icon={showPasswords.confirmPassword ? faEyeSlash : faEye} />
                                    </button>
                                </div>
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