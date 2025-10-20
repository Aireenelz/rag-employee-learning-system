import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faEye,
    faEyeSlash,
    faLock,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        console.log("Login attempt: ", {email, password});
        setLoading(true);

        try {
            const { error } = await signIn(email, password);

            if (error) {
                setError(error.message || "Login failed. Incorrect username or password.");
            } else {
                navigate("/");
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
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome back</h1>
                    <p className="text-gray-600">Log in to your account</p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Login form */}
                <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-els-primarybackground focus:border-transparent outline-none transition-all"
                                placeholder="Enter your email"
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-els-primarybackground focus:border-transparent outline-none transition-all"
                                placeholder="Enter your password"
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

                    {/* ForgotPassword */}
                    <div className="flex items-center justify-end pl-1 pb-3">
                        <a href="/forgotpassword" className="text-sm text-blue-700 hover:underline">
                            Forgot password?
                        </a>
                    </div>

                    {/* Log in button */}
                    <button
                        type="submit"
                        className="w-full bg-els-primarybutton text-white py-3 px-4 rounded-lg hover:bg-els-primarybuttonhover transition-colors font-medium"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                {/* Sign up if no account */}
                <p className="text-center text-gray-600 mt-10">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-700 hover:underline font-medium">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login