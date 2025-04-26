import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { FaFileAlt, FaBook, FaTasks, FaTachometerAlt, FaBookmark, FaChartLine, FaQuoteLeft, FaQuestionCircle, FaPlay } from 'react-icons/fa';
import { useState } from 'react';

const Home = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const features = [
    {
      title: 'Past Year Papers',
      description: 'Access a comprehensive collection of previous years\' university papers to prepare effectively for your exams.',
      path: '/pyqs',
      icon: FaFileAlt
    },
    {
      title: 'Study Resources',
      description: 'Explore our library of open-source notes, e-books, and educational materials.',
      path: '/resources',
      icon: FaBook
    },
    {
      title: 'Task Management',
      description: 'Stay organized with our smart task management system for better time management.',
      path: '/tasks',
      icon: FaTasks
    },
    {
      title: 'Dashboard',
      description: 'Get a quick overview of your academic progress and upcoming tasks.',
      path: '/dashboard',
      icon: FaTachometerAlt
    },
    {
      title: 'Bookmarks',
      description: 'Save and organize your favorite papers and resources for quick access.',
      path: '/bookmarks',
      icon: FaBookmark
    }
  ];

  const statistics = [
    { number: '1000+', label: 'Past Papers' },
    { number: '500+', label: 'Study Resources' },
    { number: '10K+', label: 'Active Users' },
  ];

  const howItWorks = [
    {
      title: 'Find Past Papers',
      description: 'Search and filter through our extensive collection of past year papers.',
      videoId: 'YOUR_LOOM_VIDEO_ID_1'
    },
    {
      title: 'Access Resources',
      description: 'Browse through our curated collection of study materials and resources.',
      videoId: 'YOUR_LOOM_VIDEO_ID_2'
    },
    {
      title: 'Manage Tasks',
      description: 'Create and organize your study tasks with our intuitive task management system.',
      videoId: 'YOUR_LOOM_VIDEO_ID_3'
    }
  ];

  const testimonials = [
    {
      quote: "This platform has completely transformed how I prepare for exams. The past papers collection is amazing!",
      author: "Sarah Johnson",
      role: "Computer Science Student"
    },
    {
      quote: "The task management feature helps me stay on top of my studies. I can't imagine my academic life without it.",
      author: "Michael Chen",
      role: "Engineering Student"
    },
    {
      quote: "The study resources are top-notch. They've helped me understand complex topics easily.",
      author: "Emma Davis",
      role: "Mathematics Student"
    }
  ];

  const faqs = [
    {
      question: "How do I access past year papers?",
      answer: "Simply navigate to the PYQs section and use the search filters to find the papers you need."
    },
    {
      question: "Can I save papers for later?",
      answer: "Yes! You can bookmark any paper or resource and access it later from your bookmarks."
    },
    {
      question: "Is the platform free to use?",
      answer: "Yes, all features are completely free for students."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          {user ? 'Welcome Back!' : 'Your All-in-One Academic Companion'}
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto px-4 sm:px-0">
          {user 
            ? 'Continue your academic journey with our comprehensive platform.'
            : 'Streamline your studies with our comprehensive platform featuring past papers and smart task management.'}
        </p>
        {!user && (
          <Link to="/auth" className="btn btn-primary text-lg">
            Get Started
          </Link>
        )}
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center text-gray-900">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(({ title, description, path, icon: FeatureIcon }, index) => (
            <Link 
              key={index} 
              to={path}
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center"
            >
              <div className="bg-primary-50 p-4 rounded-full mb-4">
                <FeatureIcon className="text-primary-500" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">{title}</h3>
              <p className="text-gray-600 text-center">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {statistics.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center text-gray-900">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {howItWorks.map((step, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-primary-50 p-4 rounded-full">
                  <FaPlay className="text-primary-500" size={24} />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">{step.title}</h3>
              <p className="text-gray-600 text-center mb-4">{step.description}</p>
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.loom.com/embed/${step.videoId}`}
                  frameBorder="0"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center text-gray-900">What Students Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <FaQuoteLeft className="text-primary-500 mb-4" size={24} />
              <p className="text-gray-600 mb-4">{testimonial.quote}</p>
              <div className="font-semibold">{testimonial.author}</div>
              <div className="text-sm text-gray-500">{testimonial.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center text-gray-900">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full p-6 flex items-center justify-between focus:outline-none"
              >
                <div className="flex items-center space-x-4">
                  <FaQuestionCircle className="text-primary-500" size={20} />
                  <h3 className="text-lg font-semibold text-left">{faq.question}</h3>
                </div>
                <svg
                  className={`w-6 h-6 transform transition-transform duration-300 ${
                    openFaqIndex === index ? 'rotate-180' : ''
                  }`}
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
                </svg>
              </button>
              <div
                className={`transition-all duration-300 ease-in-out ${
                  openFaqIndex === index
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0'
                } overflow-hidden`}
              >
                <div className="p-6 pt-0 text-gray-600">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section - Only show for non-authenticated users */}
      {!user && (
        <section className="text-center py-16 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Academic Journey?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of students who are already using Student Guide to excel in their studies.
          </p>
          <Link to="/auth" className="btn btn-primary text-lg">
            Sign Up Now
          </Link>
        </section>
      )}
    </div>
  );
};

export default Home; 