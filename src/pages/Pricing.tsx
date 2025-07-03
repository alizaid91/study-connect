import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/index";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { authService } from "../services/authService";
import { UpgradeToPremiumButton } from "../components/buttons/UpgradeToPremiumButton";

const Pricing = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user, profile } = useSelector((state: RootState) => state.auth);
    const faqs = [
        {
            question: "What happens if I reach my daily AI limit?",
            answer: "You can buy extra AI credits anytime, or upgrade to Premium for higher daily limits."
        },
        {
            question: "Can I cancel Premium anytime?",
            answer: "Yes — you can manage or cancel your subscription anytime in your account settings."
        },
        {
            question: "Will more features be added to Premium?",
            answer: "Yes — we are constantly improving Study Connect and Premium users will always get early access to new features."
        }
    ]
    const [selectedPlan, setSelectedPlan] = useState<string>(profile?.role || 'free');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };
    useEffect(() => {
        if (user) {
            setSelectedPlan(profile?.role || 'free');
        }
    }, [user, profile]);
    return (
        <div className="bg-white min-h-screen py-12 px-6">
            {/* Hero Section */}
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Choose Your Plan</h1>
                <p className="mt-3 text-md md:text-lg text-gray-600">Get the most out of Study Connect with AI-powered features built for students.</p>
            </div>

            {/* Pricing Cards */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Free Plan */}
                <div onClick={() => setSelectedPlan('free')} className={`${selectedPlan === 'free' ? 'border-2 border-indigo-600' : 'border-2 border-gray-300'} cursor-pointer rounded-3xl p-6 shadow-lg hover:shadow-xl transition flex flex-col justify-between`}>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Free</h2>
                        <p className="mt-1 text-gray-600">₹0 / month</p>
                        <ul className="mt-4 space-y-2 text-gray-700">
                            <li>✔️ PYQ Papers</li>
                            <li>✔️ Study Resources</li>
                            <li>✔️ 2 Task Boards</li>
                            <li>✔️ 2 AI Chats</li>
                            <li>✔️ 10 AI Prompts/day</li>
                            <li>✔️ Buy Extra AI Credits</li>
                        </ul>
                    </div>
                    {
                        !user ? (
                            <Link to="/auth#signup">
                                <button className="mt-6 w-full rounded-xl border border-indigo-600 text-indigo-600 px-4 py-2 font-medium hover:bg-indigo-50 transition">
                                    Sign Up
                                </button>
                            </Link>
                        ) : profile?.role === 'free' ? (
                            <div className="flex justify-center items-center mt-6 w-full rounded-xl border border-indigo-600 text-indigo-600 px-4 py-2 font-medium hover:bg-indigo-50 transition">
                                Current Plan
                            </div>
                        ) : null
                    }
                </div>

                {/* Premium Plan */}
                <div onClick={() => setSelectedPlan('premium')} className={`${selectedPlan === 'premium' ? 'border-2 border-indigo-600' : 'border-2 border-gray-300'} cursor-pointer rounded-3xl p-6 shadow-lg hover:shadow-xl transition flex flex-col justify-between`}>
                    <div>
                        <h2 className="text-2xl font-bold text-indigo-800">Premium</h2>
                        <p className="mt-1 text-indigo-700">₹149 / month</p>
                        <ul className="mt-4 space-y-2 text-gray-700">
                            <li>✔️ PYQ Papers</li>
                            <li>✔️ Study Resources</li>
                            <li>✔️ 5 Task Boards</li>
                            <li>✔️ 10 AI Chats</li>
                            <li>✔️ 50 AI Prompts/day</li>
                            <li>✔️ Buy Extra AI Credits</li>
                            <li>✨ Priority Support</li>
                        </ul>
                    </div>
                    {
                        !user ? (
                            <UpgradeToPremiumButton text="Continue with Premium" extraClasses="mt-6"/>
                        ) : profile?.role === 'premium' ? (
                            <div className="flex justify-center items-center mt-6 w-full rounded-xl border border-indigo-600 text-indigo-600 px-4 py-2 font-medium hover:bg-indigo-50 transition">
                                Current Plan
                            </div>
                        ) : <UpgradeToPremiumButton extraClasses="mt-6" />
                    }
                </div>
            </div>

            {/* Benefits Section */}
            <div className="mt-16 max-w-4xl mx-auto text-center border border-gray-300 rounded-3xl p-6">
                <h3 className="text-2xl font-bold text-gray-900">Why go Premium?</h3>
                <p className="mt-3 text-gray-600">More boards, more AI chats, faster responses — get the full power of Study Connect for your success.</p>
            </div>

            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto space-y-4 mt-16 bg-gray-100 rounded-3xl p-6">
                <h1 className="text-center text-2xl font-bold text-gray-900">Frequently Asked Questions</h1>
                {faqs.map((faq, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-lg shadow-md overflow-hidden transform-gpu"
                    >
                        <motion.button
                            onClick={() => toggleFaq(index)}
                            className="w-full p-6 flex items-center justify-between focus:outline-none"
                            whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                        >
                            <div className="flex items-center">
                                <h3 className="text-lg font-semibold text-left">{faq.question}</h3>
                            </div>
                            <motion.svg
                                animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                                className="w-6 h-6 transform-gpu"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </motion.svg>
                        </motion.button>
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{
                                height: openFaqIndex === index ? 'auto' : 0,
                                opacity: openFaqIndex === index ? 1 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden transform-gpu"
                        >
                            <div className="p-6 pt-0 text-gray-600">
                                {faq.answer}
                            </div>
                        </motion.div>
                    </motion.div>
                ))}
            </div>

            {/* Footer CTA */}
            {
                !user || profile?.role === 'free' && (
                    <div className="mt-16 max-w-4xl mx-auto text-center border border-gray-300 rounded-3xl p-6">
                        <p className="text-gray-700 text-lg font-bold">Ready to unlock the full power of Study Connect?</p>
                        <button
                            onClick={() => {
                                if (user) {
                                    authService.handleSubscribe(user.uid, profile?.email || '', profile?.fullName || '');
                                }
                            }}
                            className="mt-4 rounded-xl bg-indigo-600 text-white px-6 py-3 font-medium hover:bg-indigo-700 transition"
                        >
                            Upgrade to Premium
                        </button>
                    </div>
                )
            }
        </div>
    )
}

export default Pricing