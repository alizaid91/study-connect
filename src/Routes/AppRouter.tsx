import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Navbar from '.././components/Navbar.tsx';
import Home from '.././pages/Home.tsx';
import Dashboard from '.././pages/Dashboard.tsx';
import Tasks from '.././pages/Tasks.tsx';
import Resources from '.././pages/Resources.tsx';
import Auth from '.././pages/Auth.tsx';
import PYQs from '.././pages/PYQs.tsx';
import AdminDashboard from '.././pages/AdminDashboard.tsx';
import PrivateRoute from '.././components/PrivateRoute.tsx';
import Profile from '.././pages/Profile';
import Bookmarks from '.././pages/Bookmarks';
import Footer from '.././components/Footer';
import NotFound from '.././pages/NotFound.tsx';
import AiAssistant from '.././pages/AiAssitant.tsx';
import Pricing from '.././pages/Pricing.tsx';
import { RootState } from '.././store';
import PremiumComingSoonModal from '.././components/PremiumComingSoon.tsx';
import { useSelector } from 'react-redux';

const AppRouter = () => {

    const { isAdmin } = useSelector((state: RootState) => state.admin);
    const { pathname } = useLocation();
    const isOpen = useSelector((state: RootState) => state.globalPopups.isPremiumComingSoonOpen);
    const [isNavbarHidden, setIsNavbarHidden] = useState(false);
    const lastScrollY = useRef(0);
    const visibleHeight = window.innerHeight - 64;

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY.current && currentScrollY > 0) {
                // Scrolling down
                setIsNavbarHidden(true);
            } else {
                // Scrolling up
                setIsNavbarHidden(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div style={{ maxHeight: `${pathname === '/ai-assistant' ? visibleHeight : 'auto'}` }} className="bg-gray-50 flex flex-col">
            <Navbar isHidden={isNavbarHidden} />
            <main className={`w-full flex-grow ${isNavbarHidden ? 'pt-8' : 'pt-16'}`}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/auth" element={<Auth />} />
                    {
                        isAdmin && (

                            <Route
                                path="/admin/dashboard"
                                element={
                                    <AdminDashboard />
                                }
                            />
                        )
                    }
                    <Route
                        path='/pricing'
                        element={
                            <Pricing />
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/tasks"
                        element={
                            <PrivateRoute>
                                <Tasks />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/resources"
                        element={
                            <Resources />
                        }
                    />
                    <Route
                        path="/pyqs"
                        element={
                            <PYQs />
                        }
                    />
                    <Route
                        path="/bookmarks"
                        element={
                            <PrivateRoute>
                                <Bookmarks />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/ai-assistant" element={
                        <PrivateRoute>
                            <AiAssistant />
                        </PrivateRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>

            {pathname !== '/ai-assistant' && <Footer />}

            <PremiumComingSoonModal
                isOpen={isOpen}
            />
        </div>
    )
}

export default AppRouter