import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const Home = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const features = [
    {
      title: 'Past Year Papers',
      description: 'Access a comprehensive collection of previous years\' university papers to prepare effectively for your exams.',
      path: '/pyqs'
    },
    {
      title: 'AI Assistant',
      description: 'Get instant explanations and summaries of complex topics with our AI-powered chatbot.',
      path: '/ai-assistant'
    },
    {
      title: 'Study Resources',
      description: 'Explore our library of open-source notes, e-books, and educational materials.',
      path: '/resources'
    },
    {
      title: 'Task Management',
      description: 'Stay organized with our smart task management system for better time management.',
      path: '/tasks'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-10">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          {user ? 'Welcome Back!' : 'Your All-in-One Academic Companion'}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {user 
            ? 'Continue your academic journey with our comprehensive platform.'
            : 'Streamline your studies with our comprehensive platform featuring past papers, AI-powered assistance, and smart task management.'}
        </p>
        {!user && (
          <Link to="/auth" className="btn btn-primary text-lg">
            Get Started
          </Link>
        )}
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <Link 
            key={index} 
            to={feature.path}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </Link>
        ))}
      </section>

      {/* CTA Section - Only show for non-authenticated users */}
      {!user && (
        <section className="text-center py-16 bg-primary-50 rounded-lg">
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