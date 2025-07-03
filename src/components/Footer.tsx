import { Link } from 'react-router-dom';
import {
    FiGithub,
    FiLinkedin,
    FiInstagram,
    FiGlobe,
    FiBook,
    FiFileText,
    FiClipboard,
    FiGrid,
    FiBookmark,
    FiShield,
} from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';
import { RootState } from '../store';
import { useSelector } from 'react-redux';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const isAdmin = useSelector((state: RootState) => state.admin.isAdmin);

    const socialLinks = [
        {
            name: 'Portfolio',
            icon: FiGlobe,
            url: 'https://dev-ali-zaid-portfolio.vercel.app/',
            color: 'hover:text-blue-500'
        },
        {
            name: 'GitHub',
            icon: FiGithub,
            url: 'https://github.com/alizaid91',
            color: 'hover:text-gray-800'
        },
        {
            name: 'LinkedIn',
            icon: FiLinkedin,
            url: 'https://linkedin.com/in/alizaid91',
            color: 'hover:text-blue-600'
        },
        {
            name: 'Instagram',
            icon: FiInstagram,
            url: 'https://instagram.com/alizaid291',
            color: 'hover:text-pink-500'
        }
    ];

    const quickLinks = [
        {
            name: 'PYQs',
            icon: FiFileText,
            path: '/pyqs'
        },
        {
            name: 'Resources',
            icon: FiBook,
            path: '/resources'
        },
        {
            name: 'Tasks',
            icon: FiClipboard,
            path: '/tasks'
        },
        {
            name: 'AI Assistant',
            icon: FaRobot,
            path: '/ai-assistant'
        },
        {
            name: 'Dashboard',
            icon: FiGrid,
            path: '/dashboard'
        },
        {
            name: 'Bookmarks',
            icon: FiBookmark,
            path: '/bookmarks'
        },
        ...(isAdmin ? [{
            name: 'Admin',
            icon: FiShield,
            path: '/admin/dashboard'
        }] : [])
    ];

    return (
        <footer className="bg-gray-900 text-gray-300 w-full overflow-x-hidden">
            <div className="px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-2 mb-2">
                            <img src={logo} alt="Logo" className="mb-2 h-10 w-auto" />
                            <span className="text-2xl font-bold text-white">Study Connect</span>
                        </div>
                        <p className="text-gray-400 mb-6 max-w-md">
                            Your all-in-one academic companion. Access past papers, manage tasks, and organize your study materials in one place.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ y: -2 }}
                                    className={`text-gray-400 ${social.color} transition-colors duration-200`}
                                >
                                    <social.icon className="h-6 w-6" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="col-span-1">
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <motion.li
                                    key={link.name}
                                    whileHover={{ x: 5 }}
                                    className="transition-transform duration-200"
                                >
                                    <Link
                                        to={link.path}
                                        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
                                    >
                                        <link.icon className="h-4 w-4" />
                                        <span>{link.name}</span>
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="col-span-1">
                        <h3 className="text-white font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-2">
                            <li className="text-gray-400">
                                <a href="mailto:contact@studyconnect.com" className="hover:text-white transition-colors duration-200">
                                    alizaidshaikh9975@gmail.com
                                </a>
                            </li>
                            <li className="text-gray-400">
                                <a href="tel:+1234567890" className="hover:text-white transition-colors duration-200">
                                    +91 8180032313
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 mt-12 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © {currentYear} Study Connect. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 