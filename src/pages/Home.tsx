import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import {
  FaFileAlt,
  FaBook,
  FaTasks,
  FaTachometerAlt,
  FaBookmark,
  FaQuestionCircle,
  FaPlay,
  FaRobot,
} from "react-icons/fa";
import { useState } from "react";
import { motion } from "framer-motion";
import heroImage from "../assets/hero-image.svg";
import featureImage1 from "../assets/feature-1.svg";
import featureImage2 from "../assets/feature-2.svg";
import featureImage3 from "../assets/feature-3.svg";
import comingSoonImage from "../assets/Demo_banner.png";

const Home = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const features = [
    {
      title: "Past Year Papers",
      description:
        "Access a comprehensive collection of previous years' university papers to prepare effectively for your exams.",
      path: "/pyqs",
      icon: FaFileAlt,
    },
    {
      title: "Study Resources",
      description:
        "Explore our library of open-source notes, e-books, and educational materials.",
      path: "/resources",
      icon: FaBook,
    },
    {
      title: "AI Assistant",
      description:
        "AI Assistant built for students — trained on academic content to give accurate, up-to-date answers for your study questions.",
      path: "/ai-assistant",
      icon: FaRobot,
    },
    {
      title: "Task Management",
      description:
        "Stay organized with our smart task management system for better time management.",
      path: "/tasks",
      icon: FaTasks,
    },
    {
      title: "Dashboard",
      description:
        "Get a quick overview of your academic progress and upcoming tasks.",
      path: "/dashboard",
      icon: FaTachometerAlt,
    },
    {
      title: "Bookmarks",
      description:
        "Save and organize your favorite papers and resources for quick access.",
      path: "/bookmarks",
      icon: FaBookmark,
    },
  ];

  const statistics = [
    { number: "500+", label: "Past Papers" },
    { number: "200+", label: "Study Resources" },
    { number: "3K+", label: "Active Users" },
  ];

  const howItWorks = [
    {
      title: "Find Past Papers",
      description:
        "Search and filter through our extensive collection of past year papers.",
      videoId: "https://www.youtube.com/embed/9WQuTungoHE?si=rlViTbubbYEgypbw",
    },
    {
      title: "Access Resources",
      description:
        "Browse through our curated collection of study materials and resources.",
      videoId: "",
    },
    {
      title: "Manage Tasks",
      description:
        "Create and organize your study tasks with our intuitive task management system.",
      videoId: "",
    },
    {
      title: "AI Assistant",
      description:
        "Get personalized study recommendations and AI-powered study tips to help you stay on track.",
      videoId: "",
    },
  ];

  // const testimonials = [
  //   {
  //     quote: "This platform has completely transformed how I prepare for exams. The past papers collection is amazing!",
  //     author: "Sarah Johnson",
  //     role: "Computer Science Student"
  //   },
  // ];

  const faqs = [
    {
      question: "How do I navigate through the PYQs section?",
      answer:
        "The PYQs page features an intuitive filter panel where you can select branch, year, pattern, and subject. You can also save your frequently used filters as Quick Filters for faster access next time. Each paper has options to view it directly or add it to your tasks.",
    },
    {
      question: "How can I bookmark papers and resources?",
      answer:
        "Each paper and resource card has a bookmark icon in the top-right corner. Simply click on it to save the item to your bookmarks. You can access all your bookmarks through the Bookmarks page, which organizes them into Papers and Resources tabs.",
    },
    {
      question: "Can I add papers to my task list?",
      answer:
        "Yes! On the PYQs page, each paper card has an 'Add to Tasks' button. Clicking it opens a modal where you can set details like priority and due date before adding it to your task board.",
    },
    {
      question: "What is Study Connect AI Assistant?",
      answer:
        "Study Connect AI Assistant is built especially for students. It is trained on academic content and your syllabus, so it can give you accurate and up-to-date answers to your study questions. Just ask anything — and get clear explanations, instantly.",
    },
    {
      question: "What type of questions can I ask?",
      answer:
        "You can ask about any academic topic — including concepts from your syllabus, exam-related questions, coding, science, and more.",
    },
    {
      question: "Can I create multiple task lists on Task Borad?",
      answer:
        "Yes, you can create any number of task lists and organize your task efficeintly.",
    },
    {
      question: "How are the resources organized?",
      answer:
        "The Resources page groups study materials by category and type. You can use the filter panel to narrow down your search by branch, year, and subject. Each resource card shows key information and provides direct access to the material.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="space-y-16 pb-16 pt-8">
      {/* Hero Section with Animation */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mx-4 rounded-3xl text-center py-16 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)",
        }}
      >
        {/* Lightning Border Animation */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
          }}
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)",
          }}
          animate={{
            x: ["100%", "-100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 right-0 w-1/3 h-full opacity-20"
        >
          <img
            src={heroImage}
            alt="Hero Illustration"
            className="w-full h-full object-contain"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-4"
        >
          <Link
            to="/ai-assistant"
            className="inline-flex items-center bg-gray-900/40 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mx-3 sm:mx-0 text-white hover:bg-gray-800/60 transition-colors shadow-lg"
          >
            <span className="bg-rose-500 text-white rounded-full px-3 py-1 text-xs font-bold mr-2 sm:mr-3 shadow-md">
              NEW
            </span>
            <span className="font-bold text-xs">
              AI Assistant - Your Superhuman tutor
            </span>
          </Link>
        </motion.div>

        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 max-w-[650px] mx-auto px-4 sm:px-0">
            {user
              ? "Welcome Back!"
              : "Ace Engineering with Papers, Resources & Smart Tasks Board."}
          </h1>
          <p className="text-md md:text-lg text-blue-100 mb-8 max-w-2xl mx-auto px-4 sm:px-0">
            {user
              ? "Continue your academic journey with our comprehensive platform."
              : "From PYQs to Task Lists, everything you need is now in one place — just for SPPU students."}
          </p>
          {!user ? (
            <motion.div className="flex flex-col mx-6 gap-2 sm:gap-6 sm:flex-row sm:items-center sm:justify-center sm:mx-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/auth#login"
                  className="inline-block px-8 py-3 text-lg font-semibold text-white rounded-3xl relative overflow-hidden w-full"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                    }}
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <motion.span
                    className="relative z-10"
                    animate={{
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    Login
                  </motion.span>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/auth#signup"
                  className="inline-block px-8 py-3 text-lg font-semibold text-white rounded-3xl relative overflow-hidden w-full"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                    }}
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <motion.span
                    className="relative z-10"
                    animate={{
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    Sign up
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/dashboard"
                className="inline-block px-8 py-3 text-lg font-semibold text-white rounded-3xl relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                  }}
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <motion.span
                  className="relative z-10"
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Go to Dashboard
                </motion.span>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Features Section with Animation */}
      <div className="bg-blue-50 px-4">
        <section className="space-y-8 container mx-auto px-2 py-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-gray-900"
          >
            Features
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(
              ({ title, description, path, icon: FeatureIcon }, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="transform-gpu"
                >
                  <Link
                    to={path}
                    className="h-full p-6 bg-white rounded-3xl shadow-xl hover:shadow-lg transition-all duration-300 flex flex-col items-center relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-primary-100 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                    <div className="bg-primary-50 p-4 rounded-full mb-4">
                      <FeatureIcon className="text-primary-500" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-center">
                      {title}
                    </h3>
                    <p className="text-gray-600 text-center">{description}</p>
                    <img
                      src={
                        index === 0
                          ? featureImage1
                          : index === 1
                          ? featureImage2
                          : featureImage3
                      }
                      alt={`Feature ${index + 1}`}
                      className="absolute bottom-0 right-0 w-1/3 opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                    />
                  </Link>
                </motion.div>
              )
            )}
          </div>
        </section>
      </div>

      {/* Statistics Section with Animation */}
      <div className="bg-indigo-50 px-2">
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 py-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {statistics.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center transform-gpu"
              >
                <motion.div
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-4xl font-bold text-primary-600 mb-2"
                >
                  {stat.number}
                </motion.div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* How It Works Section */}
      <div className="bg-blue-50 px-2">
        <section className="space-y-8 container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="bg-white p-6 rounded-3xl shadow-md">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-primary-50 p-4 rounded-full">
                    <FaPlay className="text-primary-500" size={24} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  {step.description}
                </p>
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border-2 border-gary-200">
                  <img
                    src={comingSoonImage}
                    alt="Feature 1"
                    className="h-[315px] w-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FAQ Section with Animation */}
      <div className="bg-indigo-50 px-2">
        <section className="space-y-8 container mx-auto px-4 py-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-gray-900"
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl shadow-md overflow-hidden transform-gpu"
              >
                <motion.button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 flex items-center justify-between focus:outline-none"
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                >
                  <div className="flex items-center space-x-4">
                    <FaQuestionCircle className="text-primary-500" size={20} />
                    <h3 className="text-lg font-semibold text-left">
                      {faq.question}
                    </h3>
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
                    height: openFaqIndex === index ? "auto" : 0,
                    opacity: openFaqIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden transform-gpu"
                >
                  <div className="p-6 pt-0 text-gray-600">{faq.answer}</div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* CTA Section with Animation */}
      {!user && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mx-4 text-center py-16 bg-gradient-to-r from-primary-50 to-primary-100 rounded-3xl relative overflow-hidden"
        >
          {/* Lighter Lightning Border Animation */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.05), transparent)",
            }}
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(40, 150, 105, 0.05), transparent)",
            }}
            animate={{
              x: ["100%", "-100%"],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Academic Journey?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of students who are already using Student Guide to
              excel in their studies.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/auth"
                className="inline-block px-8 py-3 text-lg font-semibold text-white rounded-3xl relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                  }}
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <motion.span
                  className="relative z-10"
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Sign Up Now
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default Home;
