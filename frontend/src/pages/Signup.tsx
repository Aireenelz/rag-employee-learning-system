import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faEye,
    faEyeSlash,
    faLock
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";

interface SignupFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
}

const Signup: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState<SignupFormData>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "partner" // Default role
    });
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string>("");

    const { signUp } = useAuth();
    const navigate = useNavigate();

    // Function to determine role based on email
    const determineRole = (email: string): string => {
        const trimmedEmail = email.trim().toLowerCase();

        if (trimmedEmail.endsWith("@thinkcodex.com")) {
            return "internal-employee";
        }
        
        return "partner";
    };

    // Update role whenever email changes
    useEffect(() => {
        if (formData.email) {
            const newRole = determineRole(formData.email);
            setFormData(prev => ({
                ...prev,
                role: newRole
            }));
            console.log("Role: ", newRole);
        }
    }, [formData.email]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));

        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password but be at least 8 characteres long");
            return;
        }

        console.log("Signup attempt: ", formData.email, formData.firstName, formData.lastName, formData.role);
        setLoading(true);

        try {
            const { error } = await signUp(
                formData.email,
                formData.password,
                formData.firstName,
                formData.lastName,
                formData.role
            );

            if (error) {
                setError(error.message || "Signup failed. Please try again.");
            } else {
                setSuccessMessage("Account created successfully! Please check your email to verify your account.");
                setTimeout(() => {
                    navigate("/");
                }, 1000);
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-els-secondarybackground flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-40 mx-auto mb-4 flex items-center justify-center">
                        <img
                            src="/logo_questio.png"
                            alt="Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h1>
                    <p className="text-gray-600">Sign up to start your AI learning journey</p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Success message */}
                {successMessage && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                        {successMessage}
                    </div>
                )}

                {/* Signup form */}
                <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                    {/* FirstName and LastName */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-els-primarybackground focus:border-transparent outline-none transition-all"
                                placeholder="John"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-els-primarybackground focus:border-transparent outline-none transition-all"
                                placeholder="Doe"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-els-primarybackground focus:border-transparent outline-none transition-all"
                                placeholder="john.doe@example.com"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>
                    
                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-els-primarybackground focus:border-transparent outline-none transition-all"
                                placeholder="Create a strong password"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                disabled={loading}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                    </div>

                    {/* ConfirmPassword */}
                    <div className="pb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative">
                            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-els-primarybackground focus:border-transparent outline-none transition-all"
                                placeholder="Confirm your password"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                disabled={loading}
                            >
                                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                    </div>

                    {/* Sign up button */}
                    <button
                        type="submit"
                        className="w-full bg-els-primarybutton text-white py-3 px-4 rounded-lg hover:bg-els-primarybuttonhover transition-colors font-medium"
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                {/* Login if already have account */}
                <p className="text-center text-gray-600 mt-10">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-700 hover:underline font-medium">Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;